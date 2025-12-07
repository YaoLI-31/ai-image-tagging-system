# 🖼️ AI 图片标签化展示系统

[![GitHub stars](https://img.shields.io/github/stars/YaoLI-31/ai-image-tagging-system?style=social)](https://github.com/YaoLI-31/ai-image-tagging-system/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/YaoLI-31/ai-image-tagging-system?style=social)](https://github.com/YaoLI-31/ai-image-tagging-system/network/members)

**一个基于百度AI的全栈应用，可自动为上传的图片生成智能内容标签。**

👉 **在线体验**：[https://yaoli-31.github.io/ai-image-tagging-system/](https://yaoli-31.github.io/ai-image-tagging-system/) (若已部署)
👉 **项目演示**：[在线演示视频/GIF] # 强烈建议您录制一个GIF动图放在这里

---

## ✨ 项目功能

- **🖼️ 直观上传**：支持拖放、点击上传图片，支持 JPG、PNG、WebP 等格式。
- **🤖 智能识别**：集成百度AI图像识别接口，自动分析图片内容。
- **🏷️ 标签可视化**：将识别结果以彩色标签云形式展示，并标注置信度。
- **🎨 现代UI**：响应式设计，在桌面和移动设备上均有良好体验。
- **🔧 完整架构**：清晰的前后端分离设计，可作为全栈学习范例。

## 🛠️ 技术栈

| 层面 | 技术 |
|------|------|
| **前端** | HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript (ES6+) |
| **后端** | Node.js, Express.js |
| **AI服务** | 百度AI开放平台 - 通用物体识别 API |
| **开发工具** | Git, VSCode, Thunder Client (API测试) |

## 🚀 快速开始

### 前置要求
- [Node.js](https://nodejs.org/) (v14 或以上)
- [npm](https://www.npmjs.com/) (通常随Node.js安装)
- 一个百度AI开放平台的账号（用于申请免费API密钥）

### 本地运行步骤
1. **克隆仓库**
   ```bash
   git clone https://github.com/YaoLI-31/ai-image-tagging-system.git
   cd ai-image-tagging-system