/* ============================================================
   Undangan Walimatul Khitan — interaksi & animasi
   Plain JS, no framework. transform & opacity saja.
   ============================================================ */
(function () {
  "use strict";

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const SESSION = body.dataset.session === "2" ? 2 : 1;

  /* ---------- 1. Bind data dari CONFIG ---------- */
  const jam = SESSION === 1 ? CONFIG.sesi1_jam : CONFIG.sesi2_jam;
  const target = new Date(SESSION === 1 ? CONFIG.sesi1_target : CONFIG.sesi2_target);

  const map = {
    anak: CONFIG.anak,
    "tanggal-lengkap": CONFIG.tanggalLengkap,
    alamat: CONFIG.alamat,
    kota: CONFIG.kota,
    "ayat-arab": CONFIG.ayat_arab,
    "ayat-terjemah": CONFIG.ayat_terjemah,
    "ayat-sumber": CONFIG.ayat_sumber,
    "ajakan-sunda": CONFIG.ajakan_sunda,
    "ajakan-indo": CONFIG.ajakan_indo,
    penutup: CONFIG.penutup,
    "penutup-kel": CONFIG.penutup_kel,
    jam: jam
  };
  document.querySelectorAll("[data-bind]").forEach((el) => {
    const v = map[el.dataset.bind];
    if (v != null) el.textContent = v;
  });

  // Maps
  const mapFrame = document.getElementById("map-iframe");
  if (mapFrame) mapFrame.src = CONFIG.maps_embed;
  const mapBtn = document.getElementById("btn-maps");
  if (mapBtn) mapBtn.href = CONFIG.maps_link;

  // WhatsApp
  const waMsg =
    "Assalamu'alaikum, insya Allah saya akan hadir pada acara Walimatul Khitan " +
    CONFIG.anak + " pukul " + jam + ". Terima kasih.";
  const waBtn = document.getElementById("btn-wa");
  if (waBtn) waBtn.href = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(waMsg);

  /* ---------- Partikel ambient ---------- */
  function spawnParticles(container, count) {
    if (REDUCED || !container) return;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "particle";
      const size = 2 + Math.random() * 4;
      p.style.width = p.style.height = size + "px";
      p.style.left = Math.random() * 100 + "%";
      const dur = 9 + Math.random() * 9;
      const delay = Math.random() * dur;
      const drift = (Math.random() * 40 - 20).toFixed(0);
      const peak = (0.15 + Math.random() * 0.15).toFixed(2);
      p.style.setProperty("--drift", drift + "px");
      p.style.setProperty("--peak", peak);
      p.animate(
        [
          { transform: "translate(0, 0)", opacity: 0 },
          { opacity: peak, offset: 0.15 },
          { opacity: peak, offset: 0.85 },
          { transform: "translate(" + drift + "px, -110vh)", opacity: 0 }
        ],
        { duration: dur * 1000, delay: -delay * 1000, iterations: Infinity, easing: "linear" }
      );
      container.appendChild(p);
    }
  }
  spawnParticles(document.querySelector(".ambient"), 11);

  /* ---------- 2. Splash sequence ---------- */
  const splash = document.querySelector(".splash");
  const splashParticles = document.querySelector(".splash-particles");
  const heroImg = document.getElementById("hero-img");
  const nameEl = document.querySelector(".name");
  const nameOrn = document.querySelector(".name-orn");

  /* ---------- Musik latar ---------- */
  const music = document.getElementById("bg-music");
  const musicBtn = document.getElementById("music-toggle");
  let musicArmed = false;

  function reflectMusic() {
    if (!musicBtn) return;
    const playing = music && !music.paused;
    musicBtn.classList.toggle("playing", !!playing);
    musicBtn.setAttribute("aria-pressed", playing ? "true" : "false");
  }
  function tryPlayMusic() {
    if (!music) return;
    const p = music.play();
    if (p && p.then) p.then(reflectMusic).catch(reflectMusic);
    else reflectMusic();
  }
  function setupMusic() {
    if (!music || !musicBtn || musicArmed) return;
    musicArmed = true;
    musicBtn.classList.add("show");

    musicBtn.addEventListener("click", () => {
      if (music.paused) tryPlayMusic();
      else { music.pause(); reflectMusic(); }
    });
    music.addEventListener("play", reflectMusic);
    music.addEventListener("pause", reflectMusic);

    // Coba autoplay; jika diblokir browser, mulai saat interaksi pertama tamu
    tryPlayMusic();
    const onFirstGesture = (e) => {
      if (musicBtn.contains(e.target)) return; // tombol urus sendiri
      tryPlayMusic();
      if (!music.paused) removeGesture();
    };
    function removeGesture() {
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    }
    window.addEventListener("pointerdown", onFirstGesture);
    window.addEventListener("touchstart", onFirstGesture);
    window.addEventListener("keydown", onFirstGesture);
  }

  function revealHero() {
    if (heroImg) heroImg.classList.add("focused");
    if (nameEl) {
      const words = nameEl.querySelectorAll(".word");
      words.forEach((w, i) => {
        w.style.transitionDelay = i * 0.15 + "s";
        requestAnimationFrame(() => nameEl.classList.add("reveal"));
      });
    }
    if (nameOrn) nameOrn.classList.add("reveal");
    const badge = document.querySelector(".session-badge");
    if (badge) setTimeout(() => badge.classList.add("show"), 400);
  }

  // Coba mulai musik sedini mungkin (saat splash), fallback ke sentuhan pertama
  setupMusic();

  function startMain() {
    body.classList.remove("locked");
    revealHero();
    initObservers();
  }

  if (REDUCED || !splash) {
    body.classList.remove("locked");
    revealHero();
    initObservers();
  } else {
    body.classList.add("locked");
    spawnParticles(splashParticles, 14);
    const bism = splash.querySelector(".bismillah");
    const sub = splash.querySelector(".splash-sub");
    const hint = splash.querySelector(".splash-hint");
    // muncul bismillah
    setTimeout(() => { bism && bism.classList.add("show"); }, 350);
    setTimeout(() => { sub && sub.classList.add("show"); }, 600);
    setTimeout(() => { hint && hint.classList.add("show"); }, 1000);
    // Sentuh splash = buka — tapi baru aktif setelah splash sempat tampil
    // (mencegah klik pembuka halaman langsung menutup splash)
    setTimeout(() => {
      splash.addEventListener("pointerdown", () => { splash.classList.add("lift"); }, { once: true });
    }, 1500);
    // jika tidak disentuh, buka otomatis
    setTimeout(() => {
      splash.classList.add("lift");
    }, 3200);
    splash.addEventListener("transitionend", function onLift(e) {
      if (e.propertyName !== "transform") return;
      splash.removeEventListener("transitionend", onLift);
      splash.style.display = "none";
      startMain();
    });
    // fallback bila transitionend tak terpicu
    setTimeout(() => {
      if (splash.style.display !== "none") { splash.style.display = "none"; startMain(); }
    }, 3900);
  }

  /* ---------- 3. IntersectionObserver scroll reveals ---------- */
  function initObservers() {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target;
          // stagger anak ber-class .stagger
          const items = el.querySelectorAll(".stagger");
          items.forEach((it, i) => { it.style.transitionDelay = i * 0.1 + "s"; });
          el.classList.add("in");

          if (el.dataset.role === "ayat") animateAyat(el);
          if (el.dataset.role === "countdown") startCountdownAnim();
          obs.unobserve(el);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".reveal, .reveal-left, .reveal-scale, [data-role]").forEach((el) => io.observe(el));
  }

  function animateAyat(box) {
    const a = box.querySelector(".ayat-arab");
    const t = box.querySelector(".ayat-trans");
    const s = box.querySelector(".ayat-src");
    a && a.classList.add("in");
    t && t.classList.add("in");
    s && s.classList.add("in");
  }

  /* ---------- 4 & 5. Countdown ---------- */
  const cdGrid = document.querySelector(".cd-grid");
  const fields = ["days", "hours", "mins", "secs"];
  const nums = {};
  fields.forEach((f) => { nums[f] = document.querySelector('[data-cd="' + f + '"]'); });
  let cdStarted = false;
  let prev = { days: null, hours: null, mins: null, secs: null };

  function calc() {
    let diff = Math.max(0, target.getTime() - Date.now());
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000); diff -= h * 3600000;
    const m = Math.floor(diff / 60000); diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    return { days: d, hours: h, mins: m, secs: s };
  }
  const pad = (n) => String(n).padStart(2, "0");

  function paint(vals, flip) {
    fields.forEach((f) => {
      const el = nums[f];
      if (!el) return;
      const str = f === "days" ? String(vals[f]) : pad(vals[f]);
      if (el.textContent === str) return;
      el.textContent = str;
      if (flip && !REDUCED && prev[f] !== null) {
        el.classList.remove("flip");
        void el.offsetWidth;
        el.classList.add("flip");
      }
      prev[f] = vals[f];
    });
  }

  function startCountdownAnim() {
    if (cdStarted) return;
    cdStarted = true;
    const final = calc();

    if (REDUCED) {
      paint(final, false);
      cdGrid && cdGrid.classList.add("labels-in");
      tick();
      return;
    }

    // count-up dari 0 ke nilai asli
    const dur = 1100;
    const t0 = performance.now();
    const easeOut = (x) => 1 - Math.pow(1 - x, 3);
    function up(now) {
      const p = Math.min(1, (now - t0) / dur);
      const e = easeOut(p);
      paint(
        {
          days: Math.round(final.days * e),
          hours: Math.round(final.hours * e),
          mins: Math.round(final.mins * e),
          secs: Math.round(final.secs * e)
        },
        false
      );
      if (p < 1) requestAnimationFrame(up);
      else {
        cdGrid && cdGrid.classList.add("labels-in");
        prev = { days: null, hours: null, mins: null, secs: null };
        paint(final, false);
        tick();
      }
    }
    requestAnimationFrame(up);
  }

  function tick() {
    paint(calc(), true);
    setTimeout(tick, 1000);
  }

  /* ---------- 6. Ripple micro-interaction ---------- */
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("pointerdown", (e) => {
      if (REDUCED) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const r = document.createElement("span");
      r.className = "ripple";
      r.style.width = r.style.height = size + "px";
      r.style.left = e.clientX - rect.left - size / 2 + "px";
      r.style.top = e.clientY - rect.top - size / 2 + "px";
      btn.appendChild(r);
      setTimeout(() => r.remove(), 620);
    });
  });
})();
