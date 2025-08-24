// ---------- LocalStorage helpers ----------
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}
function saveUsers(arr) {
  localStorage.setItem("users", JSON.stringify(arr));
}
function setCurrentUser(u) {
  localStorage.setItem("currentUser", JSON.stringify(u));
}
function clearCurrentUser() {
  localStorage.removeItem("currentUser");
}

function getBookings() {
  // [{id, packageID, email, time}]
  return JSON.parse(localStorage.getItem("bookings")) || [];
}
function saveBookings(arr) {
  localStorage.setItem("bookings", JSON.stringify(arr));
}

function getAllReviews() {
  // Your reviews page uses this key
  // [{rating, name, text, date, ...}]
  return JSON.parse(localStorage.getItem("reviews")) || [];
}

// ---------- DOM ----------
const logoutBtn = document.getElementById("logoutBtn");
const guardMessage = document.getElementById("guardMessage");

// Profile form
const profileForm = document.getElementById("profileForm");
const pfName = document.getElementById("pfName");
const pfEmail = document.getElementById("pfEmail");
const pfMobile = document.getElementById("pfMobile");
const pfNationality = document.getElementById("pfNationality");
const saveStatus = document.getElementById("saveStatus");

// Bookings
const bookingsList = document.getElementById("bookingsList");
const noBookings = document.getElementById("noBookings");

// My reviews preview
const myReviewsList = document.getElementById("myReviewsList");
const noMyReviews = document.getElementById("noMyReviews");
const openReviewsBtn = document.getElementById("openReviewsBtn");

// ---------- Guard (require login) ----------
let currentUser = getCurrentUser();
if (!currentUser) {
  guardMessage.style.display = "block";
  guardMessage.textContent = "You must be signed in to view your profile. Redirecting to Sign In…";
  setTimeout(() => (window.location.href = "user.html?mode=signin"), 900);
}

// ---------- Fill profile form ----------
function hydrateProfile() {
  pfName.value = currentUser.fullName || "";
  pfEmail.value = currentUser.email || "";
  pfMobile.value = currentUser.mobileNumber || "";
  pfNationality.value = currentUser.nationality || "";
}
hydrateProfile();

// ---------- Save profile changes ----------
profileForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newName = pfName.value.trim();
  const newEmail = pfEmail.value.trim().toLowerCase();
  const newMobile = pfMobile.value.trim();
  const newNat = pfNationality.value.trim();

  if (newName.length < 3) {
    saveStatus.textContent = "Name must be at least 3 characters.";
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    saveStatus.textContent = "Invalid email.";
    return;
  }

  // Update in users list
  const users = getUsers();
  const idx = users.findIndex(u => u.userID === currentUser.userID);
  if (idx !== -1) {
    users[idx].fullName = newName;
    users[idx].email = newEmail;
    users[idx].mobileNumber = newMobile;
    users[idx].nationality = newNat;
    saveUsers(users);
  }

  // Update current user session
  currentUser.fullName = newName;
  currentUser.email = newEmail;
  currentUser.mobileNumber = newMobile;
  currentUser.nationality = newNat;
  setCurrentUser(currentUser);

  saveStatus.textContent = "Changes saved ✅";
  setTimeout(() => (saveStatus.textContent = ""), 1800);

  // Refresh dependent views
  renderBookings();
  renderMyReviews();
});

// ---------- Package helpers ----------
function packageById(id) {
  // travelPackages is available from travelPackages.js
  return (window.travelPackages || []).find(p => p.packageID === id);
}

// ---------- Render bookings ----------
function renderBookings() {
  const mine = getBookings().filter(b => b.email === currentUser.email);
  if (mine.length === 0) {
    noBookings.style.display = "block";
    bookingsList.innerHTML = "";
    return;
  }
  noBookings.style.display = "none";
  bookingsList.innerHTML = mine.map(b => {
    const pkg = packageById(b.packageID) || {};
    const img = pkg.image || "images/placeholder.jpg";
    const title = `${pkg.location || "Unknown"} • ${pkg.packageName || ""}`;
    const cost = (pkg.transportCost || 0) + (pkg.accommodationCost || 0) + (pkg.fullBoardCost || 0);
    const time = new Date(b.time).toLocaleString();
    return `
      <div class="card-item">
        <img src="${img}" alt="${title}">
        <h4>${title}</h4>
        <div class="small">Total approx: ${cost} Tk</div>
        <div class="small">Booked: ${time}</div>
      </div>
    `;
  }).join("");
}
renderBookings();

// ---------- Render my reviews (read-only) ----------
function renderMyReviews() {
  const all = getAllReviews();
  const myName = (currentUser.fullName || "").trim().toLowerCase();
  const mine = all.filter(r => (r.name || "").trim().toLowerCase() === myName);

  if (mine.length === 0) {
    noMyReviews.style.display = "block";
    myReviewsList.innerHTML = "";
    return;
  }

  noMyReviews.style.display = "none";
  myReviewsList.innerHTML = mine.slice().reverse().map(r => {
    const stars = "⭐".repeat(Number(r.rating) || 0);
    return `
      <div class="card-item">
        <h4>${stars}</h4>
        <div class="small">${r.date || ""}</div>
        <p>${(r.text || "").toString()}</p>
      </div>
    `;
  }).join("");
}
renderMyReviews();

// Link to the reviews page with name prefilled (?name=...)
if (openReviewsBtn) {
  const encoded = encodeURIComponent(currentUser.fullName || "");
  openReviewsBtn.href = `revieww.html?name=${encoded}`;
}

// Sync if reviews change in another tab
window.addEventListener("storage", (e) => {
  if (e.key === "reviews") renderMyReviews();
});

// ---------- Logout ----------
logoutBtn.addEventListener("click", () => {
  clearCurrentUser();
  window.location.href = "index.html";
});

// ---------- Optional: deep link to section (?tab=bookings) ----------
(function jumpToTab() {
  const params = new URLSearchParams(window.location.search);
  const tab = (params.get("tab") || "").toLowerCase();
  if (tab === "bookings") document.getElementById("bookingsCard")?.scrollIntoView({behavior:"smooth"});
  if (tab === "reviews") document.getElementById("myReviewsCard")?.scrollIntoView({behavior:"smooth"});
})();

