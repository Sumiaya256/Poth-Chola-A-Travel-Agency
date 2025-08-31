
const LS_QA = "pothchola_faqs";


const COMMON_QA = [
  {
    q: "What’s included in the package price?",
    a: "Transport (per tier), accommodation (room-type based), and full board. Activities vary by tier; the total shows live on each package."
  },
  {
    q: "Can I choose room types?",
    a: "Yes. Single (1 person), Double (2 persons), or Family (3–4 persons). Double is 1.5× Single; Family is 2.25× Single."
  },
  {
    q: "Are packages fixed or customizable?",
    a: "Core inclusions are fixed for clarity, but you can contact support to add extras like specific activities or timing tweaks."
  },
  {
    q: "Is transport air-conditioned?",
    a: "Yes for Standard and Premium by default. Basic may vary by destination; details are visible on each package."
  },
  {
    q: "What’s your refund/cancellation policy?",
    a: "Free cancellation up to 7 days before start; 50% refund up to 48 hours; within 48 hours non-refundable (destination-dependent)."
  },
  {
    q: "Is online payment secure?",
    a: "We use standard encrypted storage for user data and verified gateways (no card details stored on our servers)."
  },
  {
    q: "Are accommodations family-friendly?",
    a: "Yes. Family rooms fit 3–4 persons. We partner with verified hotels/resorts at each destination."
  },
  {
    q: "How do I contact support?",
    a: "Use the Sign In page or the Profile page to message us, or email support@pothchola.local (demo)."
  }
];

function loadQAs() {
  try { return JSON.parse(localStorage.getItem(LS_QA)) || []; } catch(e){ return []; }
}
function saveQAs(list) {
  localStorage.setItem(LS_QA, JSON.stringify(list));
}

function ensureSeed() {
  const cur = loadQAs();
  if (cur.length === 0) {
    const seeded = COMMON_QA.map((x, i) => ({
      id: Date.now() + i,
      question: x.q,
      answer: x.a,
      name: "Pothchola Team",
      email: "",
      time: Date.now()
    }));
    saveQAs(seeded);
    return seeded;
  }
  return cur;
}

const askForm = document.getElementById("askForm");
const askName = document.getElementById("askName");
const askEmail = document.getElementById("askEmail");
const askText = document.getElementById("askText");
const askStatus = document.getElementById("askStatus");

const qaList = document.getElementById("qaList");
const emptyQAs = document.getElementById("emptyQAs");

function renderQAs() {
  const items = ensureSeed();
  if (items.length === 0) {
    emptyQAs.style.display = "block";
    qaList.innerHTML = "";
    return;
  }
  emptyQAs.style.display = "none";

  qaList.innerHTML = items.slice().reverse().map(item => {
    const hasAnswer = !!(item.answer && item.answer.trim());
    const badge = hasAnswer ? `<span class="badge answered">Answered</span>` : "";
    const expanded = hasAnswer ? "true" : "false";
    const display = hasAnswer ? "block" : "none";
    return `
      <div class="qa-item">
        <button class="qa-q" aria-expanded="${expanded}">
          ${item.question}${badge}
        </button>
        <div class="qa-a" style="display:${display}">
          <p>${(item.answer && item.answer.trim()) ? item.answer : "<em>Pending answer. We’ll respond soon.</em>"}</p>
          <div class="qa-meta">
            Asked by: ${item.name || "Anonymous"} • ${new Date(item.time).toLocaleString()}
          </div>
        </div>
      </div>
    `;
  }).join("");

  
  qaList.querySelectorAll(".qa-q").forEach(btn => {
    btn.addEventListener("click", () => {
      const ans = btn.nextElementSibling;
      const expanded = ans.style.display === "block";
      ans.style.display = expanded ? "none" : "block";
      btn.setAttribute("aria-expanded", (!expanded).toString());
    });
  });
}


askForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = (askText.value || "").trim();
  if (!q) return;

  const list = ensureSeed();
  list.push({
    id: Date.now(),
    question: q,
    answer: "", // pending; an admin page could fill this later
    name: (askName.value || "").trim(),
    email: (askEmail.value || "").trim(),
    time: Date.now()
  });
  saveQAs(list);

  askText.value = "";
  askStatus.textContent = "Thanks! Your question has been submitted.";
  setTimeout(() => askStatus.textContent = "", 1600);

  renderQAs();
});

renderQAs();
