# 工具图标配置指南

## 概述

工具图标系统在构建时从外部 SVG 图标库（LobeHub Icons）下载图标到本地，然后编译成 SVG sprite，最终在页面中使用 sprite 引用，避免重复加载和网络请求。

## 工作流程

1. **配置阶段**：在 `src/_data/toolIcons.js` 中配置工具的图标 URL
2. **构建阶段**：运行 `npm run download:icons` 从外部下载 SVG 到 `src/icons/raw/tools/`
3. **编译阶段**：运行 `npm run build:icons` 将所有 SVG（UI 图标 + 工具图标）编译成 `sprite.svg`
4. **使用阶段**：页面通过 `<use>` 标签引用 sprite 中的图标

## 目录结构

```
src/icons/
└── raw/
    ├── generic.svg       # 静态 UI 图标（通用后备图标）
    ├── languages.svg     # 静态 UI 图标（语言切换）
    ├── palette.svg       # 静态 UI 图标（主题切换）
    └── tools/            # 工具图标目录（从外部下载）
        ├── chatgpt.svg
        ├── claude.svg
        ├── cursor.svg
        └── deepseek.svg
```

**设计理念**：
- `raw/` 目录下放置静态的 UI 图标，手动管理，不会被脚本修改
- `raw/tools/` 目录下放置工具图标，由下载脚本自动管理
- 构建时两个目录的图标都会被合并到同一个 sprite 文件中

## 添加新工具图标

### 1. 在 `src/_data/toolIcons.js` 中添加配置

```javascript
module.exports = {
  // 现有工具...
  
  // 添加新工具
  newtool: {
    symbolId: 'icon-newtool',        // sprite 中的 symbol ID
    title: 'New Tool',               // 工具显示名称
    svg: 'https://unpkg.com/@lobehub/icons-static-svg@latest/icons/NewTool.svg'  // 外部图标 URL
  },
  
  // ...
};
```

### 2. 下载新图标

```bash
npm run download:icons
```

这会将新工具的 SVG 下载到 `src/icons/raw/tools/newtool.svg`。

### 3. 重新构建

```bash
npm run build
```

完整的构建流程会：
1. 清理输出目录
2. 下载所有配置的图标（如果不存在）
3. 编译 sprite
4. 构建页面

## 图标来源

### LobeHub Icons 库

- 基础 URL: `https://unpkg.com/@lobehub/icons-static-svg@latest/icons/`
- 图标命名规则：工具名称的 PascalCase 形式 + `.svg`
  - 例如：ChatGPT → `ChatGPT.svg`
  - 例如：Claude → `Claude.svg`
  - 例如：DeepSeek → `DeepSeek.svg`
  - 例如：Gemini → `Gemini.svg`

### 查找可用图标

1. 访问 [LobeHub Icons 仓库](https://github.com/lobehub/lobe-icons) 查看所有可用图标
2. 或直接尝试访问：`https://unpkg.com/@lobehub/icons-static-svg@latest/icons/工具名.svg`

## 后备图标

如果某个工具在外部图标库中不存在，可以：

### 1. 使用通用图标

将 `svg` 字段设为 `null`，系统会使用本地的 `icon-generic`：

```javascript
unknowntool: {
  symbolId: 'icon-generic',
  title: 'Unknown Tool',
  svg: null
}
```

### 2. 使用其他 CDN 的图标

`svg` 字段可以指向任何可访问的 SVG URL：

```javascript
customtool: {
  symbolId: 'icon-customtool',
  title: 'Custom Tool',
  svg: 'https://example.com/icons/custom.svg'
}
```

### 3. 手动添加本地图标

直接将自定义的 SVG 文件放到 `src/icons/raw/tools/` 目录，文件名为 `customtool.svg`，无需配置 `svg` URL。

**注意**：如果你需要添加静态的 UI 图标（如新的主题图标、控制图标等），应该放在 `src/icons/raw/` 根目录，而不是 `tools/` 子目录。

## 清理工具图标

### 使用 clean:icons 命令

```bash
npm run clean:icons
```

此命令会清空 `src/icons/raw/tools/` 目录中的所有 SVG 文件，但不会影响静态 UI 图标。

### 使用场景

- **重新下载所有图标**：清理后重新下载
  ```bash
  npm run clean:icons && npm run download:icons
  ```

- **更新图标**：当外部图标更新时，清理并重新下载
  ```bash
  npm run clean:icons && npm run download:icons && npm run build:icons
  ```

- **测试构建流程**：验证下载和构建功能
  ```bash
  npm run clean:icons && npm run build
  ```

### 输出示例

```bash
$ npm run clean:icons

🗑️  Cleaning tool icons from .../src/icons/raw/tools...

  ✓ Deleted: chatgpt.svg
  ✓ Deleted: claude.svg
  ✓ Deleted: cursor.svg
  ✓ Deleted: deepseek.svg

✅ Cleaned 4 tool icon(s)
```

如果目录已经是空的：
```bash
✓ Tools directory is already clean (no SVG files found)
```

## 构建命令

### 完整构建
```bash
npm run build
```

执行流程：
1. 清理输出目录
2. 下载外部图标（跳过已存在）
3. 编译 sprite
4. 构建 CSS/JS
5. 生成静态页面

### 清理工具图标
```bash
npm run clean:icons
```

清空 `src/icons/raw/tools/` 目录中的所有 SVG 文件，静态 UI 图标不受影响。

使用场景：
- 重新下载所有工具图标
- 清理不再使用的图标
- 测试下载功能

### 仅下载图标
```bash
npm run download:icons
```

### 仅构建 sprite
```bash
npm run build:icons
```

### 开发模式
```bash
npm run dev
```

会先下载图标和编译 sprite，然后启动 watch 模式。

## 技术细节

### 下载脚本 (`scripts/download-icons.js`)

- 读取 `toolIcons.js` 配置
- 跳过已存在的图标文件
- 自动处理 HTTP 重定向
- 并行下载所有图标
- 下载到 `src/icons/raw/tools/` 目录

### 构建脚本 (`scripts/build-sprite.js`)

- 扫描 `src/icons/raw/` 目录（静态 UI 图标）
- 扫描 `src/icons/raw/tools/` 目录（工具图标）
- 为每个 SVG 生成 `icon-{filename}` 格式的 symbol ID
- 合并所有 SVG 到单个 sprite 文件
- 输出构建统计（UI 图标数 + 工具图标数）

### 页面使用

```html
<svg class="tool-icon" aria-hidden="true">
  <use href="#icon-claude" />
</svg>
```

## 优势

1. **性能优化**：所有图标在一个 sprite 文件中，减少 HTTP 请求
2. **离线构建**：图标下载后保存在本地，构建不依赖网络
3. **一致性**：使用专业图标库，保证视觉统一
4. **可维护**：只需配置 URL，脚本自动处理下载和编译
5. **灵活性**：支持外部 CDN、本地文件和通用后备图标
