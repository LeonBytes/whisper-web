// worker.js — 在后台线程里加载 Whisper 并转录，避免页面卡死。
// 音频只在本机处理；模型文件首次使用时下载一次，之后由浏览器缓存。
// 状态提示只发送"文案键"（key），由页面按当前语言翻译，这样切换中英文时不用改这里。
import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3";

env.allowLocalModels = false; // 只从 Hugging Face 拉取模型
env.useBrowserCache = true;   // 模型缓存到浏览器 Cache Storage，之后可离线

let asr = null;
let loadedKey = null;

function post(msg) {
  self.postMessage(msg);
}

function status(key, params) {
  post({ type: "status", key, params: params || {} });
}

async function loadModel(model, useGPU) {
  const key = `${model}|${useGPU ? "gpu" : "cpu"}`;
  if (asr && loadedKey === key) return;
  asr = null;

  const progress_callback = (p) => {
    if (p.status === "progress" && p.file) {
      post({ type: "progress", file: p.file, progress: p.progress });
    } else if (p.status === "initiate" || p.status === "download") {
      status("downloadingFile", { file: p.file || "" });
    }
  };

  if (useGPU) {
    try {
      asr = await pipeline("automatic-speech-recognition", model, {
        device: "webgpu",
        dtype: { encoder_model: "fp32", decoder_model_merged: "q4" },
        progress_callback,
      });
      loadedKey = key;
      status("readyGpu");
      return;
    } catch (err) {
      status("gpuFallback");
    }
  }

  asr = await pipeline("automatic-speech-recognition", model, {
    device: "wasm",
    dtype: "q8",
    progress_callback,
  });
  loadedKey = `${model}|cpu`;
  status("readyCpu");
}

self.onmessage = async (e) => {
  const { type } = e.data;
  try {
    if (type === "transcribe") {
      const { audio, model, language, useGPU } = e.data;
      status("loadingModel");
      await loadModel(model, useGPU);

      status("transcribing");
      const options = {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true,
      };
      // 仅英文模型（名字带 .en）不能指定语言；多语言模型不选语言则自动检测
      if (!model.endsWith(".en")) {
        options.task = "transcribe";
        if (language && language !== "auto") options.language = language;
      }

      const result = await asr(audio, options);
      post({
        type: "done",
        text: (result.text || "").trim(),
        chunks: result.chunks || [],
      });
    }
  } catch (err) {
    post({ type: "error", message: String((err && err.message) || err) });
  }
};
