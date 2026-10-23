// ====== پرچم کشورها ======
// هر پرچم یه نقاشی کوچیکه به اندازه ۳۰ در ۲۰.
// برای کشور جدید، یه خط شبیه بقیه اضافه کن.

function flagStar(cx, cy, r, fill) {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    d += (i ? "L" : "M") + (cx + rr * Math.cos(angle)).toFixed(2) + " " + (cy + rr * Math.sin(angle)).toFixed(2);
  }
  return `<path d="${d}Z" fill="${fill}"/>`;
}

// سه نوار افقی یا عمودی
const hBands = (a, b, c) => `<rect width="30" height="7" fill="${a}"/><rect y="6.67" width="30" height="7" fill="${b}"/><rect y="13.33" width="30" height="6.67" fill="${c}"/>`;
const vBands = (a, b, c) => `<rect width="10.5" height="20" fill="${a}"/><rect x="10" width="10.5" height="20" fill="${b}"/><rect x="20" width="10" height="20" fill="${c}"/>`;
const nordicCross = (bg, cross, inner) =>
  `<rect width="30" height="20" fill="${bg}"/><rect x="8" width="6" height="20" fill="${cross}"/><rect y="7" width="30" height="6" fill="${cross}"/>` +
  (inner ? `<rect x="9.5" width="3" height="20" fill="${inner}"/><rect y="8.5" width="30" height="3" fill="${inner}"/>` : "");

const FLAGS = {
  "آرژانتین": hBands("#74acdf", "#ffffff", "#74acdf") + `<circle cx="15" cy="10" r="2.2" fill="#f6b40e"/>`,
  "پرتغال": `<rect width="12" height="20" fill="#006600"/><rect x="12" width="18" height="20" fill="#ff0000"/><circle cx="12" cy="10" r="3.6" fill="#ffd700"/><circle cx="12" cy="10" r="2" fill="#ff0000"/>`,
  "برزیل": `<rect width="30" height="20" fill="#009c3b"/><path d="M15 2.5 L27 10 L15 17.5 L3 10Z" fill="#ffdf00"/><circle cx="15" cy="10" r="4.2" fill="#002776"/>`,
  "اروگوئه": `<rect width="30" height="20" fill="#ffffff"/>` + [2.2, 6.7, 11.1, 15.6].map((y) => `<rect y="${y}" width="30" height="2.2" fill="#0038a8"/>`).join("") + `<rect width="11" height="11" fill="#ffffff"/><circle cx="5.5" cy="5.5" r="3" fill="#fcd116"/>`,
  "اسپانیا": `<rect width="30" height="20" fill="#aa151b"/><rect y="5" width="30" height="10" fill="#f1bf00"/>`,
  "فرانسه": vBands("#002395", "#ffffff", "#ed2939"),
  "نروژ": nordicCross("#ba0c2f", "#ffffff", "#00205b"),
  "مصر": hBands("#ce1126", "#ffffff", "#000000") + `<circle cx="15" cy="10" r="2" fill="#c09300"/>`,
  "انگلیس": `<rect width="30" height="20" fill="#ffffff"/><rect x="12.5" width="5" height="20" fill="#ce1124"/><rect y="7.5" width="30" height="5" fill="#ce1124"/>`,
  "بلژیک": vBands("#000000", "#fdda24", "#ef3340"),
  "آلمان": hBands("#000000", "#dd0000", "#ffce00"),
  "هلند": hBands("#ae1c28", "#ffffff", "#21468b"),
  "ایران": hBands("#239f40", "#ffffff", "#da0000") + `<circle cx="15" cy="10" r="2" fill="none" stroke="#da0000" stroke-width="0.9"/>`,
  "مراکش": `<rect width="30" height="20" fill="#c1272d"/>` + flagStar(15, 10.5, 5, "none").replace('fill="none"', 'fill="none" stroke="#006233" stroke-width="1"'),
  "مجارستان": hBands("#ce2939", "#ffffff", "#477050"),
  "ایتالیا": vBands("#009246", "#ffffff", "#ce2b37"),
  "شوروی": `<rect width="30" height="20" fill="#cc0000"/>` + flagStar(6, 2.6, 1.3, "#ffd700") +
    `<path d="M3.8 6.2 Q4.6 9.6 8.2 9" fill="none" stroke="#ffd700" stroke-width="0.9" stroke-linecap="round"/><path d="M4.6 9.4 L8 5.6" stroke="#ffd700" stroke-width="0.9" stroke-linecap="round"/>`,
  "کرواسی": hBands("#ff0000", "#ffffff", "#171796") + `<rect x="12" y="5" width="6" height="8" fill="#ffffff"/><rect x="12" y="5" width="2" height="2" fill="#ff0000"/><rect x="16" y="5" width="2" height="2" fill="#ff0000"/><rect x="14" y="7" width="2" height="2" fill="#ff0000"/><rect x="12" y="9" width="2" height="2" fill="#ff0000"/><rect x="16" y="9" width="2" height="2" fill="#ff0000"/><rect x="14" y="11" width="2" height="2" fill="#ff0000"/>`,
  "ایرلند شمالی": `<rect width="30" height="20" fill="#ffffff"/><rect x="12.5" width="5" height="20" fill="#ce1124"/><rect y="7.5" width="30" height="5" fill="#ce1124"/>` + flagStar(15, 10, 3.6, "#ffffff") + `<circle cx="15" cy="10.3" r="1.4" fill="#ce1124"/>`,
  "چک‌اسلواکی": `<rect width="30" height="10" fill="#ffffff"/><rect y="10" width="30" height="10" fill="#d7141a"/><path d="M0 0 L15 10 L0 20Z" fill="#11457e"/>`,
  "اسکاتلند": `<rect width="30" height="20" fill="#005eb8"/><path d="M0 0 L30 20 M30 0 L0 20" stroke="#ffffff" stroke-width="3.5"/>`,
  "لهستان": `<rect width="30" height="10" fill="#ffffff"/><rect y="10" width="30" height="10" fill="#dc143c"/>`,
  "اوکراین": `<rect width="30" height="10" fill="#0057b7"/><rect y="10" width="30" height="10" fill="#ffd700"/>`,
  "کامرون": vBands("#007a5e", "#ce1126", "#fcd116") + flagStar(15, 10, 3, "#fcd116"),
  "لیبریا": `<rect width="30" height="20" fill="#ffffff"/>` + [0, 3.64, 7.27, 10.91, 14.55, 18.18].map((y) => `<rect y="${y}" width="30" height="1.82" fill="#bf0a30"/>`).join("") + `<rect width="10" height="9.1" fill="#002868"/>` + flagStar(5, 4.6, 2.8, "#ffffff"),
  "مکزیک": vBands("#006847", "#ffffff", "#ce1126") + `<circle cx="15" cy="10" r="2.2" fill="#8c5a2b"/>`,
  "سوئد": nordicCross("#006aa7", "#fecc00"),
  "پاراگوئه": hBands("#d52b1e", "#ffffff", "#0038a8") + `<circle cx="15" cy="10" r="2" fill="none" stroke="#0038a8" stroke-width="0.8"/>`,
  "شیلی": `<rect width="30" height="10" fill="#ffffff"/><rect y="10" width="30" height="10" fill="#d52b1e"/><rect width="10" height="10" fill="#0039a6"/>` + flagStar(5, 5, 2.8, "#ffffff"),
  "دانمارک": nordicCross("#c8102e", "#ffffff"),
};

function flagSVG(country) {
  const art = FLAGS[country];
  if (!art) return "";
  return `<svg class="flag" viewBox="0 0 30 20" aria-hidden="true">${art}</svg>`;
}
