/* =========================================================================
   ⚙️ 只需要改这里 —— SHOPIFY 配置区（其余代码不用动）
   =========================================================================
   1. storeDomain：填你的 Shopify 店铺域名（后台左下角店铺名 + .myshopify.com）
      例：mystore.myshopify.com
   2. variants：把下面每一个 "REPLACE_..." 换成对应产品的 Variant ID。
      取得 Variant ID 的方法：
        Shopify 后台 → Products → 打开该商品 → 点击对应 Variant
        → 看浏览器网址列，网址最后一段数字就是 Variant ID
        例：.../variants/44123456789012  → 44123456789012 就是 Variant ID
   3. telegramLink：改成你自己的 Telegram 用户名或群组连结
   ========================================================================= */
const SHOPIFY_CONFIG = {
  storeDomain: "yourstore.myshopify.com",
  telegramLink: "https://t.me/your_telegram_username",
  variants: {
    smc: "REPLACE_VARIANT_ID_SMC",       // SMC Orderblock V5 — RM 35.90
    apexV2: "REPLACE_VARIANT_ID_APEX_V2", // APEX Algorithm V2 — RM 35.90 (also uses Shopify Buy Button below, keep both in sync)
    combo: "REPLACE_VARIANT_ID_COMBO"    // SMC + APEX combo — RM 55.59
  }
};
/* ========================================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const toast = document.getElementById("toast");
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function cartUrlFor(key) {
    const variantId = SHOPIFY_CONFIG.variants[key];
    if (!variantId || variantId.startsWith("REPLACE_")) return null;
    return `https://${SHOPIFY_CONFIG.storeDomain}/cart/${variantId}:1`;
  }

  /* ---------- "Buy Now" 按钮：直接跳转 Shopify 结账（同一页面）---------- */
  function bindBuyBtn(btn) {
    const key = btn.getAttribute("data-variant-key");
    const url = cartUrlFor(key);
    btn.onclick = null;
    if (url) {
      btn.href = url;
      btn.target = "_self";
    } else {
      btn.href = "#";
      btn.onclick = (e) => {
        e.preventDefault();
        alert("请先在 script.js 顶部的 SHOPIFY_CONFIG 里填入你的店铺域名与 Variant ID。");
      };
    }
  }

  /* ---------- "Add to Cart" 按钮：新分页加入购物车 + 提示 ---------- */
  function bindCartBtn(btn) {
    const key = btn.getAttribute("data-variant-key");
    const url = cartUrlFor(key);
    btn.onclick = (e) => {
      e.preventDefault();
      if (!url) {
        alert("请先在 script.js 顶部的 SHOPIFY_CONFIG 里填入你的店铺域名与 Variant ID。");
        return;
      }
      window.open(url, "_blank", "noopener");
      showToast("已加入购物车 ✓ Added to cart");
    };
  }

  document.querySelectorAll(".buy-btn").forEach(bindBuyBtn);
  document.querySelectorAll(".cart-btn").forEach(bindCartBtn);

  /* ---------- 购物车图标 ---------- */
  const cartLink = document.getElementById("cartLink");
  if (cartLink) {
    cartLink.href = `https://${SHOPIFY_CONFIG.storeDomain}/cart`;
    cartLink.target = "_blank";
    cartLink.rel = "noopener";
  }

  /* ---------- Telegram 连结 ---------- */
  document.querySelectorAll("#telegramLink, #telegramLink2").forEach((el) => {
    el.href = SHOPIFY_CONFIG.telegramLink;
    el.target = "_blank";
    el.rel = "noopener";
  });

  /* ---------- Live TradingView chart (pan / zoom / timeframe) ---------- */
  const tvHost = document.getElementById("tvChartHost");
  const tvButtons = document.querySelectorAll(".tv-sym");
  function mountApexChart(symbol) {
    if (!tvHost || !window.TradingView) return;
    tvHost.innerHTML = '<div id="tradingview_apex"></div>';
    new TradingView.widget({
      autosize: true,
      symbol: symbol,
      interval: "5",
      timezone: "Asia/Kuala_Lumpur",
      theme: "dark",
      style: "1",
      locale: "en",
      toolbar_bg: "#12100c",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      save_image: false,
      withdateranges: true,
      hideideas: true,
      container_id: "tradingview_apex"
    });
  }
  function loadTradingView(callback) {
    if (window.TradingView) {
      callback();
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://s.tradingview.com/tv.js";
    tag.onload = callback;
    document.head.appendChild(tag);
  }
  if (tvHost) {
    loadTradingView(() => mountApexChart("OANDA:XAUUSD"));
    tvButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        tvButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        loadTradingView(() => mountApexChart(btn.getAttribute("data-tv-symbol")));
      });
    });
  }

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
