const reviewForm = document.getElementById('reviewForm');
const reviewsList = document.getElementById('reviewsList');
const avgRating = document.getElementById('avgRating');
const nameInput = document.getElementById("userName");
const textInput = document.getElementById("reviewText");


(function prefillName() {
  const params = new URLSearchParams(window.location.search);
  const preName = params.get("name");
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  if (currentUser?.name) {
    nameInput.value = currentUser.name;
    nameInput.readOnly = true;
    nameInput.style.background = "#f5f7ff";
  } else if (preName) {
    nameInput.value = preName;
  }
})();


let reviews = JSON.parse(localStorage.getItem('reviews')) || [];


let editingIndex = null;

function updateAverageRating() {
  if (reviews.length === 0) {
    avgRating.textContent = '⭐ 0.0 based on 0 reviews';
    return;
  }
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avg = (total / reviews.length).toFixed(1);
  avgRating.textContent = `⭐ ${avg} based on ${reviews.length} reviews`;
}

function displayReviews() {
  reviewsList.innerHTML = '<h2>User Reviews</h2>';
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  reviews.slice().reverse().forEach((r, idx) => {
    const div = document.createElement('div');
    div.className = 'review';
    div.innerHTML = `
      <div class="stars">${'⭐'.repeat(r.rating)}</div>
      <div class="user">${r.name || 'Anonymous'}</div>
      <div class="date">${r.date}</div>
      <div class="text">${r.text}</div>
    `;

    
    if (currentUser && currentUser.email && r.email === currentUser.email) {
      const btnContainer = document.createElement("div");
      btnContainer.style.marginTop = "10px";

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.style.marginRight = "8px";
      editBtn.onclick = () => startEditReview(r, reviews.length - 1 - idx); 

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.onclick = () => deleteReview(reviews.length - 1 - idx);

      btnContainer.appendChild(editBtn);
      btnContainer.appendChild(delBtn);
      div.appendChild(btnContainer);
    }

    reviewsList.appendChild(div);
  });
}

function startEditReview(review, index) {
  editingIndex = index;
  document.querySelector(`input[name="rating"][value="${review.rating}"]`).checked = true;
  nameInput.value = review.name;
  textInput.value = review.text;
  reviewForm.querySelector("button[type='submit']").textContent = "Update Review";
}

function deleteReview(index) {
  if (!confirm("Are you sure you want to delete your review?")) return;
  reviews.splice(index, 1);
  localStorage.setItem("reviews", JSON.stringify(reviews));
  displayReviews();
  updateAverageRating();
}

// Handle submit
reviewForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const rating = parseInt(document.querySelector('input[name="rating"]:checked')?.value);
  const name = nameInput.value.trim() || 'Anonymous';
  const text = textInput.value.trim();
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  if (!rating || !text) {
    alert('Please provide a rating and a review text.');
    return;
  }

  const date = new Date().toLocaleString();

  if (editingIndex !== null) {
    // Update existing review
    reviews[editingIndex] = {
      ...reviews[editingIndex],
      rating,
      name,
      text,
      date
    };
    editingIndex = null;
    reviewForm.querySelector("button[type='submit']").textContent = "Submit Review";
  } else {
    // Check if user already has a review
    if (currentUser?.email) {
      const existingIndex = reviews.findIndex(r => r.email === currentUser.email);
      if (existingIndex !== -1) {
        alert("You already have a review. Please edit it instead.");
        return;
      }
    }

    reviews.push({
      rating,
      name,
      text,
      date,
      email: currentUser?.email || null
    });
  }

  
  localStorage.setItem('reviews', JSON.stringify(reviews));

  displayReviews();
  updateAverageRating();
  reviewForm.reset();
});


displayReviews();
updateAverageRating();
