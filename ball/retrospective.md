# 网页抓小球训练游戏 v2 — 项目复盘（retrospective.md）

> 基于 Superpowers 六阶段流程 · 2026-2027-1 高级网页设计

---

## 1. 项目概述

将 v1 简单"抓球得分"游戏升级为接近 Steam Aim Lab 专业射击训练体验的网页训练游戏。核心升级：严格命中判定、反应时间/偏差统计、限时寿命小球、6 级难度梯度、Web Audio 合成音效、粒子/命中环视觉反馈。

---

## 2. 流程执行情况

| 阶段 | 产物 | 状态 |
|------|------|------|
| Phase 1 Brainstorming | spec-v2.md | ✅ 完成（6 个决策点经 AskUserQuestion 确认） |
| Phase 2 Writing-plans | plan-v2.md | ✅ 完成（8 个增量任务） |
| Phase 3 TDD 编码 | index.html / css/style.css / js/main.js | ✅ 完成 |
| Phase 4 Code Review | 发现扣分红闪 CSS bug 并修复 | ✅ 完成 |
| Phase 5 Manual Verification | 浏览器 12 项验收全 PASS | ✅ 完成 |
| Phase 6 Git 收尾 | retrospective.md（本文档） | ✅ 完成 |

---

## 3. v1 → v2 核心升级对比

| 维度 | v1 | v2 |
|------|-----|-----|
| 命中判定 | 点中 DOM 即命中 | 严格像素判定（点击点到球心 ≤ 半径） |
| 统计数据 | 仅分数 | 命中率/反应时间/平均偏差/命中数 |
| 小球寿命 | 无限，点中才消失 | 限时寿命（750-2000ms），超时自动换位置 |
| 难度 | 固定 | 6 级梯度，每 10 秒自动升级（球变小、寿命缩短、数量增加） |
| 视觉反馈 | 飘字 | 粒子放射 + 命中环 + X 标记 + 寿命闪烁 + LEVEL UP 提示 |
| 音效 | 无 | Web Audio API 合成（命中/未命中/升级/结束），可静音 |
| 结束画面 | 仅分数 | 分数 + 完整统计详情网格 |

---

## 4. 关键技术决策

1. **小球对象化**：用 `Map<ballEl, ballObj>` 替代 `ballsCount`，每个球携带 spawnTime/lifespan/cx/cy/lifeTimer，支持反应时间计算和寿命管理
2. **严格命中判定**：点击点到球心欧氏距离 ≤ 半径才算命中，偏差距离即统计指标
3. **难度表驱动**：`difficultyTable` 数组 + `getDifficultyConfig(elapsedSeconds)` 函数，6 级参数可灵活调整
4. **音效懒加载**：AudioContext 在用户首次点击"开始游戏"时创建（满足浏览器自动播放策略），单例复用
5. **粒子用 CSS 变量**：`--tx/--ty` 传递每个粒子的方向距离，纯 CSS keyframes 驱动

---

## 5. 遇到的问题与解决方案

| 问题 | 解决方案 |
|------|----------|
| v1 中 `.classList.contains` 偶尔 TypeError（target 非 Element） | 改用 `target.closest('.ball')` + try-catch 兜底 |
| 飘字位置计算错误（#game 有 padding） | 改为 `position:fixed` 直接用 clientX/Y，append 到 body |
| 扣分红闪失效（v1 的 #scoreArea 被 v2 结构替换） | 将 `.score-flash` 样式从 `#scoreArea` 移到 `#scoreboard`，用 box-shadow 红闪 |
| 小球寿命超时后碰撞检测误判 | 给 ballObj 加 `dying` 标志，碰撞检测跳过正在消失的球 |

---

## 6. 验收结果

**功能验收（12/12 PASS）**：
- 初始 UI / 倒计时 / 球体生成
- 命中反馈（粒子+环+飘字+音效）
- 严格命中判定 + 未命中 X 标记
- 统计面板实时更新（命中率/反应时间/偏差/命中数）
- 小球寿命闪烁 + 超时换位置
- 难度自动升级（LEVEL UP 提示）
- 静音切换
- 结束画面统计详情
- 再来一次重置
- Console 零报错

---

## 7. 已知限制与可改进点

1. **小球定位用 left/top**：spec 建议用 `transform: translate()` 启用 GPU 合成，但小球是静态目标（不移动），仅生成时定位一次，性能影响极小，可接受
2. **无历史最高分**：未使用 localStorage 持久化，每次刷新重置（符合课堂作业定位）
3. **小球不运动**：当前为静态 Flick 模式，Aim Lab 的 Tracking 移动模式未实现（用户决策选择静态）
4. **音效为合成音**：未使用真实采样音频，Web Audio 振荡器合成，音色较简单

---

## 8. 交付物清单

```
c:\Users\ROG\wy\
├── index.html          # 入口（v2 统计面板结构）
├── css/style.css       # 样式（含 v2 粒子/环/X标记/统计面板样式）
├── js/main.js          # 逻辑（v2 全功能）
├── server.js           # 本地预览服务器（辅助）
├── spec.md             # v1 规格
├── spec-v2.md          # v2 规格
├── plan.md             # v1 任务计划
├── plan-v2.md          # v2 任务计划
└── retrospective.md    # 本复盘文档
```
