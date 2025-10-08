# 上了AI的贼船

静态网站，用于整理与展示我使用 AI 的案例、提示词和工作流。项目基于 Eleventy 构建，采用原生 CSS/JS 和按需生成的 SVG 图标，支持多语言扩展与暗色主题。

## 开发流程

```bash
# 安装依赖
npm install

# 启动本地开发（并发监听 Eleventy、CSS、JS）
npm run dev

# 构建生产版本
npm run build
```

构建后生成的静态文件位于 `public/` 目录，可部署到任意静态托管平台（推荐 Netlify）。

## 内容编辑

- 在 `src/articles/<lang>/` 目录编写 Markdown 文件；默认语言为中文 `zh`。
- Markdown Front Matter 需要包含：`title`、`date`、`lang`、`tools`、`category`，可选的 `action_button` 与 `prompt` 字段。
- 每篇文章的主体可自由使用 Markdown 语法，自动渲染为卡片内容。

## 图标与样式

- 图标 SVG 放置在 `src/icons/raw/`，运行 `npm run build:icons` 生成合并的 `sprite.svg`。
- 样式入口为 `src/css/style.css`，通过 PostCSS + Tailwind JIT 输出压缩后的 `src/static/assets/main.css`。
- 前端交互逻辑位于 `src/js/app.js`，构建时复制到 `src/static/assets/app.js`。

## 辅助脚本

- `npm run lint`：使用 ESLint 检查 `src/js`。
- `npm run format`：通过 Prettier 统一格式（包含模板与 Markdown）。

## 部署

1. 执行 `npm run build`。
2. 将 `public/` 目录发布到目标平台。
3. 在托管平台（如 Netlify）配置自动化构建命令：`npm install && npm run build`，并将 `public` 设为输出目录。

## 后续规划

- 补充英文、日文内容与路由。
- 持续扩展工具图标库、优化页面动画。
- 根据真实数据调整 SEO、结构化数据与分享卡片。
