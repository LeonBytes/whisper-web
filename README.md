# 本地转录（Whisper 网页版）

在浏览器里直接运行 Whisper，把音频或视频转成文字和 .srt 字幕。
音频只在你自己的设备上处理，**不会上传**。适用于 iPad、iPhone、Mac 的 Safari，也支持 Chrome 等浏览器。

## 文件说明

| 文件 | 作用 |
|---|---|
| `index.html` | 页面和界面，负责读取并解码音频 |
| `worker.js` | 后台线程，加载 Whisper 模型并转录 |
| `sw.js` | Service Worker，缓存页面和运行库，用于离线使用 |

## 部署到 GitHub Pages（免费）

1. 在 GitHub 新建一个公开仓库，例如 `whisper-web`。
2. 点 **Add file → Upload files**，把这三个文件（`index.html`、`worker.js`、`sw.js`）拖进去，提交。
   README.md 也可以一起传。
3. 进入仓库的 **Settings → Pages**。
4. **Source** 选 `Deploy from a branch`，分支选 `main`，文件夹选 `/ (root)`，保存。
5. 等一两分钟，你会得到网址：`https://你的用户名.github.io/whisper-web/`。

## 使用方法

1. 在 Safari 打开上面的网址，选择音频或视频文件。
2. 选模型（推荐 base 多语言），点"开始转录"。
3. 第一次会下载模型（tiny 约 40MB，base 约 80MB），之后由浏览器缓存。
4. 转录完成后可复制文字，或下载 .txt / .srt。
5. 想当 App 用：Safari 点分享按钮，选"添加到主屏幕"。

## 离线使用

联网打开并转录一次之后，页面、运行库和模型都会缓存在浏览器里，之后可以离线使用。
如果清除了网站数据，需要重新联网下载一次。

## 常见问题

- **提示无法解码文件**：Safari 对部分视频格式的音轨支持有限。先把文件导出成 m4a、mp3 或 wav 再试。
- **页面闪退或很慢**：手机和 iPad 内存有限，换成 tiny 模型，或把长音频切成几段。
- **勾选 GPU 加速后没变快**：WebGPU 是否可用取决于系统和浏览器版本，失败会自动改用 CPU。
- **识别错词**：口语、俚语、外来词容易出错，可以换 base 模型，并手动指定语言。
- **想固定运行库版本**：把 `worker.js` 里 `@huggingface/transformers@3` 改成具体版本号，例如 `@3.5.1`，避免以后自动升级带来变化。

## 使用注意

- 只处理你有权使用的内容。
- 项目使用开源库 [Transformers.js](https://github.com/huggingface/transformers.js)，模型来自 Hugging Face 上的 Xenova 转换版 Whisper（OpenAI Whisper，MIT 协议）。
