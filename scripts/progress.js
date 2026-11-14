/* Reading progress bar — fills as you scroll down the page. */
(function () {
  var bar = document.querySelector(".progress-bar");
  if (!bar) return;

  function update() {
    var root = document.documentElement;
    var body = document.body;
    var scrollTop = root.scrollTop || body.scrollTop;
    var scrollHeight = root.scrollHeight || body.scrollHeight;
    var clientHeight = root.clientHeight || body.clientHeight;
    var maxScroll = scrollHeight - clientHeight;
    var scrolled = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    bar.style.width = scrolled + "%";
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        update();
        ticking = false;
      });
      ticking = true;
    }
  });

  update();
})();
