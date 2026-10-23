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
  const clipId = "shirt-" + drawCount++;
  const hair = hairSVG(look);
  const shirtPath = "M12 100 Q14 80 36 76 L50 83 L64 76 Q86 80 88 100Z";
  const stripes = look.stripes
    ? `<g clip-path="url(#${clipId})">${[22, 38, 54, 70].map((x) => `<rect x="${x}" y="70" width="8" height="30" fill="${look.trim}"/>`).join("")}</g>`
    : "";
  const mouth = look.bigSmile
    ? `<path d="M41 57 Q50 68 59 57Z" fill="#ffffff" stroke="#5a2414" stroke-width="1.5" stroke-linejoin="round"/>`
    : `<path d="M44 58 Q50 63 56 58" fill="none" stroke="#5a2414" stroke-width="1.8" stroke-linecap="round"/>`;
  const beard = look.beard
    ? `<path d="M34 50 Q35 69 50 69 Q65 69 66 50 Q63 63 50 63 Q37 63 34 50Z" fill="${look.hair}" opacity=".8"/>`
    : "";

  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <defs><clipPath id="${clipId}"><path d="${shirtPath}"/></clipPath></defs>
    ${hair.back || ""}
    <rect x="44" y="60" width="12" height="20" rx="3" fill="${look.skin}"/>
    <path d="${shirtPath}" fill="${look.shirt}"/>
    ${stripes}
    <path d="M40 77 L50 86 L60 77" fill="none" stroke="${look.trim}" stroke-width="3" stroke-linejoin="round"/>
    <text x="50" y="98" text-anchor="middle" font-size="12" font-weight="800" font-family="Arial, sans-serif" fill="${look.numberColor || look.trim}">${look.number}</text>
    <circle cx="33" cy="48" r="4" fill="${look.skin}"/>
    <circle cx="67" cy="48" r="4" fill="${look.skin}"/>
    <ellipse cx="50" cy="46" rx="17" ry="20" fill="${look.skin}"/>
    ${hair.front || ""}
    <path d="M39 41 Q43 39 47 41 M53 41 Q57 39 61 41" fill="none" stroke="${look.hair}" stroke-width="1.8" stroke-linecap="round"/>
    <ellipse cx="43" cy="47" rx="2" ry="2.6" fill="#1d140e"/>
    <ellipse cx="57" cy="47" rx="2" ry="2.6" fill="#1d140e"/>
    <path d="M50 49 Q47.5 54.5 51 55" fill="none" stroke="#000000" stroke-opacity=".25" stroke-width="1.4" stroke-linecap="round"/>
    ${beard}
    ${mouth}
  </svg>`;
}

// ---------- ساختن یک کارت ----------
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
      </span>
      <span class="card__face">${portraitSVG(card.look)}</span>
      <span class="card__name${nameSize}">${card.name}</span>
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
