// ====== مغز بازی Football Card Heroes ======
// این فایل صفحه رو می‌سازه، کارت‌ها رو نشون می‌ده و سکه‌ها رو ذخیره می‌کنه.

const SAVE_KEY = "football-card-heroes-save";
const START_COINS = 500;

// sell = چند سکه می‌گیری اگه یه کارت تکراری از این نوع رو بفروشی
const RARITIES = {
  secret: { label: "SECRET", order: -1, sell: 0 },
  icon: { label: "اسطوره", order: 0, sell: 400 },
  legendary: { label: "افسانه‌ای", order: 1, sell: 150 },
  rare: { label: "کمیاب", order: 2, sell: 40 },
  common: { label: "معمولی", order: 3, sell: 15 },
};

// ---------- ذخیره و بارگذاری (توی حافظه مرورگر) ----------
function loadSave() {
  try {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (data && typeof data.coins === "number") {
      return {
        coins: data.coins,
        collection: data.collection || {},
        team: data.team || null,
        beaten: data.beaten || {},
        penalty: data.penalty || null,
      };
    }
  } catch (e) {}
  return { coins: START_COINS, collection: {}, team: null, beaten: {} };
}

function writeSave() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (e) {}
}

const save = loadSave();
writeSave();

// عدد انگلیسی رو به عدد فارسی تبدیل می‌کنه (مثلاً 95 → ۹۵)
function fa(n) {
  return Number(n).toLocaleString("fa-IR");
}

// تصویر بازیکن‌ها توی portrait.js کشیده می‌شه

// ---------- ساختن یک کارت ----------
// ۶ تا آمار مثل FIFA. اگه کارتی خودش stats داشته باشه، همون استفاده می‌شه.
// وگرنه از روی قدرت و پست بازیکن حساب می‌شه (هر بازیکن یه کم با بقیه فرق داره).
const STAT_NAMES = {
  field: ["سرعت", "شوت", "پاس", "دریبل", "دفاع", "بدن"],
  keeper: ["شیرجه", "مهار", "ضربه", "واکنش", "سرعت", "جاگیری"],
};
const STAT_PROFILES = {
  "مهاجم": [2, 4, -5, 2, -45, -8],
  "هافبک": [-3, -4, 4, 2, -18, -8],
  "مدافع": [-8, -35, -12, -16, 4, 2],
  "دروازه‌بان": [1, 0, -8, 3, -40, 1],
};

function hashNumber(text) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

function cardStats(card) {
  if (card.stats) return card.stats;
  if (!STAT_PROFILES[card.position]) return Array(6).fill(card.power);
  return STAT_PROFILES[card.position].map((offset, i) => {
    const wiggle = (hashNumber(card.id + i) % 9) - 4;
    return Math.max(30, Math.min(99, card.power + offset + wiggle));
  });
}

function statsHTML(card) {
  const names = card.position === "دروازه‌بان" ? STAT_NAMES.keeper : STAT_NAMES.field;
  return cardStats(card).map((value, i) =>
    `<span class="card__stat"><b>${card.secret ? "∞" : fa(value)}</b>${names[i]}</span>`
  ).join("");
}

// قدرت کارت Secret بی‌نهایت نشون داده می‌شه
function displayPower(card) {
  return card.secret ? "∞" : fa(card.power);
}

const BINARY_TEXT = "101001 010110 110100 001011 100101 011010 101001 111000 010101 101001 001101 110010 101001 010011 100110 011101 ";

// کارت‌هایی که توی آلبوم شمرده می‌شن (کارت مخفی حساب نیست)
const ALBUM_CARDS = CARDS.filter((c) => !c.secret);

function cardHTML(card, tag = "button") {
  const rarity = RARITIES[card.rarity].label;
  const label = `${card.name}، کارت ${rarity}، قدرت ${displayPower(card)}`;
  // اسم‌های بلند کوچیک‌تر نوشته می‌شن تا روی کارت جا بشن
  const nameSize = card.name.length > 12 ? " card__name--xlong" : card.name.length > 8 ? " card__name--long" : "";
  const mark = { secret: "◆ ", icon: "✦ ", legendary: "★ " }[card.rarity] || "";
  // پس‌زمینه کارت Secret پر از صفر و یکه
  const binary = card.secret ? `<span class="card__binary" aria-hidden="true">${BINARY_TEXT}${BINARY_TEXT}</span>` : "";
  const attrs = tag === "button" ? `type="button" aria-label="${label}"` : `role="img" aria-label="${label}"`;
  return `<${tag} class="card card--${card.rarity}" data-id="${card.id}" ${attrs}>
    <span class="card__inner">
      ${binary}
      <span class="card__glare" aria-hidden="true"></span>
      <svg class="card__frame" viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true">
        <polygon class="card__rim" points="14,0 86,0 100,9.8 100,124.6 50,140 0,124.6 0,9.8"/>
        <polygon class="card__line" points="15.6,4.2 84.4,4.2 95.8,11.8 95.8,121.8 50,135.4 4.2,121.8 4.2,11.8"/>
      </svg>
      <span class="card__top">
        <span class="card__power">${displayPower(card)}</span>
        <span class="card__pos">${card.position}</span>
        ${flagSVG(card.country)}
      </span>
      <span class="card__face">${portraitSVG(card.look, card.id)}</span>
      <span class="card__name${nameSize}">${card.name}</span>
      <span class="card__stats">${statsHTML(card)}</span>
      <span class="card__meta">
        <span>${card.country}</span>
        <span class="card__rarity">${mark}${rarity}</span>
      </span>
    </span>
  </${tag}>`;
}

// کارتی که هنوز نداری: سایه مشکی با علامت سؤال
function lockedHTML(card) {
  const rarity = RARITIES[card.rarity].label;
  return `<button class="locked locked--${card.rarity}" type="button" data-locked aria-label="کارت ${rarity} که هنوز نداری">
    <span class="locked__inner">
      <svg class="locked__shadow" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="42" r="19"/>
        <path d="M12 100 Q14 72 50 70 Q86 72 88 100Z"/>
      </svg>
      <span class="locked__q" aria-hidden="true">؟</span>
      <span class="locked__rarity">${rarity}</span>
    </span>
  </button>`;
}

// ---------- آلبوم (صفحه اصلی) ----------
const grid = document.getElementById("card-grid");
let filter = "all";

function owns(card) {
  return (save.collection[card.id] || 0) > 0;
}

function duplicateValue() {
  return CARDS.reduce((sum, c) => sum + Math.max(0, (save.collection[c.id] || 0) - 1) * RARITIES[c.rarity].sell, 0);
}

function renderCoins() {
  document.getElementById("coin-count").textContent = fa(save.coins);
}

// ---------- بنر بالای صفحه ----------
// بهترین کارتت رو بزرگ نشون می‌ده
function bestCard() {
  return CARDS
    .filter(owns)
    .sort((a, b) => RARITIES[a.rarity].order - RARITIES[b.rarity].order || b.power - a.power)[0];
}

function renderHero() {
  const best = bestCard();
  const heroCard = document.getElementById("hero-card");
  if (best) {
    heroCard.className = `hero__card hero__card--${best.rarity}`;
    heroCard.innerHTML = cardHTML(best, "div");
    document.getElementById("hero-star").innerHTML =
      `ستاره کلکسیون تو: <strong>${best.name}</strong> · قدرت ${displayPower(best)}`;
  } else {
    heroCard.className = "hero__card hero__card--empty";
    heroCard.innerHTML = `<div class="hero__mystery"><div class="card-back"><span class="card-back__ball">⚽</span><span class="card-back__mark">FCH</span></div></div>`;
    document.getElementById("hero-star").textContent = "اولین بسته‌ت رو باز کن و ستاره‌ت رو پیدا کن!";
  }
  document.getElementById("hero-cards").textContent = `${fa(ALBUM_CARDS.filter(owns).length)}/${fa(ALBUM_CARDS.length)}`;
  document.getElementById("hero-wins").textContent = fa(Object.keys(save.beaten || {}).length);
  // قدرت تیم توی team.js حساب می‌شه که بعد از این فایل بار می‌شه
  if (typeof teamPower === "function") document.getElementById("hero-power").textContent = fa(teamPower());
}

// ---------- ذره‌های براق پس‌زمینه ----------
function buildSparkles() {
  let html = "";
  for (let i = 0; i < 26; i++) {
    const left = (Math.random() * 100).toFixed(1);
    const size = (2 + Math.random() * 4).toFixed(1);
    const time = (10 + Math.random() * 12).toFixed(1);
    const delay = (-Math.random() * 20).toFixed(1);
    const drift = Math.round(-40 + Math.random() * 80);
    html += `<span style="left:${left}%;--size:${size}px;--time:${time}s;--delay:${delay}s;--drift:${drift}px"></span>`;
  }
  document.getElementById("sparkles").innerHTML = html;
}

function renderGrid() {
  renderHero();
  const list = CARDS
    .filter((c) => !c.secret || owns(c))
    .filter((c) => filter === "all" || c.rarity === filter)
    .sort((a, b) => RARITIES[a.rarity].order - RARITIES[b.rarity].order || b.power - a.power);
  grid.innerHTML = list.map((c) => {
    if (!owns(c)) return `<div class="album-slot">${lockedHTML(c)}</div>`;
    const count = save.collection[c.id];
    const badge = count > 1 ? `<span class="count-badge">×${fa(count)}</span>` : "";
    return `<div class="album-slot">${cardHTML(c)}${badge}</div>`;
  }).join("");

  // نوار پیشرفت
  const ownedCount = ALBUM_CARDS.filter(owns).length;
  document.getElementById("card-total").textContent = `${fa(ownedCount)} از ${fa(ALBUM_CARDS.length)} کارت رو جمع کردی`;
  document.getElementById("album-note").textContent = `${fa(ownedCount)} از ${fa(ALBUM_CARDS.length)} کارت`;
  document.getElementById("progress-fill").style.width = `${(ownedCount / ALBUM_CARDS.length) * 100}%`;

  document.querySelectorAll("[data-filter]").forEach((btn) => {
    const f = btn.dataset.filter;
    const group = ALBUM_CARDS.filter((c) => f === "all" || c.rarity === f);
    btn.querySelector(".chip__count").textContent = `${fa(group.filter(owns).length)}/${fa(group.length)}`;
  });

  // دکمه فروش همه تکراری‌ها
  const value = duplicateValue();
  document.getElementById("sell-all").hidden = value === 0;
  document.getElementById("sell-all-btn").textContent = `فروش همه تکراری‌ها · +${fa(value)} سکه`;
}

document.querySelectorAll("[data-filter]").forEach((btn) => {
  const f = btn.dataset.filter;
  btn.addEventListener("click", () => {
    filter = f;
    document.querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    renderGrid();
  });
});

// ---------- نمایش بزرگ کارت ----------
const viewer = document.getElementById("viewer");
const sellEl = document.getElementById("sell");
const sellBtn = document.getElementById("sell-btn");
const sellConfirm = document.getElementById("sell-confirm");
let viewerCard = null;
let lastFocus = null;

function renderViewerInfo() {
  const card = viewerCard;
  const count = save.collection[card.id] || 0;
  document.getElementById("viewer-info").textContent =
    `${card.name} · ${card.position} · ${card.country} · کارت ${RARITIES[card.rarity].label} · ${fa(count)} تا داری` +
    (card.rank ? ` · رتبه ${fa(card.rank)} در ۱۰۰ فوتبالیست برتر تاریخ` : "");
  sellEl.hidden = count < 2;
  sellBtn.hidden = false;
  sellConfirm.hidden = true;
  sellBtn.textContent = `فروش یه تکراری · +${fa(RARITIES[card.rarity].sell)} سکه`;
}

function openViewer(id) {
  const card = CARDS.find((c) => c.id === id);
  if (!card) return;
  lastFocus = document.activeElement;
  viewerCard = card;
  document.getElementById("viewer-card").innerHTML = cardHTML(card, "div");
  renderViewerInfo();
  viewer.hidden = false;
  document.getElementById("viewer-close").focus();
}

function closeViewer() {
  viewer.hidden = true;
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}

grid.addEventListener("click", (e) => {
  if (e.target.closest("[data-locked]")) {
    showToast("هنوز این کارت رو نداری! بسته باز کن تا شاید پیداش کنی.");
    return;
  }
  const card = e.target.closest(".card");
  if (card) openViewer(card.dataset.id);
});

// ---------- فروختن کارت تکراری ----------
// همیشه حداقل یکی از هر کارت برات می‌مونه
function afterSale(earned) {
  writeSave();
  renderCoins();
  renderGrid();
  updatePackButtons();
  showToast(`فروختی! +${fa(earned)} سکه`);
}

sellBtn.addEventListener("click", () => {
  sellBtn.hidden = true;
  sellConfirm.hidden = false;
  document.getElementById("sell-yes").focus();
});
document.getElementById("sell-no").addEventListener("click", renderViewerInfo);
document.getElementById("sell-yes").addEventListener("click", () => {
  if ((save.collection[viewerCard.id] || 0) < 2) return;
  const price = RARITIES[viewerCard.rarity].sell;
  save.collection[viewerCard.id] -= 1;
  save.coins += price;
  afterSale(price);
  renderViewerInfo();
  document.getElementById(sellEl.hidden ? "viewer-close" : "sell-btn").focus();
});

const sellAllBtn = document.getElementById("sell-all-btn");
const sellAllConfirm = document.getElementById("sell-all-confirm");

function resetSellAll() {
  sellAllBtn.hidden = false;
  sellAllConfirm.hidden = true;
}

sellAllBtn.addEventListener("click", () => {
  sellAllBtn.hidden = true;
  sellAllConfirm.hidden = false;
  document.getElementById("sell-all-yes").focus();
});
document.getElementById("sell-all-no").addEventListener("click", () => {
  resetSellAll();
  sellAllBtn.focus();
});
document.getElementById("sell-all-yes").addEventListener("click", () => {
  const earned = duplicateValue();
  CARDS.forEach((c) => {
    if (save.collection[c.id] > 1) save.collection[c.id] = 1;
  });
  save.coins += earned;
  resetSellAll();
  afterSale(earned);
  document.getElementById("album-title").focus();
});

document.getElementById("album-btn").addEventListener("click", () => {
  const title = document.getElementById("album-title");
  title.scrollIntoView({ behavior: reducedMotionPref() ? "auto" : "smooth", block: "start" });
  title.focus({ preventScroll: true });
});

function reducedMotionPref() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
document.getElementById("viewer-close").addEventListener("click", closeViewer);
viewer.addEventListener("click", (e) => {
  if (e.target === viewer) closeViewer();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !viewer.hidden) closeViewer();
});

// ---------- دکمه‌های قسمت‌هایی که هنوز نساختیم ----------
const toast = document.getElementById("toast");
let toastTimer = null;

function showToast(text) {
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.hidden = true), 2600);
}

document.querySelectorAll("[data-stage]").forEach((btn) => {
  btn.addEventListener("click", () => {
    showToast(`این قسمت رو توی مرحله ${fa(btn.dataset.stage)} با هم می‌سازیم!`);
  });
});

buildSparkles();
// ---------- افکت سه‌بعدی کارت‌ها ----------
// وقتی موس یا انگشت روی کارت حرکت می‌کنه، کارت کج می‌شه و نور روش جابه‌جا می‌شه
function tiltCard(e) {
  const card = e.target.closest(".card");
  if (!card || card.closest(".flip")) return;
  const r = card.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;  // ۰ تا ۱
  const y = (e.clientY - r.top) / r.height;
  card.style.setProperty("--rx", `${(0.5 - y) * 18}deg`);
  card.style.setProperty("--ry", `${(x - 0.5) * 22}deg`);
  card.style.setProperty("--gx", `${x * 100}%`);
  card.style.setProperty("--gy", `${y * 100}%`);
  card.classList.add("is-tilting");
}

function untiltCard(e) {
  const card = e.target.closest(".card");
  if (!card || (e.relatedTarget && card.contains(e.relatedTarget))) return;
  card.classList.remove("is-tilting");
  card.style.removeProperty("--rx");
  card.style.removeProperty("--ry");
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.addEventListener("pointermove", tiltCard);
  document.addEventListener("pointerout", untiltCard);
  document.addEventListener("pointercancel", untiltCard);
}

renderCoins();
renderGrid();
