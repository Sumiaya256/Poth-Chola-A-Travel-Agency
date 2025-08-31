// --------------------- Helpers ---------------------
function getPartnerApps() {
  return JSON.parse(localStorage.getItem("partnerApplications")) || [];
}
function savePartnerApps(arr) {
  localStorage.setItem("partnerApplications", JSON.stringify(arr));
}

// --------------------- Application Form ---------------------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("applyPartnerForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const app = {
        org: document.getElementById("a_org").value,
        type: document.getElementById("a_type").value,
        location: document.getElementById("a_location").value,
        contact: document.getElementById("a_contact").value,
        email: document.getElementById("a_email").value,
        phone: document.getElementById("a_phone").value,
        services: document.getElementById("a_services").value,
        desc: document.getElementById("a_desc").value,
        status: "pending",
        submittedAt: new Date().toISOString()
      };

      const apps = getPartnerApps();
      apps.push(app);
      savePartnerApps(apps);

      document.getElementById("applyMsg").textContent = "✅ Application submitted!";
      form.reset();
    });
  }
});

// --------------------- Admin Panel ---------------------
function renderPartnersAdmin() {
  const tbody = document.getElementById("partnersTbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const apps = getPartnerApps();
  apps.forEach((app, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${app.org}</td>
      <td>${app.type}</td>
      <td>${app.location}</td>
      <td>${app.contact}</td>
      <td>${app.email}</td>
      <td>${app.phone}</td>
      <td>${app.services}</td>
      <td>${app.status}</td>
      <td>
        <button class="btn primary" onclick="approvePartner(${idx})">Approve</button>
        <button class="btn danger" onclick="rejectPartner(${idx})">Reject</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function approvePartner(i) {
  const apps = getPartnerApps();
  apps[i].status = "approved";
  savePartnerApps(apps);
  renderPartnersAdmin();
}

function rejectPartner(i) {
  const apps = getPartnerApps();
  apps[i].status = "rejected";
  savePartnerApps(apps);
  renderPartnersAdmin();
}

document.addEventListener("DOMContentLoaded", renderPartnersAdmin);
