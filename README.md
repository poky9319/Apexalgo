# ApexUlti — 落地页使用说明

黑底 + 亮绿霓虹风格的交易指标落地页（参考 GainzAlgo 的设计感），一次卖 **8 个指标 + 1 个全套组合包**，另外还有 **2 个旗舰产品**（APEX Algorithm V2 / SMC Orderblock V5，仿 GainzAlgo 详情卡样式，带版本/档位切换），每个都有「Add to Cart / Buy Now」按钮，之后直接挂 Shopify 收款。

## 文件结构

- `index.html` — 页面所有内容（首屏、信任栏、信号展示、8 个指标商品卡、FAQ 等）
- `style.css` — 样式（黑底 + 绿色霓虹发光风格）
- `script.js` — 倒数计时、Shopify 按钮跳转、图片轮播、手风琴 FAQ、手机菜单
- `README.md` — 就是你现在在看的这份说明

直接用浏览器打开 `index.html` 就能预览效果。

## ⚠️ 关于产品图片（重要，上线前必须处理）

现在 8 个指标卡片 + 首屏大图用的都是你之前发给我的真实截图，但目前是用**本机绝对路径**（`file:///C:/Users/TAN/...`）直接读取的 —— 这是因为这台电脑的终端环境这几轮对话一直连不上，我没办法自动把图片文件复制进 `LP_Shop` 文件夹。

这样做的效果：
- ✅ 现在你在**这台电脑**上打开 `index.html`，图片可以正常显示，方便你先看效果
- ❌ 但这些图片**不在** `LP_Shop` 文件夹里，之后换电脑、或者把网站传到 Shopify/其他主机上，图片会全部失效（因为路径指向的是你这台电脑上 Cursor 的内部缓存文件夹，不是网站自己的文件）

**上线前必须做的事**：把 8 张指标图 + 首屏大图 + 13 个经纪商 Logo（信任栏跑马灯）全部正式存到 `LP_Shop` 文件夹里，然后把 `index.html`（还有 `script.js` 里信号轮播那段）的 `file:///C:/Users/TAN/...` 路径改成简单的文件名（例如 `products/apex-trend-pro.png`、`logos/xm.png`）。等你的终端环境恢复正常，或者你把图片手动存好文件名告诉我，我可以帮你一次性改完这些路径。

## 关于信任栏的经纪商 Logo

信任栏的跑马灯用的是你发的 13 个经纪商真实 Logo（NEEX、PU Prime、Tickmill、ST Market、StarTrader、TMGM、Ultima Markets、Valetax、XM、FPG、Vantage、HFM、VT Markets），灰阶显示、鼠标移上去会变彩色，跑马灯方向是往左无限循环。

因为这些 Logo 原始图片背景色不统一（有白底、黑底、蓝底），我统一放进了一个**浅灰色圆角小方框**里显示，这样大小一致、也不会因为背景对比问题而看起来很奇怪。如果你之后有透明背景版本的 Logo（PNG 去底），效果会更好看，可以之后再换。

⚠️ **合规提醒**：使用经纪商官方 Logo 做推广，大部分 IB 联盟计划都允许（甚至提供官方素材包），但具体使用规范（能不能改色、能不能配合"信任/推荐"这种字眼）每家经纪商都不一样，建议正式使用前跟你在推广的这几家经纪商 IB 后台确认一下品牌使用规范，避免违反联盟条款。

## 上线前，你需要做的几件事

### 1. 接上 Shopify 收款

打开 `script.js`，最上面有一段 `SHOPIFY_CONFIG`：

```js
const SHOPIFY_CONFIG = {
  storeDomain: "yourstore.myshopify.com",
  telegramLink: "https://t.me/your_telegram_username",
  variants: {
    indicator1: "REPLACE_VARIANT_ID_1",
    ...
    bundle: "REPLACE_VARIANT_ID_BUNDLE",
    smcStandard: "REPLACE_VARIANT_ID_SMC_STANDARD",
    smcPro: "REPLACE_VARIANT_ID_SMC_PRO",
    apexV2: "REPLACE_VARIANT_ID_APEX_V2"
  }
};
```

**新增的旗舰产品说明**：`SMC Orderblock V5` 有 Standard/Pro 两个版本按钮（点哪个，价格和购买按钮会自动切换，所以这个产品在 Shopify 后台要建成 2 个 Variant）；`APEX Algorithm V2`（Best Seller）是单一价格、没有档位选择，直接对应 1 个 Variant。

- `storeDomain`：换成你自己的 Shopify 域名（后台左下角能看到，格式是 `xxx.myshopify.com`）
- `variants` 里每一项：换成对应商品的 **Variant ID**（Shopify 后台 → Products → 打开商品 → 点进 Variant → 看网址最后一串数字）

改完存档：
- **Buy Now** 按钮 → 直接跳转到 Shopify 结账页（同一页面）
- **Add to Cart** 按钮 → 新分页打开购物车 + 页面上弹出"已加入购物车"提示，方便访客留在落地页继续逛

### 2. 把真实指标信息填进去

8 张卡片目前用的是占位的名字/卖点/价格（Apex Trend Pro、Golden Entry、Smart Money Flow、Volatility Shield、Scalper's Edge、Swing Master、Support/Resistance AI、All-in-One Dashboard），价格也是示范价。换成你真实的指标资料即可，`index.html` 里搜索对应名字就能找到。

### 3. 换 Telegram 联络方式

`script.js` 里 `telegramLink` 改成你自己的 Telegram。

## 倒数计时说明

现在是「示范用」倒数：每个访客第一次打开会开始 6 小时倒数，结束后自动重置。如果要做**真实固定截止日期**的限时优惠，打开 `script.js` 找到：

```js
const SIX_HOURS = 6 * 60 * 60 * 1000;
```

改成固定日期，例如：

```js
let endTime = new Date("2026-08-20T23:59:59").getTime();
```

## 关于合规与转化率的提醒

1. **评价/回测数据目前是 Demo 占位内容**，上线前建议换成真实客户反馈，避免 Shopify/支付通道因"金融类目 + 夸大宣传"审核风险。
2. **避免"保证获利"类字眼**，页面已经加了免责声明（Not financial advice / 交易有风险），文案里也刻意把"Potential gain +26%"这类说法改成了"Example setup — for illustration only"，正式发布前不要再加"稳赚""100%胜率"这类词。
3. **信任栏（TradingView / Binance / Bybit 等）目前用的是纯文字徽章**，没有用真实品牌 Logo 图片 —— 这是刻意的，避免未经授权使用交易所/平台官方 Logo 涉及商标问题。如果你想放真实 Logo，需要确认对方品牌使用规范。
4. **倒数计时是"每人打开都重新倒 6 小时"的营销手法**，如果之后投 TikTok/Meta 广告，虚假紧迫感可能违反广告政策，建议改成真实固定截止日期。
5. **Shopify 卖的是数字商品/授权**，付款后不会自动发货，你需要自己接一套"付款成功 → 自动发 TradingView 邀请/安装教程"的流程（邮件自动回复或 Telegram 处理），否则容易被判定未履约。

需要的话我也可以帮你做 IB 推广那个落地页，或者接上 Google Analytics / Meta Pixel / TikTok Pixel 做转化追踪。
