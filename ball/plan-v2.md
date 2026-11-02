# 网页抓小球训练游戏 v2 — 开发任务计划（plan-v2.md）

> 对应 spec-v2.md · Phase 2 writing-plans 产物 · 增量式升级（在 v1 代码基础上修改，不重写）

---

## 任务拆分原则
- **增量修改**：每个 Task 在现有 main.js/style.css 上叠加，不推翻重写
- **独立可验证**：每步完成后打开页面即可验证该步功能
- **数据先行**：先改数据结构（小球对象化、统计对象），再改 UI 和逻辑

---

## 任务清单

### Task V2-1 — 小球数据结构对象化 + 严格命中判定 + 偏差记录

**目标**：小球从纯 DOM 升级为带元数据的对象；命中判定从"点中 DOM"改为"点击点在圆内"；记录偏差

**改动**：
- main.js：新增 `activeBalls` Map（ballEl → ballObj），替代原来的 ballsCount
- main.js：`generateBall()` 返回 ball 对象，包含 spawnTime/size/cx/cy/lifeTimer
- main.js：`handleGameClick()` 中计算点击点到球心距离，≤ 半径才算命中，记录偏差
- main.js：新增 `stats` 对象（hits/totalClicks/reactionTimes/deviations）
- CSS：不变

**验收**：点中小球边缘外（方形 DOM 角上但超出圆）→ 算未命中；偏差数据被记录

---

### Task V2-2 — 小球寿命系统

**目标**：小球有寿命，超时未命中自动消失并生成新球

**改动**：
- main.js：每个 ball 创建时绑定 `setTimeout(lifespan)` → 自动移除并 generateBall()
- main.js：点中时清除该 ball 的 lifeTimer
- CSS：寿命剩余 ≤ 30% 时小球闪烁（JS 加 class）

**验收**：小球出现后不点击，到寿命自动消失，新球在别处出现

---

### Task V2-3 — 难度梯度系统

**目标**：每 10 秒自动升级，小球变小、寿命缩短、同屏数增加

**改动**：
- main.js：`getDifficultyConfig(elapsedSeconds)` 函数返回 {size, lifespan, maxBalls}
- main.js：游戏计时器中每 10 秒调用升级逻辑，显示 LEVEL UP 提示
- main.js：generateBall 使用当前难度的 size/lifespan
- CSS：LEVEL UP 提示样式

**验收**：游戏进行到 10s 时小球明显变小，屏幕显示 "LEVEL UP → L2"

---

### Task V2-4 — 实时统计面板

**目标**：顶部分数栏扩展为信息面板，显示命中率/反应时间/偏差/命中数/等级

**改动**：
- index.html：分数栏增加命中率、反应时间、偏差、命中数、等级的 span
- CSS：面板布局（flex 均匀分布）、等宽字体、颜色阈值
- main.js：`updateStatsUI()` 函数，每次点击后刷新
- main.js：等级随难度更新

**验收**：点中几次后，面板显示命中率、反应时间（如 320ms）、偏差（如 8px），数字随点击实时更新

---

### Task V2-5 — 视觉反馈升级（粒子/命中环/X标记）

**目标**：命中有粒子放射+命中环，未命中有 X 标记

**改动**：
- CSS：粒子 .particle、命中环 .hit-ring、X 标记 .miss-mark 的样式和动画
- main.js：onBallHit 中创建粒子和命中环；onMiss 中创建 X 标记

**验收**：点中球时看到蓝色粒子放射和白色圆环扩散；点空白看到红色 ✕

---

### Task V2-6 — Web Audio 音效系统

**目标**：命中/未命中/升级/结束各有合成音效，可静音

**改动**：
- main.js：`audioCtx` 懒加载单例，`playTone(freq, duration, type)` 函数
- main.js：onBallHit 播高音，onMiss 播低音，升级播上行音，结束播下行音
- index.html/CSS：分数栏右侧加 🔊/🔇 静音按钮

**验收**：点中球有"叮"声，点空白有"噗"声，点静音按钮后无声

---

### Task V2-7 — 结束遮罩统计详情

**目标**：结束遮罩增加命中率、反应时间、平均偏差、命中数

**改动**：
- main.js：endGame 中计算最终统计，showEndOverlay 显示详情
- CSS：结束遮罩统计区排版

**验收**：游戏结束后遮罩显示完整统计数据

---

### Task V2-8 — 整体验证 + 性能检查

**目标**：跑通全流程，检查性能，修 bug

**动作**：
- 浏览器完整验收：从开始到结束全流程
- DevTools Performance 录制 60 秒，确认无长任务
- 检查无 console 报错

---

## 任务依赖

```
V2-1(数据结构+判定) ──▶ V2-2(寿命) ──▶ V2-3(难度)
        │                                    │
        ▼                                    ▼
   V2-4(统计面板)  V2-5(视觉反馈)  V2-6(音效)
        │              │              │
        └──────┬───────┴──────┬───────┘
               ▼              ▼
          V2-7(结束详情)  V2-8(整体验证)
```

V2-4/5/6 互相独立，可并行开发，但按顺序实现便于调试。
