/* きたコーチ｜動き（ライブラリ不使用） */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- ヘッダー：スクロールで背景 ---------- */
  var header = document.getElementById('header');
  var hero = document.querySelector('.hero');
  function onScroll() {
    var limit = hero ? hero.offsetHeight - 80 : 80;
    header.classList.toggle('is-scrolled', window.scrollY > limit);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- ハンバーガー ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  }
  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); }
  });

  /* ---------- 線の長さを 1 に正規化（描画アニメ用） ---------- */
  document.querySelectorAll('.chalk, .net__lines path').forEach(function (p, i) {
    p.setAttribute('pathLength', '1');
    p.style.setProperty('--i', i);
  });

  /* ---------- 作戦ボード：読み込み時に一度だけ描く ---------- */
  var board = document.querySelector('.board');
  if (board && !reduceMotion) {
    board.classList.add('is-ready');
    requestAnimationFrame(function () {
      setTimeout(function () {
        board.classList.add('is-drawing');
        setTimeout(function () { board.classList.add('is-done'); }, 6000);
      }, 250);
    });
  } else if (board) {
    board.classList.add('is-done');
  }

  /* ---------- 競技テロップ（ループ用に複製） ---------- */
  var sports = document.querySelector('.sports');
  if (sports && !reduceMotion) {
    var items = Array.prototype.slice.call(sports.children);
    var track = document.createElement('div');
    track.className = 'sports__track';
    items.forEach(function (li) { track.appendChild(li); });
    var clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    // 2本並べ、外側の track で -50% 送る
    var outer = document.createElement('div');
    outer.className = 'sports__track';
    outer.style.display = 'flex';
    track.style.animation = 'none';
    clone.style.animation = 'none';
    outer.appendChild(track);
    outer.appendChild(clone);
    // ul 直下は li が望ましいので role を調整
    sports.setAttribute('role', 'list');
    track.setAttribute('role', 'presentation');
    sports.appendChild(outer);
    sports.classList.add('is-marquee');
  }

  /* ---------- 仲間ネットワーク：見えたら描く ---------- */
  var net = document.querySelector('.together__net');
  if (net && 'IntersectionObserver' in window && !reduceMotion) {
    net.classList.add('is-ready');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { net.classList.add('is-in'); io.disconnect(); }
      });
    }, { threshold: 0.4 });
    io.observe(net);
  }

  /* ---------- 呼吸ワーク ---------- */
  var orb = document.getElementById('orb');
  var core = orb && orb.querySelector('.orb__core');
  var label = document.getElementById('orbLabel');
  var count = document.getElementById('orbCount');
  var btn = document.getElementById('breatheBtn');
  var dots = document.querySelectorAll('#rounds li');
  var PHASES = [
    { text: 'すって', sec: 4, grow: true },
    { text: 'とめて', sec: 2, grow: true },
    { text: 'はいて', sec: 6, grow: false }
  ];
  var ROUNDS = 3;
  var timer = null;
  var running = false;

  function resetBreath(message) {
    clearTimeout(timer);
    running = false;
    orb.classList.remove('is-running', 'is-in');
    core.style.transitionDuration = '1s';
    label.innerHTML = message;
    count.textContent = '';
    btn.textContent = 'はじめる';
  }

  function tick(round, phase, left) {
    var p = PHASES[phase];
    count.textContent = left;
    timer = setTimeout(function () {
      if (left > 1) { tick(round, phase, left - 1); return; }
      // 次のフェーズへ
      var nextPhase = phase + 1;
      var nextRound = round;
      if (nextPhase >= PHASES.length) {
        dots[round].classList.add('is-done');
        nextPhase = 0;
        nextRound = round + 1;
      }
      if (nextRound >= ROUNDS) {
        resetBreath('おつかれさま。<br>体、少し軽くなった？');
        btn.textContent = 'もう一度';
        return;
      }
      runPhase(nextRound, nextPhase);
    }, 1000);
  }

  function runPhase(round, phase) {
    var p = PHASES[phase];
    core.style.transitionDuration = p.sec + 's';
    orb.classList.toggle('is-in', p.grow);
    label.textContent = p.text;
    tick(round, phase, p.sec);
  }

  if (btn) {
    btn.addEventListener('click', function () {
      if (running) { resetBreath('準備ができたら<br>はじめよう'); return; }
      running = true;
      dots.forEach(function (d) { d.classList.remove('is-done'); });
      orb.classList.add('is-running');
      btn.textContent = 'とめる';
      runPhase(0, 0);
    });
  }

  /* ---------- 写真の差し込み ----------
     .photo-slot の中に <img> を入れると、仮置きの枠が消えて写真が表示されます。 */
})();
