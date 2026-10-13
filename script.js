/* ═══════════════════════════════════════════════════════════
   ⚙️ ԿԱՐԳԱՎՈՐՈՒՄՆԵՐ — ՓՈՓՈԽԻ՛Ր ՄԻԱՅՆ ԱՅՍ ՀԱՏՎԱԾԸ
   ═══════════════════════════════════════════════════════════ */
const CONFIG = {
  girlName: "Նատալի",
  boyName: "Լեվոն",

  musicFile: "music/music.mp3",

  photos: [
    { src: "images/photo1.jpg", caption: "Այս պահը…" },
    { src: "images/photo2.jpg", caption: "Մի անգամ…" },
    { src: "images/photo3.jpg", caption: "Երբ դեռ…" },
  ],

  hearts: [
    {
      title: "Ժպիտիդ մասին",
      text: "Կան ժպիտներ, որ լուսավորում են ամբողջ սենյակը։ Քոնը հենց այդպիսին է։ Խնայիր այն, մի վատնիր մանր բաների վրա։",
    },
    {
      title: "Քո ուժի մասին",
      text: "Գուցե դու դա չես նկատում, բայց դու շատ ավելի ուժեղ ես, քան կարծում ես։ Եվ շատ ավելի քաջ, քան երբևէ կաս։",
    },
    {
      title: "Հենց քեզ մասին",
      text: "Ուզում էի, որ մի օր հայելու առաջ կանգնես ու տեսնես նույնը, ինչ տեսնում են նրանք, ովքեր քեզ գնահատում են։ Դու գեղեցիկ ես՝ իսկական ու անփոխարինելի։",
    },
  ],
};
/* ═══════════════════════════════════════════════════════════ */

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const rand = (a, b) => Math.random() * (b - a) + a;

/* Device detection */
const IS_TOUCH = window.matchMedia("(hover: none), (pointer: coarse)").matches;
const IS_SMALL = window.innerWidth < 500;
const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
               (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

/* Haptic feedback (Android only — iOS ignores) */
function haptic(ms = 12) {
  if (IS_TOUCH && navigator.vibrate) {
    try { navigator.vibrate(ms); } catch (e) {}
  }
}

/* APPLY NAMES */
function applyNames() {
  $$("[data-girl-name]").forEach(el => el.textContent = CONFIG.girlName);
  $$("[data-boy-name]").forEach(el  => el.textContent = CONFIG.boyName);
}

/* PARTICLES — fewer on mobile for performance */
function createParticles() {
  const wrap = $("#particles");
  const kinds = [
    { cls: "heart", ch: "♥", size: [12, 22] },
    { cls: "star",  ch: "✦", size: [8, 16] },
    { cls: "star",  ch: "✧", size: [6, 12] },
    { cls: "dot",   ch: "•", size: [5, 10] },
  ];
  let count = 32;
  if (IS_SMALL) count = 14;
  else if (IS_TOUCH) count = 20;

  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    const k = kinds[Math.floor(Math.random() * kinds.length)];
    p.className = "particle " + k.cls;
    p.textContent = k.ch;

    const size = rand(k.size[0], k.size[1]);
    p.style.fontSize = size + "px";
    p.style.left = rand(0, 100) + "%";
    p.style.setProperty("--drift", rand(-70, 70) + "px");

    const dur = rand(14, 30);
    p.style.animationDuration = dur + "s";
    p.style.animationDelay = -rand(0, dur) + "s";

    wrap.appendChild(p);
  }
}

/* CURSOR GLOW (desktop only) */
function initCursorGlow() {
  const glow = $("#cursorGlow");
  if (!glow || IS_TOUCH) return;

  let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
  let cx = tx, cy = ty;

  document.addEventListener("mousemove", e => {
    tx = e.clientX;
    ty = e.clientY;
  }, { passive: true });

  (function loop() {
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();
}

/* SCREENS */
const screens = $$(".screen");
const dotsWrap = $("#progressDots");
const topFill = $("#topProgressFill");
let currentScreen = 0;
let isTransitioning = false;

function buildDots() {
  dotsWrap.innerHTML = "";
  screens.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "dot-item";
    b.setAttribute("aria-label", `Էջ ${i + 1}`);
    b.addEventListener("click", () => goToScreen(i));
    dotsWrap.appendChild(b);
  });
}

function updateDots() {
  $$(".dot-item", dotsWrap).forEach((d, i) => d.classList.toggle("active", i === currentScreen));
  const pct = (currentScreen / (screens.length - 1)) * 100;
  topFill.style.width = pct + "%";
}

function goToScreen(index) {
  if (index < 0 || index >= screens.length || index === currentScreen) return;
  if (isTransitioning) return;
  isTransitioning = true;

  screens[currentScreen].classList.remove("active");
  currentScreen = index;
  const next = screens[currentScreen];

  requestAnimationFrame(() => {
    next.classList.add("active");
    // Scroll to top — use instant on mobile for reliability
    try {
      window.scrollTo({ top: 0, behavior: IS_TOUCH ? "auto" : "smooth" });
    } catch (e) {
      window.scrollTo(0, 0);
    }
    updateDots();
    onScreenEnter(currentScreen);
    setTimeout(() => { isTransitioning = false; }, 400);
  });
}

$$("[data-next]").forEach(btn => {
  btn.addEventListener("click", () => {
    haptic(10);
    const n = parseInt(btn.getAttribute("data-next"), 10);
    goToScreen(n);
  });
});

/* RIPPLE — skip on touch for perf, keep visual subtle */
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-ripple]");
  if (!btn) return;
  const r = btn.getBoundingClientRect();
  const size = Math.max(r.width, r.height);
  const el = document.createElement("span");
  el.className = "ripple";
  el.style.width = el.style.height = size + "px";
  el.style.left = (e.clientX - r.left) + "px";
  el.style.top  = (e.clientY - r.top)  + "px";
  btn.appendChild(el);
  setTimeout(() => el.remove(), 750);
});

/* TILT — desktop only */
function initTilt() {
  if (IS_TOUCH) return;
  $$(".tilt-card").forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const rx = ((y / r.height) - 0.5) * -6;
      const ry = ((x / r.width)  - 0.5) * 6;
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      card.style.setProperty("--mx", x + "px");
      card.style.setProperty("--my", y + "px");
    });
    card.addEventListener("mouseleave", () => card.style.transform = "");
  });
}

/* HEARTS */
const heartsRow = $("#heartsRow");
const heartMessage = $("#heartMessage");
const hmTitle = $("#hmTitle");
const hmText = $("#hmText");

function buildHearts() {
  heartsRow.innerHTML = "";
  CONFIG.hearts.forEach((h) => {
    const btn = document.createElement("button");
    btn.className = "heart-btn";
    btn.setAttribute("aria-label", h.title);
    btn.addEventListener("click", e => {
      haptic(15);
      $$(".heart-btn", heartsRow).forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      hmTitle.textContent = h.title;
      hmText.textContent = h.text;
      heartMessage.classList.remove("show");
      void heartMessage.offsetWidth;
      heartMessage.classList.add("show");

      burstAt(e.clientX, e.clientY, ["♥", "✦", "✧"], IS_SMALL ? 10 : 14);
    });
    heartsRow.appendChild(btn);
  });
}

/* GALLERY */
const galleryTrack = $("#galleryTrack");
const galleryDots = $("#galleryDots");

function buildGallery() {
  galleryTrack.innerHTML = "";
  galleryDots.innerHTML = "";

  CONFIG.photos.forEach((photo, i) => {
    const item = document.createElement("div");
    item.className = "gallery-item";

    const polaroid = document.createElement("div");
    polaroid.className = "polaroid";

    const imgWrap = document.createElement("div");
    imgWrap.className = "polaroid-img";

    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = photo.caption || `Հիշողություն ${i + 1}`;
    img.loading = "lazy";
    img.onerror = () => {
      img.remove();
      polaroid.classList.add("no-photo");
    };
    imgWrap.appendChild(img);

    const caption = document.createElement("div");
    caption.className = "polaroid-caption";
    caption.textContent = photo.caption || "";

    const tapeTL = document.createElement("span");
    tapeTL.className = "tape tape-tl";
    const tapeTR = document.createElement("span");
    tapeTR.className = "tape tape-tr";

    polaroid.appendChild(imgWrap);
    polaroid.appendChild(caption);
    polaroid.appendChild(tapeTL);
    polaroid.appendChild(tapeTR);

    item.appendChild(polaroid);
    galleryTrack.appendChild(item);

    const dot = document.createElement("span");
    dot.className = "gdot" + (i === 0 ? " active" : "");
    galleryDots.appendChild(dot);
  });

  // Passive listener for smooth mobile scrolling
  galleryTrack.addEventListener("scroll", updateGalleryDots, { passive: true });
}

function updateGalleryDots() {
  const items = Array.from(galleryTrack.children);
  if (!items.length) return;
  const trackCenter = galleryTrack.scrollLeft + galleryTrack.clientWidth / 2;

  let closest = 0, minDist = Infinity;
  items.forEach((el, i) => {
    const c = el.offsetLeft + el.offsetWidth / 2;
    const d = Math.abs(c - trackCenter);
    if (d < minDist) { minDist = d; closest = i; }
  });

  $$(".gdot", galleryDots).forEach((d, i) => d.classList.toggle("active", i === closest));
}

/* ENVELOPE + LETTER */
const envelope = $("#envelope");
const envelopeScene = $("#envelopeScene");
const letterPaper = $("#letterPaper");
const letterNextBtn = $("#letterNextBtn");
const envHint = $("#envHint");

let letterOpened = false;

function openLetter() {
  if (letterOpened) return;
  letterOpened = true;

  haptic(20);
  envelope.classList.add("opening");

  setTimeout(() => {
    envelopeScene.classList.add("opened");
    letterPaper.setAttribute("aria-hidden", "false");
    letterPaper.classList.add("open");

    setTimeout(() => {
      letterNextBtn.style.display = "inline-flex";

      // Smooth scroll — fallback for older iOS
      setTimeout(() => {
        try {
          letterPaper.scrollIntoView({ behavior: IS_TOUCH ? "auto" : "smooth", block: "start" });
        } catch (e) {
          letterPaper.scrollIntoView(true);
        }
      }, 200);
    }, 900);
  }, 750);
}

envelope.addEventListener("click", openLetter);
envHint.addEventListener("click", openLetter);
// Keyboard support
envelope.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLetter(); }
});

/* CONFETTI */
const confettiCanvas = $("#confettiCanvas");
const cctx = confettiCanvas.getContext("2d");
let confettiPieces = [];
let confettiRAF = null;

function resizeConfetti() {
  const dpr = Math.min(window.devicePixelRatio || 1, IS_TOUCH ? 2 : 3);
  confettiCanvas.width  = window.innerWidth  * dpr;
  confettiCanvas.height = window.innerHeight * dpr;
  confettiCanvas.style.width  = window.innerWidth + "px";
  confettiCanvas.style.height = window.innerHeight + "px";
  cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resizeConfetti);
window.addEventListener("orientationchange", () => setTimeout(resizeConfetti, 100));
resizeConfetti();

const CONFETTI_COLORS = ["#ff8fab", "#ff4d84", "#d4af37", "#f4d47c", "#ffb3c6", "#fff5f8"];

function spawnConfetti(count = 120) {
  const c = IS_SMALL ? Math.round(count * 0.7) : count;
  for (let i = 0; i < c; i++) {
    confettiPieces.push({
      x: window.innerWidth / 2 + rand(-120, 120),
      y: window.innerHeight * 0.35 + rand(-40, 40),
      vx: rand(-6, 6),
      vy: rand(-14, -6),
      size: rand(4, 9),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.25, 0.25),
      life: 0,
      maxLife: rand(180, 260),
      shape: Math.random() < 0.35 ? "heart" : "rect",
    });
  }
  if (!confettiRAF) confettiLoop();
}

function drawHeart(ctx, x, y, size) {
  ctx.beginPath();
  const s = size;
  ctx.moveTo(x, y + s * 0.35);
  ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s * 0.4);
  ctx.bezierCurveTo(x - s, y + s * 0.85, x, y + s * 1.1, x, y + s * 1.4);
  ctx.bezierCurveTo(x, y + s * 1.1, x + s, y + s * 0.85, x + s, y + s * 0.4);
  ctx.bezierCurveTo(x + s, y, x, y, x, y + s * 0.35);
  ctx.closePath();
  ctx.fill();
}

function confettiLoop() {
  cctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (let i = confettiPieces.length - 1; i >= 0; i--) {
    const p = confettiPieces[i];
    p.vy += 0.35;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life++;

    const alpha = Math.max(0, 1 - p.life / p.maxLife);
    cctx.save();
    cctx.globalAlpha = alpha;
    cctx.fillStyle = p.color;
    cctx.translate(p.x, p.y);
    cctx.rotate(p.rot);

    if (p.shape === "heart") drawHeart(cctx, 0, 0, p.size * 0.8);
    else cctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);

    cctx.restore();

    if (p.life >= p.maxLife || p.y > window.innerHeight + 80) {
      confettiPieces.splice(i, 1);
    }
  }

  if (confettiPieces.length > 0) {
    confettiRAF = requestAnimationFrame(confettiLoop);
  } else {
    confettiRAF = null;
    cctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

/* BURST */
const burstLayer = document.createElement("div");
burstLayer.style.cssText = "position: fixed; inset: 0; pointer-events: none; z-index: 200; overflow: hidden;";
document.body.appendChild(burstLayer);

function burstAt(x, y, chars, count = 16) {
  const n = IS_SMALL ? Math.round(count * 0.7) : count;
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.textContent = chars[Math.floor(Math.random() * chars.length)];
    const hue = Math.random() < 0.5 ? "#ff8fab" : "#f4d47c";
    s.style.cssText = `
      position: absolute;
      left: ${x}px; top: ${y}px;
      color: ${hue};
      font-size: ${rand(12, 22)}px;
      text-shadow: 0 0 12px ${hue};
      transform: translate(-50%, -50%);
      pointer-events: none;
      will-change: transform, opacity;
    `;
    burstLayer.appendChild(s);

    const angle = (Math.PI * 2 * i) / n + rand(-0.4, 0.4);
    const dist  = rand(60, 160);
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    s.animate(
      [
        { transform: "translate(-50%, -50%) scale(0.5)", opacity: 1 },
        { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1.3) rotate(${rand(-180,180)}deg)`, opacity: 0 },
      ],
      { duration: rand(700, 1100), easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
    ).onfinish = () => s.remove();
  }
}

/* MUSIC */
const musicBtn = $("#musicBtn");
const bgMusic = new Audio();
bgMusic.src = CONFIG.musicFile;
bgMusic.loop = true;
bgMusic.preload = "auto";
bgMusic.volume = 0.5;
bgMusic.setAttribute("playsinline", ""); // iOS

let musicPlaying = false;

musicBtn.addEventListener("click", () => {
  haptic(10);
  if (!musicPlaying) {
    bgMusic.play().then(() => {
      musicPlaying = true;
      musicBtn.classList.add("playing");
    }).catch(() => {
      musicBtn.animate(
        [{ transform: "scale(1) rotate(0deg)" }, { transform: "scale(1.15) rotate(-8deg)" }, { transform: "scale(1)" }],
        { duration: 500, easing: "ease-out" }
      );
    });
  } else {
    bgMusic.pause();
    musicPlaying = false;
    musicBtn.classList.remove("playing");
  }
});

/* SCREEN HOOKS */
function onScreenEnter(index) {
  if (index === 1) {
    $$(".reveal-text").forEach(el => {
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
    });
  }
  if (index === 3) updateGalleryDots();
  if (index === 5) {
    setTimeout(() => spawnConfetti(160), 500);
    setTimeout(() => spawnConfetti(80), 1400);
  }
}

/* RESTART */
$("#restartBtn").addEventListener("click", () => {
  haptic(15);
  const env = $("#envelope");
  env.classList.remove("opening");
  envelopeScene.classList.remove("opened");
  letterPaper.classList.remove("open");
  letterPaper.setAttribute("aria-hidden", "true");
  letterNextBtn.style.display = "none";
  letterOpened = false;

  $$(".heart-btn").forEach(b => b.classList.remove("active"));
  heartMessage.classList.remove("show");

  confettiPieces = [];

  goToScreen(0);
});

/* INIT */
function init() {
  applyNames();
  buildDots();
  buildHearts();
  buildGallery();
  createParticles();
  initCursorGlow();
  initTilt();

  screens[0].classList.add("active");
  updateDots();

  const gift = $("#giftBox");
  gift.classList.add("shaking");
  gift.addEventListener("click", () => {
    haptic(15);
    goToScreen(1);
  });
  $('[data-next="1"]').addEventListener("click", () => gift.classList.remove("shaking"));

  setTimeout(() => $("#loader").classList.add("hidden"), 1600);

  /* Burst on tap — reduced for mobile */
  document.addEventListener("click", e => {
    if (e.target.closest(".heart-btn")) return;
    if (e.target.closest("#giftBox")) return;
    if (e.target.closest(".btn")) return; // skip buttons
    burstAt(e.clientX, e.clientY, ["♥", "✦"], IS_SMALL ? 4 : 6);
  });

  /* Keyboard nav (desktop) */
  document.addEventListener("keydown", e => {
    if (e.key === "ArrowRight" || e.key === " ") goToScreen(currentScreen + 1);
    if (e.key === "ArrowLeft") goToScreen(currentScreen - 1);
  });

  /* Handle iOS 100vh issue on orientation change */
  if (IS_IOS) {
    const setVH = () => {
      document.documentElement.style.setProperty("--vh", window.innerHeight * 0.01 + "px");
    };
    setVH();
    window.addEventListener("orientationchange", () => setTimeout(setVH, 200));
    window.addEventListener("resize", setVH);
  }

  /* Prevent double-tap zoom on iOS Safari */
  let lastTouch = 0;
  document.addEventListener("touchend", e => {
    const now = Date.now();
    if (now - lastTouch <= 300) e.preventDefault();
    lastTouch = now;
  }, { passive: false });
}

document.addEventListener("DOMContentLoaded", init);