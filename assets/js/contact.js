// Contact form: client-side validation + sanitisation.
// The site is static, so the form hands a clean message to the visitor's mail app (mailto).
// If you later add a backend (e.g. a Vercel function), it MUST re-validate everything below
// server-side — client checks are for UX only and can be bypassed.
(function () {
  "use strict";

  var LIMITS = { name: 80, email: 120, company: 120, phone: 20, message: 2000 };
  var SERVICES = ["Safety File compilation", "HIRA / risk assessment", "Fall Protection Plan", "ISO 45001 / IMS audit",
                  "Incident investigation", "Training", "AI-assisted documentation", "Other"];
  var EMAIL_RE = /^[^\s@<>()[\]\\,;:"]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
  var PHONE_RE = /^[+0-9 ()-]{7,20}$/;

  // Remove control chars, angle brackets and collapse whitespace. Output is only ever
  // used as text (textContent / URL-encoded), never as HTML.
  function clean(v, max, multiline) {
    var s = String(v == null ? "" : v);
    s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u2028\u2029]/g, "");
    s = s.replace(/[<>]/g, "");
    s = multiline ? s.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n") : s.replace(/\s+/g, " ");
    return s.trim().slice(0, max);
  }

  function setErr(field, msg) {
    var wrap = field.closest(".field");
    if (!wrap) return;
    var e = wrap.querySelector(".err");
    wrap.classList.toggle("invalid", !!msg);
    field.setAttribute("aria-invalid", msg ? "true" : "false");
    if (e) e.textContent = msg || "";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var status = document.getElementById("form-status");
    var started = Date.now();
    var lastSend = 0;
    var to = form.getAttribute("data-to") || "";

    form.setAttribute("novalidate", "");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      status.className = "form-status";
      status.textContent = "";

      // Bot traps: honeypot filled, or submitted impossibly fast
      var hp = form.querySelector("[name='website']");
      if ((hp && hp.value) || Date.now() - started < 2500) {
        status.className = "form-status bad";
        status.textContent = "Please wait a moment and try again.";
        return;
      }
      if (Date.now() - lastSend < 30000) {
        status.className = "form-status bad";
        status.textContent = "You've just sent a message. Please wait 30 seconds before sending another.";
        return;
      }

      var els = form.elements, f = {};
      ["name","email","company","phone","service","message","consent"].forEach(function (n) { f[n] = els.namedItem(n); });
      var data = {
        name: clean(f.name.value, LIMITS.name),
        email: clean(f.email.value, LIMITS.email).toLowerCase(),
        company: clean(f.company.value, LIMITS.company),
        phone: clean(f.phone.value, LIMITS.phone),
        service: clean(f.service.value, 60),
        message: clean(f.message.value, LIMITS.message, true)
      };

      var ok = true;
      if (data.name.length < 2) { setErr(f.name, "Please enter your name."); ok = false; } else setErr(f.name, "");
      if (!EMAIL_RE.test(data.email)) { setErr(f.email, "Please enter a valid email address."); ok = false; } else setErr(f.email, "");
      if (data.phone && !PHONE_RE.test(data.phone)) { setErr(f.phone, "Digits, spaces, + ( ) - only."); ok = false; } else setErr(f.phone, "");
      if (SERVICES.indexOf(data.service) === -1) { setErr(f.service, "Please choose a service."); ok = false; } else setErr(f.service, "");
      if (data.message.length < 20) { setErr(f.message, "Please give a little more detail (20+ characters)."); ok = false; } else setErr(f.message, "");
      if (!f.consent.checked) { setErr(f.consent, "Consent is required to respond to you (POPIA)."); ok = false; } else setErr(f.consent, "");

      if (!ok) {
        var first = form.querySelector("[aria-invalid='true']");
        if (first) first.focus();
        return;
      }
      if (!EMAIL_RE.test(to)) {
        status.className = "form-status bad";
        status.textContent = "The contact address isn't configured yet.";
        return;
      }

      var body = "Name: " + data.name + "\nEmail: " + data.email +
        (data.company ? "\nCompany: " + data.company : "") +
        (data.phone ? "\nPhone: " + data.phone : "") +
        "\nService: " + data.service + "\n\n" + data.message;
      var subject = "Consultation enquiry: " + data.service;
      var href = "mailto:" + encodeURIComponent(to) + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

      lastSend = Date.now();
      status.className = "form-status ok";
      status.textContent = "Thanks, " + data.name + ". Your email app is opening with your enquiry ready to send.";
      window.location.href = href;
    });

    // Live length counter for the message
    var msg = form.elements.namedItem("message"), counter = document.getElementById("msg-count");
    if (msg && counter) {
      var upd = function () { counter.textContent = msg.value.length + " / " + LIMITS.message; };
      msg.addEventListener("input", upd); upd();
    }
  });
})();
