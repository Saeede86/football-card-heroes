// ====== ضربات پنالتی (دونفره، مثل جام جهانی) ======
// یه بار تو شوت می‌زنی، یه بار تیم حریف. وقتی حریف شوت می‌زنه، تو دروازه‌بانی!
// هر کدوم ۵ تا شوت داره. اگه مساوی شد، تک‌ضربه‌ها شروع می‌شه تا یکی ببره.
// دو نوع بازی داریم: «دوستانه» و «جام پنالتی» (سه مرحله تا جام قهرمانی).

const KICKS = 5;
const MAX_ROUNDS = 10; // اگه بعد از ۱۰ دور هنوز مساوی بود، بازی مساوی تموم می‌شه
const COINS_PER_GOAL = 20;
const COINS_PER_SAVE = 20;
const WIN_BONUS = 50;
const CUP_BONUS = 200; // جایزه بردن جام

// سطح سختی
//   keeper = دروازه‌بان حریف چقدر خوب حدس می‌زنه
//   miss   = شانس اینکه شوت حریف بره بیرون
//   speed  = نوار قدرت چند میلی‌ثانیه طول می‌کشه تا بره و برگرده
//   coins  = سکه‌ها چند برابر می‌شن
const LEVELS = {
  easy: { label: "آسون", keeper: 0.7, miss: 0.15, speed: 2200, coins: 1, coinsText: "سکه‌ها عادی" },
  medium: { label: "متوسط", keeper: 1, miss: 0.08, speed: 1500, coins: 1.5, coinsText: "سکه‌ها یک و نیم برابر" },
  hard: { label: "سخت", keeper: 1.3, miss: 0.04, speed: 1000, coins: 2, coinsText: "سکه‌ها دو برابر" },
};

// مرحله‌های جام: هر مرحله دروازه‌بان حریف بهتر و شوت‌هاش دقیق‌تره
const CUP_ROUNDS = [
  { name: "یک‌چهارم نهایی", boost: 0 },
  { name: "نیمه‌نهایی", boost: 0.05 },
  { name: "فینال", boost: 0.1 },
];

// اگه هنوز هیچ کارتی نداری، این بازیکن شوت می‌زنه
const ROOKIE = { id: "rookie", name: "تازه‌کار", power: 70, look: { skin: "#d9a27a", hair: "#2b1d14", hairStyle: "short", shirt: "#2e7d32", trim: "#ffffff", number: 7 } };

const OPPONENT_NAMES = ["ستاره‌های شهر", "شیرهای آبی", "عقاب‌های طلایی", "پلنگ‌های سرخ", "گرگ‌های کوهستان"];
const OPPONENT_SKINS = ["#f1c6a6", "#e0ac85", "#c68a63", "#8d5a3b", "#6b4026"];

// شش جای دروازه: ستون ۰ = چپ، ۱ = وسط، ۲ = راست / ردیف ۰ = بالا، ۱ = پایین
const ZONE_NAMES = [["بالا چپ", "بالا وسط", "بالا راست"], ["پایین چپ", "پایین وسط", "پایین راست"]];

// شیرجه دروازه‌بان به هر جای دروازه
const DIVES = {
  "0,0": "translate(-150%, -45%) rotate(-65deg)",
  "0,1": "translate(-150%, 15%) rotate(-85deg)",
  "1,0": "translate(0, -40%)",
  "1,1": "translate(0, 8%) scale(1.05, 0.9)",
  "2,0": "translate(150%, -45%) rotate(65deg)",
  "2,1": "translate(150%, 15%) rotate(85deg)",
};

// نوار قدرت: زیر ۳۰ ضعیف، ۳۰ تا ۷۵ خوب، ۷۵ تا ۹۰ عالی، بالای ۹۰ خیلی محکم (می‌ره بیرون)
const POWER_WEAK = 30;
const POWER_PERFECT = 75;
const POWER_TOO_HARD = 90;

if (!save.penalty) save.penalty = { mode: "friendly", level: "easy", cups: 0 };

// شانس اینکه دروازه‌بان حریف درست حدس بزنه (قدرت ۷۰ → ۴۵٪، قدرت ۹۵ → ۱۵٪)
function keeperChance(power) {
  return Math.min(0.45, Math.max(0.15, 0.45 - (power - 70) * 0.012));
}

// جای وسط هر قسمت دروازه (به درصد از زمین)
function zoneCenter(col, row) {
  return { x: 14 + (72 * (col + 0.5)) / 3, y: 14 + (46 * (row + 0.5)) / 2 };
}

const penaltyEl = document.getElementById("penalty");
const pickView = document.getElementById("pick-view");
const shootView = document.getElementById("shoot-view");
const pickGrid = document.getElementById("pick-grid");
const fieldEl = document.getElementById("field");
const crowdEl = document.getElementById("crowd");
const ballEl = document.getElementById("ball");
const ballShadow = document.getElementById("ball-shadow");
const ghosts = [...document.querySelectorAll(".ball--ghost")];
const keeperEl = document.getElementById("keeper");
const kickerEl = document.getElementById("kicker");
const netEl = document.getElementById("net");
const shoutEl = document.getElementById("shout");
const zonesEl = document.getElementById("zones");
const turnEl = document.getElementById("turn");
const powerEl = document.getElementById("power");
const powerMarker = document.getElementById("power-marker");
const powerBtn = document.getElementById("power-btn");
const cupPathEl = document.getElementById("cup-path");
const roundEndEl = document.getElementById("round-end");
const trophyEl = document.getElementById("trophy");
const againBtnPen = document.getElementById("pen-again");
const shootHint = document.getElementById("shoot-hint");
const penaltyTile = document.getElementById("penalty-btn");
const soundBtn = document.getElementById("sound-btn");

let shooter = null;
let opponent = null;
let mine = [];   // نتیجه شوت‌های تو (true = گل)
let theirs = []; // نتیجه شوت‌های حریف (true = گل)
let turn = "shoot"; // "shoot" = نوبت شوت تو، "save" = نوبت دروازه‌بانی تو
let earnedThisGame = 0;
let busy = false;
let cupRound = 0;
let nextAction = "again";
let aim = null; // جایی که برای شوت انتخاب کردی

function level() {
  return LEVELS[save.penalty.level];
}

function renderPenaltyCoins() {
  document.getElementById("pen-coins").textContent = fa(save.coins);
}

function addCoins(amount) {
  const coins = Math.round(amount * level().coins);
  save.coins += coins;
  earnedThisGame += coins;
  writeSave();
  renderCoins();
  renderPenaltyCoins();
  updatePackButtons();
  return coins;
}

// ---------- تماشاگرها ----------
const FAN_COLORS = ["#e8423f", "#f2c14e", "#5cbfeb", "#ffffff", "#2fbf71", "#ff7a1a", "#9b59ff", "#1f5fbf"];

function buildCrowd() {
  let html = "";
  [4, 16, 28, 40, 52, 64, 76, 88].forEach((top, row) => {
    for (let i = 0; i < 34; i++) {
      const left = i * 3 + (row % 2) * 1.5 + Math.random() * 0.8;
      const color = randomFrom(FAN_COLORS);
      const skin = randomFrom(OPPONENT_SKINS);
      const delay = (Math.random() * 0.3).toFixed(2);
      html += `<span class="fan" style="left:${left}%;top:${top}%;--shirt:${color};--skin:${skin};--d:${delay}s"></span>`;
    }
  });
  crowdEl.innerHTML = html;
}

function cheerCrowd() {
  crowdEl.classList.remove("is-cheering");
  void crowdEl.offsetWidth;
  crowdEl.classList.add("is-cheering");
}

// ---------- بازیکنی که شوت می‌زنه (از پشت دیده می‌شه) ----------
function kickerSVG(look) {
  const hair = look.hairStyle === "bald"
    ? ""
    : `<path d="M12 12 Q12 3 20 3 Q28 3 28 12 Q28 17 20 17 Q12 17 12 12Z" fill="${look.hair}"/>`;
  return `<svg viewBox="0 0 40 80" aria-hidden="true">
    <rect x="13" y="54" width="5.5" height="24" rx="2.5" fill="${look.skin}"/>
    <rect x="12.5" y="64" width="6.5" height="14" rx="2.5" fill="${look.shirt}"/>
    <g class="kicker__leg">
      <rect x="21.5" y="54" width="5.5" height="24" rx="2.5" fill="${look.skin}"/>
      <rect x="21" y="64" width="6.5" height="14" rx="2.5" fill="${look.shirt}"/>
      <rect x="20.5" y="75" width="8" height="4" rx="2" fill="#111111"/>
    </g>
    <rect x="12" y="75" width="8" height="4" rx="2" fill="#111111"/>
    <rect x="11" y="44" width="18" height="13" rx="3" fill="#1b1b1b"/>
    <rect x="3.5" y="23" width="6" height="19" rx="3" fill="${look.shirt}" transform="rotate(12 6.5 23)"/>
    <rect x="30.5" y="23" width="6" height="19" rx="3" fill="${look.shirt}" transform="rotate(-12 33.5 23)"/>
    <path d="M9 23 Q20 17 31 23 L30 48 L10 48Z" fill="${look.shirt}"/>
    <text x="20" y="40" text-anchor="middle" font-size="12" font-weight="800" font-family="Arial, sans-serif" fill="${look.numberColor || look.trim}">${look.number}</text>
    <rect x="17" y="15" width="6" height="7" fill="${look.skin}"/>
    <circle cx="12.3" cy="11.5" r="2" fill="${look.skin}"/>
    <circle cx="27.7" cy="11.5" r="2" fill="${look.skin}"/>
    <circle cx="20" cy="10.5" r="8" fill="${look.skin}"/>
    ${hair}
  </svg>`;
}

// ---------- صفحه انتخاب: نوع بازی، سختی و شوت‌زن ----------
function renderOptions() {
  document.querySelectorAll("[data-pen-mode]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.penMode === save.penalty.mode)));
  document.querySelectorAll("[data-pen-level]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.penLevel === save.penalty.level)));
  const lv = level();
  document.getElementById("level-info").textContent =
    (save.penalty.mode === "cup"
      ? `جام: سه مرحله تا قهرمانی، جایزه جام ${fa(Math.round(CUP_BONUS * lv.coins))} سکه`
      : "دوستانه: یه بازی تکی") + ` · ${lv.coinsText}`;
  document.getElementById("cup-count").textContent =
    save.penalty.cups ? `🏆 تا حالا ${fa(save.penalty.cups)} بار قهرمان جام پنالتی شدی!` : "";
}

function showPicker() {
  pickView.hidden = false;
  shootView.hidden = true;
  renderOptions();
  const owned = CARDS.filter((c) => save.collection[c.id]).sort((a, b) => b.power - a.power);
  if (owned.length) {
    pickGrid.innerHTML = owned.map((c) => cardHTML(c)).join("");
  } else {
    pickGrid.innerHTML = `<p class="penalty__hint">هنوز کارتی نداری! فعلاً بازیکن تازه‌کار شوت می‌زنه.</p>
      <button class="btn btn--gold" type="button" data-id="rookie">شوت با تازه‌کار (قدرت ${fa(ROOKIE.power)})</button>`;
  }
}

document.getElementById("pen-options").addEventListener("click", (e) => {
  const modeBtn = e.target.closest("[data-pen-mode]");
  const levelBtn = e.target.closest("[data-pen-level]");
  if (modeBtn) save.penalty.mode = modeBtn.dataset.penMode;
  if (levelBtn) save.penalty.level = levelBtn.dataset.penLevel;
  if (!modeBtn && !levelBtn) return;
  writeSave();
  renderOptions();
});

pickGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-id]");
  if (!btn) return;
  shooter = btn.dataset.id === "rookie" ? ROOKIE : CARDS.find((c) => c.id === btn.dataset.id);
  cupRound = 0;
  startGame();
});

// دروازه‌بان تو: بهترین دروازه‌بانی که داری
function myKeeper() {
  return CARDS
    .filter((c) => c.position === "دروازه‌بان" && save.collection[c.id])
    .sort((a, b) => b.power - a.power)[0];
}

function isCup() {
  return save.penalty.mode === "cup";
}

// سختی این بازی (با حساب مرحله جام)
function boost() {
  return isCup() ? CUP_ROUNDS[cupRound].boost : 0;
}

function renderCupPath() {
  cupPathEl.hidden = !isCup();
  if (!isCup()) return;
  cupPathEl.innerHTML = CUP_ROUNDS.map((r, i) => {
    const state = i < cupRound ? "is-done" : i === cupRound ? "is-now" : "";
    return `<span class="cup-step ${state}">${i < cupRound ? "✓ " : ""}${r.name}</span>`;
  }).join(`<span class="cup-arrow" aria-hidden="true">‹</span>`) + `<span class="cup-arrow" aria-hidden="true">‹</span><span class="cup-step cup-step--trophy">🏆</span>`;
}

// ---------- شروع بازی ----------
function startGame() {
  pickView.hidden = true;
  shootView.hidden = false;
  roundEndEl.hidden = true;
  trophyEl.hidden = true;
  mine = [];
  theirs = [];
  turn = "shoot";
  earnedThisGame = 0;
  opponent = {
    name: randomFrom(OPPONENT_NAMES),
    look: {
      skin: randomFrom(OPPONENT_SKINS), hair: "#1a1110", hairStyle: randomFrom(["short", "buzz", "bald"]),
      shirt: "#e8423f", trim: "#ffffff", number: randomFrom([7, 9, 10, 11, 17]),
    },
  };
  document.getElementById("opp-name").textContent = opponent.name;
  const keeper = myKeeper();
  document.getElementById("shooter-info").innerHTML =
    `شوت‌زن: <strong>${shooter.name}</strong> · سختی: ${level().label}` +
    (keeper ? ` · دروازه‌بان: <strong>${keeper.name}</strong>` : "");
  renderCupPath();
  renderScore();
  Sound.whistle();
  prepareKick();
}

function goals(list) {
  return list.filter(Boolean).length;
}

function renderScore() {
  const total = Math.max(KICKS, mine.length, theirs.length);
  const dots = (list) => {
    let html = "";
    for (let i = 0; i < total; i++) {
      const r = list[i];
      const cls = r === true ? "shot--goal" : r === false ? "shot--saved" : "";
      const label = r === true ? "گل" : r === false ? "خراب" : "مونده";
      html += `<span class="shot ${cls}" aria-label="${label}">${r === true ? "✓" : r === false ? "✕" : ""}</span>`;
    }
    return html;
  };
  document.getElementById("shots-mine").innerHTML = dots(mine);
  document.getElementById("shots-opp").innerHTML = dots(theirs);
  document.getElementById("goals-mine").textContent = fa(goals(mine));
  document.getElementById("goals-opp").textContent = fa(goals(theirs));
}

// آماده شدن برای شوت بعدی
function prepareKick() {
  resetField();
  aim = null;
  stopMeter();
  powerEl.hidden = true;
  const shooting = turn === "shoot";
  fieldEl.classList.toggle("is-saving", !shooting);
  turnEl.textContent = shooting ? "⚽ نوبت شوت توئه!" : "🧤 نوبت دروازه‌بانی توئه!";
  turnEl.className = "turn " + (shooting ? "turn--shoot" : "turn--save");
  shootHint.textContent = shooting
    ? "۱. روی یه جای دروازه بزن تا نشونه بگیری."
    : "حدس بزن حریف کجا می‌زنه و روی همون جا بزن تا شیرجه بری!";
  kickerEl.innerHTML = kickerSVG(shooting ? shooter.look || ROOKIE.look : opponent.look);
  setZonesEnabled(true);
}

function setZonesEnabled(on) {
  zonesEl.querySelectorAll("button").forEach((b) => (b.disabled = !on));
}

function resetField() {
  [ballEl, ballShadow, keeperEl, kickerEl, netEl, ...ghosts].forEach((el) =>
    el.getAnimations({ subtree: true }).forEach((a) => a.cancel()));
  zonesEl.querySelectorAll(".is-aimed").forEach((b) => b.classList.remove("is-aimed"));
  shoutEl.hidden = true;
}

function showShout(text, good) {
  shoutEl.textContent = text;
  shoutEl.className = "shout " + (good ? "shout--goal" : "shout--saved");
  shoutEl.hidden = false;
}

// ---------- نوار قدرت ----------
let meterFrame = 0;
let meterStart = 0;
let meterValue = 0;

function meterTick(now) {
  const period = level().speed;
  const t = ((now - meterStart) % period) / period; // ۰ تا ۱
  meterValue = t < 0.5 ? t * 200 : (1 - t) * 200; // می‌ره بالا و برمی‌گرده
  powerMarker.style.insetInlineStart = `${meterValue}%`;
  meterFrame = requestAnimationFrame(meterTick);
}

function startMeter() {
  stopMeter();
  powerEl.hidden = false;
  meterStart = performance.now();
  meterFrame = requestAnimationFrame(meterTick);
}

function stopMeter() {
  cancelAnimationFrame(meterFrame);
  meterFrame = 0;
}

// ---------- انیمیشن‌ها ----------
function runUp(fast) {
  return kickerEl.animate(
    [{ left: "37%", top: "80%" }, { left: "45.5%", top: "89%" }],
    { duration: 450 * fast, easing: "ease-in", fill: "forwards" }
  ).finished;
}

// پای شوت‌زن به توپ می‌خوره
function swingLeg(fast) {
  const leg = kickerEl.querySelector(".kicker__leg");
  if (!leg) return;
  leg.animate(
    [{ transform: "none" },
     { transform: "translateY(3px) rotate(-14deg)", offset: 0.4 },
     { transform: "translateY(-8px) scaleY(0.72) rotate(12deg)" }],
    { duration: 240 * fast, easing: "ease-out", fill: "forwards" }
  );
  kickerEl.animate([{ rotate: "0deg" }, { rotate: "-6deg" }], { duration: 240 * fast, fill: "forwards" });
}

// پرواز توپ با سایه و دنباله
function flyBall(target, fast, speed = 1) {
  const duration = (550 / speed) * fast;
  const frames = [
    { left: "50%", top: "86%", width: "7%", rotate: "0deg" },
    { left: `${target.x}%`, top: `${target.y}%`, width: "4.5%", rotate: "620deg" },
  ];
  const easing = "cubic-bezier(.2,.7,.4,1)";
  ghosts.forEach((g, i) => {
    g.animate(
      [{ ...frames[0], opacity: 0.35 - i * 0.1 }, { ...frames[1], opacity: 0 }],
      { duration, delay: (i + 1) * 35 * fast, easing, fill: "both" }
    );
  });
  ballShadow.animate(
    [{ left: "50%", top: "88.5%", width: "6%", opacity: 0.5 },
     { left: `${target.x}%`, top: "60%", width: "3%", opacity: 0.25 }],
    { duration, easing, fill: "forwards" }
  );
  return ballEl.animate(frames, { duration, easing, fill: "forwards" }).finished;
}

function bounceOut(target, col, fast) {
  ballEl.animate(
    [{ left: `${target.x}%`, top: `${target.y}%`, width: "4.5%" },
     { left: `${target.x + (col === 1 ? 18 : (1 - col) * 14)}%`, top: "74%", width: "6%" }],
    { duration: 500 * fast, easing: "ease-out", fill: "forwards" }
  );
}

// تور دروازه از جایی که توپ خورده موج برمی‌داره
function netWave(target) {
  const ox = ((target.x - 14) / 72) * 100;
  const oy = ((target.y - 14) / 46) * 100;
  netEl.style.transformOrigin = `${ox}% ${oy}%`;
  netEl.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.08, 1.1)" }, { transform: "scale(0.98)" }, { transform: "scale(1.02)" }, { transform: "scale(1)" }],
    { duration: 700, easing: "ease-out" }
  );
}

function dive(col, row, fast) {
  keeperEl.animate([{ transform: "none" }, { transform: DIVES[`${col},${row}`] }],
    { duration: 420 * fast, delay: 120 * fast, easing: "ease-out", fill: "forwards" });
}

// ---------- نوبت شوت تو ----------
async function myKick(col, row, power) {
  const fast = reduceMotion ? 0.2 : 1;
  const tooHard = power > POWER_TOO_HARD;
  const perfect = power >= POWER_PERFECT && !tooHard;
  const weak = power < POWER_WEAK;

  // شانس اینکه دروازه‌بان حریف درست حدس بزنه
  let chance = keeperChance(shooter.power) * level().keeper + boost();
  if (perfect) chance *= 0.5;
  if (weak) chance += 0.3;
  chance = Math.min(0.9, chance);

  let diveCol = col;
  let diveRow = row;
  if (Math.random() >= chance) {
    const others = Object.keys(DIVES).filter((k) => k !== `${col},${row}`);
    [diveCol, diveRow] = randomFrom(others).split(",").map(Number);
  }
  // شوت ضعیف: اگه دروازه‌بان سمت درست بره (حتی ارتفاع اشتباه)، می‌گیره
  const saved = !tooHard && (diveCol === col && (diveRow === row || weak));
  const target = zoneCenter(col, row);
  if (tooHard) target.y = 5;

  await runUp(fast);
  swingLeg(fast);
  Sound.kick();
  dive(diveCol, diveRow, fast);
  await flyBall(target, fast, perfect ? 1.4 : weak ? 0.7 : 1);

  const label = perfect ? "عالی! " : weak ? "ضعیف · " : "";
  if (tooHard) {
    showShout("خیلی محکم زدی! رفت هوا", false);
    Sound.groan();
  } else if (saved) {
    bounceOut(target, col, fast);
    showShout(`${label}دروازه‌بان گرفت!`, false);
    Sound.groan();
  } else {
    netWave(target);
    const coins = addCoins(COINS_PER_GOAL);
    showShout(`${label}گل! +${fa(coins)}`, true);
    cheerCrowd();
    Sound.cheer();
  }
  mine.push(!saved && !tooHard);
}

// ---------- نوبت دروازه‌بانی تو ----------
async function theirKick(col, row) {
  const fast = reduceMotion ? 0.2 : 1;
  // حریف یه جای شانسی رو انتخاب می‌کنه
  const shotCol = Math.floor(Math.random() * 3);
  const shotRow = Math.floor(Math.random() * 2);
  const missed = Math.random() < Math.max(0.01, level().miss - boost() * 0.3);
  // اگه درست سمت توپ (چپ، وسط یا راست) شیرجه بری، توپ رو می‌گیری.
  // توی سطح سخت، اگه ارتفاع رو اشتباه حدس بزنی، نصف وقت‌ها توپ از دستت در می‌ره.
  const rightSide = shotCol === col;
  const saved = !missed && rightSide &&
    (save.penalty.level !== "hard" || shotRow === row || Math.random() < 0.5);
  const target = zoneCenter(shotCol, shotRow);
  if (missed) target.y = 5;

  await runUp(fast);
  swingLeg(fast);
  Sound.kick();
  dive(col, row, fast);
  await flyBall(target, fast);

  if (missed) {
    showShout("زد بیرون!", true);
    cheerCrowd();
    Sound.cheer();
  } else if (saved) {
    bounceOut(target, shotCol, fast);
    const coins = addCoins(COINS_PER_SAVE);
    showShout(`گرفتی! +${fa(coins)}`, true);
    cheerCrowd();
    Sound.cheer();
  } else {
    netWave(target);
    showShout("گل خوردی!", false);
    Sound.groan();
  }
  theirs.push(!missed && !saved);
}

// آیا بازی تموم شده؟ "win" / "lose" / "draw" / null
function result() {
  const m = mine.length;
  const t = theirs.length;
  const gm = goals(mine);
  const gt = goals(theirs);
  if (m <= KICKS && t <= KICKS && (m < KICKS || t < KICKS)) {
    // ۵ شوت اول: اگه یکی دیگه نتونه برسه، بازی تمومه
    if (gm > gt + (KICKS - t)) return "win";
    if (gt > gm + (KICKS - m)) return "lose";
    return null;
  }
  if (m === t && gm !== gt) return gm > gt ? "win" : "lose";
  if (m === t && m >= MAX_ROUNDS) return "draw";
  return null;
}

async function afterKick() {
  renderScore();
  await sleep(1400);
  const end = result();
  if (end) {
    finishGame(end);
  } else {
    turn = turn === "shoot" ? "save" : "shoot";
    prepareKick();
  }
  busy = false;
}

zonesEl.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-col]");
  if (!btn || busy) return;
  const col = Number(btn.dataset.col);
  const row = Number(btn.dataset.row);
  if (turn === "shoot") {
    // اول نشونه می‌گیری، بعد با نوار قدرت شوت می‌زنی
    aim = { col, row };
    zonesEl.querySelectorAll(".is-aimed").forEach((b) => b.classList.remove("is-aimed"));
    btn.classList.add("is-aimed");
    shootHint.textContent = "۲. وقتی نشونگر توی قسمت سبز یا طلاییه، دکمه «شوت!» رو بزن.";
    if (!meterFrame) startMeter();
    powerBtn.focus();
    return;
  }
  busy = true;
  setZonesEnabled(false);
  await theirKick(col, row);
  await afterKick();
});

powerBtn.addEventListener("click", async () => {
  if (busy || !aim) return;
  busy = true;
  stopMeter();
  setZonesEnabled(false);
  const power = meterValue;
  await sleep(250);
  powerEl.hidden = true;
  await myKick(aim.col, aim.row, power);
  await afterKick();
});

function finishGame(end) {
  setZonesEnabled(false);
  turnEl.textContent = "";
  shootHint.textContent = "";
  Sound.whistle();
  if (end === "win") {
    addCoins(WIN_BONUS);
    celebrate(document.querySelector(".shootout"));
    cheerCrowd();
    Sound.cheer();
  }
  const score = `${fa(goals(mine))} - ${fa(goals(theirs))}`;
  let title;
  if (!isCup()) {
    title = end === "win" ? `بردی! ${score} 🏆` : end === "lose" ? `باختی! ${score}` : `مساوی شد! ${score}`;
    nextAction = "again";
    againBtnPen.textContent = "یه بازی دیگه";
  } else if (end === "win" && cupRound === CUP_ROUNDS.length - 1) {
    // قهرمان جام!
    addCoins(CUP_BONUS);
    save.penalty.cups += 1;
    writeSave();
    title = `قهرمان جام پنالتی شدی! ${score}`;
    trophyEl.hidden = false;
    celebrate(trophyEl);
    nextAction = "restart";
    againBtnPen.textContent = "یه جام دیگه";
  } else if (end === "win") {
    title = `بردی! ${score} · رفتی ${CUP_ROUNDS[cupRound + 1].name}!`;
    nextAction = "next";
    againBtnPen.textContent = `برو ${CUP_ROUNDS[cupRound + 1].name}`;
  } else if (end === "lose") {
    title = `باختی و از جام حذف شدی! ${score}`;
    nextAction = "restart";
    againBtnPen.textContent = "شروع دوباره جام";
  } else {
    title = `مساوی شد! ${score} · این مرحله رو دوباره بازی کن`;
    nextAction = "retry";
    againBtnPen.textContent = "دوباره همین مرحله";
  }
  document.getElementById("round-title").textContent = title;
  document.getElementById("round-detail").textContent = `توی این بازی ${fa(earnedThisGame)} سکه گرفتی.`;
  roundEndEl.hidden = false;
  againBtnPen.focus();
}

againBtnPen.addEventListener("click", () => {
  if (nextAction === "next") cupRound += 1;
  if (nextAction === "restart") cupRound = 0;
  startGame();
});

// ---------- باز و بسته کردن ----------
function renderSoundButton() {
  soundBtn.textContent = Sound.isMuted() ? "🔇 بی‌صدا" : "🔊 صدا";
  soundBtn.setAttribute("aria-pressed", String(!Sound.isMuted()));
}

function openPenalty() {
  penaltyEl.hidden = false;
  document.body.classList.add("no-scroll");
  if (!crowdEl.children.length) buildCrowd();
  renderPenaltyCoins();
  renderSoundButton();
  showPicker();
  document.getElementById("pen-exit").focus();
}

function closePenalty() {
  if (busy) return;
  stopMeter();
  penaltyEl.hidden = true;
  document.body.classList.remove("no-scroll");
  resetField();
  penaltyTile.focus();
}

zonesEl.querySelectorAll("button[data-col]").forEach((b) => {
  b.setAttribute("aria-label", ZONE_NAMES[b.dataset.row][b.dataset.col]);
});
penaltyTile.addEventListener("click", openPenalty);
soundBtn.addEventListener("click", () => {
  Sound.toggle();
  renderSoundButton();
});
document.getElementById("pen-exit").addEventListener("click", closePenalty);
document.getElementById("pen-change").addEventListener("click", showPicker);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !penaltyEl.hidden) closePenalty();
});
