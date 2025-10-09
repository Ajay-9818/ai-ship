# 项目计划："上了AI的贼船" 网站

## 项目概述

构建一个静态网站，用于记录AI使用案例和经验分享，样式和布局保持简洁有趣，是一个想让人探索的页面。

## 当前进度

- ✅ 站点基础结构、案例卡片组件、分页与主题切换均已实现并投入使用
- ✅ 工具图标构建链路（下载 → sprite 合并）与 Prompt 复制交互稳定工作
- ✅ 多语言框架到位（`zh` 默认输出，`en`/`jp` 依赖 Front Matter `lang` 字段）；目前内容主要为中文
- ✅ 卡片正文图片支持点击后进入 modal 预览，并处理键盘可访问性
- ⏳ Backlog 中的增强项（内容扩充、性能优化等）待后续迭代

## 详细需求规格

### 1. 页面结构

**头部区域**
- 网站标题："上了AI的贼船"
- 有趣的CSS动画效果标题
- 描述文字段落
- 导航链接或打赏二维码区域

**内容区域**
- 卡片式布局展示AI使用案例
- 支持分页（每页最多20个卡片）
- 响应式设计
  - 宽屏页面每栏两个卡片
  - 手持设备每栏单个卡片

**底部区域**
- 分页导航器
- 版权信息

### 2. 卡片组件设计

每个卡片包含：
- **标题**：案例名称
- **工具名称和图标**：使用Lobe Icons或其他图标库（可能有多个工具，水平排列）
- **描述**：包含高亮和链接的几行文字
- **操作按钮**：导航到详细页面或展开prompt (按照卡片类型不同进行变化)
- **可展开区域**：显示完整的prompt内容，以及一个复制按钮

### 3. 内容管理系统

**Markdown文件格式**
```yaml
---
title: "案例标题"
date: "2025-10-08"
tools: ["claude", "cursor", "github-copilot"]
category: "开发"
action_button:
  text: "查看详情"
  url: "https://example.com"
prompt: |
  这里可以写完整的prompt内容
  支持多行文本
---

这里是案例的详细描述内容，支持**Markdown**格式，可以包含[链接](https://example.com)和`高亮`。
```

> 说明：默认中文文章可以省略 `lang` 字段；如果要渲染到英文或日文集合，请在 Front Matter 中增加 `lang: en` 或 `lang: jp`。

**文件命名规范**
- `YYYY-MM-DD-title.md`
- 例如：`2025-10-08-using-ai-for-code-review.md`

### 4. 技术栈推荐

#### 静态站点生成器
**推荐：Eleventy (11ty)**
- 轻量级，学习曲线平缓
- 支持多种模板语言
- 与Markdown集成良好

#### 前端技术
- **HTML/CSS/JavaScript**：原生技术栈
- **CSS策略**：以手写 CSS + CSS 自定义属性为主，必要时在构建阶段通过 PostCSS/Tailwind JIT 按需生成少量工具类，确保最终产物精简
- **图标库**：Lobe Icons / Lucide Icons
- **动画效果**：CSS Animations，必要时再引入 GSAP 等库

#### 构建工具
- **Node.js** + **npm scripts**
- **构建流程**：Markdown → Eleventy Collections（排序/分页）→ HTML + JSON 数据 → 静态页面
- **CSS处理**：PostCSS（Autoprefixer + Tailwind JIT 可选）在构建阶段产出精简样式

#### 部署方案
- **Netlify** (自动部署，CDN加速)

### 5. 项目结构

```
ai-ship-website/
├── src/
│   ├── _data/           # 全局数据
│   ├── _includes/       # 模板组件
│   ├── articles/        # Markdown文章
│   │   ├── 2025-10-08-example-1.md
│   │   └── 2025-10-09-example-2.md
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.njk        # 主页模板
├── public/              # 构建输出
├── eleventy.config.js   # 11ty配置
├── package.json
└── README.md
```

### 6. 开发流程

1. **内容创建**：编写Markdown文件
2. **构建过程**：运行构建命令生成静态页面
3. **本地预览**：启动开发服务器
4. **部署**：推送到GitHub或部署平台

### 7. 核心功能实现

#### 卡片展示

- 将 md 文件渲染成卡片
- 满足上面提到的卡片交互需求
- HTML 输出中默认包含完整 prompt，使用 `<details>` / `<summary>` 作为无 JS 降级方案，前端 JS 仅负责动画和复制按钮反馈
- 保持最小化引用：编译过程中避免复杂的 css 引用，只获取用到的 css 组件
- 图标使用内联 SVG sprite 或构建时合并的符号集，避免重复请求
- `src/_data/toolIcons.js` 维护工具 slug → SVG symbol 映射，Markdown 中的 `tools` 字段使用 slug；构建阶段通过 Eleventy Shortcode 注入 `<use xlink:href="#icon-slug">`
- 卡片正文中的图片可点击放大至 modal 并支持键盘触发，便于阅读细节

#### 分页功能
- 通过 Eleventy 内置 `pagination` 功能按日期排序后，每页显示 20 个卡片并生成 `/page/N/`
- 自动计算总页数，渲染上一页/下一页及当前页指示
- 在模板中集中处理分页导航，确保新案例始终排在前面且 URL 稳定

#### 卡片展开效果
- 使用CSS transition实现平滑展开
- JavaScript控制展开/收起状态
- 支持多个卡片同时展开
- 复制按钮优先使用 Clipboard API，提供 textarea 回退保障

#### 响应式设计
- 移动端友好的卡片布局
- 自适应屏幕尺寸
- 触摸友好的交互

#### SEO 与站点元数据
- `_data/site.json` 维护站点标题、描述、社交分享图，模板中输出 `<meta>` / Open Graph / Twitter Card
- 构建阶段生成 `sitemap.xml`、RSS/JSON Feed，提升收录与订阅体验
- 预渲染结构化数据（如 `Article`/`BreadcrumbList`）以帮助搜索引擎理解文档结构

### 8. 扩展功能

- 多语言支持
  - 采用 `/zh/`、`/en/`、`/jp/` 等子目录，`/` 默认指向中文版本；Markdown 文件按语言子目录或后缀组织，构建时归并到对应 collection
  - 通过 `_data/i18n.json` 配置文案字典，并在 Nunjucks 中使用 `t` 过滤器输出多语言文本，模板可扩展 `<link rel="alternate" hreflang>` 与语言切换按钮
  - 根据浏览器 `Accept-Language` 提供软跳转提示，但保持显式的语言切换控制
- 暗色主题
  - 默认遵循 `prefers-color-scheme`，并在本地存储用户选择
  - 切换按钮更新 `data-theme` 属性，构建阶段生成亮/暗两套 CSS 变量

## 推荐工具链总结

**核心工具链：**
- **静态站点生成器**：Eleventy (11ty)
- **样式策略**：原生 CSS + PostCSS/Tailwind JIT 按需输出
- **图标库**：Lobe Icons（按需下载 SVG，构建时生成 sprite）
- **部署平台**：Netlify

**优势：**
- 轻量级，性能优秀
- 学习成本低
- 与AI辅助开发兼容性好
- 部署简单，维护成本低
