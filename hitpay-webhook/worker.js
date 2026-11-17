/**
 * ApexUlti PayEssence checkout + payment notification.
 *
 * Cloudflare secrets / variables:
 *   PE_SECRET_KEY      required. PayEssence Secret Key. Set as a secret, not in the webpage.
 *   PE_MERCHANT_CODE   M3796126
 *   PE_DEPOSIT_URL     https://api.mxpay.asia/WebForm/Deposit.aspx
 *   PE_REDIRECT_URL    https://apexulti.com/thank-you.html
 *   TELEGRAM_BOT_TOKEN optional
 *   TELEGRAM_CHAT_ID   optional
 *
 * Customer checkout:  GET /checkout?product=smc|apex|combo&name=TradingViewUsername
 * PayEssence success: POST JSON to this worker's root URL
 */

const PRODUCTS = {
  smc: { amount: "35.90", desc: "SMC Orderblock V5" },
  apex: { amount: "35.90", desc: "APEX Algorithm V2" },
  combo: { amount: "55.59", desc: "SMC Orderblock V5 + APEX Algorithm V2" },
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "GET" && (url.pathname === "/checkout" || url.pathname === "/checkout/")) {
      return checkout(url, env);
    }

    if (request.method === "GET") {
      return new Response("ApexUlti PayEssence checkout is ready.", { status: 200 });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response("Bad payload", { status: 400 });
    }

    const secret = env.PE_SECRET_KEY;
    if (secret && payload.CheckString2) {
      const expected = await sha256Hex(
        reverseString(String(payload.MerchantCode || "")) +
          reverseString(String(payload.TransNum || "")) +
          secret
      );
      if (expected !== String(payload.CheckString2).toLowerCase()) {
        return new Response("Invalid CheckString2", { status: 401 });
      }
    }

    ctx.waitUntil((async () => {
      if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
        await sendTelegramNotification(payload, env);
      }
    })());

    return new Response("OK", { status: 200 });
  },
};

async function checkout(url, env) {
  const secret = env.PE_SECRET_KEY;
  const merchant = env.PE_MERCHANT_CODE;
  if (!secret || !merchant) {
    return new Response("Payment is not configured yet.", { status: 500 });
  }

  const key = String(url.searchParams.get("product") || "").toLowerCase();
  const product = PRODUCTS[key === "apexv2" ? "apex" : key];
  const name = cleanName(url.searchParams.get("name"));
  const email = cleanEmail(url.searchParams.get("email"));
  if (!product || !name || !email) {
    return new Response("Go back and enter your TradingView username and a valid email, then choose a product.", { status: 400 });
  }

  const transNum = makeTransNum();
  const currency = "MYR";
  const signature = await sha256Hex(`${merchant}${secret}${transNum}${currency}${product.amount}`);
  const depositUrl = env.PE_DEPOSIT_URL || "https://api.mxpay.asia/WebForm/Deposit.aspx";
  const redirectUrl = env.PE_REDIRECT_URL || "https://apexulti.com/thank-you.html";

  const fields = {
    MerchantCode: merchant,
    TransNum: transNum,
    Currency: currency,
    Amount: product.amount,
    PaymentDesc: product.desc,
    FirstName: name,
    LastName: "",
    EmailAddress: email,
    PhoneNum: "",
    Address: "",
    City: "",
    State: "",
    Country: "MYS",
    Postcode: "",
    MerchantRemark: `${key} ${name} ${email}`.slice(0, 300),
    Signature: signature,
    RedirectUrl: redirectUrl,
  };

  const inputs = Object.entries(fields)
    .map(([field, value]) => `<input type="hidden" name="${escapeHtml(field)}" value="${escapeHtml(value)}">`)
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Redirecting to payment</title></head>
<body>
  <p>Taking you to the secure payment page for ${escapeHtml(product.desc)}, RM ${escapeHtml(product.amount)}.</p>
  <form id="pay" method="POST" action="${escapeHtml(depositUrl)}">
${inputs}
  </form>
  <script>document.getElementById("pay").submit();</script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function cleanName(value) {
  const name = String(value || "").trim();
  if (!/^[A-Za-z0-9_.-]{2,40}$/.test(name)) return "";
  return name;
}

function cleanEmail(value) {
  const email = String(value || "").trim();
  if (email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return "";
  return email;
}

function makeTransNum() {
  const rand = crypto.randomUUID().replaceAll("-", "").slice(0, 6);
  return `APEX${Date.now()}${rand}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function reverseString(value) {
  return [...value].reverse().join("");
}

async function sha256Hex(value) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sendTelegramNotification(payload, env) {
  const result = String(payload.Result || "");
  const ok = result === "10001";
  const text =
    `${ok ? "✅" : "⚠️"} *ApexUlti — PayEssence*\n` +
    `Result: ${result || "unknown"}\n` +
    `Amount: ${payload.Amount || "?"} ${payload.Currency || "MYR"}\n` +
    `TransNum: ${payload.TransNum || "N/A"}\n` +
    `DepositId: ${payload.DepositId || "N/A"}\n` +
    `Name: ${payload.FirstName || "N/A"} ${payload.LastName || ""}\n` +
    `Email: ${payload.EmailAddress || "N/A"}`;

  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text,
      parse_mode: "Markdown",
    }),
  });
}
