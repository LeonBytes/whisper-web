# 本地转录（Whisper 网页版）

在浏览器里直接运行 Whisper，把音频或视频转成文字和 .srt 字幕。
音频只在你自己的设备上处理，不会上传。适用于 iPad、iPhone、Mac 的 Safari，也支持 Chrome 等浏览器。

## 文件说明

| 文件 | 作用 |
|---|---|
| `index.html` | 页面和界面，负责读取并解码音频 |
| `worker.js` | 后台线程，加载 Whisper 模型并转录 |
| `sw.js` | Service Worker，缓存页面和运行库，用于离线使用 |

---

# Local Transcription (Whisper Web App)

Run Whisper directly in the browser to turn audio or video into text and .srt subtitles.
Audio is processed only on your own device and is never uploaded. Works in Safari on iPad, iPhone and Mac, and also in browsers such as Chrome.

## Files

| File | Purpose |
|---|---|
| `index.html` | The page and interface; reads and decodes the audio |
| `worker.js` | Background thread; loads the Whisper model and transcribes |
| `sw.js` | Service Worker; caches the page and libraries for offline use |
