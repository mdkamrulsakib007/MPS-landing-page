/* ============================================
   AREA71 MPS - STANDALONE CONSULTATION FORM
  
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

      // Mark the thank-you destination only AFTER the backend confirms save.
      // We store only an opaque ID and timestamp (no name, phone or email).
      try {
        sessionStorage.setItem("a71-mps-lead-confirmed-v1", JSON.stringify({
          id: payload.submissionId,
          savedAt: Date.now(),
          viewed: false
        }));
      } catch (storageError) {
        // In restricted browsers, still show the honest saved confirmation.
        form.reset();
        updateCountryCodeInput();
        submissionId = null;
        showStatus("Thank you! Your request was saved. Our MPS team will contact you.", "success");
        return;
      }
      window.location.replace("/thank-you/");
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
