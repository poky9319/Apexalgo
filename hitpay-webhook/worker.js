/**
 * HitPay Postback (Webhook) Receiver — Cloudflare Worker
 * =======================================================
 * 用途：接收 HitPay 支付成功后发来的 POST 通知，验证签名，
 *       然后（可选）发一条 Telegram 消息通知你有新订单。
 *
 * 部署步骤（2 分钟，用你已有的 Cloudflare 账号）：
 *   1. 打开 https://dash.cloudflare.com → 左侧 "Workers & Pages" → "Create" → "Create Worker"
 *   2. 随便取个名字，例如 "hitpay-postback"，点 "Deploy"（先部署一个空的）
 *   3. 部署完后点 "Edit code"，把这个文件的全部内容复制粘贴进去，覆盖默认代码，点右上角 "Deploy"
 *   4. 回到 Worker 的设置页 → "Settings" → "Variables" → "Add variable"，加这几个（类型选 "Encrypt" 更安全）：
 *        - HITPAY_SALT          必填。HitPay 后台 → Payment Gateway / API Keys 页面里的 "Salt" 值，用于验证签名
 *        - TELEGRAM_BOT_TOKEN   选填。要收通知才需要，去 Telegram 找 @BotFather 建一个机器人拿到的 token
 *        - TELEGRAM_CHAT_ID     选填。你自己的 Telegram 数字 ID 或群组 ID（跟 TELEGRAM_BOT_TOKEN 一起填才会推送）
 *   5. 保存后，Worker 页面顶部会显示一个网址，形如：
 *        https://hitpay-postback.<你的用户名>.workers.dev
 *      这个网址就是要填进 HitPay 表单 "Postback JSON URL" 的值。
 *
 * 不需要改任何代码，只要在第 4 步填变量即可。
 */

export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("OK — waiting for HitPay POST", { status: 200 });
    }

    let payload;
    const contentType = request.headers.get("content-type") || "";

    try {
      if (contentType.includes("application/json")) {
        payload = await request.json();
      } else {
        // HitPay's default postback is application/x-www-form-urlencoded
        const form = await request.formData();
        payload = Object.fromEntries(form.entries());
      }
    } catch (err) {
      return new Response("Bad payload", { status: 400 });
    }

    // ---------- 1. 验证签名（防止有人伪造假的"付款成功"请求） ----------
    const salt = env.HITPAY_SALT;
    const receivedHmac = payload.hmac;

    if (salt && receivedHmac) {
      const isValid = await verifyHitPayHmac(payload, salt, receivedHmac);
      if (!isValid) {
        return new Response("Invalid signature", { status: 401 });
      }
    }
    // 如果没配置 HITPAY_SALT，这里会跳过验证（不建议长期这样，先把流程跑通再补上）。

    // ---------- 2. 必须在几秒内返回 200，否则 HitPay 会重试/判定失败 ----------
    // 用 waitUntil 把"发通知"这件慢一点的事放到后台做，不卡住响应。
    const notify = (async () => {
      if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
        await sendTelegramNotification(payload, env);
      }
    })();

    ctx.waitUntil(notify);

    return new Response("OK", { status: 200 });
  },
};

async function verifyHitPayHmac(payload, salt, receivedHmac) {
  const entries = Object.keys(payload)
    .filter((k) => k !== "hmac")
    .sort()
    .map((k) => `${k}${payload[k]}`)
    .join("");

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(salt),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(entries));
  const computedHmac = [...new Uint8Array(sigBuffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedHmac === receivedHmac;
}

async function sendTelegramNotification(payload, env) {
  const status = payload.status || "unknown";
  const amount = payload.amount || "?";
  const currency = payload.currency || "MYR";
  const reference = payload.reference_number || payload.payment_id || "N/A";
  const email = payload.customer_email || payload.email || "N/A";

  const emoji = status === "completed" ? "✅" : "⚠️";
  const text =
    `${emoji} *ApexUlti — HitPay Postback*\n` +
    `Status: ${status}\n` +
    `Amount: ${amount} ${currency}\n` +
    `Reference: ${reference}\n` +
    `Customer: ${email}`;

  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text,
      parse_mode: "Markdown",
    }),
  });
}
