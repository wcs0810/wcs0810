// ===== v2 Aim Lab 风格训练游戏 =====

// === 常量区 ===
const CONFIG = {
  bgColor: '#FFF8E1',
  ballColor: '#2E86DE',
  btnColor: '#2E86DE',
  btnHover: '#1B5AA0',
  scoreText: '#1B4F72',
  timeText: '#5D6D7E',
  positiveColor: '#27AE60',
  negativeColor: '#C0392B',
  overlayBg: 'rgba(0,0,0,0.6)',

  baseBallSize: 60,
  scoreboardHeight: 64,
  safeMargin: 20,

  scoreHit: 1,
  scoreMiss: -1,
  scoreMin: 0,
  countdownSeconds: 5,
  gameDuration: 60,
  generateRetry: 20,
  finalTenThreshold: 10,

  // 难度配置：固定参数，不随时间升级
  difficultyTable: [
    { size: 60, maxBalls: 3 },
  ],
  difficultyInterval: 10, // 每 10 秒升级
};

// === 状态容器 ===
const state = {
  phase: 'idle',
  score: 0,
  timeLeft: CONFIG.gameDuration,
  countdownTimer: null,
  gameTimer: null,
  currentLevel: 1,
  // v2 统计
  stats: {
    hits: 0,
    totalClicks: 0,
    reactionTimes: [],
    deviations: [],
  },
  // v2 活跃小球 Map：ballEl → ballObj
  activeBalls: new Map(),
  // 音效
  audioCtx: null,
  muted: false,
};

// === DOM 引用 ===
const $ = {};

// =========================================================
// v2 音效系统（Web Audio API 合成）
// =========================================================

function ensureAudioCtx() {
  if (!state.audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    state.audioCtx = new AC();
  }
  if (state.audioCtx.state === 'suspended') state.audioCtx.resume();
}

function playTone(freq, duration, type = 'sine', volume = 0.15) {
  if (state.muted) return;
  try {
    ensureAudioCtx();
    const ctx = state.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) { /* 静默失败 */ }
}

function playHitSound()    { playTone(880, 0.08, 'sine', 0.15); }
function playMissSound()   { playTone(180, 0.12, 'square', 0.1); }
function playLevelUpSound(){ playTone(440, 0.1); setTimeout(() => playTone(660, 0.1), 100); }
function playEndSound()    { playTone(660, 0.15); setTimeout(() => playTone(440, 0.15), 150); setTimeout(() => playTone(330, 0.2), 300); }

function toggleMute() {
  state.muted = !state.muted;
  $.muteBtn.textContent = state.muted ? '🔇' : '🔊';
}

// =========================================================
// v2 难度系统
// =========================================================

function getDifficultyConfig(elapsedSeconds) {
  const idx = Math.min(
    Math.floor(elapsedSeconds / CONFIG.difficultyInterval),
    CONFIG.difficultyTable.length - 1
  );
  return CONFIG.difficultyTable[idx];
}

function updateLevel(elapsedSeconds) {
  const newLevel = Math.min(
    Math.floor(elapsedSeconds / CONFIG.difficultyInterval) + 1,
    CONFIG.difficultyTable.length
  );
  if (newLevel !== state.currentLevel) {
    state.currentLevel = newLevel;
    $.levelText.textContent = newLevel;
    showLevelUpToast(newLevel);
    playLevelUpSound();
  }
}

function showLevelUpToast(level) {
  const toast = document.createElement('div');
  toast.className = 'level-up-toast';
  toast.textContent = 'LEVEL UP → L' + level;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 800);
}

// =========================================================
// v2 统计面板
// =========================================================

function avg(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function updateStatsUI() {
  const s = state.stats;
  $.hitText.textContent = s.hits + '/' + s.totalClicks;

  const acc = s.totalClicks > 0 ? Math.round(s.hits / s.totalClicks * 100) : 0;
  $.accText.textContent = s.totalClicks > 0 ? acc + '%' : '--%';
  setThresholdClass($.accText, acc, 80, 60);

  const rt = Math.round(avg(s.reactionTimes));
  $.rtText.textContent = s.hits > 0 ? rt + 'ms' : '--ms';
  setThresholdClass($.rtText, rt, 300, 500, true);

  const dev = avg(s.deviations).toFixed(1);
  $.devText.textContent = s.hits > 0 ? dev + 'px' : '--px';
  setThresholdClass($.devText, parseFloat(dev), 10, 20, true);
}

function setThresholdClass(el, val, good, mid, reverse = false) {
  el.classList.remove('good', 'mid', 'bad');
  if (reverse) {
    // 值越小越好（反应时间、偏差）
    if (val <= good) el.classList.add('good');
    else if (val <= mid) el.classList.add('mid');
    else el.classList.add('bad');
  } else {
    // 值越大越好（命中率）
    if (val >= good) el.classList.add('good');
    else if (val >= mid) el.classList.add('mid');
    else el.classList.add('bad');
  }
}

// =========================================================
// 状态机 + 开场倒计时 + 游戏时间
// =========================================================

function onStartClick() {
  if (state.phase === 'ended') { resetGame(); return; }
  if (state.phase !== 'idle') return;
  ensureAudioCtx(); // 用户手势后初始化音频
  startCountdown();
}

function startCountdown() {
  state.phase = 'countdown';
  hideStartButton();

  let n = CONFIG.countdownSeconds;
  showCountdownNumber(n);

  const tick = () => {
    n--;
    if (n <= 0) {
      showCountdownGo();
      setTimeout(() => {
        removeCountdownOverlay();
        state.phase = 'playing';
        startGameTimer();
        seedInitialBalls();
      }, 1000);
    } else {
      showCountdownNumber(n);
      state.countdownTimer = setTimeout(tick, 1000);
    }
  };
  state.countdownTimer = setTimeout(tick, 1000);
}

function cancelCountdown() {
  if (state.phase !== 'countdown') return;
  if (state.countdownTimer) { clearTimeout(state.countdownTimer); state.countdownTimer = null; }
  removeCountdownOverlay();
  state.phase = 'idle';
  showStartButtonIdle();
}

function showCountdownNumber(n) {
  let overlay = $.countdownOverlay;
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'countdownOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:300;display:flex;justify-content:center;align-items:center;background:rgba(255,248,225,0.5);pointer-events:none;';
    document.body.appendChild(overlay);
    $.countdownOverlay = overlay;
  }
  overlay.innerHTML = '';
  const span = document.createElement('span');
  span.className = 'countdown-num';
  span.textContent = n;
  overlay.appendChild(span);
}

function showCountdownGo() {
  const overlay = $.countdownOverlay;
  overlay.innerHTML = '';
  const span = document.createElement('span');
  span.className = 'countdown-num go';
  span.textContent = 'GO!';
  overlay.appendChild(span);
}

function removeCountdownOverlay() {
  if ($.countdownOverlay) { $.countdownOverlay.remove(); $.countdownOverlay = null; }
}

function startGameTimer() {
  state.timeLeft = CONFIG.gameDuration;
  updateTimeUI();

  const elapsed = () => CONFIG.gameDuration - state.timeLeft;

  state.gameTimer = setInterval(() => {
    state.timeLeft--;
    updateTimeUI();
    updateLevel(elapsed());

    if (state.timeLeft <= 0) {
      clearInterval(state.gameTimer);
      state.gameTimer = null;
      state.phase = 'ended';
      endGame();
    }
  }, 1000);
}

function updateTimeUI() {
  $.timeText.textContent = state.timeLeft;
  if (state.timeLeft <= CONFIG.finalTenThreshold && state.timeLeft > 0) {
    $.scoreboard.classList.add('final-ten');
  } else {
    $.scoreboard.classList.remove('final-ten');
  }
}

function updateScoreUI() { $.scoreText.textContent = state.score; }

// =========================================================
// 结束遮罩 + 重置
// =========================================================

function endGame() {
  playEndSound();

  const balls = $.game.querySelectorAll('.ball');
  balls.forEach(ball => {
    ball.classList.remove('disappearing');
    ball.classList.add('final-fade');
  });

  $.scoreboard.classList.remove('final-ten');

  setTimeout(() => {
    showEndOverlay();
    balls.forEach(b => b.remove());
    state.activeBalls.clear();
  }, 400);
}

function showEndOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'endOverlay';

  const title = document.createElement('h1');
  title.textContent = '游戏结束';

  const scoreLine = document.createElement('div');
  scoreLine.id = 'finalScore';
  scoreLine.textContent = '本次得分：' + state.score + ' 分';

  // v2 统计详情
  const s = state.stats;
  const acc = s.totalClicks > 0 ? Math.round(s.hits / s.totalClicks * 100) : 0;
  const rt = Math.round(avg(s.reactionTimes));
  const dev = avg(s.deviations).toFixed(1);

  const grid = document.createElement('div');
  grid.className = 'stats-grid';
  grid.innerHTML = `
    <div><span class="label">命中率</span> <span class="value">${acc}%</span></div>
    <div><span class="label">反应时间</span> <span class="value">${s.hits > 0 ? rt + 'ms' : '--'}</span></div>
    <div><span class="label">平均偏差</span> <span class="value">${s.hits > 0 ? dev + 'px' : '--'}</span></div>
    <div><span class="label">命中数</span> <span class="value">${s.hits}/${s.totalClicks}</span></div>
  `;

  const btn = $.startBtn;
  btn.textContent = '再来一次';
  btn.style.position = '';
  btn.style.top = '';
  btn.style.left = '';
  btn.style.transform = '';
  btn.style.display = '';
  btn.style.margin = '0 auto';

  overlay.appendChild(title);
  overlay.appendChild(scoreLine);
  overlay.appendChild(grid);
  overlay.appendChild(btn);
  document.body.appendChild(overlay);
  $.endOverlay = overlay;
}

function hideEndOverlay() {
  if (!$.endOverlay) return;
  $.endOverlay.remove();
  $.endOverlay = null;
}

function hideStartButton() { $.startBtn.style.display = 'none'; }

function showStartButtonIdle() {
  $.startBtn.textContent = '开始游戏';
  $.startBtn.style.position = '';
  $.startBtn.style.top = '';
  $.startBtn.style.left = '';
  $.startBtn.style.transform = '';
  $.startBtn.style.display = '';
}

function resetGame() {
  const btn = $.startBtn;
  hideEndOverlay();

  btn.textContent = '开始游戏';
  btn.style.position = 'fixed';
  btn.style.top = '50%';
  btn.style.left = '50%';
  btn.style.transform = 'translate(-50%, -50%)';
  btn.style.display = 'none';
  document.body.appendChild(btn);

  $.game.innerHTML = '';
  state.activeBalls.clear();

  state.score = 0;
  state.timeLeft = CONFIG.gameDuration;
  state.currentLevel = 1;
  state.stats = { hits: 0, totalClicks: 0, reactionTimes: [], deviations: [] };
  state.phase = 'idle';
  updateScoreUI();
  updateTimeUI();
  updateStatsUI();
  $.levelText.textContent = '1';

  startCountdown();
}

function handleEsc(e) {
  if (e.key !== 'Escape') return;
  if (state.phase === 'countdown') cancelCountdown();
  else if (state.phase === 'ended') resetGame();
}

// =========================================================
// v2 小球生成（对象化 + 寿命 + 难度尺寸）
// =========================================================

function seedInitialBalls() {
  const cfg = getDifficultyConfig(0);
  for (let i = 0; i < cfg.maxBalls; i++) generateBall();
}

function computeSafeBounds(ballSize) {
  const containerWidth = $.game.clientWidth;
  const containerHeight = $.game.clientHeight;
  return {
    minLeft: CONFIG.safeMargin,
    maxLeft: containerWidth - ballSize - CONFIG.safeMargin,
    minTop: CONFIG.safeMargin,
    maxTop: containerHeight - ballSize - CONFIG.safeMargin,
  };
}

function isOverlapping(newLeft, newTop, ballSize) {
  const newCenterX = newLeft + ballSize / 2;
  const newCenterY = newTop + ballSize / 2;
  const minDistance = ballSize;

  for (const [ballEl, ballObj] of state.activeBalls) {
    if (ballObj.dying) continue; // 正在消失的球不参与碰撞
    const dist = Math.hypot(newCenterX - ballObj.cx, newCenterY - ballObj.cy);
    if (dist < minDistance) return true;
  }
  return false;
}

function getRandomPosition(ballSize) {
  const bounds = computeSafeBounds(ballSize);
  for (let i = 0; i < CONFIG.generateRetry; i++) {
    const left = bounds.minLeft + Math.random() * Math.max(0, bounds.maxLeft - bounds.minLeft);
    const top = bounds.minTop + Math.random() * Math.max(0, bounds.maxTop - bounds.minTop);
    if (!isOverlapping(left, top, ballSize)) return { left, top };
  }
  return null;
}

function generateBall() {
  if (state.phase !== 'playing') return;

  const elapsed = CONFIG.gameDuration - state.timeLeft;
  const cfg = getDifficultyConfig(elapsed);
  const ballSize = cfg.size;

  // 同屏上限
  const aliveCount = [...state.activeBalls.values()].filter(b => !b.dying).length;
  if (aliveCount >= cfg.maxBalls) return;

  const pos = getRandomPosition(ballSize);
  if (!pos) return;

  const el = document.createElement('div');
  el.className = 'ball';
  el.style.width = ballSize + 'px';
  el.style.height = ballSize + 'px';
  el.style.left = pos.left + 'px';
  el.style.top = pos.top + 'px';
  $.game.appendChild(el);

  const ballObj = {
    el,
    spawnTime: performance.now(),
    size: ballSize,
    cx: pos.left + ballSize / 2,
    cy: pos.top + ballSize / 2,
    dying: false,
  };

  state.activeBalls.set(el, ballObj);
}

// =========================================================
// v2 点击交互（严格判定 + 偏差/反应时间记录 + 视觉反馈）
// =========================================================

function handleGameClick(e) {
  if (state.phase !== 'playing') return;

  try {
    const target = e.target;
    const ballEl = target && target.closest ? target.closest('.ball') : null;

    if (ballEl) {
      const ballObj = state.activeBalls.get(ballEl);
      if (!ballObj || ballObj.dying) {
        onMiss(e);
        return;
      }
      onBallHit(ballEl, ballObj, e);
    } else {
      onMiss(e);
    }
  } catch (err) {
    console.warn('[handleGameClick]', err);
  }
}

function onBallHit(ballEl, ballObj, clickEvent) {
  ballObj.dying = true;
  ballEl.style.pointerEvents = 'none';

  // 严格命中判定：点击点到球心距离 ≤ 半径
  const gameRect = $.game.getBoundingClientRect();
  const clickX = clickEvent.clientX - gameRect.left;
  const clickY = clickEvent.clientY - gameRect.top;
  const distance = Math.hypot(clickX - ballObj.cx, clickY - ballObj.cy);
  const radius = ballObj.size / 2;

  if (distance > radius) {
    // 点在方形 DOM 内但超出圆形 → 算未命中
    onMiss(clickEvent);
    return;
  }

  // 命中
  state.stats.hits++;
  state.stats.totalClicks++;
  state.score += CONFIG.scoreHit;

  // 反应时间
  const rt = performance.now() - ballObj.spawnTime;
  state.stats.reactionTimes.push(rt);

  // 偏差
  state.stats.deviations.push(distance);

  updateScoreUI();
  updateStatsUI();

  // 视觉反馈
  createHitParticles(clickEvent.clientX, clickEvent.clientY);
  createHitRing(clickEvent.clientX, clickEvent.clientY, ballObj.size);
  createFloatText('+' + CONFIG.scoreHit + ' · ' + Math.round(rt) + 'ms', clickEvent.clientX, clickEvent.clientY, true);

  playHitSound();

  ballEl.classList.add('disappearing');
  setTimeout(() => {
    if (ballEl.parentNode) ballEl.parentNode.removeChild(ballEl);
    state.activeBalls.delete(ballEl);
  }, 200);

  generateBall();
}

function onMiss(clickEvent) {
  state.stats.totalClicks++;
  const prevScore = state.score;
  state.score = Math.max(CONFIG.scoreMin, state.score + CONFIG.scoreMiss);
  updateScoreUI();
  updateStatsUI();

  if (state.score < prevScore) flashScoreArea();

  createMissMark(clickEvent.clientX, clickEvent.clientY);
  createFloatText(String(CONFIG.scoreMiss), clickEvent.clientX, clickEvent.clientY, false);
  playMissSound();
}

// === v2 视觉反馈 ===

function createHitParticles(cx, cy) {
  const count = 10;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const dist = 30 + Math.random() * 30;
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = cx + 'px';
    p.style.top = cy + 'px';
    p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
    p.style.background = i % 2 === 0 ? CONFIG.ballColor : '#FFFFFF';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 400);
  }
}

function createHitRing(cx, cy, size) {
  const ring = document.createElement('div');
  ring.className = 'hit-ring';
  ring.style.left = cx + 'px';
  ring.style.top = cy + 'px';
  ring.style.width = size + 'px';
  ring.style.height = size + 'px';
  document.body.appendChild(ring);
  setTimeout(() => ring.remove(), 300);
}

function createMissMark(cx, cy) {
  const mark = document.createElement('div');
  mark.className = 'miss-mark';
  mark.textContent = '✕';
  mark.style.left = cx + 'px';
  mark.style.top = cy + 'px';
  document.body.appendChild(mark);
  setTimeout(() => mark.remove(), 420);
}

function createFloatText(text, clientX, clientY, isPositive) {
  const float = document.createElement('div');
  float.className = 'float-text ' + (isPositive ? 'positive' : 'negative');
  float.textContent = text;
  float.style.position = 'fixed';
  float.style.left = clientX + 'px';
  float.style.top = clientY + 'px';
  float.style.zIndex = 500;
  document.body.appendChild(float);
  setTimeout(() => { if (float.parentNode) float.remove(); }, isPositive ? 600 : 500);
}

function flashScoreArea() {
  $.scoreboard.classList.remove('score-flash');
  void $.scoreboard.offsetWidth;
  $.scoreboard.classList.add('score-flash');
}

// =========================================================
// 初始化
// =========================================================
document.addEventListener('DOMContentLoaded', function init() {
  $.game = document.getElementById('game');
  $.scoreboard = document.getElementById('scoreboard');
  $.scoreText = document.getElementById('scoreText');
  $.timeText = document.getElementById('timeText');
  $.hitText = document.getElementById('hitText');
  $.accText = document.getElementById('accText');
  $.rtText = document.getElementById('rtText');
  $.devText = document.getElementById('devText');
  $.levelText = document.getElementById('levelText');
  $.muteBtn = document.getElementById('muteBtn');
  $.startBtn = document.getElementById('startBtn');

  $.startBtn.addEventListener('click', onStartClick);
  $.muteBtn.addEventListener('click', toggleMute);
  document.addEventListener('click', handleGameClick);
  document.addEventListener('keydown', handleEsc);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  updateStatsUI();
  console.log('[v2] Aim Lab 风格训练游戏已就绪');
});

// =========================================================
// 页面可见性变化
// =========================================================
function handleVisibilityChange() {
  if (document.hidden) {
    if (state.gameTimer) { clearInterval(state.gameTimer); state.gameTimer = null; }
  } else {
    if (state.phase === 'playing' && !state.gameTimer && state.timeLeft > 0) {
      state.gameTimer = setInterval(() => {
        state.timeLeft--;
        updateTimeUI();
        updateLevel(CONFIG.gameDuration - state.timeLeft);
        if (state.timeLeft <= 0) {
          clearInterval(state.gameTimer);
          state.gameTimer = null;
          state.phase = 'ended';
          endGame();
        }
      }, 1000);
    }
  }
}
