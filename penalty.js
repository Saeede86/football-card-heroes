// ====== ضربات پنالتی (دونفره، مثل جام جهانی) ======
// یه بار تو شوت می‌زنی، یه بار تیم حریف. وقتی حریف شوت می‌زنه، تو دروازه‌بانی!
// هر کدوم ۵ تا شوت داره. اگه مساوی شد، تک‌ضربه‌ها شروع می‌شه تا یکی ببره.

const KICKS = 5;
const MAX_ROUNDS = 8; // اگه بعد از ۸ دور هنوز مساوی بود، بازی مساوی تموم می‌شه
const COINS_PER_GOAL = 20;
const COINS_PER_SAVE = 20;
const WIN_BONUS = 50;
const OPP_MISS_CHANCE = 0.08; // شانس اینکه شوت حریف بره بیرون

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
const keeperEl = document.getElementById("keeper");
const kickerEl = document.getElementById("kicker");
const netEl = document.getElementById("net");
const shoutEl = document.getElementById("shout");
const zonesEl = document.getElementById("zones");
const turnEl = document.getElementById("turn");
const roundEndEl = document.getElementById("round-end");
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

function renderPenaltyCoins() {
  document.getElementById("pen-coins").textContent = fa(save.coins);
}

function addCoins(amount) {
  save.coins += amount;
  earnedThisGame += amount;
  writeSave();
  renderCoins();
  renderPenaltyCoins();
  updatePackButtons();
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
    <rect x="21.5" y="54" width="5.5" height="24" rx="2.5" fill="${look.skin}"/>
    <rect x="12.5" y="64" width="6.5" height="14" rx="2.5" fill="${look.shirt}"/>
    <rect x="21" y="64" width="6.5" height="14" rx="2.5" fill="${look.shirt}"/>
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

// ---------- انتخاب شوت‌زن ----------
function showPicker() {
  pickView.hidden = false;
  shootView.hidden = true;
  const owned = CARDS.filter((c) => save.collection[c.id]).sort((a, b) => b.power - a.power);
  if (owned.length) {
    pickGrid.innerHTML = owned.map((c) => cardHTML(c)).join("");
  } else {
    pickGrid.innerHTML = `<p class="penalty__hint">هنوز کارتی نداری! فعلاً بازیکن تازه‌کار شوت می‌زنه.</p>
      <button class="btn btn--gold" type="button" data-id="rookie">شوت با تازه‌کار (قدرت ${fa(ROOKIE.power)})</button>`;
  }
  const first = pickGrid.querySelector("button");
  if (first) first.focus();
}

pickGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-id]");
  if (!btn) return;
  shooter = btn.dataset.id === "rookie" ? ROOKIE : CARDS.find((c) => c.id === btn.dataset.id);
  startGame();
});

// دروازه‌بان تو: بهترین دروازه‌بانی که داری
function myKeeper() {
  return CARDS
    .filter((c) => c.position === "دروازه‌بان" && save.collection[c.id])
    .sort((a, b) => b.power - a.power)[0];
}

// ---------- شروع بازی ----------
function startGame() {
  pickView.hidden = true;
  shootView.hidden = false;
  roundEndEl.hidden = true;
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
  const goalChance = Math.round((1 - keeperChance(shooter.power)) * 100);
  const keeper = myKeeper();
  document.getElementById("shooter-info").innerHTML =
    `شوت‌زن: <strong>${shooter.name}</strong> · شانس گل ${fa(goalChance)}٪` +
    (keeper ? ` · دروازه‌بان: <strong>${keeper.name}</strong>` : "");
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
  const shooting = turn === "shoot";
  fieldEl.classList.toggle("is-saving", !shooting);
  turnEl.textContent = shooting ? "⚽ نوبت شوت توئه!" : "🧤 نوبت دروازه‌بانی توئه!";
  turnEl.className = "turn " + (shooting ? "turn--shoot" : "turn--save");
  shootHint.textContent = shooting
    ? "روی یه جای دروازه بزن تا توپ رو بفرستی اونجا."
    : "حدس بزن حریف کجا می‌زنه و روی همون جا بزن تا شیرجه بری!";
  kickerEl.innerHTML = kickerSVG(shooting ? shooter.look || ROOKIE.look : opponent.look);
  setZonesEnabled(true);
}

function setZonesEnabled(on) {
  zonesEl.querySelectorAll("button").forEach((b) => (b.disabled = !on));
}

function resetField() {
  [ballEl, keeperEl, kickerEl].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
  shoutEl.hidden = true;
  netEl.classList.remove("is-shaking");
}

function showShout(text, good) {
  shoutEl.textContent = text;
  shoutEl.className = "shout " + (good ? "shout--goal" : "shout--saved");
  shoutEl.hidden = false;
}

// دویدن شوت‌زن به سمت توپ
function runUp(fast) {
  return kickerEl.animate(
    [{ left: "37%", top: "80%" }, { left: "45.5%", top: "89%" }],
    { duration: 450 * fast, easing: "ease-in", fill: "forwards" }
  ).finished;
}

// پرواز توپ
function flyBall(target, fast) {
  return ballEl.animate(
    [{ left: "50%", top: "86%", width: "7%", rotate: "0deg" },
     { left: `${target.x}%`, top: `${target.y}%`, width: "4.5%", rotate: "540deg" }],
    { duration: 550 * fast, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" }
  ).finished;
}

function bounceOut(target, col, fast) {
  ballEl.animate(
    [{ left: `${target.x}%`, top: `${target.y}%`, width: "4.5%" },
     { left: `${target.x + (col === 1 ? 18 : (1 - col) * 14)}%`, top: "74%", width: "6%" }],
    { duration: 500 * fast, easing: "ease-out", fill: "forwards" }
  );
}

function dive(col, row, fast) {
  keeperEl.animate([{ transform: "none" }, { transform: DIVES[`${col},${row}`] }],
    { duration: 420 * fast, delay: 120 * fast, easing: "ease-out", fill: "forwards" });
}

// ---------- نوبت شوت تو ----------
async function myKick(col, row) {
  const fast = reduceMotion ? 0.2 : 1;
  // دروازه‌بان حریف حدس می‌زنه کجا شیرجه بره
  let diveCol = col;
  let diveRow = row;
  if (Math.random() >= keeperChance(shooter.power)) {
    const others = Object.keys(DIVES).filter((k) => k !== `${col},${row}`);
    [diveCol, diveRow] = randomFrom(others).split(",").map(Number);
  }
  const saved = diveCol === col && diveRow === row;
  const target = zoneCenter(col, row);

  await runUp(fast);
  Sound.kick();
  dive(diveCol, diveRow, fast);
  await flyBall(target, fast);

  if (saved) {
    bounceOut(target, col, fast);
    showShout("دروازه‌بان گرفت!", false);
    Sound.groan();
  } else {
    netEl.classList.add("is-shaking");
    addCoins(COINS_PER_GOAL);
    showShout(`گل! +${fa(COINS_PER_GOAL)}`, true);
    cheerCrowd();
    Sound.cheer();
  }
  mine.push(!saved);
}

// ---------- نوبت دروازه‌بانی تو ----------
async function theirKick(col, row) {
  const fast = reduceMotion ? 0.2 : 1;
  // حریف یه جای شانسی رو انتخاب می‌کنه
  const shotCol = Math.floor(Math.random() * 3);
  const shotRow = Math.floor(Math.random() * 2);
  const missed = Math.random() < OPP_MISS_CHANCE;
  // اگه درست سمت توپ (چپ، وسط یا راست) شیرجه بری، توپ رو می‌گیری
  const saved = !missed && shotCol === col;
  const target = zoneCenter(shotCol, shotRow);
  if (missed) target.y = 6;

  await runUp(fast);
  Sound.kick();
  dive(col, row, fast);
  await flyBall(target, fast);

  if (missed) {
    showShout("زد بیرون!", true);
    cheerCrowd();
    Sound.cheer();
  } else if (saved) {
    bounceOut(target, shotCol, fast);
    addCoins(COINS_PER_SAVE);
    showShout(`گرفتی! +${fa(COINS_PER_SAVE)}`, true);
    cheerCrowd();
    Sound.cheer();
  } else {
    netEl.classList.add("is-shaking");
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

zonesEl.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-col]");
  if (!btn || busy) return;
  busy = true;
  setZonesEnabled(false);
  const col = Number(btn.dataset.col);
  const row = Number(btn.dataset.row);
  if (turn === "shoot") await myKick(col, row);
  else await theirKick(col, row);
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
  document.getElementById("round-title").textContent =
    end === "win" ? `بردی! ${score} 🏆` : end === "lose" ? `باختی! ${score}` : `مساوی شد! ${score}`;
  document.getElementById("round-detail").textContent =
    `توی این بازی ${fa(earnedThisGame)} سکه گرفتی` + (end === "win" ? ` (با ${fa(WIN_BONUS)} سکه جایزه برد)` : "") + ".";
  roundEndEl.hidden = false;
  document.getElementById("pen-again").focus();
}

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
}

function closePenalty() {
  if (busy) return;
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
document.getElementById("pen-again").addEventListener("click", startGame);
document.getElementById("pen-change").addEventListener("click", showPicker);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !penaltyEl.hidden) closePenalty();
});
