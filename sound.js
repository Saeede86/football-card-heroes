// ====== صداهای بازی ======
// همه صداها با کد ساخته می‌شن (فایل صوتی نداریم):
// سوت داور، ضربه به توپ، تشویق تماشاگرها و «اوووه» وقتی گل نمی‌شه.

const Sound = (() => {
  let ctx = null;
  let muted = false;
  try {
    muted = localStorage.getItem("football-card-heroes-muted") === "1";
  } catch (e) {}

  // مرورگر فقط بعد از اولین لمس یا کلیک اجازه پخش صدا می‌ده
  function audio() {
    if (muted) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function noise(c, seconds) {
    const buffer = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buffer;
    return src;
  }

  // سوت داور: دو تا سوت کوتاه و بلند
  function whistle() {
    const c = audio();
    if (!c) return;
    const t = c.currentTime;
    [[0, 0.18], [0.3, 0.45]].forEach(([start, length]) => {
      const osc = c.createOscillator();
      const trill = c.createOscillator();
      const trillGain = c.createGain();
      const gain = c.createGain();
      osc.frequency.value = 2900;
      trill.frequency.value = 30;
      trillGain.gain.value = 140;
      trill.connect(trillGain).connect(osc.frequency);
      gain.gain.setValueAtTime(0, t + start);
      gain.gain.linearRampToValueAtTime(0.1, t + start + 0.02);
      gain.gain.setValueAtTime(0.1, t + start + length);
      gain.gain.linearRampToValueAtTime(0, t + start + length + 0.05);
      osc.connect(gain).connect(c.destination);
      osc.start(t + start);
      trill.start(t + start);
      osc.stop(t + start + length + 0.1);
      trill.stop(t + start + length + 0.1);
    });
  }

  // ضربه به توپ: یه «تاپ» کوتاه
  function kick() {
    const c = audio();
    if (!c) return;
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.frequency.setValueAtTime(170, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.13);
    gain.gain.setValueAtTime(0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.2);

    const click = noise(c, 0.05);
    const filter = c.createBiquadFilter();
    const clickGain = c.createGain();
    filter.type = "highpass";
    filter.frequency.value = 1200;
    clickGain.gain.setValueAtTime(0.18, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    click.connect(filter).connect(clickGain).connect(c.destination);
    click.start(t);
  }

  // صدای تماشاگرها: تشویق بلند یا «اوووه» کوتاه
  function crowd(happy) {
    const c = audio();
    if (!c) return;
    const t = c.currentTime;
    const length = happy ? 2.6 : 1.2;
    const src = noise(c, length);
    const filter = c.createBiquadFilter();
    const gain = c.createGain();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(happy ? 800 : 500, t);
    filter.frequency.linearRampToValueAtTime(happy ? 1100 : 300, t + length);
    filter.Q.value = 0.8;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(happy ? 0.45 : 0.25, t + (happy ? 0.25 : 0.15));
    gain.gain.linearRampToValueAtTime(0, t + length);
    src.connect(filter).connect(gain).connect(c.destination);
    src.start(t);
  }

  function toggle() {
    muted = !muted;
    try {
      localStorage.setItem("football-card-heroes-muted", muted ? "1" : "0");
    } catch (e) {}
    return muted;
  }

  return {
    whistle,
    kick,
    cheer: () => crowd(true),
    groan: () => crowd(false),
    toggle,
    isMuted: () => muted,
  };
})();
