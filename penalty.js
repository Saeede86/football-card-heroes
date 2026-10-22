// ====== مینی‌گیم پنالتی ======
// یکی از کارت‌هات شوت می‌زنه. روی یه جای دروازه بزن تا توپ بره اونجا.
// هرچی قدرت شوت‌زن بیشتر باشه، دروازه‌بان کمتر درست شیرجه می‌ره.

const SHOTS_PER_ROUND = 5;
const COINS_PER_GOAL = 20;
const PERFECT_BONUS = 50; // جایزه ۵ گل از ۵

// اگه هنوز هیچ کارتی نداری، این بازیکن شوت می‌زنه
const ROOKIE = { id: "rookie", name: "تازه‌کار", power: 70 };

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

// شانس اینکه دروازه‌بان درست حدس بزنه (قدرت ۷۰ → ۴۵٪، قدرت ۹۵ → ۱۵٪)
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
const ballEl = document.getElementById("ball");
const keeperEl = document.getElementById("keeper");
const netEl = document.getElementById("net");
const shoutEl = document.getElementById("shout");
const shotsEl = document.getElementById("shots");
const zonesEl = document.getElementById("zones");
const roundEndEl = document.getElementById("round-end");
const shootHint = document.getElementById("shoot-hint");
const penaltyTile = document.getElementById("penalty-btn");

let shooter = null;
let shotResults = [];
let shooting = false;

function renderPenaltyCoins() {
  document.getElementById("pen-coins").textContent = fa(save.coins);
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
  startRound();
});

// ---------- یک دور پنالتی ----------
function startRound() {
  pickView.hidden = true;
  shootView.hidden = false;
  roundEndEl.hidden = true;
  shootHint.hidden = false;
  shotResults = [];
  const goalChance = Math.round((1 - keeperChance(shooter.power)) * 100);
  document.getElementById("shooter-info").innerHTML =
    `شوت‌زن: <strong>${shooter.name}</strong> · قدرت ${fa(shooter.power)} · شانس گل ${fa(goalChance)}٪`;
  renderShots();
  resetField();
  setZonesEnabled(true);
}

function renderShots() {
  let html = "";
  for (let i = 0; i < SHOTS_PER_ROUND; i++) {
    const r = shotResults[i];
    const cls = r === true ? "shot--goal" : r === false ? "shot--saved" : "";
    const label = r === true ? "گل" : r === false ? "گرفت" : "مونده";
    html += `<span class="shot ${cls}" aria-label="${label}">${r === true ? "✓" : r === false ? "✕" : ""}</span>`;
  }
  shotsEl.innerHTML = html;
}

function setZonesEnabled(on) {
  zonesEl.querySelectorAll("button").forEach((b) => (b.disabled = !on));
}

function resetField() {
  ballEl.getAnimations().forEach((a) => a.cancel());
  keeperEl.getAnimations().forEach((a) => a.cancel());
  shoutEl.hidden = true;
  netEl.classList.remove("is-shaking");
}

async function shoot(col, row) {
  if (shooting || shotResults.length >= SHOTS_PER_ROUND) return;
  shooting = true;
  setZonesEnabled(false);
  shootHint.hidden = true;

  // دروازه‌بان حدس می‌زنه کجا شیرجه بره
  let diveCol = col;
  let diveRow = row;
  if (Math.random() >= keeperChance(shooter.power)) {
    const others = Object.keys(DIVES).filter((k) => k !== `${col},${row}`);
    [diveCol, diveRow] = randomFrom(others).split(",").map(Number);
  }
  const saved = diveCol === col && diveRow === row;
  const target = zoneCenter(col, row);
  const fast = reduceMotion ? 0.2 : 1;

  keeperEl.animate([{ transform: "none" }, { transform: DIVES[`${diveCol},${diveRow}`] }],
    { duration: 420 * fast, delay: 120 * fast, easing: "ease-out", fill: "forwards" });
  await ballEl.animate(
    [{ left: "50%", top: "86%", width: "7%" }, { left: `${target.x}%`, top: `${target.y}%`, width: "4.5%" }],
    { duration: 550 * fast, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" }
  ).finished;

  if (saved) {
    // توپ از دست دروازه‌بان برمی‌گرده بیرون
    ballEl.animate(
      [{ left: `${target.x}%`, top: `${target.y}%`, width: "4.5%" },
       { left: `${target.x + (col === 1 ? 18 : (1 - col) * 14)}%`, top: "74%", width: "6%" }],
      { duration: 500 * fast, easing: "ease-out", fill: "forwards" }
    );
    showShout("دروازه‌بان گرفت!", false);
  } else {
    netEl.classList.add("is-shaking");
    save.coins += COINS_PER_GOAL;
    writeSave();
    renderCoins();
    renderPenaltyCoins();
    updatePackButtons();
    showShout(`گل! +${fa(COINS_PER_GOAL)}`, true);
  }
  shotResults.push(!saved);
  renderShots();

  await sleep(1300);
  shooting = false;
  if (shotResults.length < SHOTS_PER_ROUND) {
    resetField();
    setZonesEnabled(true);
  } else {
    endRound();
  }
}

function showShout(text, isGoal) {
  shoutEl.textContent = text;
  shoutEl.className = "shout " + (isGoal ? "shout--goal" : "shout--saved");
  shoutEl.hidden = false;
}

function endRound() {
  const goals = shotResults.filter(Boolean).length;
  let earned = goals * COINS_PER_GOAL;
  const perfect = goals === SHOTS_PER_ROUND;
  if (perfect) {
    save.coins += PERFECT_BONUS;
    earned += PERFECT_BONUS;
    writeSave();
    renderCoins();
    renderPenaltyCoins();
    updatePackButtons();
    celebrate(shotsEl);
  }
  document.getElementById("round-title").textContent =
    perfect ? "۵ از ۵! قهرمانی!" : goals >= 3 ? "آفرین! دور خوبی بود!" : "دفعه بعد بهتر می‌شه!";
  document.getElementById("round-detail").textContent =
    `${fa(goals)} گل زدی و ${fa(earned)} سکه گرفتی` + (perfect ? ` (با ${fa(PERFECT_BONUS)} سکه جایزه)` : "") + ".";
  roundEndEl.hidden = false;
  document.getElementById("pen-again").focus();
}

// ---------- باز و بسته کردن ----------
function openPenalty() {
  penaltyEl.hidden = false;
  document.body.classList.add("no-scroll");
  renderPenaltyCoins();
  showPicker();
}

function closePenalty() {
  if (shooting) return;
  penaltyEl.hidden = true;
  document.body.classList.remove("no-scroll");
  resetField();
  penaltyTile.focus();
}

zonesEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-col]");
  if (btn) shoot(Number(btn.dataset.col), Number(btn.dataset.row));
});
zonesEl.querySelectorAll("button[data-col]").forEach((b) => {
  b.setAttribute("aria-label", "شوت به " + ZONE_NAMES[b.dataset.row][b.dataset.col]);
});
penaltyTile.addEventListener("click", openPenalty);
document.getElementById("pen-exit").addEventListener("click", closePenalty);
document.getElementById("pen-again").addEventListener("click", startRound);
document.getElementById("pen-change").addEventListener("click", showPicker);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !penaltyEl.hidden) closePenalty();
});
