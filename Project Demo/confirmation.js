document.addEventListener("DOMContentLoaded", () => {
  const booking = JSON.parse(localStorage.getItem("lastConfirmedBooking") || "null");
  if (!booking) {
    alert("No booking confirmation found. Redirecting to packages.");
    window.location.href = "travelPackages.html";
    return;
  }

  // Confirmation message
  const msg = document.getElementById("confirmMessage");
  msg.textContent = `Your booking for ${booking.location} (${booking.packageName}) has been confirmed!`;

  // Booking details
  const details = document.getElementById("details");
  details.innerHTML = `
    <p><strong>Package:</strong> ${booking.packageName}</p>
    <p><strong>Location:</strong> ${booking.location}</p>
    <p><strong>People:</strong> ${booking.people}</p>
    <p><strong>Rooms:</strong> 
      ${booking.rooms.single} Single, 
      ${booking.rooms.double} Double, 
      ${booking.rooms.family} Family
    </p>
    <p><strong>Payment Method:</strong> ${booking.paymentMethod}</p>
    <p><strong>Transaction ID:</strong> ${booking.transactionId}</p>
    <p><strong>Date:</strong> ${new Date(booking.time).toLocaleString()}</p>
  `;

  // Totals
  const totals = document.getElementById("totals");
  totals.innerHTML = `
    <div class="row"><span>Transport</span><strong>${booking.totals.transport} Tk</strong></div>
    <div class="row"><span>Full Board</span><strong>${booking.totals.fullBoard} Tk</strong></div>
    <div class="row"><span>Accommodation</span><strong>${booking.totals.accommodation} Tk</strong></div>
    <div class="row"><span><strong>Grand Total</strong></span><strong>${booking.totals.grand} Tk</strong></div>
  `;
});
