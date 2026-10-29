# AGENTS.md

## Project overview

A collection of native HTML/CSS/JavaScript coursework pages for the "高级网页设计" (Advanced Web Design) class, plus a standalone ball-catching game.

- No build system, package manager, framework, or automated tests.
- Pages are opened directly in a browser; a few depend on sibling `data.js` or assets.
- Content and UI copy are in Chinese (zh-CN).
- Prefer native HTML/CSS/JS. Do not add frameworks or CDNs unless explicitly asked; local assets live in `cdn/`, `img/`, and `font_5238935_2rlng48ulsj/`.

## Layout

```
810王传淞/            Student course index (index.html) and early exercises
9.14/ 9.17/ 9.21/     CSS / layout exercises (stacking, gallery, grid)
9.24/ 9.24(1)/ 9.28/  Component, grid, SVG exercises
10.8/ 10.12/          Later exercises (CSS, number game)
ball/                 Standalone game (v1/v2/v3): index.html, css/, js/, spec/plan docs
cdn/                  Locally vendored Font Awesome and Lucide
img/                  Shared images (duplicated in 9.14/img)
font_5238935_2rlng48ulsj/  Local iconfont package
iconfont-1..4.html    Font Awesome / Lucide / mobile bottom-nav demos
starter-level1/2-810-wcs.html  Student grade dashboard starter templates
data.js               Shared STUDENTS / SUBJECTS data for the dashboard
wcs810_prompt.md      Prompt log (see mandatory rule below)
.trae/rules/          Mandatory project rules
.trae/skills/         frontend-design, gitee-project-submit skills
```

## Mandatory rules (from `.trae/rules/wcs810-naming.md`)

1. **Naming prefix**: every custom CSS class, CSS id, and JavaScript variable must start with `wcs810_`.
   - Functions, object methods, and built-in DOM APIs are exempt.
   - Example: `wcs810_container`, `#wcs810_nav`, `const wcs810_count`.
2. **Prompt log**: before doing any task, append (never overwrite) an entry to `wcs810_prompt.md` at repo root containing timestamp, model, and the verbatim user prompt.
   ```md
   ## [YYYY-MM-DD HH:mm:ss]

   **使用模型：** <model>

   **提示词内容：**

   <prompt>

   ---
   ```
3. **Home link**: every new HTML page must include a relative link back to its `index.html` (e.g. `../index.html`). `index.html` itself is exempt.

## Conventions

- Keep CSS inside `<style>` for single-file exercises; use separate `css/` + `js/` files only for larger projects like `ball/`.
- Use UTF-8 with `<meta charset="UTF-8">` and `<meta name="viewport" ...>`.
- Use responsive layouts (`clamp()`, grid, media queries) and visible focus states.
- For visual/design work, follow `.trae/skills/frontend-design/SKILL.md` (deliberate typography, palette, no generic AI-default styling).
- For pushing to Gitee, follow `.trae/skills/gitee-project-submit/SKILL.md`; never commit secrets/tokens.

## Verify

There is no lint, typecheck, or test command. Verify by opening the changed HTML file in a browser (or run `node ball/server.js` for the game at http://localhost:8081/) and checking the console for errors.
