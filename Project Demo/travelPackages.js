// ===== Travel Packages with Room Type & Total Cost =====

// Data model
class TravelPackage {
  constructor(
    packageID,
    packageName,
    location,
    image,
    description,
    transportCost,
    accommodationCost, // Single room base
    fullBoardCost,
    availability
  ) {
    this.packageID = packageID;
    this.packageName = packageName;
    this.location = location;
    this.image = image;
    this.description = description;
    this.transportCost = transportCost;         // Tk
    this.accommodationCost = accommodationCost; // Tk (Single room base)
    this.fullBoardCost = fullBoardCost;         // Tk
    this.availability = availability;           // seats/slots
  }
}

// NOTE: Keep/adjust the image filenames to match your actual files.
const travelPackages = [
  // Cox's Bazar
  new TravelPackage(1, "Basic",    "Cox's Bazar", "images/coxsbazar.jpg", "Budget beach trip",                 700, 1000, 1800, 10),
  new TravelPackage(2, "Standard", "Cox's Bazar", "images/coxsbazar.jpg", "Comfort beach hotel + activities", 900, 1600, 2000, 12),
  new TravelPackage(3, "Premium",  "Cox's Bazar", "images/coxsbazar.jpg", "Luxury beach resort experience",    1200, 2000, 2300, 10),

  // Sylhet
  new TravelPackage(4, "Basic",    "Sylhet", "images/sylhet.jpg", "Budget tea garden tour",         500, 800, 1300, 20),
  new TravelPackage(5, "Standard", "Sylhet", "images/sylhet.jpg", "Comfort tea garden experience",  700, 1000, 1500, 15),
  new TravelPackage(6, "Premium",  "Sylhet", "images/sylhet.jpg", "Luxury Sylhet resort stay",      900, 1200, 1700, 10),

  // Bandarban (adjust filename if yours differs)
  new TravelPackage(7, "Basic",    "Bandarban", "images/bandarbann.jpg", "Budget hill trip",   500, 800, 1200, 20),
  new TravelPackage(8, "Standard", "Bandarban", "images/bandarbann.jpg", "Comfort hill tour",  700, 1000, 1500, 15),
  new TravelPackage(9, "Premium",  "Bandarban", "images/bandarbann.jpg", "Luxury hill resort", 900, 1200, 1700, 18),

  // Rangamati (adjust filename if yours differs)
  new TravelPackage(10, "Basic",   "Rangamati", "images/rangamatii.jpg", "Budget lake tour",   300, 800, 900, 10),
  new TravelPackage(11, "Standard","Rangamati", "images/rangamatii.jpg", "Comfort lake stay",  400, 900, 1200, 15),
  new TravelPackage(12, "Premium", "Rangamati", "images/rangamatii.jpg", "Luxury lake resort", 500, 1100, 1400, 5),

  // Tanguar Haor
  new TravelPackage(13, "Basic",   "Tanguar Haor", "images/tanguar.jpg", "Budget haor boat tour",     700, 900, 1800, 18),
  new TravelPackage(14, "Standard","Tanguar Haor", "images/tanguar.jpg", "Comfort haor experience",   900, 1300, 2000, 12),
  new TravelPackage(15, "Premium", "Tanguar Haor", "images/tanguar.jpg", "Luxury haor cruise & stay", 1000, 1700, 2200, 7),
];

// ---- Room price multipliers ----
// Single = 1.0; Double = 1.5; Family = 2.25 (1.5× Double).
// If you prefer Family to also be 1.5×, change family: 1.5.
const ROOM_MULTIPLIERS = { single: 1.0, double: 1.5, family: 2 };

// ---- LocalStorage helpers ----
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem("currentUser")); } catch { return null; }
}
function getBookings() {
  try { return JSON.parse(localStorage.getItem("bookings")) || []; } catch { return []; }
}
function saveBookings(list) {
  localStorage.setItem("bookings", JSON.stringify(list));
}

// ---- Render ----
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

function renderDetails(pkg, detailsContainer) {
  const baseAccText = `Accommodation (Single room base): ${pkg.accommodationCost} Tk`;

  detailsContainer.innerHTML = `
    <div class="package-top">
      <img class="package-image" src="${pkg.image}" alt="${pkg.location} - ${pkg.packageName}">
      <div class="package-info">
        <span><i class="fas fa-info-circle"></i> ${pkg.description}</span>
        <span><i class="fas fa-bus"></i> Transport: ${pkg.transportCost} Tk</span>
        <span><i class="fas fa-hotel"></i> ${baseAccText}</span>
        <span><i class="fas fa-utensils"></i> Full Board: ${pkg.fullBoardCost} Tk</span>
        <span>Availability: <strong class="${pkg.availability <= 5 ? "low-availability" : ""}">${pkg.availability}</strong></span>
      </div>
    </div>

    <div class="room-type" role="group" aria-label="Room type">
      <strong>Room type:</strong>
      <label><input type="radio" name="room-${pkg.packageID}" value="single" checked> Single</label>
      <label><input type="radio" name="room-${pkg.packageID}" value="double"> Double </label>
      <label><input type="radio" name="room-${pkg.packageID}" value="family"> Family </label>
    </div>
    <div class="room-type-note">
      Single room: 1 person • Double room: 2 persons • Family room: 3–4 persons
    </div>

    <div class="total-cost" id="total-${pkg.packageID}">Total: —</div>

    <button class="book-btn" id="book-${pkg.packageID}">Book Now</button>
  `;

  const totalEl = detailsContainer.querySelector(`#total-${pkg.packageID}`);
  const radios = detailsContainer.querySelectorAll(`input[name="room-${pkg.packageID}"]`);
  const bookBtn = detailsContainer.querySelector(`#book-${pkg.packageID}`);

  function calcTotal(roomType) {
    const multiplier = ROOM_MULTIPLIERS[roomType] || 1;
    const acc = Math.round(pkg.accommodationCost * multiplier);
    const total = pkg.transportCost + acc + pkg.fullBoardCost;
    return { total, acc };
  }

  function updateTotal() {
    const selected = detailsContainer.querySelector(`input[name="room-${pkg.packageID}"]:checked`)?.value || "single";
    const { total } = calcTotal(selected);
    totalEl.textContent = `Total: ${total} Tk`;
  }

  radios.forEach(r => r.addEventListener("change", updateTotal));
  updateTotal();

  bookBtn.addEventListener("click", () => {
    const selected = detailsContainer.querySelector(`input[name="room-${pkg.packageID}"]:checked`)?.value || "single";
    const { total } = calcTotal(selected);
    bookPackage(pkg.packageID, selected, total);
  });
}

// ---- Booking (persists to localStorage and updates availability) ----
function bookPackage(id, roomType = "single", totalCost = null) {
  const pkg = travelPackages.find(p => p.packageID === id);
  if (!pkg) return;

  if (pkg.availability <= 0) {
    alert("Sorry, fully booked!");
    return;
  }

  const user = getCurrentUser();
  if (!user) {
    if (confirm("You need to sign in to book. Go to Sign In now?")) {
      window.location.href = "user.html?mode=signin";
    }
    return;
  }

  const bookings = getBookings();
  bookings.push({
    id: Date.now(),
    packageID: pkg.packageID,
    email: user.email,
    roomType,
    totalCost:
      totalCost !== null
        ? totalCost
        : pkg.transportCost + pkg.accommodationCost + pkg.fullBoardCost,
    time: Date.now(),
  });
  saveBookings(bookings);

  pkg.availability -= 1;

  alert(`You booked ${pkg.packageName} in ${pkg.location}!`);
  renderLocations();
}

// ---- Booking (persists to localStorage and updates availability) ----
function bookPackage(id, roomType = "single", totalCost = null) {
  const pkg = travelPackages.find(p => p.packageID === id);
  if (!pkg) return;

  const user = getCurrentUser();
  if (!user) {
    if (confirm("You need to sign in to book. Go to Sign In now?")) {
      window.location.href = "user.html?mode=signin";
    }
    return;
  }

  // Save selected package temporarily in localStorage
  const bookingData = {
    packageID: pkg.packageID,
    location: pkg.location,
    packageName: pkg.packageName,
    transportCost: pkg.transportCost,
    accommodationCost: pkg.accommodationCost,
    fullBoardCost: pkg.fullBoardCost,
    roomType,
    baseTotal:
      totalCost !== null
        ? totalCost
        : pkg.transportCost + pkg.accommodationCost + pkg.fullBoardCost,
  };

  localStorage.setItem("pendingBooking", JSON.stringify(bookingData));

  // Redirect to booking.html
  window.location.href = "booking.html";
}
// Initial render
renderLocations();




