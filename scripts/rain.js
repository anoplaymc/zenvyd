/* Subtle rain background — thin falling streaks, seamless wrap-around loop.
 *
 * Optional CSS hooks on the <canvas id="rain">:
 *   color: ...;            streak colour (falls back to #e5e5e5)
 *   --rain-wind: 0.12;     horizontal drift per vertical pixel (0 = straight rain)
 */
(function () {
  var canvas = document.getElementById("rain");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Decorative only: keep it out of the accessibility tree and away from clicks.
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.pointerEvents = "none";

  var MAX_DROPS = 110;
  var LAYERS = 4; // depth layers; each is drawn as ONE path (4 strokes/frame)
  var DEFAULT_COLOR = "#e5e5e5";
  var DEFAULT_WIND = 0.12;
  var MAX_DT = 0.05; // clamp so a stalled frame / tab return can't make drops jump

  var DPR = 1;
  var W = 0;
  var H = 0;
  var wind = DEFAULT_WIND;
  var color = DEFAULT_COLOR;
  var count = 0;

  // Fixed seed so the pattern is identical on every load (repeating figure).
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Drops are generated once, with positions stored NORMALISED (0..1).
   * Resizing then needs no rescaling or rebuilding, never distorts the
   * pattern, and never resets the animation — we just draw more/fewer drops.
   * Depth drives everything together (closer = longer, faster, brighter,
   * thicker), which reads as parallax instead of random noise. */
  var drops = (function () {
    var rand = mulberry32(1337);
    var list = [];
    for (var i = 0; i < MAX_DROPS; i++) {
      var z = rand(); // 0 = far, 1 = near
      list.push({
        nx: rand(),
        ny: rand(),
        len: 10 + z * 16 + rand() * 4, // px
        v: 330 + z * 220 + rand() * 40, // px / second
        layer: Math.min(LAYERS - 1, Math.floor(z * LAYERS)),
      });
    }
    return list;
  })();

  var layerAlpha = [];
  var layerWidth = [];
  for (var l = 0; l < LAYERS; l++) {
    layerAlpha.push(0.07 + (l / (LAYERS - 1)) * 0.17);
    layerWidth.push(l === LAYERS - 1 ? 1.5 : 1);
  }

  function readStyle() {
    var cs = window.getComputedStyle(canvas);
    var c = cs.color;
    // Default computed colour is opaque black; treat "unset" as our default.
    color = canvas.style.color || c !== "rgb(0, 0, 0)" ? c : DEFAULT_COLOR;
    var w = parseFloat(cs.getPropertyValue("--rain-wind"));
    wind = isNaN(w) ? DEFAULT_WIND : w;
  }

  function resize() {
    var nw = window.innerWidth;
    var nh = window.innerHeight;
    var ndpr = Math.min(window.devicePixelRatio || 1, 2);
    if (nw === W && nh === H && ndpr === DPR) return;
    W = nw;
    H = nh;
    DPR = ndpr;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    count = Math.max(1, Math.min(MAX_DROPS, Math.floor((W * H) / 18000) || 45));
    readStyle();
    draw(); // paint one static frame immediately (also covers reduced-motion)
  }

  // Coalesce bursts of resize events (mobile URL-bar, window drag) into one per frame.
  var resizePending = false;
  function onResize() {
    if (resizePending) return;
    resizePending = true;
    requestAnimationFrame(function () {
      resizePending = false;
      resize();
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    for (var l = 0; l < LAYERS; l++) {
      ctx.globalAlpha = layerAlpha[l];
      ctx.lineWidth = layerWidth[l];
      ctx.beginPath();
      for (var i = 0; i < count; i++) {
        var d = drops[i];
        if (d.layer !== l) continue;
        var x = d.nx * W;
        var y = d.ny * H;
        ctx.moveTo(x, y);
        ctx.lineTo(x - wind * d.len, y - d.len);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // dt in seconds → same apparent speed on 60 / 120 / 144 Hz displays.
  function step(dt) {
    for (var i = 0; i < count; i++) {
      var d = drops[i];
      var dy = d.v * dt;
      d.ny += dy / H;
      d.nx += (wind * dy) / W;
      // Wrap around for an infinite repeating cycle.
      if (d.ny * H - d.len > H) {
        d.ny = -d.len / H;
      }
      var x = d.nx * W;
      if (x < -d.len) {
        d.nx = (W + d.len) / W;
      } else if (x > W + d.len) {
        d.nx = -d.len / W;
      }
    }
  }

  var motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  var frame = null;
  var last = 0;

  function loop(now) {
    if (!last) last = now;
    var dt = Math.min((now - last) / 1000, MAX_DT);
    last = now;
    step(dt);
    draw();
    frame = requestAnimationFrame(loop);
  }

  function stop() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    last = 0;
  }

  function start() {
    if (frame === null && !motionPreference.matches && !document.hidden) {
      last = 0;
      frame = requestAnimationFrame(loop);
    }
  }

  function onMotionChange(event) {
    if (event.matches) {
      stop();
      draw();
    } else {
      start();
    }
  }

  function listen(mql, handler) {
    if (mql.addEventListener) mql.addEventListener("change", handler);
    else if (mql.addListener) mql.addListener(handler);
  }

  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else start();
  });
  listen(motionPreference, onMotionChange);

  // Re-read colour if the page switches light/dark.
  listen(window.matchMedia("(prefers-color-scheme: dark)"), function () {
    readStyle();
    if (frame === null) draw();
  });

  resize();
  start();
})();
