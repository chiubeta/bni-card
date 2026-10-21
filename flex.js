// Flex Message 輪播：名片 → 課程招生 → 陪跑諮詢 → 4 張服務卡。瀏覽器與 node 共用（node 用來輸出 flex.json 給 Flex Simulator）
(function (root) {
  const NAVY = "#0B1730";
  const CYAN = "#4FD8FF";
  const MUTED = "#9DB3D3";
  const LINE_GREEN = "#06C755";
  const BLUE = "#1E6FFF";

  const SERVICES = [
    { img: "s1.jpg", title: "系統開發", model: "Claude Opus 5.5",
      points: ["客製內部系統、報表自動化", "官網、預約、表單串接", "重複作業交給程式跑"] },
    { img: "s6.jpg", title: "個人助理", model: "Grok Bot",
      points: ["整理資料、會議摘要", "行程與待辦提醒", "客人常見問題自動回覆"] },
    { img: "s2.jpg", title: "生成圖片", model: "GPT Image 2.5",
      points: ["商品圖、活動海報", "社群貼文配圖", "不用每次等設計外包"] },
    { img: "s3.jpg", title: "生成影片", model: "Seedance 2.5",
      points: ["產品介紹短片", "社群短影音素材", "一張圖變成動態影片"] },
  ];

  const txt = (text, extra) => Object.assign({ type: "text", text, wrap: true }, extra || {});
  const btn = (label, uri, color) => ({
    type: "button", style: "primary", height: "sm", color,
    action: { type: "uri", label, uri },
  });

  function cardBubble(cfg) {
    const footer = [btn("加我 LINE 好友", cfg.lineAdd, LINE_GREEN), btn("電子名片", cfg.base, BLUE)];
    if (cfg.liffId) footer.push(btn("分享給好友", "https://liff.line.me/" + cfg.liffId, BLUE));
    return {
      type: "bubble", size: "mega",
      hero: { type: "image", url: cfg.base + "img/hero.jpg", size: "full", aspectRatio: "4:5", aspectMode: "cover",
        action: { type: "uri", label: "名片", uri: cfg.base } },
      body: { type: "box", layout: "vertical", spacing: "sm", backgroundColor: NAVY, contents: [
        txt("邱一晉 Joey", { weight: "bold", size: "xl", color: "#FFFFFF" }),
        txt("AI 系統工程", { size: "sm", color: CYAN, weight: "bold" }),
        txt("用 AI 幫中小企業省人力", { size: "md", color: "#FFFFFF", margin: "md" }),
        txt("★系統開發★個人助理\n★生成圖片★生成影片", { size: "sm", color: MUTED, margin: "md" }),
      ] },
      footer: { type: "box", layout: "vertical", spacing: "sm", backgroundColor: NAVY, contents: footer },
    };
  }

  function serviceBubble(s, cfg) {
    return {
      type: "bubble", size: "mega",
      hero: { type: "image", url: cfg.base + "img/" + s.img, size: "full", aspectRatio: "1:1", aspectMode: "cover" },
      body: { type: "box", layout: "vertical", spacing: "sm", backgroundColor: NAVY, contents: [
        txt(s.title, { weight: "bold", size: "xl", color: "#FFFFFF" }),
        txt(s.model, { size: "sm", color: CYAN }),
        txt("可以幫你做", { size: "sm", color: MUTED, margin: "md" }),
        ...s.points.map((p) => txt("☆" + p, { size: "md", color: "#FFFFFF" })),
      ] },
      footer: { type: "box", layout: "vertical", backgroundColor: NAVY, contents: [
        btn("私訊我聊這個", cfg.lineAdd, LINE_GREEN),
      ] },
    };
  }

  const COURSE_FORM = "https://docs.google.com/forms/d/e/1FAIpQLSeKzUN3lAfPUH5pFcaCfzYgez0CRfYhbKvoDqLdlZgkxyZh2w/viewform?usp=publish-editor";

  // 標籤＋值一列（課程卡的時間／地點／費用）
  const infoRow = (label, value) => ({
    type: "box", layout: "baseline", spacing: "md", contents: [
      txt(label, { size: "sm", color: CYAN, flex: 2 }),
      txt(value, { size: "sm", color: "#FFFFFF", flex: 7 }),
    ],
  });

  function courseBubble(cfg) {
    return {
      type: "bubble", size: "mega",
      hero: { type: "image", url: cfg.base + "img/course.jpg", size: "full", aspectRatio: "2:3", aspectMode: "cover",
        action: { type: "uri", label: "報名", uri: COURSE_FORM } },
      body: { type: "box", layout: "vertical", spacing: "sm", backgroundColor: NAVY, contents: [
        txt("AI 課程招生", { size: "sm", color: CYAN, weight: "bold" }),
        txt("AI 小白的第一堂實戰課", { weight: "bold", size: "xl", color: "#FFFFFF" }),
        { type: "box", layout: "vertical", spacing: "xs", margin: "md", contents: [
          infoRow("時間", "11/7（六）14:00–16:00"),
          infoRow("地點", "中和區連城路469巷37號（啵啵哈哈鬆餅專賣）"),
          infoRow("費用", "600 元（含場地費、小點心）"),
        ] },
      ] },
      footer: { type: "box", layout: "vertical", backgroundColor: NAVY, contents: [
        btn("立即報名", COURSE_FORM, LINE_GREEN),
      ] },
    };
  }

  function coachBubble(cfg) {
    return {
      type: "bubble", size: "mega",
      hero: { type: "image", url: cfg.base + "img/coach.jpg", size: "full", aspectRatio: "1:1", aspectMode: "cover" },
      body: { type: "box", layout: "vertical", spacing: "sm", backgroundColor: NAVY, contents: [
        txt("AI 陪跑", { size: "sm", color: CYAN, weight: "bold" }),
        txt("一對一諮詢", { weight: "bold", size: "xl", color: "#FFFFFF" }),
        txt("可以幫你做", { size: "sm", color: MUTED, margin: "md" }),
        ...["依你的工作挑對 AI 工具", "陪你把流程實際做出來", "卡關隨時問，不用自己摸索"].map((p) => txt("☆" + p, { size: "md", color: "#FFFFFF" })),
      ] },
      footer: { type: "box", layout: "vertical", backgroundColor: NAVY, contents: [
        btn("預約諮詢", cfg.lineAdd, LINE_GREEN),
      ] },
    };
  }

  function buildFlex(cfg) {
    return {
      type: "flex",
      altText: "邱一晉 Joey｜AI 系統工程｜用 AI 幫中小企業省人力",
      contents: { type: "carousel", contents: [cardBubble(cfg), courseBubble(cfg), coachBubble(cfg), ...SERVICES.map((s) => serviceBubble(s, cfg))] },
    };
  }

  if (typeof module !== "undefined") module.exports = { buildFlex };
  else root.buildFlex = buildFlex;
})(this);
