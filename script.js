/* =========================================================================
   PayEssence 收款。改 Telegram 连结即可，付款网址不要改。
   ========================================================================= */
const PAY_CONFIG = {
  checkout: "https://apexulti-pay.staralgo8888.workers.dev/checkout",
  telegramLink: "https://t.me/your_telegram_username"
};

const USERNAME_FIELD = {
  smc: "smcUsername",
  apex: "apexUsername",
  apexV2: "apexUsername",
  combo: "comboUsername"
};

document.addEventListener("DOMContentLoaded", () => {

  const toast = document.getElementById("toast");
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function startCheckout(event, key) {
    event.preventDefault();
    const input = document.getElementById(USERNAME_FIELD[key] || "");
    const name = input ? input.value.trim() : "";
    if (!/^[A-Za-z0-9_.-]{2,40}$/.test(name)) {
      alert("Please enter your TradingView username (letters and numbers only).");
      if (input) input.focus();
      return;
    }
    const product = key === "apexV2" ? "apex" : key;
    window.location.href = PAY_CONFIG.checkout
      + "?product=" + encodeURIComponent(product)
      + "&name=" + encodeURIComponent(name);
  }

  document.querySelectorAll(".buy-btn, .cart-btn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      startCheckout(event, btn.getAttribute("data-variant-key"));
    });
  });

  const cartLink = document.getElementById("cartLink");
  if (cartLink) {
    cartLink.href = "#flagship";
    cartLink.target = "_self";
  }

  document.querySelectorAll("#telegramLink, #telegramLink2").forEach((el) => {
    el.href = PAY_CONFIG.telegramLink;
    el.target = "_blank";
    el.rel = "noopener";
  });

  /* ---------- Live TradingView chart (iframe, no tv.js) ---------- */
  const tvFrame = document.getElementById("tvFrame");
  function tvEmbedSrc(symbol) {
    const spec = {
      autosize: true,
      symbol: symbol,
      interval: "5",
      timezone: "Asia/Kuala_Lumpur",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "#0c0a08",
      gridColor: "rgba(255, 200, 87, 0.08)",
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      withdateranges: true,
      support_host: "https://www.tradingview.com"
    };
    return "https://www.tradingview-widget.com/embed-widget/advanced-chart/?locale=en#" + encodeURIComponent(JSON.stringify(spec));
  }
  document.querySelectorAll(".tv-sym").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tv-sym").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      if (tvFrame) tvFrame.src = tvEmbedSrc(btn.getAttribute("data-tv-symbol"));
    });
  });

  /* ---------- Logo / review 跑马灯：复制一份内容，做到无缝循环 ---------- */
  const logoTrack = document.getElementById("logoTrack");
  if (logoTrack) {
    logoTrack.innerHTML += logoTrack.innerHTML;
  }
  const reviewTrack = document.getElementById("reviewTrack");
  if (reviewTrack) {
    reviewTrack.innerHTML += reviewTrack.innerHTML;
  }

  /* ---------- 移动端导航开关 ---------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  navToggle?.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks?.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => navLinks.classList.remove("open"))
  );

  /* ---------- FAQ 手风琴 ---------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach((i) => {
        i.classList.remove("open");
        i.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---------- 滚动淡入动画 ---------- */
  const reveals = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  reveals.forEach((el) => observer.observe(el));

  /* ---------- 倒数计时（营销用，示范用 6 小时循环）---------- */
  function startCountdown(endTime) {
    function tick() {
      const now = new Date().getTime();
      let diff = endTime - now;
      if (diff < 0) diff = 0;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      const pad = (n) => String(n).padStart(2, "0");

      const topEl = document.getElementById("topCountdown");
      if (topEl) topEl.textContent = `${pad(hours + days * 24)}:${pad(mins)}:${pad(secs)}`;

      ["td", "fd"].forEach((id) => { const el = document.getElementById(id); if (el) el.textContent = pad(days); });
      ["th", "fh"].forEach((id) => { const el = document.getElementById(id); if (el) el.textContent = pad(hours); });
      ["tm", "fm"].forEach((id) => { const el = document.getElementById(id); if (el) el.textContent = pad(mins); });
      ["ts", "fs"].forEach((id) => { const el = document.getElementById(id); if (el) el.textContent = pad(secs); });
    }
    tick();
    return setInterval(tick, 1000);
  }

  // 示范用：倒数 6 小时后重置。正式上线建议改成固定的真实结束日期，
  // 例如：new Date("2026-08-20T23:59:59").getTime()
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  let endTime = Number(localStorage.getItem("apexedge_offer_end"));
  if (!endTime || endTime < Date.now()) {
    endTime = Date.now() + SIX_HOURS;
    localStorage.setItem("apexedge_offer_end", endTime);
  }
  startCountdown(endTime);

  const bundleCard = document.querySelector(".bundle-card");
  if (bundleCard) {
    const grid = bundleCard.querySelector(".bundle-grid");
    const shots = bundleCard.querySelector(".combo-shots, .bundle-posters, .bundle-collage");
    if (grid && shots && grid.contains(shots)) {
      bundleCard.insertBefore(shots, grid);
    }
    bundleCard.querySelectorAll(".combo-shots img, .bundle-posters img, .bundle-collage img").forEach((img) => {
      img.style.setProperty("height", "auto", "important");
      img.style.setProperty("width", "100%", "important");
      img.style.setProperty("object-fit", "contain", "important");
      img.style.setProperty("aspect-ratio", "1 / 1", "important");
      img.style.setProperty("max-height", "none", "important");
    });
  }
});
