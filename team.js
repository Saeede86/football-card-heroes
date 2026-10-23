// ====== تیم من و مسابقه‌ها ======
// اینجا تیم ۱۱ نفره‌ت رو می‌چینی و با تیم‌های کامپیوتر مسابقه می‌دی.

// خط‌های تیم: دروازه‌بان، دفاع، هافبک، حمله
const LINES = {
  GK: "دروازه‌بان",
  DEF: "مدافع",
  MID: "هافبک",
  FWD: "مهاجم",
};

// ترکیب‌ها: چند تا مدافع، هافبک و مهاجم داریم
const FORMATIONS = {
  "4-3-3": { GK: 1, DEF: 4, MID: 3, FWD: 3 },
  "4-4-2": { GK: 1, DEF: 4, MID: 4, FWD: 2 },
  "3-5-2": { GK: 1, DEF: 3, MID: 5, FWD: 2 },
};

// جای خالی توی تیم این‌قدر قدرت حساب می‌شه
const EMPTY_POWER = 50;

// کاپیتان تیم این‌قدر قدرت اضافه می‌گیره
const CAPTAIN_BONUS = 6;

// تیم‌های کامپیوتر: قدرت و جایزه برد
// مساوی یک‌چهارم جایزه رو می‌ده، باخت جایزه نداره
const OPPONENTS = [
  { name: "بچه‌های کوچه", power: 58, reward: 40 },
  { name: "مدرسه فوتبال ستاره", power: 65, reward: 60 },
  { name: "تیم شهر", power: 72, reward: 80 },
  { name: "باشگاه لیگ برتر", power: 78, reward: 110 },
  { name: "قهرمان آسیا", power: 84, reward: 150 },
  { name: "قهرمان اروپا", power: 89, reward: 200 },
  { name: "تیم رؤیایی جهان", power: 94, reward: 300 },
];

if (!save.team) {
  save.team = { name: "تیم من", formation: "4-3-3", lines: { GK: [], DEF: [], MID: [], FWD: [] } };
}

const teamEl = document.getElementById("team");
const teamView = document.getElementById("team-view");
const matchView = document.getElementById("match-view");
const pitchEl = document.getElementById("pitch");
const sheetEl = document.getElementById("sheet");
const teamTile = document.getElementById("team-btn");
const teamNameInput = document.getElementById("team-name");

// ---------- حساب کردن تیم ----------
function cardById(id) {
  return CARDS.find((c) => c.id === id);
}

// بازیکن‌های هر خط، به اندازه ترکیب فعلی (جای خالی = null)
function lineUp(line) {
  const size = FORMATIONS[save.team.formation][line];
  const ids = save.team.lines[line] || [];
  const list = [];
  for (let i = 0; i < size; i++) {
    const card = ids[i] ? cardById(ids[i]) : null;
    list.push(card && owns(card) ? card : null);
  }
  return list;
}

function allPlayers() {
  return Object.keys(LINES).flatMap(lineUp);
}

// این بازیکن می‌تونه توی این خط بازی کنه؟
function fitsLine(card, line) {
  return card.anyPosition || card.position === LINES[line];
}

function inTeam(id) {
  return allPlayers().some((c) => c && c.id === id);
}

// کاپیتان فقط وقتی حساب می‌شه که توی تیم باشه
function captainId() {
  return save.team.captain && inTeam(save.team.captain) ? save.team.captain : null;
}

function teamPower() {
  const players = allPlayers();
  const captain = captainId();
  const total = players.reduce((sum, c) =>
    sum + (c ? c.power + (c.id === captain ? CAPTAIN_BONUS : 0) : EMPTY_POWER), 0);
  return Math.round(total / players.length);
}

// ---------- نشون دادن تیم ----------
function rarityTokenClass(card) {
  return card ? `token--${card.rarity}` : "token--empty";
}

// هر بازیکن روی زمین یه کارت کوچیکه
function tokenHTML(card, line, index) {
  if (!card) {
    return `<button class="token token--empty" type="button" data-line="${line}" data-index="${index}" aria-label="انتخاب ${LINES[line]}">
      <span class="token__card"><span class="token__plus">+</span><span class="token__name">${LINES[line]}</span></span>
    </button>`;
  }
  const isCaptain = card.id === captainId();
  return `<button class="token ${rarityTokenClass(card)}" type="button" data-line="${line}" data-index="${index}" aria-label="${card.name}، ${LINES[line]}، قدرت ${displayPower(card)}${isCaptain ? "، کاپیتان" : ""}">
    <span class="token__card">
      <span class="token__power">${displayPower(card)}</span>
      <span class="token__face">${portraitSVG(card.look, card.id)}</span>
      <span class="token__name">${card.name}</span>
    </span>
    ${isCaptain ? `<span class="token__captain" title="کاپیتان">C</span>` : ""}
  </button>`;
}

// خط‌های زمین فوتبال (از بالا: دروازه حریف، پایین: دروازه خودت)
const PITCH_LINES = `<svg class="pitch__lines" viewBox="0 0 68 80" preserveAspectRatio="none" aria-hidden="true">
  <rect x="1" y="1" width="66" height="78"/>
  <line x1="1" y1="40" x2="67" y2="40"/>
  <circle cx="34" cy="40" r="7.3"/>
  <circle cx="34" cy="40" r="0.5" class="dot"/>
  <rect x="13.85" y="1" width="40.3" height="12"/>
  <rect x="24.85" y="1" width="18.3" height="4"/>
  <circle cx="34" cy="9" r="0.5" class="dot"/>
  <path d="M28.5 13 A6.8 6.8 0 0 0 39.5 13"/>
  <rect x="13.85" y="67" width="40.3" height="12"/>
  <rect x="24.85" y="75" width="18.3" height="4"/>
  <circle cx="34" cy="71" r="0.5" class="dot"/>
  <path d="M28.5 67 A6.8 6.8 0 0 1 39.5 67"/>
  <path d="M1 2.5 A1.5 1.5 0 0 0 2.5 1 M65.5 1 A1.5 1.5 0 0 0 67 2.5 M1 77.5 A1.5 1.5 0 0 1 2.5 79 M65.5 79 A1.5 1.5 0 0 1 67 77.5"/>
</svg>`;

function renderTeam() {
  // ترکیب‌ها
  document.getElementById("formations").innerHTML = Object.keys(FORMATIONS).map((f) =>
    `<button class="chip" type="button" data-formation="${f}" aria-pressed="${f === save.team.formation}"><span dir="ltr">${f}</span></button>`
  ).join("");

  // زمین: حمله بالا، دروازه‌بان پایین
  pitchEl.innerHTML = PITCH_LINES + ["FWD", "MID", "DEF", "GK"].map((line) =>
    `<div class="pitch__row">${lineUp(line).map((card, i) => tokenHTML(card, line, i)).join("")}</div>`
  ).join("");

  const empty = allPlayers().filter((c) => !c).length;
  document.getElementById("team-hint").textContent = empty
    ? `${fa(empty)} جای خالی داری. جای خالی فقط قدرت ${fa(EMPTY_POWER)} حساب می‌شه، پس پرشون کن!`
    : captainId()
    ? "تیمت کامله! روی هر بازیکن بزن تا عوضش کنی."
    : "تیمت کامله! روی یه بازیکن بزن و کاپیتانش کن تا تیمت قوی‌تر بشه.";

  const power = teamPower();
  document.getElementById("team-power").textContent = fa(power);
  document.getElementById("team-note").textContent = `قدرت تیم ${fa(power)}`;
  renderHero();
  teamNameInput.value = save.team.name;
  renderLadder();
}

function isUnlocked(i) {
  return i === 0 || save.beaten[i - 1];
}

function renderLadder() {
  document.getElementById("ladder").innerHTML = OPPONENTS.map((opp, i) => {
    const status = save.beaten[i]
      ? `<span class="ladder__done">✓ بردی</span>`
      : "";
    const action = isUnlocked(i)
      ? `<button class="btn btn--gold" type="button" data-match="${i}">مسابقه</button>`
      : `<span class="ladder__lock">🔒 قفل</span>`;
    return `<li class="ladder__row${isUnlocked(i) ? "" : " is-locked"}">
      <span class="ladder__info">
        <span class="ladder__name">${opp.name}</span>
        <span class="ladder__meta">قدرت ${fa(opp.power)} · جایزه برد ${fa(opp.reward)} سکه ${status}</span>
      </span>
      ${action}
    </li>`;
  }).join("");
}

// ---------- انتخاب بازیکن برای یه جا ----------
let sheetSlot = null;

function openSheet(line, index) {
  sheetSlot = { line, index };
  const current = lineUp(line)[index];
  const options = CARDS
    .filter((c) => fitsLine(c, line) && owns(c) && !inTeam(c.id))
    .sort((a, b) => b.power - a.power);
  document.getElementById("sheet-title").textContent = current ? `${current.name}` : `انتخاب ${LINES[line]}`;
  // بخش کاپیتان برای بازیکنی که الان اینجاست
  document.getElementById("sheet-current").hidden = !current;
  if (current) {
    const isCaptain = current.id === captainId();
    document.getElementById("sheet-current-name").textContent =
      isCaptain ? "این بازیکن کاپیتان تیمه!" : `کاپیتان قدرت ${fa(CAPTAIN_BONUS)} بیشتر می‌گیره.`;
    const capBtn = document.getElementById("sheet-captain");
    capBtn.textContent = isCaptain ? "✓ کاپیتانه" : "Ⓒ کاپیتانش کن";
    capBtn.disabled = isCaptain;
  }
  document.getElementById("sheet-hint").textContent = options.length
    ? (current ? `یا یه ${LINES[line]} دیگه جاش بذار:` : "")
    : `${current ? "بازیکن دیگه‌ای" : "هنوز هیچ " + LINES[line] + "ی"} نداری! بسته باز کن تا ${LINES[line]} جدید پیدا کنی.`;
  document.getElementById("sheet-grid").innerHTML = options.map((c) => cardHTML(c)).join("");
  document.getElementById("sheet-clear").hidden = !current;
  sheetEl.hidden = false;
  (sheetEl.querySelector(".card") || document.getElementById("sheet-close")).focus();
}

function closeSheet() {
  sheetEl.hidden = true;
  const slot = pitchEl.querySelector(`[data-line="${sheetSlot.line}"][data-index="${sheetSlot.index}"]`);
  if (slot) slot.focus();
}

function setSlot(id) {
  const { line, index } = sheetSlot;
  const ids = lineUp(line).map((c) => (c ? c.id : null));
  ids[index] = id;
  save.team.lines[line] = ids;
  writeSave();
  renderTeam();
  closeSheet();
}

pitchEl.addEventListener("click", (e) => {
  const token = e.target.closest(".token");
  if (token) openSheet(token.dataset.line, Number(token.dataset.index));
});
document.getElementById("sheet-grid").addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (card) setSlot(card.dataset.id);
});
document.getElementById("sheet-clear").addEventListener("click", () => setSlot(null));
document.getElementById("sheet-captain").addEventListener("click", () => {
  const current = lineUp(sheetSlot.line)[sheetSlot.index];
  if (!current) return;
  save.team.captain = current.id;
  writeSave();
  renderTeam();
  closeSheet();
  showToast(`${current.name} کاپیتان تیم شد!`);
});
document.getElementById("sheet-close").addEventListener("click", closeSheet);
sheetEl.addEventListener("click", (e) => {
  if (e.target === sheetEl) closeSheet();
});

document.getElementById("formations").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-formation]");
  if (!btn) return;
  save.team.formation = btn.dataset.formation;
  writeSave();
  renderTeam();
  document.querySelector(`[data-formation="${save.team.formation}"]`).focus();
});

// بهترین بازیکن‌های هر پست رو خودکار می‌چینه
// (از حمله شروع می‌کنه، پس بازیکنی که همه پست‌ها رو بلده اول مهاجم می‌شه)
document.getElementById("auto-fill").addEventListener("click", () => {
  const used = new Set();
  ["FWD", "MID", "DEF", "GK"].forEach((line) => {
    save.team.lines[line] = CARDS
      .filter((c) => fitsLine(c, line) && owns(c) && !used.has(c.id))
      .sort((a, b) => b.power - a.power)
      .slice(0, FORMATIONS[save.team.formation][line])
      .map((c) => c.id);
    save.team.lines[line].forEach((id) => used.add(id));
  });
  // اگه کاپیتان نداری، قوی‌ترین بازیکن کاپیتان می‌شه
  if (!captainId()) {
    const best = allPlayers().filter(Boolean).sort((a, b) => b.power - a.power)[0];
    if (best) save.team.captain = best.id;
  }
  writeSave();
  renderTeam();
  showToast("بهترین بازیکن‌هات چیده شدن!");
});

teamNameInput.addEventListener("input", () => {
  save.team.name = teamNameInput.value.trim() || "تیم من";
  writeSave();
});

// ---------- مسابقه ----------
let matchIndex = 0;
let matchSkip = false;
let matchRunning = false;

// چند تا گل می‌زنه؟ هرچی تیم قوی‌تر باشه، شانس گل بیشتره
function expectedGoals(myPower, otherPower) {
  return Math.min(4.5, Math.max(0.2, 1.3 * Math.pow(1.6, (myPower - otherPower) / 5)));
}

// یکی از بازیکن‌های تیمت رو برای گل زدن انتخاب می‌کنه (مهاجم‌ها شانس بیشتری دارن)
function pickScorer() {
  const weights = { FWD: 4, MID: 2, DEF: 1, GK: 0 };
  const pool = [];
  Object.keys(LINES).forEach((line) => {
    lineUp(line).forEach((c) => {
      for (let i = 0; i < weights[line]; i++) pool.push(c ? c.name : "بازیکن آماتور");
    });
  });
  return randomFrom(pool);
}

function simulateMatch(myPower, oppPower) {
  const events = [];
  const segments = 18; // هر ۵ دقیقه یه شانس
  const myChance = expectedGoals(myPower, oppPower) / segments;
  const oppChance = expectedGoals(oppPower, myPower) / segments;
  for (let s = 0; s < segments; s++) {
    if (Math.random() < myChance) events.push({ minute: s * 5 + 1 + Math.floor(Math.random() * 5), mine: true, scorer: pickScorer() });
    if (Math.random() < oppChance) events.push({ minute: s * 5 + 1 + Math.floor(Math.random() * 5), mine: false });
  }
  return events.sort((a, b) => a.minute - b.minute);
}

// ---------- زمین کوچیک مسابقه ----------
// تیم تو سمت راسته و به دروازه چپ حمله می‌کنه
const mpBall = document.getElementById("mp-ball");
let mpDots = [];

function setupMiniPitch(opp) {
  document.getElementById("mp-name-left").textContent = opp.name;
  document.getElementById("mp-name-right").textContent = save.team.name;
  const mineX = { GK: 95, DEF: 82, MID: 68, FWD: 57 };
  const theirX = { GK: 5, DEF: 18, MID: 32, FWD: 43 };
  const theirShape = { GK: 1, DEF: 4, MID: 4, FWD: 2 };
  const dots = [];
  const addLine = (count, x, side) => {
    for (let k = 0; k < count; k++) dots.push({ x, y: ((k + 1) * 100) / (count + 1), side });
  };
  Object.keys(LINES).forEach((line) => {
    addLine(FORMATIONS[save.team.formation][line], mineX[line], "mine");
    addLine(theirShape[line], theirX[line], "them");
  });
  document.getElementById("mp-players").innerHTML = dots.map((d, k) =>
    `<span class="mp-dot mp-dot--${d.side}" style="left:${d.x}%;top:${d.y}%;--d:${(k % 7) * 0.13}s"></span>`
  ).join("");
  mpDots = dots.map((d, k) => ({ ...d, el: document.getElementById("mp-players").children[k] }));
  moveBall(50, 50);
}

// توپ می‌ره یه جای زمین و بازیکن‌ها یه کم دنبالش می‌رن
function moveBall(x, y) {
  mpBall.style.left = `${x}%`;
  mpBall.style.top = `${y}%`;
  const shift = (x - 50) * 0.3;
  mpDots.forEach((d) => {
    if (d.x < 8 || d.x > 92) return; // دروازه‌بان‌ها سر جاشون می‌مونن
    d.el.style.left = `${Math.min(92, Math.max(8, d.x + shift))}%`;
  });
}

function flashGoal(side) {
  const goal = document.getElementById(side === "left" ? "mp-goal-left" : "mp-goal-right");
  goal.classList.remove("is-goal");
  void goal.offsetWidth;
  goal.classList.add("is-goal");
}

async function playMatch(i) {
  if (matchRunning) return;
  matchRunning = true;
  matchSkip = false;
  matchIndex = i;
  const opp = OPPONENTS[i];
  const events = simulateMatch(teamPower(), opp.power);

  teamView.hidden = true;
  matchView.hidden = false;
  document.getElementById("match-end").hidden = true;
  document.getElementById("match-skip").hidden = false;
  document.getElementById("sb-home").textContent = save.team.name;
  document.getElementById("sb-away").textContent = opp.name;
  const myEl = document.getElementById("sb-my");
  const oppEl = document.getElementById("sb-opp");
  const minuteEl = document.getElementById("sb-minute");
  const listEl = document.getElementById("events");
  listEl.innerHTML = `<li class="event">سوت شروع بازی! 📣</li>`;
  let my = 0;
  let them = 0;
  myEl.textContent = fa(0);
  oppEl.textContent = fa(0);
  document.getElementById("match-skip").focus();
  setupMiniPitch(opp);
  Sound.whistle();

  // دقیقه به دقیقه جلو می‌ره
  let next = 0;
  for (let minute = 1; minute <= 90; minute++) {
    minuteEl.textContent = `دقیقه ${fa(minute)}`;
    // توپ هر چند دقیقه یه جای دیگه زمین می‌ره
    if (!matchSkip && minute % 3 === 0) moveBall(15 + Math.random() * 70, 12 + Math.random() * 76);
    while (next < events.length && events[next].minute <= minute) {
      const ev = events[next++];
      if (!matchSkip) {
        // توپ اول نزدیک دروازه می‌ره، بعد می‌ره توش
        moveBall(ev.mine ? 18 : 82, 30 + Math.random() * 40);
        await sleep(450);
        moveBall(ev.mine ? 1.5 : 98.5, 45 + Math.random() * 10);
        await sleep(350);
        flashGoal(ev.mine ? "left" : "right");
        if (ev.mine) Sound.cheer(); else Sound.groan();
      }
      if (ev.mine) my++; else them++;
      myEl.textContent = fa(my);
      oppEl.textContent = fa(them);
      const text = ev.mine
        ? `⚽ گل! ${ev.scorer} برای ${save.team.name}`
        : `⚽ ${opp.name} گل زد`;
      listEl.insertAdjacentHTML("afterbegin", `<li class="event ${ev.mine ? "event--mine" : "event--them"}"><span class="event__min">${fa(ev.minute)}'</span> ${text}</li>`);
      if (!matchSkip) {
        await sleep(700);
        moveBall(50, 50);
      }
    }
    if (minute === 45) {
      listEl.insertAdjacentHTML("afterbegin", `<li class="event">پایان نیمه اول ⏸️</li>`);
      if (!matchSkip) {
        Sound.whistle();
        moveBall(50, 50);
        await sleep(600);
      }
    }
    if (!matchSkip) await sleep(70);
  }
  minuteEl.textContent = "پایان بازی";
  moveBall(50, 50);
  Sound.whistle();
  listEl.insertAdjacentHTML("afterbegin", `<li class="event">سوت پایان! 🏁</li>`);

  // نتیجه و جایزه
  let title;
  let earned = 0;
  if (my > them) {
    earned = opp.reward;
    title = "بردی! 🏆";
    const firstWin = !save.beaten[i];
    save.beaten[i] = true;
    if (firstWin && i + 1 < OPPONENTS.length) title += ` تیم «${OPPONENTS[i + 1].name}» باز شد!`;
    celebrate(document.querySelector(".scoreboard"));
    Sound.cheer();
  } else if (my === them) {
    earned = Math.round(opp.reward / 4);
    title = "مساوی شد!";
  } else {
    title = "باختی! تیمت رو قوی‌تر کن و دوباره امتحان کن.";
  }
  save.coins += earned;
  writeSave();
  renderCoins();
  updatePackButtons();
  renderTeamCoins();
  document.getElementById("match-title").textContent = title;
  document.getElementById("match-detail").textContent =
    `نتیجه ${fa(my)} - ${fa(them)}` + (earned ? ` · +${fa(earned)} سکه` : "");
  document.getElementById("match-skip").hidden = true;
  document.getElementById("match-end").hidden = false;
  document.getElementById("match-back").focus();
  matchRunning = false;
}

function backToTeam() {
  matchView.hidden = true;
  teamView.hidden = false;
  renderTeam();
}

document.getElementById("ladder").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-match]");
  if (btn) playMatch(Number(btn.dataset.match));
});
document.getElementById("match-skip").addEventListener("click", () => (matchSkip = true));
document.getElementById("match-back").addEventListener("click", backToTeam);
document.getElementById("match-again").addEventListener("click", () => playMatch(matchIndex));

// ---------- باز و بسته کردن صفحه تیم ----------
function renderTeamCoins() {
  document.getElementById("team-coins").textContent = fa(save.coins);
}

function openTeam() {
  teamEl.hidden = false;
  document.body.classList.add("no-scroll");
  teamView.hidden = false;
  matchView.hidden = true;
  renderTeamCoins();
  renderTeam();
  document.getElementById("team-exit").focus();
}

function closeTeam() {
  if (matchRunning) return;
  teamEl.hidden = true;
  document.body.classList.remove("no-scroll");
  renderHero();
  teamTile.focus();
}

teamTile.addEventListener("click", openTeam);
document.getElementById("team-exit").addEventListener("click", closeTeam);
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!sheetEl.hidden) closeSheet();
  else if (!teamEl.hidden) closeTeam();
});

document.getElementById("team-note").textContent = `قدرت تیم ${fa(teamPower())}`;
renderHero();
