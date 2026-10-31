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
   AREA71 MPS - META PIXEL CTA TRACKING
============================================ */

(function () {
  "use strict";

  const consultationLinks = document.querySelectorAll(
    'a[href^="https://area71academy.com/managed-product-service-schedule-form/"]'
  );

  consultationLinks.forEach(function (link) {
    link.addEventListener("click", function () {

      if (typeof window.fbq === "function") {
        window.fbq(
          "trackCustom",
          "MPSConsultationClick",
          {
            content_name: "Area71 MPS Consultation"
          }
        );
      }

    });
  });

})();


