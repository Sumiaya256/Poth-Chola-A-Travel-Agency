// Partner Page – download-gated form
(function () {
  const form = document.querySelector(".partner-form");
  if (!form) return;

  // 🔗 Update to your downloadable file path if needed:
  const DOWNLOAD_URL = "partner-kit.pdf"; // e.g., /assets/partner-kit.pdf

  // Fields from partner.html
  const nameBiz = document.getElementById("business-name");
  const nameContact = document.getElementById("contact-name");
  const email = document.getElementById("email");
  const type = document.getElementById("service-type");

  // Success banner
  const banner = document.createElement("div");
  banner.className = "success-banner";
  banner.textContent = "✅ Thanks! Your download should begin automatically.";
  form.parentElement.insertBefore(banner, form);

  // Smooth anchor scroll (optional)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      if (id.length > 1) {
        e.preventDefault();
        document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Validation helpers
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const required = el => (el.value || "").trim().length > 0;
  const fields = [nameBiz, nameContact, email, type];
  function mark(el, ok) { el.classList.toggle("input-error", !ok); }

  function validate() {
    const v1 = required(nameBiz);
    const v2 = required(nameContact);
    const v3 = isEmail(email.value || "");
    const v4 = required(type);
    mark(nameBiz, v1); mark(nameContact, v2); mark(email, v3); mark(type, v4);
    return v1 && v2 && v3 && v4;
  }

  fields.forEach(el => el.addEventListener("input", validate));

  // LocalStorage bucket
  const LS_KEY = "pothchola_partner_apps";
  const loadApps = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; } };
  const saveApps = list => localStorage.setItem(LS_KEY, JSON.stringify(list));

  // Disable/enable submit UX
  const submitBtn = form.querySelector('button[type="submit"], .btn[type="submit"]') || form.querySelector(".btn");
  function setBusy(busy) {
    if (!submitBtn) return;
    submitBtn.disabled = busy;
    submitBtn.dataset.loading = busy ? "1" : "0";
  }

  // Trigger a file download safely
  function triggerDownload(url) {
    const a = document.createElement("a");
    a.href = url;
    a.download = "";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!validate()) return;

    setBusy(true);

    // Save submission
    const app = {
      id: Date.now(),
      businessName: nameBiz.value.trim(),
      contactName: nameContact.value.trim(),
      email: email.value.trim(),
      serviceType: type.value,
      submittedAt: Date.now()
    };
    const list = loadApps();
    list.push(app);
    saveApps(list);

    // Clear form + show success
    form.reset();
    banner.style.display = "block";

    try {
      const ok = await fetch(DOWNLOAD_URL, { method: "HEAD" }).then(r => r.ok).catch(() => false);
      triggerDownload(DOWNLOAD_URL);
      if (!ok) { /* Optional: show a note if file missing */ }
    } catch {
      triggerDownload(DOWNLOAD_URL);
    } finally {
      setTimeout(() => { banner.style.display = "none"; }, 5000);
      setBusy(false);
    }
  });
})();