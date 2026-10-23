// ====== باز کردن بسته کارت ======
// اینجا بسته باز می‌شه، ۵ تا کارت شانسی انتخاب می‌شه و با انیمیشن نشون داده می‌شه.

const PACK_PRICE = 250;
const PACK_SIZE = 5;

// شانس اومدن هر نوع کارت (از ۱۰۰). بقیه‌ش کارت معمولیه.
const CHANCE = { legendary: 6, rare: 26 };

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((done) => setTimeout(done, reduceMotion ? Math.min(ms, 150) : ms));

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function cardsOf(rarity) {
  return CARDS.filter((c) => c.rarity === rarity);
}

// ۵ تا کارت شانسی انتخاب می‌کنه
function drawPack() {
  const pack = [];
  for (let i = 0; i < PACK_SIZE; i++) {
    const roll = Math.random() * 100;
    const rarity =
      roll < CHANCE.legendary ? "legendary" :
      roll < CHANCE.legendary + CHANCE.rare ? "rare" : "common";
    pack.push(randomFrom(cardsOf(rarity)));
  }
  // هر بسته حداقل یه کارت کمیاب یا بهتر داره
  if (pack.every((c) => c.rarity === "common")) {
    pack[Math.floor(Math.random() * PACK_SIZE)] = randomFrom(cardsOf("rare"));
  }
  return pack;
}

// کارت ضعیف‌تر زودتر برمی‌گرده، کارت بهتر آخر از همه
function rank(card) {
  return (2 - RARITIES[card.rarity].order) * 100 + card.power;
}

// ---------- صفحه باز کردن بسته ----------
const openingEl = document.getElementById("opening");
const titleEl = document.getElementById("opening-title");
const packEl = document.getElementById("pack");
const revealEl = document.getElementById("reveal");
const flashEl = document.getElementById("flash");
const skipBtn = document.getElementById("skip-btn");
const againBtn = document.getElementById("again-btn");
const doneBtn = document.getElementById("done-btn");
const packTile = document.getElementById("open-pack-btn");

let packBusy = false;
let skipFlips = false;

function slotHTML({ card, isNew }, i) {
  const badge = isNew ? "جدید!" : `تکراری · ${fa(save.collection[card.id])} تا`;
  return `<div class="slot" style="--i:${i}">
    <div class="flip">
      <div class="flip__face flip__back"><div class="card-back"><span class="card-back__ball">⚽</span><span class="card-back__mark">FCH</span></div></div>
      <div class="flip__face flip__front">${cardHTML(card, "div")}</div>
    </div>
    <span class="slot__badge${isNew ? " slot__badge--new" : ""}" hidden>${badge}</span>
  </div>`;
}

function flash() {
  flashEl.classList.remove("is-on");
  void flashEl.offsetWidth;
  flashEl.classList.add("is-on");
}

function updatePackButtons() {
  const enough = save.coins >= PACK_PRICE;
  packTile.querySelector(".tile__note").textContent = enough
    ? `${fa(PACK_PRICE)} سکه`
    : `${fa(PACK_PRICE)} سکه · سکه کافی نداری`;
  againBtn.disabled = !enough;
  againBtn.textContent = enough ? `یه بسته دیگه · ${fa(PACK_PRICE)} سکه` : "سکه کافی نداری";
}

async function openPack() {
  if (packBusy) return;
  if (save.coins < PACK_PRICE) {
    showToast("سکه کافی نداری! برو پنالتی بزن و سکه جمع کن.");
    return;
  }
  packBusy = true;
  skipFlips = false;

  // اول سکه کم می‌شه و کارت‌ها ذخیره می‌شن، که اگه صفحه بسته شد کارت‌ها گم نشن
  save.coins -= PACK_PRICE;
  const pulled = drawPack().map((card) => {
    const before = save.collection[card.id] || 0;
    save.collection[card.id] = before + 1;
    return { card, isNew: before === 0 };
  });
  writeSave();
  renderCoins();
  renderGrid();
  updatePackButtons();

  // ۱. بسته می‌لرزه
  openingEl.hidden = false;
  document.body.classList.add("no-scroll");
  revealEl.innerHTML = "";
  packEl.hidden = false;
  packEl.className = "pack is-shaking";
  skipBtn.hidden = false;
  againBtn.hidden = true;
  doneBtn.hidden = true;
  titleEl.textContent = "بسته داره باز می‌شه…";
  skipBtn.focus();
  await sleep(1400);

  // ۲. بسته می‌ترکه
  packEl.className = "pack is-bursting";
  flash();
  await sleep(450);
  packEl.hidden = true;

  // ۳. کارت‌ها پشت‌ورو میان
  revealEl.innerHTML = pulled.map(slotHTML).join("");
  titleEl.textContent = "کارت‌هات!";
  const slots = [...revealEl.children];
  if (!skipFlips) await sleep(1000);

  // ۴. کارت‌ها یکی‌یکی برمی‌گردن
  const order = slots.map((_, i) => i).sort((a, b) => rank(pulled[a].card) - rank(pulled[b].card));
  let missedParty = null;
  for (const i of order) {
    const isLegend = pulled[i].card.rarity === "legendary";
    slots[i].classList.add("is-flipped");
    if (isLegend) slots[i].classList.add("is-legend");
    if (skipFlips) {
      if (isLegend && !missedParty) missedParty = slots[i];
      continue;
    }
    if (isLegend) celebrate(slots[i]);
    await sleep(isLegend ? 1900 : 850);
  }
  if (missedParty) celebrate(missedParty);

  // ۵. نتیجه
  slots.forEach((s) => (s.querySelector(".slot__badge").hidden = false));
  const newCount = pulled.filter((p) => p.isNew).length;
  titleEl.textContent = pulled.some((p) => p.card.rarity === "legendary")
    ? "وای! کارت افسانه‌ای گرفتی!"
    : newCount ? `${fa(newCount)} کارت جدید گرفتی!` : "این دفعه همه‌شون تکراری بودن!";
  skipBtn.hidden = true;
  againBtn.hidden = false;
  doneBtn.hidden = false;
  updatePackButtons();
  doneBtn.focus();
  packBusy = false;
}

function closeOpening() {
  if (packBusy) return;
  openingEl.hidden = true;
  document.body.classList.remove("no-scroll");
  packTile.focus();
}

packTile.addEventListener("click", openPack);
againBtn.addEventListener("click", openPack);
doneBtn.addEventListener("click", closeOpening);
skipBtn.addEventListener("click", () => (skipFlips = true));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !openingEl.hidden) closeOpening();
});

// ---------- جرقه و کاغذ رنگی برای کارت افسانه‌ای ----------
const fx = document.getElementById("fx");
const ctx = fx.getContext("2d");
const CONFETTI_COLORS = ["#f2c14e", "#fff4b8", "#ffffff", "#2fbf71", "#e8423f", "#5cbfeb"];
let particles = [];
let fxRunning = false;

function sizeFx() {
  const dpr = window.devicePixelRatio || 1;
  fx.width = innerWidth * dpr;
  fx.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function celebrate(el) {
  if (reduceMotion) return;
  if (!fxRunning) sizeFx();
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  // جرقه‌های طلایی از وسط کارت
  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 7;
    particles.push({
      kind: "spark", x: cx, y: cy,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 3, life: 1, decay: 0.012 + Math.random() * 0.015,
      color: Math.random() < 0.5 ? "#fff4b8" : "#f2c14e",
    });
  }
  // کاغذ رنگی از بالای صفحه
  for (let i = 0; i < 150; i++) {
    particles.push({
      kind: "paper", x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.6,
      vx: -1 + Math.random() * 2, vy: 2 + Math.random() * 3,
      rot: Math.random() * 6, vr: -0.2 + Math.random() * 0.4,
      w: 6 + Math.random() * 6, h: 4 + Math.random() * 6, sway: Math.random() * 6,
      color: randomFrom(CONFETTI_COLORS),
    });
  }
  if (!fxRunning) {
    fxRunning = true;
    requestAnimationFrame(drawFx);
  }
}

function drawFx() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  particles = particles.filter((p) => {
    if (p.kind === "spark") {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy = p.vy * 0.96 + 0.08;
      p.life -= p.decay;
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      return p.life > 0;
    }
    p.sway += 0.05;
    p.x += p.vx + Math.sin(p.sway) * 0.8;
    p.y += p.vy;
    p.rot += p.vr;
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.sway * 2)) + 1);
    ctx.restore();
    return p.y < innerHeight + 30;
  });
  ctx.globalAlpha = 1;
  if (particles.length) {
    requestAnimationFrame(drawFx);
  } else {
    fxRunning = false;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
  }
}

updatePackButtons();
