# wcs810 命名与提示词记录规则 <EXTREMELY_IMPORTANT>

## 一、命名规范（强制）

从现在开始，所有代码必须遵守以下命名前缀规则：

1. **CSS 类名（class）**：所有 class 名称必须以 `wcs810_` 开头
   - 正确：`wcs810_container`、`wcs810_header-title`
   - 错误：`container`、`.header`

2. **CSS ID 名（id）**：所有 id 名称必须以 `wcs810_` 开头
   - 正确：`wcs810_main`、`wcs810_navbar`
   - 错误：`main`、`#navbar`

3. **JavaScript 变量**：所有 JS 变量（包括 `let`、`const`、`var` 声明的变量）必须以 `wcs810_` 开头
   - 正确：`wcs810_count`、`wcs810_userList`
   - 错误：`count`、`userList`

> 注意：函数名、对象方法名、DOM API 内置属性（如 `document`、`window`、`getElementById` 等）不受此约束。仅约束自定义的变量、类名、ID 名。

## 二、提示词记录规范（强制）

在执行任何任务之前，必须先将用户提示词写入项目根目录的 `wcs810_prompt.md` 文件：

- **写入方式**：附加（append），**禁止覆盖**已有内容
- **文件路径**：`c:\Users\ROG\wy\wcs810_prompt.md`
- **记录格式**：

```
## [YYYY-MM-DD HH:mm:ss]

**使用模型：** <模型名称>

**提示词内容：**

<提示词原文>

---
```

- **记录时机**：收到用户提示词后、开始执行任务之前
- **必须包含**：时间、使用的模型、提示词内容

## 三、HTML 文件首页链接规范（强制）

所有新建的 HTML 文件，必须在页面中加入返回首页 `index.html` 的超链接。

- **链接目标**：`index.html`（使用相对路径，根据文件所在目录层级调整，如 `../index.html`）
- **链接位置**：建议放在页面顶部导航栏或底部页脚区域
- **链接文本**：建议使用"首页"或"返回首页"
- **示例**：

```html
<a href="index.html" class="wcs810_home-link">返回首页</a>
```

> 注意：`index.html` 本身不需要添加指向自己的链接。

</EXTREMELY_IMPORTANT>
