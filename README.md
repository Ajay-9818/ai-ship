# 上了AI的贼船

https://ai.onev.cat 的源码。

静态网站，用于整理与展示我使用 AI 的案例、提示词和工作流。项目基于 Eleventy 3，采用原生 CSS/JS 与按需生成的 SVG 图标，已接入多语言框架（默认输出中文，支持英文/日文）与暗色主题切换。卡片图片支持点击后通过 modal 预览大图。编译时调用 Codex SDK 自动完成翻译。

## 环境要求

- Node.js 22（推荐使用 `nvm use 22` 或 `fnm use 22`）
- npm 10 及以上
- 首次运行需要可访问外部网络以下载工具图标（`npm run download:icons`）

## 安装与开发

```bash
# 安装依赖
npm install

# 首次运行会拉取图标、生成 sprite，并并发监听 Eleventy / CSS / JS
npm run dev

# 产出生产版本（清理 → 下载图标 → 生成资源 → 构建 Eleventy）
npm run build
```

构建结果输出到 `public/` 目录，可直接部署到任意静态托管平台（推荐 Netlify）。

## 内容结构

- Markdown 文章根据语言存放在 `src/articles/<lang>/`，默认语言 `zh`
- Front Matter 至少需要：
  - `title`：案例标题
  - `date`：`YYYY-MM-DD`
  - `tools`：工具 slug 数组（与 `src/_data/toolIcons.js` 对应）
  - `category`：分类文本
- 可选字段：
  - `action_button`：包含 `text` 与 `url`
  - `prompt`：用于展示在卡片下方的完整提示词
- 若需生成英文/日文页面，请在 Front Matter 中显式添加 `lang: en` 或 `lang: jp`
- 正文自由使用 Markdown；当正文包含图片时，生成的卡片图片会自动获得放大预览（点击或按 Enter/Space 打开 modal）

示例 Front Matter：

```md
---
title: "使用 N8N 创建每日安排提醒"
date: "2025-10-09"
tools: ["n8n", "deepseek"]
category: "生活"
action_button:
  text: "访问 n8n"
  url: "https://n8n.io"
prompt: |
  这里放置提示词或脚本
---

正文内容，支持 **加粗**、[链接](https://example.com) 以及 `荧光笔` 高亮。
```

## 资源与样式

- 工具图标：`npm run download:icons` 将远程 SVG 缓存到 `src/icons/raw/tools/`，`npm run build:icons` 生成 `src/_includes/sprite.svg`
- 样式：入口 `src/css/style.css`，通过 Tailwind CLI + PostCSS 输出压缩后的 `src/static/assets/main.css`，内含亮/暗主题变量以及卡片图片 modal 样式
- 前端脚本：`src/js/app.js` 负责 prompt 复制、分页滚动、主题切换、图片 modal 等交互，构建时由 `scripts/copy-js.js` 复制到 `src/static/assets/app.js`

## 可用脚本

- `npm run dev`：下载缺失图标并并发监听 CSS/JS/Eleventy
- `npm run build`：生产构建，包含清理、下载图标、生成 sprite 与资源
- `npm run clean:icons`：清空 `src/icons/raw/tools/`，便于重新下载
- `npm run download:icons`：仅同步图标文件
- `npm run format`：使用 Prettier 统一格式
- `npm run lint`：预留的 ESLint 脚本（当前仓库尚未迁移至 ESLint Flat Config，需要自行补充 `eslint.config.js` 后再使用）

## 部署

1. 本地执行 `npm run build`，确认 `public/` 产物完整
2. 将 `public/` 目录上传至静态托管服务
3. CI/CD 平台（如 Netlify）配置：
   - Build command：`npm install && npm run build`
   - Publish directory：`public`
   - 若平台网络受限，需要预先缓存 `src/icons/raw/tools/` 或放行相关 CDN

## 后续方向

- 扩充英文、日文文章内容，完善语言切换体验
- 根据内容规模引入图片懒加载与结构化数据增强
- 迁移 ESLint 配置至 Flat Config，恢复 `npm run lint` 校验
