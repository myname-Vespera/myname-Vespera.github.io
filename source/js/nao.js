/*!
 * 看板娘 · 友利奈绪
 * 立绘 + 漂浮 / 呼吸 / 视线跟随 / 点击台词
 * 纯本地资源，无外部依赖
 */
(function () {
  "use strict";

  var BP = 900;
  if (window.innerWidth <= BP) return;

  var KEY = "nao-widget-hidden";
  var LINES = [
    "我是你的恋人！……这句话，可不能反悔哦。",
    "学生会的工作，交给我就好。",
    "拉一下绳子就会热的牛舌便当，你想吃吗？",
    "星之海学园里，奇怪的家伙可不少呢。",
    "别一直盯着屏幕，眼睛会累的。",
    "今天写的这篇，勉强算及格吧。",
    "让身形从一个人眼中消失——所以，我只对你藏起来。",
    "摸鱼可以，别摸太久。",
    "ZHIEND 的新专辑，要不要一起听？",
    "你来了。我还以为今天你不会来。",
    "在这里站着，风里都是星星的味道。",
    "有事就说，我听着呢。",
  ];
  var GREET = {
    morning: "早上好。今天的星星还没落呢。",
    noon: "中午了，记得吃点东西。",
    afternoon: "下午了，来陪你写一会儿。",
    evening: "天黑了，星星出来了。",
    night: "这么晚还不睡？我陪你一会儿。",
  };

  function el(tag, id, cls) {
    var n = document.createElement(tag);
    if (id) n.id = id;
    if (cls) n.className = cls;
    return n;
  }

  function pick(a) {
    return a[Math.floor(Math.random() * a.length)];
  }

  function greetText() {
    var h = new Date().getHours();
    if (h >= 5 && h < 11) return GREET.morning;
    if (h >= 11 && h < 14) return GREET.noon;
    if (h >= 14 && h < 18) return GREET.afternoon;
    if (h >= 18 && h < 23) return GREET.evening;
    return GREET.night;
  }

  var widget, open, bubble, img, clsTimer, sayTimer;

  function say(text, ms) {
    if (!bubble) return;
    bubble.textContent = text;
    bubble.classList.add("is-on");
    clearTimeout(sayTimer);
    sayTimer = setTimeout(function () {
      bubble.classList.remove("is-on");
    }, ms || 5200);
  }

  function bounce() {
    widget.classList.remove("is-bounce");
    void widget.offsetWidth;
    widget.classList.add("is-bounce");
    clearTimeout(clsTimer);
    clsTimer = setTimeout(function () {
      widget.classList.remove("is-bounce");
    }, 600);
  }

  /* ---------- 视线跟随 ---------- */
  var raf = null,
    target = { x: 0, r: 0 },
    cur = { x: 0, r: 0 },
    moving = false;

  function apply() {
    var dx = Math.abs(cur.x - target.x),
      dr = Math.abs(cur.r - target.r);
    if (dx < 0.02 && dr < 0.02) {
      cur.x = target.x;
      cur.r = target.r;
      moving = false;
    } else {
      cur.x += (target.x - cur.x) * 0.09;
      cur.r += (target.r - cur.r) * 0.09;
    }
    widget.style.transform =
      "translateX(" + cur.x.toFixed(2) + "px) rotate(" + cur.r.toFixed(2) + "deg)";
    if (moving) raf = requestAnimationFrame(apply);
    else raf = null;
  }

  function start() {
    if (raf || widget.classList.contains("is-hidden")) return;
    moving = true;
    raf = requestAnimationFrame(apply);
  }

  function onMove(e) {
    var w = window.innerWidth || 1;
    var dx = (e.clientX - w / 2) / (w / 2);
    if (dx < -1) dx = -1;
    if (dx > 1) dx = 1;
    target.x = dx * -9;
    target.r = dx * -5.5;
    start();
  }

  /* ---------- 挂载 ---------- */
  function build() {
    widget = el("div", "nao-widget");
    widget.innerHTML =
      '<div id="nao-bubble"></div>' +
      '<div class="nao-float"><div class="nao-breath">' +
      '<img id="nao-img" src="/images/nao.webp" alt="友利奈绪" draggable="false">' +
      "</div></div>" +
      '<button id="nao-close" type="button" aria-label="收起看板娘">×</button>';
    document.body.appendChild(widget);

    open = el("button", "nao-reopen");
    open.type = "button";
    open.textContent = "奈";
    open.setAttribute("aria-label", "唤出看板娘");
    document.body.appendChild(open);

    bubble = document.getElementById("nao-bubble");
    img = document.getElementById("nao-img");

    img.addEventListener("click", function () {
      bounce();
      say(pick(LINES));
    });

    document.getElementById("nao-close").addEventListener("click", function (e) {
      e.stopPropagation();
      hide(true);
    });

    open.addEventListener("click", function () {
      hide(false);
      say(pick(LINES));
    });

    document.addEventListener("mousemove", onMove, { passive: true });
  }

  function hide(on) {
    if (!widget) return;
    widget.classList.toggle("is-hidden", on);
    open.classList.toggle("is-on", on);
    try {
      if (on) sessionStorage.setItem(KEY, "1");
      else sessionStorage.removeItem(KEY);
    } catch (err) {}
    if (on) {
      bubble.classList.remove("is-on");
    } else {
      target.x = 0;
      target.r = 0;
      start();
    }
  }

  function boot() {
    var closed = false;
    try {
      closed = sessionStorage.getItem(KEY) === "1";
    } catch (err) {}

    build();

    if (closed) {
      hide(true);
      return;
    }

    setTimeout(function () {
      say(greetText(), 6000);
    }, 2600);
  }

  function ready() {
    if (document.body) boot();
    else document.addEventListener("DOMContentLoaded", boot);
  }

  // 首屏优先，看板娘延后加载，不抢渲染
  if (document.readyState === "complete") {
    setTimeout(ready, 600);
  } else {
    window.addEventListener("load", function () {
      setTimeout(ready, 600);
    });
  }
})();
