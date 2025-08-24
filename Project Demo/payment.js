document.addEventListener('DOMContentLoaded', () => {
  const bookingData = JSON.parse(localStorage.getItem('pendingBooking'));

  if (!bookingData) {
    document.body.innerHTML = '<h1>No booking data found. Please select a package first.</h1>';
    return;
  }

  // Populate booking summary
  document.getElementById('summary-package-name').textContent = bookingData.packageName;
  document.getElementById('summary-location').textContent = bookingData.location;
  document.getElementById('summary-room-type').textContent = bookingData.roomType;
  document.getElementById('summary-people').textContent = bookingData.people;
  document.getElementById('summary-total-cost').textContent = bookingData.totalCost;

  const paymentForm = document.getElementById('card-payment-form');
  paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const cardholderName = document.getElementById('cardholder-name').value;
    const cardNumber = document.getElementById('card-number').value;
    const expiryDate = document.getElementById('expiry-date').value;
    const cvv = document.getElementById('cvv').value;

    if (!cardholderName || !cardNumber || !expiryDate || !cvv) {
      alert('Please fill in all payment details.');
      return;
    }

    // Simulate payment processing
    alert('Payment successful! Your booking is confirmed.');

    // Save the booking to the main bookings list
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const newBooking = {
      id: Date.now(),
      email: JSON.parse(localStorage.getItem('currentUser')).email,
      ...bookingData,
      time: Date.now()
    };
    bookings.push(newBooking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    // Clean up pending booking
    localStorage.removeItem('pendingBooking');

    // Redirect to profile page to see the booking
    window.location.href = 'userProfile.html?tab=bookings';
  });
});