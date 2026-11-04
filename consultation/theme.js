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
