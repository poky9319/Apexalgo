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
    indicator1: "REPLACE_VARIANT_ID_1",
    indicator2: "REPLACE_VARIANT_ID_2",
    indicator3: "REPLACE_VARIANT_ID_3",
    indicator4: "REPLACE_VARIANT_ID_4",
    indicator5: "REPLACE_VARIANT_ID_5",
    indicator6: "REPLACE_VARIANT_ID_6",
    indicator7: "REPLACE_VARIANT_ID_7",
    indicator8: "REPLACE_VARIANT_ID_8",
    bundle: "REPLACE_VARIANT_ID_BUNDLE",
    smcStandard: "REPLACE_VARIANT_ID_SMC_STANDARD",
    smcPro: "REPLACE_VARIANT_ID_SMC_PRO",
    apexV2: "REPLACE_VARIANT_ID_APEX_V2"
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

  /* ---------- 旗舰产品卡：Version / Preset 切换 ---------- */
  document.querySelectorAll("[data-toggle-group]").forEach((group) => {
    const card = group.closest(".flagship-card");
    if (!card) return;
    const wasEl = card.querySelector("[data-was]");
    const nowEl = card.querySelector("[data-now]");
    const cartBtn = card.querySelector(".cart-btn");
    const buyBtn = card.querySelector(".buy-btn");

    group.querySelectorAll(".toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        group.querySelectorAll(".toggle-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const priceNow = btn.getAttribute("data-price-now");
        const priceWas = btn.getAttribute("data-price-was");
        const variant = btn.getAttribute("data-variant");
        if (nowEl) nowEl.textContent = `$${priceNow} USD`;
        if (wasEl) wasEl.textContent = `$${priceWas} USD`;

        if (cartBtn) { cartBtn.setAttribute("data-variant-key", variant); bindCartBtn(cartBtn); }
        if (buyBtn) { buyBtn.setAttribute("data-variant-key", variant); bindBuyBtn(buyBtn); }
      });
    });
  });

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

  /* ---------- 信号展示区：图片轮播 ---------- */
  const showcaseImages = [
    "images/golden-entry.png",
    "images/scalpers-edge.png",
    "images/apex-trend-pro.png",
    "images/indicator-preview.png"
  ];
  const showcaseImg = document.getElementById("showcaseImg");
  const showcaseDots = document.getElementById("showcaseDots");
  let showcaseIndex = 0;
  if (showcaseImg && showcaseDots) {
    showcaseImages.forEach((_, i) => {
      const dot = document.createElement("button");
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => setShowcase(i));
      showcaseDots.appendChild(dot);
    });
    function setShowcase(i) {
      showcaseIndex = i;
      showcaseImg.src = showcaseImages[i];
      [...showcaseDots.children].forEach((d, idx) => d.classList.toggle("active", idx === i));
    }
    setInterval(() => setShowcase((showcaseIndex + 1) % showcaseImages.length), 5000);
  }

  /* ---------- Logo 跑马灯：自动复制一份内容，做到无缝循环 ---------- */
  const logoTrack = document.getElementById("logoTrack");
  if (logoTrack) {
    logoTrack.innerHTML += logoTrack.innerHTML;
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
});
