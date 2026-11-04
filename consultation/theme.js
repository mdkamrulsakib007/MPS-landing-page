/* ============================================
   AREA71 MPS - THEME CONTROL
============================================ */
(function () {
  "use strict";

  const root = document.documentElement;
  const button = document.getElementById("theme-toggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const storageKey = "a71-theme";

  if (!button) return;

  function syncThemeUI() {
    const dark = root.dataset.theme === "dark";
    const label = dark ? "Switch to light mode" : "Switch to dark mode";

    button.setAttribute("aria-pressed", String(dark));
    button.setAttribute("aria-label", label);
    button.title = label;

    root.style.colorScheme = dark ? "dark" : "light";
    if (themeMeta) themeMeta.content = dark ? "#0c1b16" : "#ffffff";
  }

  button.addEventListener("click", function () {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;

    try {
      localStorage.setItem(storageKey, nextTheme);
    } catch (error) {
      // Toggle remains usable if browser storage is unavailable.
    }

    syncThemeUI();
  });

  const systemPreference = window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

  function followSystemPreference(event) {
    let savedTheme;
    try {
      savedTheme = localStorage.getItem(storageKey);
    } catch (error) {}

    if (savedTheme === "dark" || savedTheme === "light") return;
    root.dataset.theme = event.matches ? "dark" : "light";
    syncThemeUI();
  }

  if (systemPreference) {
    if (systemPreference.addEventListener) {
      systemPreference.addEventListener("change", followSystemPreference);
    } else if (systemPreference.addListener) {
      systemPreference.addListener(followSystemPreference);
    }
  }

  syncThemeUI();
})();



/* ================================================
   AREA71 - HERO VIDEO PLAYER
================================================ */

(function () {
  "use strict";

  const player = document.getElementById("a71-hero-player");
  if (!player) return;

  const video = document.getElementById("a71-hero-video");
  const start = document.getElementById("a71-hero-start");
  const controls = document.getElementById("a71-hero-controls");

  const toggle = document.getElementById("a71-hero-toggle");
  const seek = document.getElementById("a71-hero-seek");
  const time = document.getElementById("a71-hero-time");
  const mute = document.getElementById("a71-hero-mute");
  const volume = document.getElementById("a71-hero-volume");
  const speed = document.getElementById("a71-hero-speed");
  const fullscreen = document.getElementById("a71-hero-fullscreen");
  const errorMessage = document.getElementById("a71-hero-error");

  let hasStarted = false;

  // Custom controls are enabled only when JS is ready.
  video.controls = false;
  start.hidden = false;
  controls.hidden = false;

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";

    const total = Math.floor(seconds);
    const minutes = Math.floor(total / 60);
    const secs = String(total % 60).padStart(2, "0");

    return minutes + ":" + secs;
  }

  function syncProgress() {
    const duration = video.duration;

    if (Number.isFinite(duration) && duration > 0) {
      seek.value = String(100 * video.currentTime / duration);
    }

    time.textContent =
      formatTime(video.currentTime) + " / " +
      formatTime(Number.isFinite(duration) ? duration : 531);
  }

  function syncPlayback() {
    const paused = video.paused;

    toggle.textContent = paused ? "▶" : "❚❚";
    toggle.setAttribute(
      "aria-label",
      paused ? "Play video" : "Pause video"
    );

    start.hidden = hasStarted && !video.ended;
  }

  async function togglePlayback() {
    if (video.paused) {
      try {
        errorMessage.hidden = true;
        await video.play();
        hasStarted = true;
      } catch (error) {
        errorMessage.hidden = false;
        console.error("MPS video playback failed:", error);
      }
    } else {
      video.pause();
    }

    syncPlayback();
  }

  start.addEventListener("click", togglePlayback);
  toggle.addEventListener("click", togglePlayback);

  video.addEventListener("play", function () {
    hasStarted = true;
    syncPlayback();
  });

  video.addEventListener("pause", syncPlayback);
  video.addEventListener("ended", syncPlayback);
  video.addEventListener("timeupdate", syncProgress);
  video.addEventListener("loadedmetadata", syncProgress);

  video.addEventListener("error", function () {
    errorMessage.hidden = false;
  });

  seek.addEventListener("input", function () {
    if (Number.isFinite(video.duration) && video.duration > 0) {
      video.currentTime =
        (Number(seek.value) / 100) * video.duration;
    }
  });

  speed.addEventListener("change", function () {
    video.playbackRate = Number(speed.value);
  });

  function syncVolume() {
    const isMuted = video.muted || video.volume === 0;

    mute.textContent = isMuted ? "🔇" : "🔊";
    mute.setAttribute(
      "aria-label",
      isMuted ? "Unmute video" : "Mute video"
    );
  }

  mute.addEventListener("click", function () {
    video.muted = !video.muted;
    syncVolume();
  });

  volume.addEventListener("input", function () {
    video.volume = Number(volume.value);
    video.muted = video.volume === 0;
    syncVolume();
  });

  fullscreen.addEventListener("click", async function () {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (player.requestFullscreen) {
        await player.requestFullscreen();
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    } catch (error) {
      console.error("Video fullscreen unavailable:", error);
    }
  });

  syncPlayback();
  syncProgress();
  syncVolume();
})();
