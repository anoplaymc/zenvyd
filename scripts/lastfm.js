/* @licstart  The following is the entire license notice for the
  JavaScript code in this page.

  Copyright (C) 2026 Mykhailo "inuhepott" Aleksieiev

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
  associated documentation files (the "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
  following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial
  portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
  LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
  EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
  IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  USE OR OTHER DEALINGS IN THE SOFTWARE.

  @licend  The above is the entire license notice
  for the JavaScript code in this page. */

/*so yeah i just stole it */

// Cover art helpers. The placeholder is created here so the HTML stays unchanged.
function getPlaceholder(image) {
  let ph = document.querySelector(".now-playing-cover-placeholder");
  if (!ph) {
    ph = document.createElement("span");
    ph.className = "now-playing-cover now-playing-cover-placeholder";
    ph.setAttribute("aria-hidden", "true");
    ph.textContent = "♪";
    ph.style.display = "none";
    image.after(ph);
  }
  return ph;
}

// state: "image" | "placeholder" | "none"
function setCover(image, state, url) {
  if (!image) return;
  const ph = getPlaceholder(image);

  if (state === "image") {
    // If the image fails to load, fall back to the placeholder.
    image.onerror = () => setCover(image, "placeholder");
    image.src = url;
    image.style.display = "inline-block";
    ph.style.display = "none";
  } else if (state === "placeholder") {
    image.removeAttribute("src");
    image.style.display = "none";
    ph.style.display = "flex";
  } else {
    image.style.display = "none";
    ph.style.display = "none";
  }
}

// The last.fm username comes from data-lastfm-user on the #music pane.
// While it's empty the pane stays hidden and nothing is fetched.
const lastfmPane = document.getElementById("music");
const lastfmUser = ((lastfmPane && lastfmPane.dataset.lastfmUser) || "").trim();

async function updateStatus() {
  const container = document.querySelector(".now-playing");
  if (!container) return;

  const image = document.querySelector(".now-playing-cover");
  const label = document.querySelector(".lastfm");
  const isRussian = document.documentElement.lang === "ru";
  const strings = isRussian
    ? {
        now: "играет щас",
        last: "слушал в прошлый раз",
        failed: "¯\\_(ツ)_/¯",
      }
    : {
        now: "playing rn",
        last: "played last time",
        failed: "¯\\_(ツ)_/¯",
      };

  // Reset everything to the "no data" state: plain label, no link, no cover.
  const resetExtras = () => {
    if (label) label.textContent = "last.fm";
    container.removeAttribute("href");
    setCover(image, "none");
  };

  try {
    const res = await fetch(
      `https://api.vesperlinux.org/kuunnella?user=${encodeURIComponent(lastfmUser)}`,
      { cache: "no-store" },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const isJson = (res.headers.get("content-type") || "").includes(
      "application/json",
    );
    const data = isJson ? await res.json() : null;

    if (
      !data ||
      typeof data.name !== "string" ||
      typeof data.artist !== "string"
    ) {
      container.textContent = strings.failed;
      resetExtras();
      return;
    }

    const trackName = data.name.replace(/—/g, "-");

    container.textContent = `${trackName} - ${data.artist}`;

    // Link to the track page (only if the API gave us a usable URL)
    if (typeof data.url === "string" && /^https?:\/\//i.test(data.url)) {
      container.href = data.url;
    } else {
      container.removeAttribute("href");
    }

    // Cover art, or a placeholder when the API has none
    if (typeof data.image_url === "string" && data.image_url) {
      setCover(image, "image", data.image_url);
    } else {
      setCover(image, "placeholder");
    }

    if (label) {
      label.textContent = `last.fm (${data.nowplaying ? strings.now : strings.last})`;
    }
  } catch (e) {
    container.textContent = strings.failed;
    resetExtras();
    console.error("failed to get lastfm status:", e);
  }
}

if (lastfmUser) {
  lastfmPane.hidden = false;
  updateStatus();
  setInterval(updateStatus, 15000);
}
