// ====== مغز بازی Football Card Heroes ======
// این فایل صفحه رو می‌سازه، کارت‌ها رو نشون می‌ده و سکه‌ها رو ذخیره می‌کنه.

const SAVE_KEY = "football-card-heroes-save";
const START_COINS = 500;

// sell = چند سکه می‌گیری اگه یه کارت تکراری از این نوع رو بفروشی
const RARITIES = {
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

// ---------- کشیدن تصویر کارتونی بازیکن ----------
let drawCount = 0;

function hairSVG(look) {
  const hair = hairShape(look);
  // هدبند (نوار دور سر) روی هر مدل مویی می‌شینه
  if (look.headband) {
    hair.front = (hair.front || "") + `<path d="M32 34 Q50 25 68 34 L68 39 Q50 30 32 39Z" fill="${look.headband}"/>`;
  }
  return hair;
}

function hairShape(look) {
  const c = look.hair;
  switch (look.hairStyle) {
    case "short":
      return { front: `<path d="M31 44 Q30 19 50 18 Q70 19 69 44 Q66 31 50 30 Q34 31 31 44Z" fill="${c}"/>` };
    case "buzz":
      return { front: `<path d="M32 40 Q33 22 50 22 Q67 22 68 40 Q63 31 50 30 Q37 31 32 40Z" fill="${c}" opacity=".85"/>` };
    case "spiky":
      return { front: `<path d="M31 43 Q30 27 36 22 L37 13 L43 19 L47 9 L51 18 L56 10 L58 19 L65 14 Q70 24 69 43 Q65 31 50 30 Q35 31 31 43Z" fill="${c}"/>` };
    case "curly": {
      const curls = [[32, 41, 6], [33, 33, 7], [39, 26, 7], [47, 22, 7], [55, 22, 7], [62, 26, 7], [67, 33, 7], [68, 41, 6], [44, 28, 6], [56, 28, 6]];
      return { front: curls.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join("") };
    }
    case "long": {
      const back = `<path d="M28 44 Q26 15 50 14 Q74 15 72 44 L74 72 Q66 76 63 64 L63 44 L37 44 L37 64 Q34 76 26 72Z" fill="${c}"/>`;
      const front = `<path d="M31 44 Q30 18 50 17 Q70 18 69 44 Q64 30 50 29 Q36 30 31 44Z" fill="${c}"/>`;
      return { back, front };
    }
    default:
      return {};
  }
}

function portraitSVG(look) {
  const n = drawCount++;
  const hair = hairSVG(look);
  const shirtPath = "M10 100 Q12 80 34 75.5 L50 82 L66 75.5 Q88 80 90 100Z";
  const facePath = "M33 44 Q33 25 50 25 Q67 25 67 44 Q67 58 59 64.5 Q50 69 41 64.5 Q33 58 33 44Z";
  const stripes = look.stripes
    ? [22, 38, 54, 70].map((x) => `<rect x="${x}" y="70" width="8" height="30" fill="${look.trim}"/>`).join("")
    : "";
  const mouth = look.bigSmile
    ? `<path d="M41.5 57.5 Q50 68 58.5 57.5Z" fill="#ffffff" stroke="#6b2a1c" stroke-width="1.4" stroke-linejoin="round"/>`
    : `<path d="M44.5 58.2 Q50 61.5 55.5 58.2 Q50 63.8 44.5 58.2Z" fill="#9b4332"/>`;
  const beard = look.beard
    ? `<path d="M34 50 Q35 69 50 69.5 Q65 69 66 50 Q63 63.5 50 63.5 Q37 63.5 34 50Z" fill="${look.hair}" opacity=".85"/>
       <path d="M43.5 56.4 Q50 54 56.5 56.4 Q50 57.6 43.5 56.4Z" fill="${look.hair}" opacity=".9"/>`
    : "";
  // برق مو (یا برق سر کچل)
  const shine = look.hairStyle === "bald"
    ? `<ellipse cx="44" cy="31" rx="5" ry="2.5" fill="#ffffff" opacity=".28"/>`
    : `<path d="M39 25 Q48 19.5 58 23" fill="none" stroke="#ffffff" stroke-opacity=".28" stroke-width="2" stroke-linecap="round"/>`;
  const eye = (x) => `<ellipse cx="${x}" cy="47" rx="3.1" ry="2.3" fill="#ffffff"/>
    <circle cx="${x}" cy="47.2" r="1.8" fill="#2b1a10"/>
    <circle cx="${x + 0.7}" cy="46.4" r="0.6" fill="#ffffff"/>`;

  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <defs>
      <clipPath id="shirt-${n}"><path d="${shirtPath}"/></clipPath>
      <clipPath id="face-${n}"><path d="${facePath}"/></clipPath>
      <linearGradient id="cloth-${n}" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#000000" stop-opacity=".28"/>
        <stop offset=".35" stop-color="#ffffff" stop-opacity=".12"/>
        <stop offset=".65" stop-color="#ffffff" stop-opacity="0"/>
        <stop offset="1" stop-color="#000000" stop-opacity=".3"/>
      </linearGradient>
      <radialGradient id="light-${n}" cx=".38" cy=".3" r=".75">
        <stop offset="0" stop-color="#ffffff" stop-opacity=".28"/>
        <stop offset=".55" stop-color="#ffffff" stop-opacity="0"/>
        <stop offset="1" stop-color="#000000" stop-opacity=".18"/>
      </radialGradient>
    </defs>
    ${hair.back || ""}
    <rect x="43.5" y="58" width="13" height="22" rx="4" fill="${look.skin}"/>
    <path d="M43.5 63 Q50 69 56.5 63 L56.5 68 Q50 72 43.5 68Z" fill="#000000" opacity=".18"/>
    <g clip-path="url(#shirt-${n})">
      <path d="${shirtPath}" fill="${look.shirt}"/>
      ${stripes}
      <path d="M10 100 Q12 80 34 75.5 L36 80 Q20 84 18 100Z" fill="${look.trim}" opacity=".5"/>
      <path d="M90 100 Q88 80 66 75.5 L64 80 Q80 84 82 100Z" fill="${look.trim}" opacity=".5"/>
      <rect x="0" y="70" width="100" height="30" fill="url(#cloth-${n})"/>
    </g>
    <path d="M39.5 76.5 L50 86.5 L60.5 76.5" fill="none" stroke="${look.trim}" stroke-width="3.2" stroke-linejoin="round"/>
    <circle cx="64" cy="89" r="2.6" fill="${look.trim}" opacity=".9"/>
    <text x="50" y="98" text-anchor="middle" font-size="11" font-weight="800" font-family="Arial, sans-serif" fill="${look.numberColor || look.trim}">${look.number}</text>
    <ellipse cx="33.5" cy="48" rx="3.6" ry="4.6" fill="${look.skin}"/>
    <ellipse cx="66.5" cy="48" rx="3.6" ry="4.6" fill="${look.skin}"/>
    <ellipse cx="33.8" cy="48" rx="1.6" ry="2.4" fill="#000000" opacity=".15"/>
    <ellipse cx="66.2" cy="48" rx="1.6" ry="2.4" fill="#000000" opacity=".15"/>
    <path d="${facePath}" fill="${look.skin}"/>
    <g clip-path="url(#face-${n})">
      <rect x="30" y="22" width="40" height="50" fill="url(#light-${n})"/>
    </g>
    <ellipse cx="40" cy="54" rx="3.4" ry="2" fill="#e0695a" opacity=".16"/>
    <ellipse cx="60" cy="54" rx="3.4" ry="2" fill="#e0695a" opacity=".16"/>
    ${hair.front || ""}
    ${shine}
    <path d="M38.5 41.5 Q43 38.6 47.5 40.6 M52.5 40.6 Q57 38.6 61.5 41.5" fill="none" stroke="${look.hair}" stroke-width="2.3" stroke-linecap="round"/>
    ${eye(43)}
    ${eye(57)}
    <path d="M50.5 48 Q47.4 54.2 50 55.3 Q51.8 55.8 53 54.8" fill="none" stroke="#000000" stroke-opacity=".22" stroke-width="1.3" stroke-linecap="round"/>
    ${beard}
    ${mouth}
  </svg>`;
}

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
  return STAT_PROFILES[card.position].map((offset, i) => {
    const wiggle = (hashNumber(card.id + i) % 9) - 4;
    return Math.max(30, Math.min(99, card.power + offset + wiggle));
  });
}

function statsHTML(card) {
  const names = card.position === "دروازه‌بان" ? STAT_NAMES.keeper : STAT_NAMES.field;
  return cardStats(card).map((value, i) =>
    `<span class="card__stat"><b>${fa(value)}</b>${names[i]}</span>`
  ).join("");
}

function cardHTML(card, tag = "button") {
  const rarity = RARITIES[card.rarity].label;
  const label = `${card.name}، کارت ${rarity}، قدرت ${fa(card.power)}`;
  // اسم‌های بلند کوچیک‌تر نوشته می‌شن تا روی کارت جا بشن
  const nameSize = card.name.length > 12 ? " card__name--xlong" : card.name.length > 8 ? " card__name--long" : "";
  const mark = { icon: "✦ ", legendary: "★ " }[card.rarity] || "";
  const attrs = tag === "button" ? `type="button" aria-label="${label}"` : `role="img" aria-label="${label}"`;
  return `<${tag} class="card card--${card.rarity}" data-id="${card.id}" ${attrs}>
    <span class="card__inner">
      <span class="card__top">
        <span class="card__power">${fa(card.power)}</span>
        <span class="card__pos">${card.position}</span>
        ${flagSVG(card.country)}
      </span>
      <span class="card__face">${portraitSVG(card.look)}</span>
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

function renderGrid() {
  const list = CARDS
    .filter((c) => filter === "all" || c.rarity === filter)
    .sort((a, b) => RARITIES[a.rarity].order - RARITIES[b.rarity].order || b.power - a.power);
  grid.innerHTML = list.map((c) => {
    if (!owns(c)) return `<div class="album-slot">${lockedHTML(c)}</div>`;
    const count = save.collection[c.id];
    const badge = count > 1 ? `<span class="count-badge">×${fa(count)}</span>` : "";
    return `<div class="album-slot">${cardHTML(c)}${badge}</div>`;
  }).join("");

  // نوار پیشرفت
  const ownedCount = CARDS.filter(owns).length;
  document.getElementById("card-total").textContent = `${fa(ownedCount)} از ${fa(CARDS.length)} کارت رو جمع کردی`;
  document.getElementById("album-note").textContent = `${fa(ownedCount)} از ${fa(CARDS.length)} کارت`;
  document.getElementById("progress-fill").style.width = `${(ownedCount / CARDS.length) * 100}%`;

  document.querySelectorAll("[data-filter]").forEach((btn) => {
    const f = btn.dataset.filter;
    const group = CARDS.filter((c) => f === "all" || c.rarity === f);
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

renderCoins();
renderGrid();
