// ====== User Class ======
class User {
  constructor(userID, fullName, email, mobileNumber, nationality, password) {
    this.userID = userID;
    this.fullName = fullName;
    this.email = email;
    this.mobileNumber = mobileNumber;
    this.nationality = nationality || "";
    this.password = password;
  }

  signup() {
    return `${this.fullName}, your account has been created successfully! 🎉`;
  }

  login(email, password) {
    if (this.email === email && this.password === password) {
      return `✅ Logged in as ${this.fullName}`;
    } else {
      return "❌ Wrong email or password!";
    }
  }
}

// ====== Storage Helpers ======
function getStoredUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}
function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}
function clearCurrentUser() {
  localStorage.removeItem("currentUser");
}

// ====== Validation ======
function validateSignup(fullName, email, mobile, password) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "❌ Invalid email format!";
  if ((mobile || "").replace(/\D/g, "").length < 10) return "❌ Mobile number must be at least 10 digits!";
  if ((password || "").length < 6) return "❌ Password must be at least 6 characters!";
  if ((fullName || "").trim().length < 3) return "❌ Full name must be at least 3 characters!";
  return null;
}

// ====== Elements ======
const topMessage = document.getElementById("topMessage");
const userGreeting = document.getElementById("userGreeting");
const greetName = document.getElementById("greetName");
const greetEmail = document.getElementById("greetEmail");
const logoutBtn = document.getElementById("logoutBtn");

// Sections
const signupSection = document.getElementById("signupSection");
const loginSection = document.getElementById("loginSection");
const recoverSection = document.getElementById("recoverSection");

// Forms & Inputs
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const recoverForm = document.getElementById("recoverForm");
const recoverBtn = document.getElementById("recoverBtn");

// Globals
let currentUser = null;

// ====== UI Helpers ======
function showOnly(section) {
  // Hide all
  signupSection.style.display = "none";
  loginSection.style.display = "none";
  recoverSection.style.display = "none";

  // Show requested
  section.style.display = "block";
}

function updateUIForLogin() {
  if (currentUser) {
    // Logged in
    userGreeting.style.display = "flex";
    greetName.textContent = `Hi, ${currentUser.fullName}!`;
    greetEmail.textContent = currentUser.email;

    // Hide forms when logged in
    signupSection.style.display = "none";
    loginSection.style.display = "none";
    recoverSection.style.display = "none";
  } else {
    // Logged out
    userGreeting.style.display = "none";
  }
}

function showFormFromURL() {
  const params = new URLSearchParams(window.location.search);
  const mode = (params.get("mode") || "").toLowerCase();

  if (currentUser) return; // already handled by updateUIForLogin

  if (mode === "signup") {
    showOnly(signupSection);
    document.getElementById("fullName").focus();
  } else if (mode === "signin") {
    showOnly(loginSection);
    document.getElementById("loginEmail").focus();
  } else {
    // default: show both? Requirement says only the requested one.
    // If no mode, show login by default:
    showOnly(loginSection);
  }
}

// ====== SIGNUP ======
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const mobile = document.getElementById("mobileNumber").value.trim();
  const nationality = document.getElementById("nationality").value.trim();
  const password = document.getElementById("password").value;

  const err = validateSignup(fullName, email, mobile, password);
  if (err) {
    topMessage.textContent = err;
    return;
  }

  const users = getStoredUsers();
  if (users.find((u) => u.email === email)) {
    topMessage.textContent = "❌ Email already exists! Try signing in.";
    showOnly(loginSection);
    return;
  }

  const newUser = new User(
    Date.now(),
    fullName,
    email,
    mobile,
    nationality,
    password
  );
  users.push(newUser);
  saveUsers(users);

  currentUser = newUser;
  setCurrentUser(currentUser);

  topMessage.textContent = currentUser.signup();
  updateUIForLogin();
});

// ====== LOGIN ======
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  const users = getStoredUsers();
  const found = users.find((u) => u.email === email);

  if (!found) {
    topMessage.textContent = "❌ Email not found!";
    return;
  }
  if (found.password !== password) {
    topMessage.textContent = "❌ Wrong password!";
    return;
  }

  currentUser = found;
  setCurrentUser(currentUser);
  topMessage.textContent = `✅ Logged in as ${currentUser.fullName}`;
  updateUIForLogin();
});

// ====== RECOVER PASSWORD ======
recoverBtn.addEventListener("click", () => {
  showOnly(recoverSection);
  document.getElementById("recoverEmail").focus();
});

recoverForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("recoverEmail").value.trim().toLowerCase();
  const newPass = document.getElementById("newPassword").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (newPass.length < 6) {
    topMessage.textContent = "❌ Password must be at least 6 characters!";
    return;
  }
  if (newPass !== confirm) {
    topMessage.textContent = "❌ Passwords do not match!";
    return;
  }

  const users = getStoredUsers();
  const foundIndex = users.findIndex((u) => u.email === email);
  if (foundIndex === -1) {
    topMessage.textContent = "❌ Email not found!";
    return;
  }

  users[foundIndex].password = newPass;
  saveUsers(users);

  // If the same user is currently logged in, update the session password too
  const session = getCurrentUser();
  if (session && session.email === email) {
    session.password = newPass;
    setCurrentUser(session);
  }

  topMessage.textContent = "✅ Password updated. Please sign in with your new password.";
  showOnly(loginSection);
});

// ====== LOGOUT ======
logoutBtn.addEventListener("click", () => {
  clearCurrentUser();
  currentUser = null;
  topMessage.textContent = "🔒 Logged out successfully.";
  updateUIForLogin();
  showOnly(loginSection);
});

// ====== INIT ======
window.onload = () => {
  const savedUser = getCurrentUser();
  if (savedUser) {
    currentUser = savedUser;
    updateUIForLogin();
    topMessage.textContent = `🔄 Session restored. Welcome back, ${currentUser.fullName}!`;
  } else {
    updateUIForLogin();
    showFormFromURL();
  }
};


