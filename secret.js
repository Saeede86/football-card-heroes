// ====== کارت مخفی Secret ======
// این کارت فقط با یه کد مخفی باز می‌شه.
// راه باز کردن: ۵ بار پشت سر هم روی توپ ⚽ بالای صفحه بزن، بعد کد رو بنویس.
// خود کد اینجا نوشته نشده (فقط یه عدد رمزی ازش هست) که کسی نتونه از روی کدها پیداش کنه.

const SECRET_CODE_HASH = 134533930;
const SECRET_TAPS = 5;

const secretDialog = document.getElementById("secret-dialog");
const secretInput = document.getElementById("secret-code");
const secretMsg = document.getElementById("secret-msg");
let secretTaps = 0;
let secretTimer = null;

function openSecret() {
  secretInput.value = "";
  secretMsg.textContent = "";
  secretDialog.hidden = false;
  secretInput.focus();
}

function closeSecret() {
  secretDialog.hidden = true;
}

// ۵ بار زدن روی توپ، پنجره کد مخفی رو باز می‌کنه
document.querySelector(".brand__ball").addEventListener("click", () => {
  secretTaps += 1;
  clearTimeout(secretTimer);
  secretTimer = setTimeout(() => (secretTaps = 0), 2000);
  if (secretTaps >= SECRET_TAPS) {
    secretTaps = 0;
    openSecret();
  }
});

document.getElementById("secret-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const code = secretInput.value.trim().toUpperCase();
  if (portraitHash(code) !== SECRET_CODE_HASH) {
    secretMsg.textContent = "این کد درست نیست!";
    secretInput.select();
    return;
  }
  if (save.collection.secret) {
    secretMsg.textContent = "تو این کارت رو داری! 😎";
    return;
  }
  save.collection.secret = 1;
  writeSave();
  renderGrid();
  closeSecret();
  openViewer("secret");
  celebrate(document.getElementById("viewer-card"));
  showToast("کارت Secret مال تو شد! 🔓");
});

document.getElementById("secret-close").addEventListener("click", closeSecret);
secretDialog.addEventListener("click", (e) => {
  if (e.target === secretDialog) closeSecret();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !secretDialog.hidden) closeSecret();
});
