const reviewForm = document.getElementById('reviewForm');
const reviewsList = document.getElementById('reviewsList');
const avgRating = document.getElementById('avgRating');
// Prefill name from URL (?name=Full%20Name) so profile page can pass the user name
(function prefillNameFromURL(){
  const params = new URLSearchParams(window.location.search);
  const preName = params.get("name");
  if (preName) {
    const nameInput = document.getElementById("userName");
    if (nameInput) {
      nameInput.value = preName;
      // Optional: lock the field to avoid mismatches with profile name
      // nameInput.readOnly = true;
      // nameInput.style.background = "#f5f7ff";
    }
  }
})();


// Load reviews from localStorage or fallback to sample ones
let reviews = JSON.parse(localStorage.getItem('reviews')) || [
  { rating: 5, name: 'Sumiaya Sharif', text: 'Amazing place! Truly peaceful and scenic.', date: '2025-08-21 10:45 AM' },
  { rating: 4, name: 'Rahat Ahmed', text: 'Beautiful experience, but a bit crowded.', date: '2025-08-20 3:20 PM' },
  { rating: 3, name: 'Nadia Khan', text: 'Good, but could improve facilities.', date: '2025-08-19 1:10 PM' }
];

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
  reviews.slice().reverse().forEach(r => {
    const div = document.createElement('div');
    div.className = 'review';
    div.innerHTML = `
      <div class="stars">${'⭐'.repeat(r.rating)}</div>
      <div class="user">${r.name || 'Anonymous'}</div>
      <div class="date">${r.date}</div>
      <div class="text">${r.text}</div>
    `;
    reviewsList.appendChild(div);
  });
}

reviewForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const rating = parseInt(document.querySelector('input[name="rating"]:checked')?.value);
  const name = document.getElementById('userName').value.trim() || 'Anonymous';
  const text = document.getElementById('reviewText').value.trim();

  if (!rating || !text) {
    alert('Please provide a rating and a review text.');
    return;
  }

  const date = new Date().toLocaleString();
  reviews.push({ rating, name, text, date });

  // Save to localStorage
  localStorage.setItem('reviews', JSON.stringify(reviews));

  displayReviews();
  updateAverageRating();
  reviewForm.reset();
});

displayReviews();
updateAverageRating();
