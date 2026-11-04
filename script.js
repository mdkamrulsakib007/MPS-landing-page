(function(){
    'use strict';
    
    var inputIds=['price','landed','fba','referral','ads','other','units'];
    var usd=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
    var usdc=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2});
    function number(id){var el=document.getElementById(id);var n=Number(el.value);return Number.isFinite(n)?Math.max(0,n):0;}
    function updateEconomics(){
      var price=number('price'),landed=number('landed'),fba=number('fba'),referral=Math.min(100,number('referral'))/100,ads=number('ads'),other=number('other'),units=Math.min(1000000,Math.floor(number('units')));
      var unitcost=landed+fba+(price*referral)+ads+other;
      var contrib=price-unitcost,revenue=price*units,cost=unitcost*units,monthly=contrib*units,margin=price>0?100*contrib/price:0;
      document.getElementById('monthly').textContent=usd.format(monthly);
      document.getElementById('monthly').classList.toggle('negative',monthly<0);
      document.getElementById('perunit').textContent=usdc.format(contrib)+' per unit · '+margin.toFixed(1)+'% contribution margin';
      document.getElementById('revenue').textContent=usd.format(revenue);
      document.getElementById('unitcost').textContent=usdc.format(unitcost);
      document.getElementById('totalcost').textContent=usd.format(cost);
      var contributionShare=price>0?Math.min(100,Math.max(0,margin)):0;
      document.getElementById('costbar').style.width=(100-contributionShare)+'%';
      document.getElementById('contribbar').style.width=contributionShare+'%';
      document.getElementById('stackbar').setAttribute('aria-label',contributionShare.toFixed(1)+'% contribution, balance variable costs; if contribution is negative, losses are not represented by the bar');
    }
    inputIds.forEach(function(id){document.getElementById(id).addEventListener('input',updateEconomics);});updateEconomics();
  })();
  function closeMenu(){var menu=document.getElementById('mobile-menu'),btn=document.getElementById('menu-btn');menu.classList.remove('open');btn.setAttribute('aria-expanded','false');btn.textContent='☰';}
  function toggleMenu(){var menu=document.getElementById('mobile-menu'),btn=document.getElementById('menu-btn');var open=menu.classList.toggle('open');btn.setAttribute('aria-expanded',String(open));btn.textContent=open?'×':'☰';}

  
  



/* ============================================
   AREA71 FOOTER JAVASCRIPT
============================================ */

(function () {

  function initializeArea71Footer() {

    const yearElement = document.getElementById(
      "a71-footer-year"
    );

    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }

  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeArea71Footer,
      { once: true }
    );
  } else {
    initializeArea71Footer();
  }

})();


/* ============================================
   AREA71 YOUTUBE VIDEO SHOWCASE
============================================ */

(function () {
  "use strict";

  const videoCards = document.querySelectorAll(
    ".a71-video-card[data-youtube]"
  );

  if (!videoCards.length) return;

  let activeVideo = null;

  // Extract a valid YouTube video ID from a URL
  function getYouTubeId(value) {
    if (!value || !value.trim()) return null;

    try {
      const url = new URL(value.trim());
      const host = url.hostname
        .toLowerCase()
        .replace(/^www\./, "");

      let id = null;

      if (host === "youtu.be") {
        id = url.pathname.split("/")[1];

      } else if (
        [
          "youtube.com",
          "m.youtube.com",
          "music.youtube.com",
          "youtube-nocookie.com"
        ].includes(host)
      ) {
        const parts = url.pathname.split("/");

        if (url.pathname === "/watch") {
          id = url.searchParams.get("v");

        } else if (
          ["embed", "shorts", "live"].includes(parts[1])
        ) {
          id = parts[2];
        }
      }

      return /^[a-zA-Z0-9_-]{11}$/.test(id || "")
        ? id
        : null;

    } catch (error) {
      return null;
    }
  }

  videoCards.forEach(function (card) {
    const url = card.dataset.youtube;
    const videoId = getYouTubeId(url);

    // Leave cards with empty or invalid URLs disabled
    if (!videoId) return;

    const trigger = card.querySelector(
      ".a71-video-trigger"
    );

    const poster = card.querySelector(
      ".a71-video-poster"
    );

    const title = card.querySelector(
      ".a71-video-details h3"
    ).textContent.trim();

    // Enable card and display thumbnail
    card.classList.add("is-ready");
    trigger.disabled = false;
    trigger.setAttribute("aria-label", "Play " + title);

    poster.src =
      "https://i.ytimg.com/vi/" +
      videoId +
      "/hqdefault.jpg";

    // Hide broken thumbnails, if any
    poster.addEventListener("error", function () {
      poster.style.display = "none";
    });

    trigger.addEventListener("click", function () {

      // Stop the previously playing video
      if (activeVideo && activeVideo.card !== card) {
        activeVideo.iframe.replaceWith(
          activeVideo.trigger
        );
      }

      // Create embedded player on demand
      const iframe = document.createElement("iframe");

      iframe.src =
        "https://www.youtube-nocookie.com/embed/" +
        videoId +
        "?autoplay=1&rel=0";

      iframe.title = title;

      iframe.allow =
        "accelerometer; autoplay; clipboard-write; " +
        "encrypted-media; gyroscope; picture-in-picture; " +
        "web-share";

      iframe.referrerPolicy =
        "strict-origin-when-cross-origin";

      iframe.allowFullscreen = true;

      trigger.replaceWith(iframe);

      activeVideo = {
        card: card,
        iframe: iframe,
        trigger: trigger
      };
    });
  });

})();



/* ============================================
   CASE STUDIES NAVIGATION
============================================ */

(function () {
  "use strict";

  function initCaseStudiesNav() {
    const videoSection = document.getElementById(
      "area71-videos"
    );

    const navLinks = document.querySelectorAll(
      '.nav a[href="#area71-videos"]'
    );

    if (!videoSection || !navLinks.length) return;
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      function (entries) {
        const isVisible = entries[0].isIntersecting;

        navLinks.forEach(function (link) {
          if (isVisible) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      },
      {
        rootMargin: "-90px 0px -55% 0px",
        threshold: 0
      }
    );

    observer.observe(videoSection);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initCaseStudiesNav,
      { once: true }
    );
  } else {
    initCaseStudiesNav();
  }
})();



/* ============================================
   AREA71 MPS - EMBEDDED LEAD FORM
  
============================================ */
(function () {
  "use strict";

  const form = document.getElementById("mps-lead-form");
  const status = document.getElementById("mps-lead-status");
  const submit = form && form.querySelector('button[type="submit"]');
  if (!form || !status || !submit) return;

  // Show a free-form dialing-code field if visitor selects "Other".
  const codePreset = form.querySelector("#a71-lead-phone-code");
  const customCode = form.querySelector("#a71-lead-custom-code");
  const customCodeWrap = form.querySelector("#a71-lead-custom-code-wrap");

  function updateCountryCodeInput() {
    const isOther = codePreset.value === "other";
    customCodeWrap.hidden = !isOther;
    customCode.disabled = !isOther;
    customCode.required = isOther;
    if (!isOther) customCode.value = "";
  }

  codePreset.addEventListener("change", updateCountryCodeInput);
  updateCountryCodeInput();

  // All former Google Form CTAs must now use href="#mps-consultation".
  document.querySelectorAll('a[href="#mps-consultation"]').forEach(link => {
    link.removeAttribute("target");
    link.removeAttribute("rel");
    link.addEventListener("click", function () {
      if (link.closest("#mobile-menu") && typeof closeMenu === "function") {
        closeMenu();
      }
      // CTA clicks are a separate event, NOT a completed lead.
      if (typeof window.fbq === "function") {
        window.fbq("trackCustom", "MPSConsultationClick", {
          content_name: "Area71 MPS Consultation"
        });
      }
    });
  });

  let sending = false;
  let submissionId = null;

  function showStatus(message, type) {
    status.textContent = message;
    status.className = "a71-lead-status" + (type ? " is-" + type : "");
  }

  function getSubmissionId() {
    if (!submissionId) {
      submissionId = window.crypto && window.crypto.randomUUID
        ? window.crypto.randomUUID()
        : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
    }
    return submissionId;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;

    const fields = new FormData(form);
    const selectedCode = String(fields.get("phoneCodePreset") || "");
    const phoneCountryCode = selectedCode === "other"
      ? String(fields.get("phoneCodeCustom") || "").trim()
      : selectedCode;

    if (!/^\+[1-9][0-9]{0,3}$/.test(phoneCountryCode)) {
      showStatus("Please choose a valid phone country code (e.g. +880).", "error");
      if (selectedCode === "other") customCode.focus();
      return;
    }

    const payload = {
      submissionId: getSubmissionId(),
      fullName: String(fields.get("fullName") || "").trim(),
      phone: String(fields.get("phone") || "").trim(),
      phoneCountryCode,
      email: String(fields.get("email") || "").trim(),
      residenceCountry: String(fields.get("residenceCountry") || "").trim(),
      preferredCallTime: String(fields.get("preferredCallTime") || "").trim(),
      profession: String(fields.get("profession") || "").trim(),
      interest: String(fields.get("interest") || "").trim(),
      message: String(fields.get("message") || "").trim(),
      website: String(fields.get("website") || ""),
      consent: fields.get("consent") === "yes"
    };

    sending = true;
    submit.disabled = true;
    const originalLabel = submit.querySelector(".a71-lead-submit-text");
    if (originalLabel) originalLabel.textContent = "Submitting...";
    showStatus("Saving your request...", "");

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) {
        throw new Error(result.message || "Could not confirm save");
      }

      // One Meta standard Lead only after confirmed spreadsheet save.
      if (typeof window.fbq === "function") {
        window.fbq("track", "Lead", {
          content_name: "Area71 MPS Consultation",
          content_category: "MPS"
        });
      }
      form.reset();
      updateCountryCodeInput();
      submissionId = null;
      showStatus("Thank you! Your request was received. Our MPS team will contact you.", "success");
    } catch (error) {
      console.error("Area71 lead submission failed:", error);
      showStatus("We couldn't confirm your request was saved. Please try again.", "error");
      // Keep form contents and submissionId for a safe retry.
    } finally {
      sending = false;
      submit.disabled = false;
      if (originalLabel) originalLabel.textContent = "Submit consultation request";
    }
  });
})();



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

