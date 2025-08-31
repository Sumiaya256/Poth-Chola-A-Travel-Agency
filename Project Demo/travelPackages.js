
class TravelPackage {
  constructor(
    packageID,
    packageName,
    location,
    image,
    description,
    transportCost,         
    accommodationCost,     
    fullBoardCost,         
    availability
  ) {
    this.packageID = packageID;
    this.packageName = packageName;
    this.location = location;
    this.image = image;
    this.description = description;
    this.transportCost = transportCost;
    this.accommodationCost = accommodationCost;
    this.fullBoardCost = fullBoardCost;
    this.availability = availability;
  }
}


const travelPackages = [
  
  new TravelPackage(1, "Basic",    "Cox's Bazar", "images/coxsbazar.jpg", "Budget beach trip",                  700, 1000, 1800, 10),
  new TravelPackage(2, "Standard", "Cox's Bazar", "images/coxsbazar.jpg", "Comfort beach hotel + activities",   900, 1600, 2000, 12),
  new TravelPackage(3, "Premium",  "Cox's Bazar", "images/coxsbazar.jpg", "Luxury beach resort experience",    1200, 2000, 2300, 10),

  
  new TravelPackage(4, "Basic",    "Sylhet", "images/sylhet.jpg", "Budget tea garden tour",         500,  800, 1300, 20),
  new TravelPackage(5, "Standard", "Sylhet", "images/sylhet.jpg", "Comfort tea garden experience",  700, 1000, 1500, 15),
  new TravelPackage(6, "Premium",  "Sylhet", "images/sylhet.jpg", "Luxury Sylhet resort stay",      900, 1200, 1700, 10),

  // Bandarban
  new TravelPackage(7, "Basic",    "Bandarban", "images/bandarbann.jpg", "Budget hill trip",    500,  800, 1200, 20),
  new TravelPackage(8, "Standard", "Bandarban", "images/bandarbann.jpg", "Comfort hill tour",   700, 1000, 1500, 15),
  new TravelPackage(9, "Premium",  "Bandarban", "images/bandarbann.jpg", "Luxury hill resort",  900, 1200, 1700, 18),

  // Rangamati
  new TravelPackage(10, "Basic",   "Rangamati", "images/rangamatii.jpg", "Budget lake tour",    300,  800,  900, 10),
  new TravelPackage(11, "Standard","Rangamati", "images/rangamatii.jpg", "Comfort lake stay",   400,  900, 1200, 15),
  new TravelPackage(12, "Premium", "Rangamati", "images/rangamatii.jpg", "Luxury lake resort",  500, 1100, 1400,  5),

  // Tanguar Haor
  new TravelPackage(13, "Basic",   "Tanguar Haor", "images/tanguar.jpg", "Budget haor boat tour",       700,  900, 1800, 18),
  new TravelPackage(14, "Standard","Tanguar Haor", "images/tanguar.jpg", "Comfort haor experience",     900, 1300, 2000, 12),
  new TravelPackage(15, "Premium", "Tanguar Haor", "images/tanguar.jpg", "Luxury haor cruise & stay",  1000, 1700, 2200,  7),
];


window.travelPackages = travelPackages;


function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem("currentUser")); } catch { return null; }
}


const container = document.getElementById("locations-container");

function groupByLocation(arr) {
  const map = {};
  arr.forEach(p => (map[p.location] = map[p.location] || []).push(p));
  Object.values(map).forEach(list => {
    const order = { Basic: 1, Standard: 2, Premium: 3 };
    list.sort((a, b) => (order[a.packageName] || 99) - (order[b.packageName] || 99));
  });
  return map;
}

function renderLocations() {
  if (!container) return;
  const grouped = groupByLocation(travelPackages);
  container.innerHTML = "";

  Object.keys(grouped).forEach(location => {
    const list = grouped[location];

    const card = document.createElement("div");
    card.className = "location-card";

    const title = document.createElement("h2");
    title.textContent = location;
    card.appendChild(title);

    const tabs = document.createElement("div");
    tabs.className = "package-tabs";

    const details = document.createElement("div");
    details.className = "package-details";

    list.forEach(pkg => {
      const btn = document.createElement("button");
      btn.textContent = pkg.packageName;
      btn.addEventListener("click", () => {
        tabs.querySelectorAll("button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderDetails(pkg, details);
      });
      tabs.appendChild(btn);
    });

    card.appendChild(tabs);
    card.appendChild(details);
    container.appendChild(card);

    // Auto-open first package
    const firstBtn = tabs.querySelector("button");
    if (firstBtn) firstBtn.click();
  });
}

function renderDetails(pkg, el) {
  // Room rates from Single base:
  const base = pkg.accommodationCost;
  const singleRate = Math.round(base * 1.0);
  const doubleRate = Math.round(base * 1.5);
  const familyRate = Math.round(base * 2.25); // capacity 3–4

  el.innerHTML = `
    <!-- Image -->
    <img class="package-image" src="${pkg.image}" alt="${pkg.location} - ${pkg.packageName}">

    <!-- Centered title/description -->
    <div class="pkg-title">
      <div class="pkg-name">${pkg.location} — ${pkg.packageName}</div>
      <div class="pkg-desc">${pkg.description}</div>
      <div class="pkg-meta">Availability:
        <strong class="${pkg.availability <= 5 ? "low-availability" : ""}">${pkg.availability}</strong>
      </div>
    </div>

    <!-- Transport -->
    <div class="info-section">
      <h4>Transport <span class="cost-line">• ${pkg.transportCost} Tk per person</span></h4>
      <ul class="info-list">
        <li>Seat-in-coach transport with verified & licensed drivers</li>
        <li><strong>Starting from stand and dropping at the stand</strong> (clear pickup & drop points)</li>
        <li>Standard & Premium generally include A/C transport</li>
        <li>Emergency hotline during the travel window</li>
      </ul>
    </div>

    <!-- Room types & rates -->
    <div class="rates">
      <h4>Room Types & Rates (per room)</h4>
      <table class="rate-table">
        <tr><th>Type</th><th>Capacity</th><th>Rate</th></tr>
        <tr><td>Single</td><td>1 person</td><td>${singleRate} Tk</td></tr>
        <tr><td>Double</td><td>2 persons</td><td>${doubleRate} Tk</td></tr>
        <tr><td>Family</td><td>3–4 persons</td><td>${familyRate} Tk</td></tr>
      </table>
      <p class="tiny-note">Single for 1 person • Double for 2 persons • Family for 3–4 persons (max).</p>
    </div>

    <!-- Full board -->
    <div class="info-section">
      <h4>Full Board <span class="cost-line">• ${pkg.fullBoardCost} Tk per person</span></h4>
      <ul class="info-list">
        <li><strong>3 meals per day</strong> (breakfast, lunch, dinner)</li>
        <li>Snacks/tea provided</li>
        <li>Hygiene and food safety maintained with vetted partners</li>
      </ul>
    </div>

    <button class="book-btn" id="book-${pkg.packageID}">Book</button>
  `;

  // Book → booking.html
  el.querySelector(`#book-${pkg.packageID}`).addEventListener("click", () => {
    const user = getCurrentUser();
    if (!user) {
      if (confirm("You need to sign in to book. Go to Sign In now?")) {
        window.location.href = "user.html?mode=signin";
      }
      return;
    }
    const bookingData = {
      packageID: pkg.packageID,
      location: pkg.location,
      packageName: pkg.packageName,
      transportPerPerson: pkg.transportCost,
      accommodationPerRoomSingleBase: pkg.accommodationCost,
      fullBoardPerPerson: pkg.fullBoardCost,
      image: pkg.image
    };
    localStorage.setItem("pendingBooking", JSON.stringify(bookingData));
    window.location.href = "booking.html";
  });
}

// Init
renderLocations();



