/* =========================================================
   金城タクシー — 予約フォームの送信処理（サーバー不要）
   ---------------------------------------------------------
   ★ 開業情報が決まったら、下の CONFIG だけ書き換えてください。
     サイト内の電話・WhatsApp・LINE・メールのリンクが一括で変わります。
   ========================================================= */
const CONFIG = {
  // 電話番号（表示用 / 発信用）
  phoneDisplay: "090-XXXX-XXXX",
  phoneTel: "+8190XXXXXXXX",           // 国際表記（先頭0を取り +81 を付ける）
  // WhatsApp：国番号から数字のみ（例 819012345678）。空なら非表示
  whatsapp: "8190XXXXXXXX",
  // LINE公式アカウントのID（@から始まる）。空なら非表示
  lineId: "@xxxxxxx",
  // 予約受付メールアドレス
  email: "info@example.com",
};

(function () {
  const isEn = document.documentElement.lang === "en";

  // ---- 連絡先リンクを CONFIG から反映 ----
  document.querySelectorAll("[data-tel]").forEach((a) => {
    a.href = "tel:" + CONFIG.phoneTel;
  });
  document.querySelectorAll("[data-phone-text]").forEach((el) => {
    el.textContent = CONFIG.phoneDisplay;
  });
  document.querySelectorAll("[data-wa]").forEach((a) => {
    if (!CONFIG.whatsapp) { a.style.display = "none"; return; }
    a.href = "https://wa.me/" + CONFIG.whatsapp;
  });
  document.querySelectorAll("[data-line]").forEach((a) => {
    if (!CONFIG.lineId) { a.style.display = "none"; return; }
    a.href = "https://line.me/R/ti/p/" + encodeURIComponent(CONFIG.lineId);
  });
  document.querySelectorAll("[data-mail]").forEach((a) => {
    a.href = "mailto:" + CONFIG.email;
  });
  document.querySelectorAll("[data-mail-text]").forEach((el) => {
    el.textContent = CONFIG.email;
  });

  // ---- 予約フォーム ----
  const form = document.getElementById("booking-form");
  if (!form) return;
  const err = document.getElementById("form-error");

  // 日付は今日以降のみ
  const dateInput = form.querySelector('[name="date"]');
  if (dateInput) {
    const t = new Date();
    dateInput.min = new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  const L = isEn
    ? {
        title: "Taxi booking request — Kinjo Taxi",
        name: "Name", contact: "Contact (email / phone)", date: "Date", time: "Pickup time",
        from: "Pickup", to: "Destination", pax: "Passengers", bags: "Large suitcases",
        flight: "Flight No.", lang: "Language", note: "Notes",
        missing: "Please fill in the required fields (name, contact, date, time, pickup, destination).",
      }
    : {
        title: "【金城タクシー】ご予約・お問い合わせ",
        name: "お名前", contact: "ご連絡先", date: "ご希望日", time: "お迎え時刻",
        from: "お迎え場所", to: "行き先", pax: "人数", bags: "大きな荷物",
        flight: "便名", lang: "言語", note: "備考",
        missing: "必須項目（お名前・ご連絡先・日付・時刻・お迎え場所・行き先）をご入力ください。",
      };

  function buildMessage() {
    const d = Object.fromEntries(new FormData(form).entries());
    const required = ["name", "contact", "date", "time", "from", "to"];
    if (required.some((k) => !String(d[k] || "").trim())) return null;
    const lines = [L.title, ""];
    const push = (label, v) => { if (v && String(v).trim()) lines.push(`${label}: ${String(v).trim()}`); };
    push(L.name, d.name);
    push(L.contact, d.contact);
    push(L.date, d.date);
    push(L.time, d.time);
    push(L.from, d.from);
    push(L.to, d.to);
    push(L.pax, d.pax);
    push(L.bags, d.bags);
    push(L.flight, d.flight);
    push(L.lang, d.lang);
    push(L.note, d.note);
    return lines.join("\n");
  }

  form.querySelectorAll("[data-send]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const msg = buildMessage();
      if (!msg) { err.textContent = L.missing; form.reportValidity(); return; }
      err.textContent = "";
      const text = encodeURIComponent(msg);
      let url;
      switch (btn.dataset.send) {
        case "whatsapp":
          url = `https://wa.me/${CONFIG.whatsapp}?text=${text}`;
          break;
        case "line":
          // LINE公式アカウント宛にメッセージを下書き
          url = `https://line.me/R/oaMessage/${encodeURIComponent(CONFIG.lineId)}/?${text}`;
          break;
        default:
          url = `mailto:${CONFIG.email}?subject=${encodeURIComponent(L.title)}&body=${text}`;
      }
      window.open(url, btn.dataset.send === "email" ? "_self" : "_blank", "noopener");
    });
  });

  // 設定が空の送信方法ボタンは隠す
  form.querySelectorAll('[data-send="whatsapp"]').forEach((b) => { if (!CONFIG.whatsapp) b.style.display = "none"; });
  form.querySelectorAll('[data-send="line"]').forEach((b) => { if (!CONFIG.lineId) b.style.display = "none"; });

  // 年
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
