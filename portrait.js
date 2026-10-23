// ====== نقاشی چهره بازیکن‌ها ======
// هر بازیکن با کد کشیده می‌شه (عکس واقعی نداریم).
// رنگ پوست، مو، ریش و پیراهن از cards.js میاد.
// شکل صورت (فک، طول صورت، ابرو، بینی، لب، رنگ چشم) از روی اسم انگلیسی بازیکن (id)
// ساخته می‌شه، پس هر بازیکن قیافه خودش رو داره و همیشه هم همون می‌مونه.

let drawCount = 0;

function portraitHash(text) {
  let h = 2166136261;
  for (const ch of text) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

// رنگ‌ها رو با هم قاطی می‌کنه (برای سایه و روشنی)
function mixColor(hex, other, t) {
  const a = parseInt(hex.slice(1), 16);
  const b = parseInt(other.slice(1), 16);
  const ch = (shift) => Math.round(((a >> shift) & 255) * (1 - t) + ((b >> shift) & 255) * t);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}
const shadeOf = (hex, t) => mixColor(hex, "#000000", t);
const lightOf = (hex, t) => mixColor(hex, "#ffffff", t);

// ویژگی‌های صورت هر بازیکن (عدد بین ۰ و ۱)
function faceTraits(id, look) {
  const h = portraitHash(id || "player");
  const pick = (shift, steps) => ((h >>> shift) % steps) / (steps - 1);
  const skinLight = parseInt(look.skin.slice(1, 3), 16) > 0xd0;
  const eyeColors = skinLight
    ? ["#4a2c17", "#5b3a1e", "#3d6b8f", "#4f6b3a", "#6b4a2a"]
    : ["#2b1a10", "#3a2414", "#4a2c17"];
  return {
    jaw: pick(0, 6),
    long: pick(3, 5),
    brow: pick(6, 4),
    nose: pick(9, 5),
    lips: pick(12, 4),
    smile: pick(15, 3),
    eye: eyeColors[(h >>> 18) % eyeColors.length],
    stubble: (h >>> 22) % 3 === 0,
  };
}

// ---------- مو ----------
function hairArt(look, n, t) {
  const c = look.hair;
  const hi = lightOf(c, 0.35);
  const lo = shadeOf(c, 0.35);
  const fill = `url(#hair-${n})`;
  const strands = (paths) => paths.map((d) =>
    `<path d="${d}" fill="none" stroke="${hi}" stroke-width=".55" stroke-linecap="round" opacity=".45"/>`).join("");
  switch (look.hairStyle) {
    case "short":
      return {
        front: `<path d="M32.5 42 Q30.5 19.5 50 18.5 Q69.5 19.5 67.5 42 Q66.6 34.5 63.4 31.6 Q60.2 33.6 57.2 30.8 Q53.6 32.8 50.2 30.2 Q46.6 32.8 43 30.8 Q39.8 33.4 36.8 31.6 Q33.6 34.5 32.5 42Z" fill="${fill}"/>
          ${strands(["M38 24 Q44 21 50 21.5", "M52 21 Q58 21.5 62.5 25", "M36 30 Q40 25 46 24", "M55 24.5 Q61 26 64.5 31"])}
          <path d="M33 40 Q32.6 33 35.5 29" fill="none" stroke="${lo}" stroke-width=".7" opacity=".6"/>`,
      };
    case "buzz":
      return {
        front: `<path d="M33.6 39 Q33 23 50 22.2 Q67 23 66.4 39 Q63.5 31.2 50 30.6 Q36.5 31.2 33.6 39Z" fill="${c}" opacity=".55"/>
          <path d="M33.6 39 Q33 23 50 22.2 Q67 23 66.4 39 Q63.5 31.2 50 30.6 Q36.5 31.2 33.6 39Z" fill="url(#stip-${n})"/>`,
      };
    case "spiky":
      return {
        front: `<path d="M32 43 Q30.5 27 36 22.5 L36.5 13.5 L42.5 19.5 L46.5 9.5 L50.8 18.3 L56 10.5 L58 19.5 L65 14.5 Q70 24 68 43 Q65.8 32 50 30.4 Q34.2 32 32 43Z" fill="${fill}"/>
          ${strands(["M38 21 L37.5 15", "M45 18 L46.5 11.5", "M51.5 17.5 L55.5 12", "M59 19 L64 15.5"])}`,
      };
    case "curly": {
      // کلی حلقه کوچیک مو، با سایه و برق
      const h = portraitHash(look.hair + n);
      let curls = "";
      const ring = [];
      for (let a = 0; a <= 16; a++) {
        const ang = Math.PI * (1.02 + (a / 16) * 0.96);
        ring.push([50 + Math.cos(ang) * 17.5, 39 + Math.sin(ang) * 18.5]);
      }
      for (let a = 0; a <= 10; a++) {
        const ang = Math.PI * (1.12 + (a / 10) * 0.76);
        ring.push([50 + Math.cos(ang) * 11.5, 33 + Math.sin(ang) * 9]);
      }
      ring.forEach(([x, y], i) => {
        const r = 3.1 + (((h >>> (i % 24)) & 3) * 0.35);
        curls += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${c}"/>
          <circle cx="${(x - r * 0.3).toFixed(1)}" cy="${(y - r * 0.35).toFixed(1)}" r="${(r * 0.38).toFixed(2)}" fill="${hi}" opacity=".35"/>`;
      });
      return { front: `<ellipse cx="50" cy="29" rx="14" ry="7" fill="${c}"/>${curls}` };
    }
    case "long": {
      const back = `<path d="M28 44 Q25.5 14.5 50 13.5 Q74.5 14.5 72 44 L74 73 Q67 77.5 63.5 66 L63 44 L37 44 L36.5 66 Q33 77.5 26 73Z" fill="${fill}"/>
        ${strands(["M29 50 Q28.5 62 27.5 71", "M71 50 Q71.5 62 72.5 71", "M31 52 Q31 63 30.5 70", "M69 52 Q69 63 69.5 70"])}`;
      const front = `<path d="M31.5 44 Q30 17.5 50 16.8 Q70 17.5 68.5 44 Q66 33 58 29.5 Q53 29 50.5 26 Q47 29.5 42 29.5 Q34 33 31.5 44Z" fill="${fill}"/>
        <path d="M50.5 17.5 Q50.3 22 50.5 26" fill="none" stroke="${lo}" stroke-width=".7"/>
        ${strands(["M48 20 Q41 23 35 33", "M53 20 Q60 23 65 33", "M46 22.5 Q40 27 36.5 36"])}`;
      return { back, front };
    }
    default: // کچل
      return {
        front: `<path d="M33.6 42 Q33.4 37 34.6 34" fill="none" stroke="${c}" stroke-width="1.6" opacity=".25"/>
          <path d="M66.4 42 Q66.6 37 65.4 34" fill="none" stroke="${c}" stroke-width="1.6" opacity=".25"/>`,
        shine: `<ellipse cx="44" cy="29" rx="6" ry="3" fill="#ffffff" opacity=".3" transform="rotate(-20 44 29)"/>`,
      };
  }
}

// ---------- کل چهره ----------
function portraitSVG(look, id) {
  const n = drawCount++;
  const t = faceTraits(id, look);
  const skin = look.skin;
  const hair = hairArt(look, n, t);

  // اندازه‌های صورت
  const tw = 16.2;                 // پهنای شقیقه
  const cw = 16.4 + t.jaw * 0.5;  // پهنای گونه
  const jx = 11.5 + t.jaw * 3.5;  // گوشه فک
  const jy = 57 + t.long * 1.5;
  const chinY = 67.5 + t.long * 2;
  const chw = 4 + t.jaw * 2;
  const facePath = `M50 22.5 C${50 + tw * 0.62} 22.5 ${50 + tw} 27 ${50 + tw} 36 C${50 + cw} 44 ${50 + cw} 49 ${50 + jx + 1} ${jy - 3} C${50 + jx} ${jy + 2} ${50 + chw + 3} ${chinY - 1} ${50 + chw} ${chinY} Q50 ${chinY + 1.2} ${50 - chw} ${chinY} C${50 - chw - 3} ${chinY - 1} ${50 - jx} ${jy + 2} ${50 - jx - 1} ${jy - 3} C${50 - cw} 49 ${50 - cw} 44 ${50 - tw} 36 C${50 - tw} 27 ${50 - tw * 0.62} 22.5 50 22.5Z`;
  const eyeY = 45.5 + t.long * 0.6;
  const browY = 41 + t.long * 0.5;
  const noseK = 1 + t.nose * 0.25;
  const mouthY = 60.6 + t.long * 1.1;
  const lip = mixColor(skin, "#a8473a", 0.5);
  const lipLight = mixColor(skin, "#c76a5a", 0.45);

  // پیراهن
  const shirtPath = "M5 100 C7 86 20 79 37 76.4 L50 82.5 L63 76.4 C80 79 93 86 95 100Z";
  const stripes = look.stripes
    ? [18, 34, 50, 66, 82].map((x) => `<rect x="${x - 4}" y="70" width="8" height="30" fill="${look.trim}"/>`).join("")
    : "";

  // چشم
  const eye = (x, side) => `
    <ellipse cx="${x}" cy="${eyeY - 0.4}" rx="5" ry="3.2" fill="url(#shade-${n})" opacity=".55"/>
    <path id="eye${side}-${n}" d="M${x - 3.5} ${eyeY} Q${x} ${eyeY - 2.8} ${x + 3.5} ${eyeY} Q${x} ${eyeY + 2.1} ${x - 3.5} ${eyeY}Z" fill="#f4efe9"/>
    <g clip-path="url(#eyeclip${side}-${n})">
      <circle cx="${x}" cy="${eyeY - 0.2}" r="1.8" fill="${t.eye}"/>
      <circle cx="${x}" cy="${eyeY - 0.2}" r="1.8" fill="none" stroke="#000000" stroke-opacity=".35" stroke-width=".35"/>
      <circle cx="${x}" cy="${eyeY - 0.2}" r=".85" fill="#0d0907"/>
      <path d="M${x - 3.5} ${eyeY - 1.6} Q${x} ${eyeY - 3.3} ${x + 3.5} ${eyeY - 1.6} L${x + 3.5} ${eyeY - 0.6} Q${x} ${eyeY - 2.2} ${x - 3.5} ${eyeY - 0.6}Z" fill="#000000" opacity=".18"/>
    </g>
    <circle cx="${x + 0.65}" cy="${eyeY - 0.9}" r=".45" fill="#ffffff"/>
    <path d="M${x - 3.7} ${eyeY + 0.1} Q${x} ${eyeY - 3} ${x + 3.7} ${eyeY - 0.1}" fill="none" stroke="#24150d" stroke-width=".85" stroke-linecap="round"/>
    <path d="M${x - 3} ${eyeY - 1.9} Q${x} ${eyeY - 4.1} ${x + 3.2} ${eyeY - 1.7}" fill="none" stroke="${shadeOf(skin, 0.35)}" stroke-width=".4" opacity=".7"/>
    <path d="M${x - 2.6} ${eyeY + 1.2} Q${x} ${eyeY + 2.2} ${x + 2.8} ${eyeY + 1.1}" fill="none" stroke="${shadeOf(skin, 0.25)}" stroke-width=".3" opacity=".7"/>`;

  // ابرو (کلفتی‌ش برای هر بازیکن فرق داره)
  const bt = 1 + t.brow * 1.1;
  const browColor = shadeOf(look.hair, 0.1);
  const brow = (ex, s) => {
    const inner = ex - s * 4.3;
    const outer = ex + s * 4.7;
    return `<path d="M${inner} ${browY + 1} Q${ex} ${browY - 1.4 - bt} ${outer} ${browY + 0.6} Q${ex} ${browY - 0.4} ${inner} ${browY + 1 + bt * 0.6}Z" fill="${browColor}"/>`;
  };
  const brows = brow(42.8, -1) + brow(57.2, 1);

  // بینی
  const nose = `
    <path d="M${48.2} ${eyeY} Q${47.6} ${eyeY + 5} ${47.4} ${eyeY + 8}" fill="none" stroke="${shadeOf(skin, 0.22)}" stroke-width="1.3" stroke-linecap="round" opacity=".45"/>
    <ellipse cx="50" cy="${eyeY + 9}" rx="${2.5 * noseK}" ry="1.9" fill="${lightOf(skin, 0.12)}"/>
    <path d="M${50 - 3.4 * noseK} ${eyeY + 9.2} Q${50 - 4.1 * noseK} ${eyeY + 10.9} ${50 - 2.3 * noseK} ${eyeY + 11.3}" fill="none" stroke="${shadeOf(skin, 0.35)}" stroke-width=".7" stroke-linecap="round"/>
    <path d="M${50 + 3.4 * noseK} ${eyeY + 9.2} Q${50 + 4.1 * noseK} ${eyeY + 10.9} ${50 + 2.3 * noseK} ${eyeY + 11.3}" fill="none" stroke="${shadeOf(skin, 0.35)}" stroke-width=".7" stroke-linecap="round"/>
    <ellipse cx="${50 - 1.5 * noseK}" cy="${eyeY + 11}" rx=".95" ry=".5" fill="${shadeOf(skin, 0.6)}" opacity=".85"/>
    <ellipse cx="${50 + 1.5 * noseK}" cy="${eyeY + 11}" rx=".95" ry=".5" fill="${shadeOf(skin, 0.6)}" opacity=".85"/>
    <ellipse cx="50" cy="${eyeY + 12.4}" rx="3.2" ry=".9" fill="url(#shade-${n})"/>
    <ellipse cx="50.6" cy="${eyeY + 8.4}" rx=".8" ry=".6" fill="#ffffff" opacity=".35"/>`;

  // دهن
  const lipsFull = 0.6 + t.lips * 0.9;
  const curve = 0.5 + t.smile * 0.9;
  const mouth = look.bigSmile
    ? `<path d="M44.2 ${mouthY - 0.6} Q50 ${mouthY + 6.4} 55.8 ${mouthY - 0.6} Q50 ${mouthY + 0.8} 44.2 ${mouthY - 0.6}Z" fill="${lip}"/>
       <path d="M45.2 ${mouthY - 0.2} Q50 ${mouthY + 4.6} 54.8 ${mouthY - 0.2} Q50 ${mouthY + 1.1} 45.2 ${mouthY - 0.2}Z" fill="#fbf7f2"/>
       <path d="M45.2 ${mouthY - 0.2} Q50 ${mouthY + 1.1} 54.8 ${mouthY - 0.2}" fill="none" stroke="${shadeOf(lip, 0.3)}" stroke-width=".5"/>`
    : `<path d="M45.4 ${mouthY} Q47.8 ${mouthY - 1.5} 50 ${mouthY - 0.8} Q52.2 ${mouthY - 1.5} 54.6 ${mouthY} Q50 ${mouthY + 0.6} 45.4 ${mouthY}Z" fill="${lip}"/>
       <path d="M46.2 ${mouthY + 0.3} Q50 ${mouthY + 2.4 + lipsFull} 53.8 ${mouthY + 0.3} Q50 ${mouthY + 0.9} 46.2 ${mouthY + 0.3}Z" fill="${lipLight}"/>
       <path d="M45 ${mouthY - curve * 0.4} Q50 ${mouthY + 0.5 + curve * 0.5} 55 ${mouthY - curve * 0.4}" fill="none" stroke="${shadeOf(lip, 0.45)}" stroke-width=".55" stroke-linecap="round"/>
       <ellipse cx="50.6" cy="${mouthY + 1.4 + lipsFull * 0.4}" rx="1.5" ry=".45" fill="#ffffff" opacity=".22"/>
       <ellipse cx="50" cy="${mouthY + 4 + lipsFull}" rx="3" ry=".9" fill="url(#shade-${n})" opacity=".7"/>`;

  // ریش و سبیل (یا ته‌ریش برای بعضی‌ها)
  const beardPath = `M${50 - cw + 1} 50 C${50 - cw + 1.5} 60 ${50 - chw - 4} ${chinY + 1.5} 50 ${chinY + 2} C${50 + chw + 4} ${chinY + 1.5} ${50 + cw - 1.5} 60 ${50 + cw - 1} 50 C${50 + cw - 3} 56 ${50 + 6} ${mouthY + 3.8} 50 ${mouthY + 3.6} C${50 - 6} ${mouthY + 3.8} ${50 - cw + 3} 56 ${50 - cw + 1} 50Z`;
  const beard = look.beard
    ? `<path d="${beardPath}" fill="${look.hair}" opacity=".7"/>
       <path d="${beardPath}" fill="url(#stip-${n})" opacity=".9"/>
       <path d="M44.4 ${mouthY - 1.1} Q47 ${mouthY - 3.2} 50 ${mouthY - 2.3} Q53 ${mouthY - 3.2} 55.6 ${mouthY - 1.1} Q50 ${mouthY - 1.6} 44.4 ${mouthY - 1.1}Z" fill="${look.hair}" opacity=".9"/>`
    : t.stubble && look.hairStyle !== "long"
    ? `<path d="${beardPath}" fill="url(#stip-${n})" opacity=".14"/>`
    : "";

  const ear = (side) => {
    const s = side === "L" ? -1 : 1;
    const x0 = 50 + s * (tw + 0.2);
    return `<path d="M${x0} ${eyeY - 2} C${x0 + s * 4.2} ${eyeY - 4} ${x0 + s * 4.6} ${eyeY + 3} ${x0 + s * 3.4} ${eyeY + 6} C${x0 + s * 2.6} ${eyeY + 8} ${x0 + s * 1} ${eyeY + 8.4} ${x0 - s * 0.3} ${eyeY + 7.6}Z" fill="${skin}"/>
      <path d="M${x0 + s * 0.6} ${eyeY - 0.6} C${x0 + s * 3} ${eyeY - 1.6} ${x0 + s * 3.2} ${eyeY + 3} ${x0 + s * 2} ${eyeY + 5}" fill="none" stroke="${shadeOf(skin, 0.3)}" stroke-width=".6" opacity=".8"/>`;
  };

  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <defs>
      <clipPath id="shirt-${n}"><path d="${shirtPath}"/></clipPath>
      <clipPath id="face-${n}"><path d="${facePath}"/></clipPath>
      <clipPath id="eyeclipL-${n}"><use href="#eyeL-${n}"/></clipPath>
      <clipPath id="eyeclipR-${n}"><use href="#eyeR-${n}"/></clipPath>
      <linearGradient id="skin-${n}" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="${shadeOf(skin, 0.18)}"/>
        <stop offset=".28" stop-color="${skin}"/>
        <stop offset=".68" stop-color="${skin}"/>
        <stop offset="1" stop-color="${shadeOf(skin, 0.24)}"/>
      </linearGradient>
      <linearGradient id="neck-${n}" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="${shadeOf(skin, 0.3)}"/>
        <stop offset=".45" stop-color="${shadeOf(skin, 0.08)}"/>
        <stop offset="1" stop-color="${shadeOf(skin, 0.32)}"/>
      </linearGradient>
      <radialGradient id="light-${n}" cx=".36" cy=".28" r=".7">
        <stop offset="0" stop-color="#ffffff" stop-opacity=".3"/>
        <stop offset=".6" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="shade-${n}">
        <stop offset="0" stop-color="${shadeOf(skin, 0.45)}" stop-opacity=".55"/>
        <stop offset="1" stop-color="${shadeOf(skin, 0.45)}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="hair-${n}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="${lightOf(look.hair, 0.18)}"/>
        <stop offset=".6" stop-color="${look.hair}"/>
        <stop offset="1" stop-color="${shadeOf(look.hair, 0.25)}"/>
      </linearGradient>
      <linearGradient id="cloth-${n}" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#000000" stop-opacity=".35"/>
        <stop offset=".3" stop-color="#ffffff" stop-opacity=".1"/>
        <stop offset=".55" stop-color="#ffffff" stop-opacity="0"/>
        <stop offset="1" stop-color="#000000" stop-opacity=".38"/>
      </linearGradient>
      <pattern id="stip-${n}" width="1.5" height="1.5" patternUnits="userSpaceOnUse">
        <circle cx=".75" cy=".75" r=".42" fill="${shadeOf(look.hair, 0.15)}"/>
      </pattern>
    </defs>
    ${hair.back || ""}
    <path d="M42.6 58 L42.6 75 Q50 79 57.4 75 L57.4 58Z" fill="url(#neck-${n})"/>
    <ellipse cx="50" cy="${chinY + 1}" rx="8.5" ry="3.6" fill="url(#shade-${n})"/>
    <g clip-path="url(#shirt-${n})">
      <path d="${shirtPath}" fill="${look.shirt}"/>
      ${stripes}
      <path d="M5 100 C7 86 20 79 37 76.4 L38.5 80.5 Q22 84 18 100Z" fill="${look.trim}" opacity=".45"/>
      <path d="M95 100 C93 86 80 79 63 76.4 L61.5 80.5 Q78 84 82 100Z" fill="${look.trim}" opacity=".45"/>
      <path d="M22 84 Q20 92 21 100 M78 84 Q80 92 79 100" fill="none" stroke="#000000" stroke-opacity=".18" stroke-width=".8"/>
      <path d="M34 90 Q40 87 44 92 M58 93 Q62 88 68 90" fill="none" stroke="#000000" stroke-opacity=".12" stroke-width=".7"/>
      <rect x="0" y="70" width="100" height="30" fill="url(#cloth-${n})"/>
    </g>
    <path d="M39.6 76.6 Q44 80.5 50 86 Q56 80.5 60.4 76.6" fill="none" stroke="${look.trim}" stroke-width="2.8" stroke-linejoin="round"/>
    <path d="M42 77.5 Q46 80.5 50 84 Q54 80.5 58 77.5" fill="none" stroke="#000000" stroke-opacity=".25" stroke-width=".6"/>
    <circle cx="64" cy="89" r="2.4" fill="${look.trim}" opacity=".9"/>
    <circle cx="64" cy="89" r="1.2" fill="${look.shirt}" opacity=".7"/>
    <text x="50" y="98" text-anchor="middle" font-size="10" font-weight="800" font-family="Arial, sans-serif" fill="${look.numberColor || look.trim}">${look.number}</text>
    ${ear("L")}
    ${ear("R")}
    <path d="${facePath}" fill="url(#skin-${n})"/>
    <g clip-path="url(#face-${n})">
      <rect x="30" y="20" width="40" height="52" fill="url(#light-${n})"/>
      <ellipse cx="${50 - cw + 4}" cy="${eyeY + 9}" rx="3.2" ry="5" fill="url(#shade-${n})" opacity=".55"/>
      <ellipse cx="${50 + cw - 4}" cy="${eyeY + 9}" rx="3.2" ry="5" fill="url(#shade-${n})" opacity=".7"/>
      <ellipse cx="40" cy="${eyeY + 6.5}" rx="3.4" ry="1.9" fill="#e0695a" opacity=".1"/>
      <ellipse cx="60" cy="${eyeY + 6.5}" rx="3.4" ry="1.9" fill="#e0695a" opacity=".1"/>
      <ellipse cx="50" cy="${chinY - 2}" rx="3.2" ry="1.6" fill="#ffffff" opacity=".12"/>
    </g>
    ${beard}
    ${hair.front || ""}
    ${hair.shine || ""}
    ${brows}
    ${eye(42.8, "L")}
    ${eye(57.2, "R")}
    ${nose}
    ${mouth}
    ${look.headband ? `<path d="M32.5 34 Q50 25 67.5 34 L67.5 38.6 Q50 29.8 32.5 38.6Z" fill="${look.headband}"/><path d="M32.5 36.2 Q50 27.5 67.5 36.2" fill="none" stroke="#000000" stroke-opacity=".12" stroke-width=".6"/>` : ""}
  </svg>`;
}
