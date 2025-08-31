
const ADMIN_EMAIL = "admin@pothchola.local"; 

(function guard(){
  let u = null;
  try { u = JSON.parse(localStorage.getItem("currentUser")); } catch {}
  if (!u || !u.email || u.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    alert("Admin access only.");
    window.location.href = "index.html";
  }
})();


const tabs = document.querySelectorAll(".admin-tabs button");
const sections = {
  pkg: document.getElementById("sec-pkg"),
  faqs: document.getElementById("sec-faqs"),
  users: document.getElementById("sec-users"),
  reviews: document.getElementById("sec-reviews"),
  partners: document.getElementById("sec-partners"),
};
tabs.forEach(b => b.addEventListener("click", () => {
  tabs.forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  Object.values(sections).forEach(s => s.classList.remove("active"));
  sections[b.dataset.tab].classList.add("active");
}));


const PKG_ADMIN_KEY = "packages_admin"; 
function loadPkgAdmin() {
  try { return JSON.parse(localStorage.getItem(PKG_ADMIN_KEY)) || {overrides:{}, additions:[], deletions:[]} } catch { return {overrides:{}, additions:[], deletions:[]} }
}
function savePkgAdmin(st){ localStorage.setItem(PKG_ADMIN_KEY, JSON.stringify(st)); }


function getBasePackages(){ return Array.isArray(window.travelPackages) ? window.travelPackages.slice() : []; }

function mergePackages() {
  const base = getBasePackages();
  const st = loadPkgAdmin();
  const byId = new Map(base.map(p => [p.packageID, {...p}]));
  
  (st.deletions || []).forEach(id => byId.delete(id));
 
  Object.entries(st.overrides || {}).forEach(([id, o]) => {
    id = Number(id);
    if (byId.has(id)) byId.set(id, {...byId.get(id), ...o});
  });
  // additions
  (st.additions || []).forEach(p => byId.set(p.packageID, {...p}));
  
  const list = [...byId.values()];
  const order = { Basic:1, Standard:2, Premium:3 };
  list.sort((a,b)=>{
    if (a.location !== b.location) return a.location.localeCompare(b.location);
    return (order[a.packageName]||99) - (order[b.packageName]||99);
  });
  return list;
}

// Render table
const pkgTbody = document.getElementById("pkgTbody");
function renderPkgTable(){
  const list = mergePackages();
  pkgTbody.innerHTML = list.map(p => `
    <tr data-id="${p.packageID}">
      <td>${p.packageID}</td>
      <td>${escapeHtml(p.location)}</td>
      <td>${escapeHtml(p.packageName)}</td>
      <td><input class="in t" type="number" value="${p.transportCost}" /></td>
      <td><input class="in a" type="number" value="${p.accommodationCost}" /></td>
      <td><input class="in f" type="number" value="${p.fullBoardCost}" /></td>
      <td><input class="in v" type="number" value="${p.availability}" /></td>
      <td>
        <button class="btn primary btnSaveRow">Save</button>
        <button class="btn danger btnDelRow">Delete</button>
      </td>
    </tr>
  `).join("");

  pkgTbody.querySelectorAll(".btnSaveRow").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const tr = btn.closest("tr");
      const id = Number(tr.dataset.id);
      const o = {
        transportCost: Number(tr.querySelector(".in.t").value||0),
        accommodationCost: Number(tr.querySelector(".in.a").value||0),
        fullBoardCost: Number(tr.querySelector(".in.f").value||0),
        availability: Number(tr.querySelector(".in.v").value||0),
      };
      const st = loadPkgAdmin();
      st.overrides[id] = {...(st.overrides[id]||{}), ...o};
      savePkgAdmin(st);
      alert("Saved.");
      renderPkgTable();
    });
  });

  pkgTbody.querySelectorAll(".btnDelRow").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      if (!confirm("Delete this package?")) return;
      const id = Number(btn.closest("tr").dataset.id);
      const st = loadPkgAdmin();
      
      const idx = (st.additions||[]).findIndex(x=> Number(x.packageID)===id);
      if (idx>=0) st.additions.splice(idx,1); else st.deletions = [...(st.deletions||[]), id];
      
      if (st.overrides[id]) delete st.overrides[id];
      savePkgAdmin(st);
      renderPkgTable();
    });
  });
}
function escapeHtml(s){return (s||"").replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]))}

// Add / Edit Modal
const modal = document.getElementById("pkgModal");
const mTitle = document.getElementById("pkgModalTitle");
const mId = document.getElementById("m_id");
const mLoc = document.getElementById("m_location");
const mName = document.getElementById("m_name");
const mImg = document.getElementById("m_image");
const mDesc = document.getElementById("m_desc");
const mTrans = document.getElementById("m_transport");
const mAccom = document.getElementById("m_accom");
const mFull = document.getElementById("m_full");
const mAvail = document.getElementById("m_avail");
const mMsg = document.getElementById("pkgModalMsg");

document.getElementById("btnAddPkg").addEventListener("click", ()=>{
  mTitle.textContent = "Add Package";
  [mId,mLoc,mName,mImg,mDesc,mTrans,mAccom,mFull,mAvail].forEach(i=>i.value="");
  modal.classList.remove("hidden");
});
document.getElementById("btnCancelPkg").addEventListener("click", ()=>{
  modal.classList.add("hidden");
});
document.getElementById("btnSavePkg").addEventListener("click", ()=>{
  const id = Number(mId.value || Date.now());
  const pkg = {
    packageID: id,
    location: (mLoc.value||"").trim() || "Unknown",
    packageName: (mName.value||"").trim() || "Basic",
    image: (mImg.value||"").trim(),
    description: (mDesc.value||"").trim(),
    transportCost: Number(mTrans.value||0),
    accommodationCost: Number(mAccom.value||0),
    fullBoardCost: Number(mFull.value||0),
    availability: Number(mAvail.value||0)
  };
  const st = loadPkgAdmin();
  
  const existsInBase = getBasePackages().some(p=>Number(p.packageID)===id);
  const existsInAdd = (st.additions||[]).some(p=>Number(p.packageID)===id);
  if (existsInBase) {
    st.overrides[id] = {...(st.overrides[id]||{}), ...pkg};
  } else if (existsInAdd) {
    const i = st.additions.findIndex(p=>Number(p.packageID)===id);
    st.additions[i] = pkg;
  } else {
    st.additions.push(pkg);
  }
  savePkgAdmin(st);
  mMsg.textContent = "Saved.";
  setTimeout(()=>{ mMsg.textContent=""; modal.classList.add("hidden"); renderPkgTable(); }, 500);
});

// Initial packages render
renderPkgTable();




const LS_QA = "pothchola_faqs";
const LS_ADMIN = "pothchola_admin_profile";
const faqSearch = document.getElementById("faqSearch");
const faqStatus = document.getElementById("faqStatus");
const faqSort = document.getElementById("faqSort");
const faqAdminName = document.getElementById("faqAdminName");
const faqClear = document.getElementById("faqClear");
const faqGrid = document.getElementById("faqGrid");

function loadQAs(){ try { return JSON.parse(localStorage.getItem(LS_QA)) || []; } catch(e){ return []; } }
function saveQAs(list){ localStorage.setItem(LS_QA, JSON.stringify(list)); }
function loadAdminProfile(){ try { return JSON.parse(localStorage.getItem(LS_ADMIN)) || {}; } catch(e){ return {}; } }
function saveAdminProfile(p){ localStorage.setItem(LS_ADMIN, JSON.stringify(p)); }

function faqTemplate(item){
  const answered = !!(item.answer && item.answer.trim());
  const pill = answered ? `<span class="pill" style="background:#e8ffe8;color:#0d6a0d;border:1px solid #b7e1b7">Answered</span>` :
                          `<span class="pill" style="background:#fff2d6;color:#7a4a00;border:1px solid #f3d39a">Pending</span>`;
  const dateStr = new Date(item.time || Date.now()).toLocaleString();
  return `
    <div class="card" data-id="${item.id}">
      <div class="row" style="justify-content:space-between">
        <div style="font-weight:800;color:#0b3d91">${escapeHtml(item.question||"")}</div>
        ${pill}
      </div>
      <div class="small">Asked by: ${escapeHtml(item.name||"Anonymous")} • ${escapeHtml(item.email||"")}</div>
      <div class="small">Asked on: ${dateStr}</div>
      ${item.answeredAt ? `<div class="small">Answered on: ${new Date(item.answeredAt).toLocaleString()} ${item.answeredBy ? "• by " + escapeHtml(item.answeredBy) : ""}</div>` : ""}
      <textarea class="faqAns" placeholder="Type your answer…">${item.answer ? escapeHtml(item.answer) : ""}</textarea>
      <div class="row">
        <button class="btn primary faqSave">Save Answer</button>
        <button class="btn ghost faqMark">${answered ? "Mark Pending" : "Mark Answered"}</button>
        <button class="btn danger faqDel">Delete</button>
      </div>
    </div>
  `;
}
function renderFaqs(){
  let items = loadQAs();
  const q = (faqSearch.value||"").toLowerCase().trim();
  const stat = faqStatus.value;
  items = items.filter(it=>{
    const hay = [it.question,it.answer,it.name,it.email].map(x=>(x||"").toLowerCase()).join(" ");
    const okSearch = q ? hay.includes(q) : true;
    const okStatus = stat==="all" ? true : (stat==="answered" ? !!(it.answer && it.answer.trim()) : !(it.answer && it.answer.trim()));
    return okSearch && okStatus;
  });
  if (faqSort.value==="new") items.sort((a,b)=>(b.time||0)-(a.time||0)); else items.sort((a,b)=>(a.time||0)-(b.time||0));
  faqGrid.innerHTML = items.map(faqTemplate).join("");

  faqGrid.querySelectorAll(".card").forEach(card=>{
    const id = Number(card.getAttribute("data-id"));
    const ta = card.querySelector(".faqAns");
    card.querySelector(".faqSave").addEventListener("click", ()=>{
      const list = loadQAs();
      const i = list.findIndex(x=>x.id===id);
      if (i>=0){
        const prof = loadAdminProfile();
        if (faqAdminName.value.trim()){ prof.name = faqAdminName.value.trim(); saveAdminProfile(prof); }
        list[i].answer = ta.value;
        list[i].answeredAt = Date.now();
        list[i].answeredBy = faqAdminName.value.trim() || prof.name || "Admin";
        saveQAs(list); renderFaqs();
      }
    });
    card.querySelector(".faqMark").addEventListener("click", ()=>{
      const list = loadQAs();
      const i = list.findIndex(x=>x.id===id);
      if (i>=0){
        const has = !!(list[i].answer && list[i].answer.trim());
        if (has){ list[i].answer=""; list[i].answeredAt=null; list[i].answeredBy=null; }
        else {
          list[i].answer="Answered.";
          list[i].answeredAt=Date.now();
          const prof = loadAdminProfile();
          list[i].answeredBy = faqAdminName.value.trim() || (prof.name||"Admin");
        }
        saveQAs(list); renderFaqs();
      }
    });
    card.querySelector(".faqDel").addEventListener("click", ()=>{
      if (!confirm("Delete this question?")) return;
      const list = loadQAs().filter(x=>x.id!==id);
      localStorage.setItem(LS_QA, JSON.stringify(list));
      renderFaqs();
    });
  });
}
[faqSearch, faqStatus, faqSort].forEach(el=>el.addEventListener("input", renderFaqs));
faqClear.addEventListener("click", ()=>{ faqSearch.value=""; faqStatus.value="all"; faqSort.value="new"; renderFaqs(); });
// Initial FAQs render
renderFaqs();


const usersTbody = document.getElementById("usersTbody");
const userSearch = document.getElementById("userSearch");
function loadUsers(){
  // common key is 'users'; add fallbacks
  try {
    let arr = JSON.parse(localStorage.getItem("users")) || [];
    if (!Array.isArray(arr) || arr.length===0){
      const alt = JSON.parse(localStorage.getItem("user_list")||"[]");
      if (Array.isArray(alt)) arr = alt;
    }
    return arr;
  } catch { return []; }
}
function saveUsers(list){ localStorage.setItem("users", JSON.stringify(list)); }
function renderUsers(){
  const q = (userSearch.value||"").toLowerCase().trim();
  const list = loadUsers().filter(u=>{
    const hay = [u.fullName,u.email,u.mobileNumber,u.nationality].map(x=>(x||"").toLowerCase()).join(" ");
    return q ? hay.includes(q) : true;
  });
  usersTbody.innerHTML = list.map(u=>`
    <tr>
      <td>${escapeHtml(u.fullName||"")}</td>
      <td>${escapeHtml(u.email||"")}</td>
      <td>${escapeHtml(u.mobileNumber||"")}</td>
      <td>${escapeHtml(u.nationality||"")}</td>
      <td><button class="btn danger delUser" data-email="${escapeHtml(u.email||"")}">Delete</button></td>
    </tr>
  `).join("");

  usersTbody.querySelectorAll(".delUser").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const email = (btn.getAttribute("data-email")||"").toLowerCase();
      if (!email) return;
      if (!confirm("Delete user "+email+" ?")) return;
      const rest = loadUsers().filter(x=>(x.email||"").toLowerCase()!==email);
      saveUsers(rest);
      const cur = JSON.parse(localStorage.getItem("currentUser")||"null");
      if (cur && (cur.email||"").toLowerCase()===email){
        localStorage.removeItem("currentUser");
      }
      renderUsers();
    });
  });
}
userSearch.addEventListener("input", renderUsers);
renderUsers();


const reviewsTbody = document.getElementById("reviewsTbody");
const reviewSearch = document.getElementById("reviewSearch");
const btnClearReviews = document.getElementById("btnClearReviews");
function loadReviews(){ try { return JSON.parse(localStorage.getItem("reviews")) || []; } catch { return []; } }
function saveReviews(list){ localStorage.setItem("reviews", JSON.stringify(list)); }

function renderReviews(){
  // Keep Reviews tab in sync if revieww.html updates localStorage
window.addEventListener('storage', function (e) {
  if (e.key === 'reviews') renderReviews();
});

  const q = (reviewSearch.value||"").toLowerCase().trim();
  const list = loadReviews().filter(r=>{
    const hay = [r.text, r.name].map(x=>(x||"").toLowerCase()).join(" ");
    return q ? hay.includes(q) : true;
  });
  reviewsTbody.innerHTML = list.slice().reverse().map((r,idx)=>`
    <tr data-idx="${idx}">
      <td>${Number(r.rating)||0} ⭐</td>
      <td>${escapeHtml(r.name||"Anonymous")}</td>
      <td>${escapeHtml(r.text||"")}</td>
      <td>${escapeHtml(r.date|| new Date().toLocaleString())}</td>
      <td><button class="btn danger delReview" data-idx="${idx}">Delete</button></td>
    </tr>
  `).join("");

  reviewsTbody.querySelectorAll(".delReview").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      if (!confirm("Delete this review?")) return;
      const idx = Number(btn.getAttribute("data-idx"));
      const list = loadReviews();
      // since we reversed for view, delete from the end accordingly
      const realIndex = list.length - 1 - idx;
      list.splice(realIndex,1);
      saveReviews(list);
      renderReviews();
    });
  });
}
reviewSearch.addEventListener("input", renderReviews);
btnClearReviews.addEventListener("click", ()=>{
  if (!confirm("Delete ALL reviews?")) return;
  saveReviews([]);
  renderReviews();
});
renderReviews();


const LS_ADMIN_PARTNERS = "partners_admin"; // Key for managed partners
const partnersTbody = document.getElementById("partnersTbody");
const partnerModal = document.getElementById("partnerModal");
const partnerModalTitle = document.getElementById("partnerModalTitle");
const pCompany = document.getElementById("p_company");
const pContact = document.getElementById("p_contact");
const pEmail = document.getElementById("p_email");
const pPhone = document.getElementById("p_phone");
const pService = document.getElementById("p_service");
const pNotes = document.getElementById("p_notes");
const partnerModalMsg = document.getElementById("partnerModalMsg");

let editingPartnerId = null; // To keep track if we are editing or adding

function loadAdminPartners() {
  try { return JSON.parse(localStorage.getItem(LS_ADMIN_PARTNERS)) || []; } catch { return []; }
}
function saveAdminPartners(list) { localStorage.setItem(LS_ADMIN_PARTNERS, JSON.stringify(list)); }

function renderAdminPartners() {
  const partners = loadAdminPartners();
  partnersTbody.innerHTML = partners.map(p => `
    <tr data-id="${p.id}">
      <td>${escapeHtml(p.company)}</td>
      <td>${escapeHtml(p.contact)}</td>
      <td>${escapeHtml(p.email)}</td>
      <td>${escapeHtml(p.phone)}</td>
      <td>${escapeHtml(p.service)}</td>
      <td>
        <button class="btn primary btnEditPartner">Edit</button>
        <button class="btn danger btnDeletePartner">Delete</button>
      </td>
    </tr>
  `).join("");

  partnersTbody.querySelectorAll(".btnEditPartner").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.closest("tr").dataset.id);
      const partner = partners.find(p => p.id === id);
      if (partner) {
        editingPartnerId = id;
        partnerModalTitle.textContent = "Edit Partner";
        pCompany.value = partner.company;
        pContact.value = partner.contact;
        pEmail.value = partner.email;
        pPhone.value = partner.phone;
        pService.value = partner.service;
        pNotes.value = partner.notes;
        partnerModal.classList.remove("hidden");
      }
    });
  });

  partnersTbody.querySelectorAll(".btnDeletePartner").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!confirm("Delete this partner?")) return;
      const id = Number(btn.closest("tr").dataset.id);
      const updatedPartners = partners.filter(p => p.id !== id);
      saveAdminPartners(updatedPartners);
      renderAdminPartners();
    });
  });
}

document.getElementById("btnAddPartner").addEventListener("click", () => {
  editingPartnerId = null;
  partnerModalTitle.textContent = "Add Partner";
  [pCompany, pContact, pEmail, pPhone, pService, pNotes].forEach(i => i.value = "");
  partnerModal.classList.remove("hidden");
  partnerModalMsg.textContent = "";
});

document.getElementById("btnCancelPartner").addEventListener("click", () => {
  partnerModal.classList.add("hidden");
});

document.getElementById("btnSavePartner").addEventListener("click", () => {
  const newPartner = {
    id: editingPartnerId || Date.now(),
    company: pCompany.value.trim(),
    contact: pContact.value.trim(),
    email: pEmail.value.trim(),
    phone: pPhone.value.trim(),
    service: pService.value.trim(),
    notes: pNotes.value.trim(),
  };

  if (!newPartner.company || !newPartner.email || !newPartner.contact) {
    partnerModalMsg.textContent = "Company, Contact, and Email are required.";
    return;
  }

  let partners = loadAdminPartners();
  if (editingPartnerId) {
    // Update existing partner
    partners = partners.map(p => p.id === editingPartnerId ? newPartner : p);
  } else {
    // Add new partner
    partners.push(newPartner);
  }
  saveAdminPartners(partners);
  partnerModalMsg.textContent = "Saved.";
  setTimeout(() => {
    partnerModalMsg.textContent = "";
    partnerModal.classList.add("hidden");
    renderAdminPartners();
  }, 500);
});

renderAdminPartners();
