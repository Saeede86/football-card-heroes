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

function teamPower() {
  const players = allPlayers();
  const total = players.reduce((sum, c) => sum + (c ? c.power : EMPTY_POWER), 0);
  return Math.round(total / players.length);
}

function inTeam(id) {
  return allPlayers().some((c) => c && c.id === id);
}

// ---------- نشون دادن تیم ----------
function rarityTokenClass(card) {
  return card ? `token--${card.rarity}` : "token--empty";
}

function tokenHTML(card, line, index) {
  if (!card) {
    return `<button class="token token--empty" type="button" data-line="${line}" data-index="${index}" aria-label="انتخاب ${LINES[line]}">
      <span class="token__face">+</span>
      <span class="token__name">${LINES[line]}</span>
    </button>`;
  }
  return `<button class="token ${rarityTokenClass(card)}" type="button" data-line="${line}" data-index="${index}" aria-label="${card.name}، ${LINES[line]}، قدرت ${fa(card.power)}">
    <span class="token__face">${portraitSVG(card.look)}<span class="token__power">${fa(card.power)}</span></span>
    <span class="token__name">${card.name}</span>
  </button>`;
}

function renderTeam() {
  // ترکیب‌ها
  document.getElementById("formations").innerHTML = Object.keys(FORMATIONS).map((f) =>
    `<button class="chip" type="button" data-formation="${f}" aria-pressed="${f === save.team.formation}"><span dir="ltr">${f}</span></button>`
  ).join("");

  // زمین: حمله بالا، دروازه‌بان پایین
  pitchEl.innerHTML = ["FWD", "MID", "DEF", "GK"].map((line) =>
    `<div class="pitch__row">${lineUp(line).map((card, i) => tokenHTML(card, line, i)).join("")}</div>`
  ).join("");

  const empty = allPlayers().filter((c) => !c).length;
  document.getElementById("team-hint").textContent = empty
    ? `${fa(empty)} جای خالی داری. جای خالی فقط قدرت ${fa(EMPTY_POWER)} حساب می‌شه، پس پرشون کن!`
    : "تیمت کامله! روی هر بازیکن بزن تا عوضش کنی.";

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
    .filter((c) => c.position === LINES[line] && owns(c) && !inTeam(c.id))
    .sort((a, b) => b.power - a.power);
  document.getElementById("sheet-title").textContent = `انتخاب ${LINES[line]}`;
  document.getElementById("sheet-grid").innerHTML = options.length
    ? options.map((c) => cardHTML(c)).join("")
    : `<p class="penalty__hint">${current ? "بازیکن دیگه‌ای" : "هنوز هیچ " + LINES[line] + "ی"} نداری! بسته باز کن تا ${LINES[line]} جدید پیدا کنی.</p>`;
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
document.getElementById("auto-fill").addEventListener("click", () => {
  Object.keys(LINES).forEach((line) => {
    save.team.lines[line] = CARDS
      .filter((c) => c.position === LINES[line] && owns(c))
      .sort((a, b) => b.power - a.power)
      .slice(0, FORMATIONS[save.team.formation][line])
      .map((c) => c.id);
  });
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

  // دقیقه به دقیقه جلو می‌ره
  let next = 0;
  for (let minute = 1; minute <= 90; minute++) {
    minuteEl.textContent = `دقیقه ${fa(minute)}`;
    while (next < events.length && events[next].minute <= minute) {
      const ev = events[next++];
      if (ev.mine) my++; else them++;
      myEl.textContent = fa(my);
      oppEl.textContent = fa(them);
      const text = ev.mine
        ? `⚽ گل! ${ev.scorer} برای ${save.team.name}`
        : `⚽ ${opp.name} گل زد`;
      listEl.insertAdjacentHTML("afterbegin", `<li class="event ${ev.mine ? "event--mine" : "event--them"}"><span class="event__min">${fa(ev.minute)}'</span> ${text}</li>`);
      if (!matchSkip) await sleep(700);
    }
    if (minute === 45) {
      listEl.insertAdjacentHTML("afterbegin", `<li class="event">پایان نیمه اول ⏸️</li>`);
      if (!matchSkip) await sleep(600);
    }
    if (!matchSkip) await sleep(70);
  }
  minuteEl.textContent = "پایان بازی";
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
