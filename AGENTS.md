# AGENTS.md

## 项目概览

本项目是《高级网页设计》课程的原生 HTML/CSS/JavaScript 作业页面合集，另包含一个独立的接球小游戏。

- 无构建系统、包管理器、框架或自动化测试。
- 页面直接在浏览器中打开即可；少数页面依赖同目录的 `data.js` 或资源文件。
- 内容与界面文案均为简体中文（zh-CN）。
- 优先使用原生 HTML/CSS/JS；除非明确要求，不引入框架或 CDN。本地资源位于 `cdn/`、`img/` 和 `font_5238935_2rlng48ulsj/`。

## 目录结构

```
810王传淞/            学生课程首页（index.html）及早期练习
9.14/ 9.17/ 9.21/     CSS / 布局练习（层叠、画廊、网格）
9.24/ 9.24(1)/ 9.28/  组件、网格、SVG 练习
10.8/ 10.12/          后期练习（CSS、数字游戏）
ball/                 独立小游戏（v1/v2/v3）：index.html、css/、js/、规格与计划文档
cdn/                  本地引入的 Font Awesome 与 Lucide
img/                  共享图片（9.14/img 中有副本）
font_5238935_2rlng48ulsj/  本地 iconfont 图标包
iconfont-1..4.html    Font Awesome / Lucide / 移动端底部导航演示
starter-level1/2-810-wcs.html  学生成绩仪表盘起始模板
data.js               仪表盘共享的 STUDENTS / SUBJECTS 数据
wcs810_prompt.md      提示词记录（见下方强制规则）
.trae/rules/          强制项目规则
.trae/skills/         frontend-design、gitee-project-submit 技能
```

## 强制规则（源自 `.trae/rules/wcs810-naming.md`）

1. **命名前缀**：所有自定义 CSS 类名、CSS id 和 JavaScript 变量必须以 `wcs810_` 开头。
   - 函数名、对象方法名、内置 DOM API 不受此约束。
   - 示例：`wcs810_container`、`#wcs810_nav`、`const wcs810_count`。
2. **提示词记录**：执行任何任务前，必须向仓库根目录的 `wcs810_prompt.md` 追加（禁止覆盖）一条记录，包含时间、使用的模型和用户提示词原文。
   ```md
   ## [YYYY-MM-DD HH:mm:ss]

   **使用模型：** <模型名称>

   **提示词内容：**

   <提示词原文>

   ---
   ```
3. **首页链接**：所有新建 HTML 页面必须包含指向其 `index.html` 的相对链接（如 `../index.html`）；`index.html` 本身除外。
4. **文件与函数注释**：所有新建 HTML 文件必须带注释。文件顶部添加文件头注释块；每个 JavaScript 函数上方添加说明其主要功能的注释。注释必须包含：作者 `王传淞`、建立时间、使用模型、功能名称及简介。
   ```html
   <!--
     作者：王传淞
     建立时间：YYYY-MM-DD HH:mm:ss
     使用模型：<模型名称>
     功能名称：<功能名称>
     简介：<页面功能简述>
   -->
   ```
   ```js
   /*
    * 作者：王传淞
    * 建立时间：YYYY-MM-DD HH:mm:ss
    * 使用模型：<模型名称>
    * 功能名称：<功能名称>
    * 简介：<函数功能简述>
    */
   function wcs810_doSomething() { /* ... */ }
   ```

## 约定

- **语言约定**：本项目内生成的所有说明文档、检查清单统一使用简体中文；文件路径及 HTML、CSS、JS 标识符保留英文。
- 单文件练习的 CSS 写在 `<style>` 内；仅 `ball/` 等较大项目使用独立的 `css/` + `js/` 文件。
- 使用 UTF-8，包含 `<meta charset="UTF-8">` 和 `<meta name="viewport" ...>`。
- 使用响应式布局（`clamp()`、grid、媒体查询），并提供可见的 focus 状态。
- 视觉/设计工作遵循 `.trae/skills/frontend-design/SKILL.md`（刻意的字体排印与配色，避免模板化的默认风格）。
- 推送 Gitee 遵循 `.trae/skills/gitee-project-submit/SKILL.md`；绝不提交密钥或 token。

## 验证

无 lint、类型检查或测试命令。验证方式：在浏览器中打开修改过的 HTML 文件（小游戏则运行 `node ball/server.js` 后访问 http://localhost:8081/），并检查控制台无报错。
