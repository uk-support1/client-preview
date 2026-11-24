/* =========================================================
   金城タクシー — LUXE edition スクリプト
   ★ 連絡先は CONFIG を書き換えるだけでサイト全体に反映されます
   ========================================================= */
const CONFIG = {
  phoneDisplay: "090-XXXX-XXXX",
  phoneTel: "+8190XXXXXXXX",
  lineId: "@xxxxxxx",          // LINE公式アカウントID。使わない場合は ""
  email: "info@example.com",
};

(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const body = document.body;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 連絡先の反映 ---------- */
  $$("[data-tel]").forEach((a) => (a.href = "tel:" + CONFIG.phoneTel));
  $$("[data-phone-text]").forEach((el) => (el.textContent = CONFIG.phoneDisplay));
  $$("[data-mail]").forEach((a) => (a.href = "mailto:" + CONFIG.email));
  $$("[data-mail-text]").forEach((el) => (el.textContent = CONFIG.email));
  $$("[data-line]").forEach((a) => {
    if (!CONFIG.lineId) return (a.style.display = "none");
    a.href = "https://line.me/R/ti/p/" + encodeURIComponent(CONFIG.lineId);
  });
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- オープニング ---------- */
  const opening = $(".opening");
  let seen = false;
  try { seen = sessionStorage.getItem("kinjo-opening") === "1"; } catch (e) {}
  const finish = () => {
    if (!opening || opening.classList.contains("is-done")) return;
    opening.classList.add("is-done");
    body.classList.remove("is-loading");
    body.classList.add("is-ready");
    try { sessionStorage.setItem("kinjo-opening", "1"); } catch (e) {}
    setTimeout(() => opening.classList.add("is-gone"), 1500);
  };
  if (!opening || reduce) {
    body.classList.remove("is-loading");
    body.classList.add("is-ready");
    if (opening) opening.classList.add("is-gone");
  } else {
    const wait = seen ? 900 : 3300;
    const start = () => setTimeout(finish, wait);
    if (document.readyState === "complete") start(); else window.addEventListener("load", start);
    setTimeout(finish, 6000); // 画像が遅くても必ず開く
    $(".opening__skip")?.addEventListener("click", finish);
  }

  /* ---------- ヘッダー・進捗バー・スマホCTA ---------- */
  const header = $(".header");
  const bar = $(".progress");
  const mcta = $(".mcta");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    header.classList.toggle("is-scrolled", y > 40);
    header.classList.toggle("is-hidden", y > lastY && y > innerHeight * 0.8 && !body.classList.contains("menu-open"));
    if (mcta) mcta.classList.toggle("is-shown", y > innerHeight * 0.6);
    lastY = y;
    parallax();
  };

  /* ---------- パララックス ---------- */
  const pars = $$("[data-parallax]");
  function parallax() {
    if (reduce) return;
    pars.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      el.style.transform = `translate3d(0, ${p * parseFloat(el.dataset.parallax) * -100}px, 0)`;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- スクロールで現れる ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      if (e.target.matches("[data-count]")) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal, .curtain, .flow, .heading, [data-count]").forEach((el) => io.observe(el));

  function countUp(el) {
    const to = parseFloat(el.dataset.count);
    const pad = el.dataset.pad ? parseInt(el.dataset.pad, 10) : 0;
    const t0 = performance.now();
    const dur = 1800;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const v = Math.round(to * (1 - Math.pow(1 - k, 4)));
      el.firstChild.nodeValue = String(v).padStart(pad, "0");
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- サービスカードの光 ---------- */
  $$(".service").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* ---------- FAQ ---------- */
  $$(".faq__q").forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.closest(".faq__item");
      const open = item.classList.toggle("is-open");
      q.setAttribute("aria-expanded", open);
    });
  });

  /* ---------- メニュー ---------- */
  const menuBtn = $(".menu-btn");
  menuBtn?.addEventListener("click", () => {
    const open = body.classList.toggle("menu-open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  $$(".drawer a").forEach((a) => a.addEventListener("click", () => body.classList.remove("menu-open")));

  /* ---------- カーソル（PCのみ） ---------- */
  const cursor = $(".cursor");
  if (cursor && matchMedia("(hover: hover) and (min-width: 901px)").matches && !reduce) {
    let x = 0, y = 0, cx = 0, cy = 0;
    window.addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; cursor.classList.add("is-on"); });
    document.addEventListener("pointerleave", () => cursor.classList.remove("is-on"));
    const loop = () => {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
    $$("a, button, .detail, .service").forEach((el) => {
      el.addEventListener("pointerenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("pointerleave", () => cursor.classList.remove("is-hover"));
    });
    // ボタンが少し吸い寄せられる
    $$(".btn").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.15}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      b.addEventListener("pointerleave", () => (b.style.transform = ""));
    });
  }

  /* ---------- 予約フォーム ---------- */
  const form = $("#booking-form");
  if (!form) return;
  const err = $("#form-error");
  const date = form.querySelector('[name="date"]');
  if (date) {
    const t = new Date();
    date.min = new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }
  const labels = { name: "お名前", contact: "ご連絡先", date: "ご希望日", time: "お迎え時刻", from: "お迎え場所", to: "行き先", pax: "人数", bags: "大きな荷物", note: "備考" };
  const build = () => {
    const d = Object.fromEntries(new FormData(form).entries());
    if (["name", "contact", "date", "time", "from", "to"].some((k) => !String(d[k] || "").trim())) return null;
    const lines = ["【金城タクシー】ご予約・お問い合わせ", ""];
    Object.keys(labels).forEach((k) => { if (d[k] && String(d[k]).trim()) lines.push(`${labels[k]}: ${String(d[k]).trim()}`); });
    return lines.join("\n");
  };
  $$("[data-send]", form).forEach((btn) => {
    if (btn.dataset.send === "line" && !CONFIG.lineId) btn.style.display = "none";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const msg = build();
      if (!msg) { err.textContent = "必須項目（お名前・ご連絡先・日付・時刻・お迎え場所・行き先）をご入力ください。"; return; }
      err.textContent = "";
      const text = encodeURIComponent(msg);
      if (btn.dataset.send === "line") {
        window.open(`https://line.me/R/oaMessage/${encodeURIComponent(CONFIG.lineId)}/?${text}`, "_blank", "noopener");
      } else {
        location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("【金城タクシー】ご予約・お問い合わせ")}&body=${text}`;
      }
    });
  });
})();
