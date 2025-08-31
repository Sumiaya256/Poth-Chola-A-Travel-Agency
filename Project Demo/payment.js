// payment.js

document.addEventListener("DOMContentLoaded", () => {
    const bookingData = JSON.parse(localStorage.getItem("pendingBooking") || "null");

    const summaryPackageName = document.getElementById("summary-package-name");
    const summaryLocation = document.getElementById("summary-location");
    const summaryPeople = document.getElementById("summary-people");
    const summaryRoomType = document.getElementById("summary-room-type");
    const summaryTotalCost = document.getElementById("summary-total-cost");

    const bkashAmount = document.getElementById("bkash-amount");
    const nagadAmount = document.getElementById("nagad-amount");

    const methodCards = document.querySelectorAll(".method-card");
    const paymentDetailsForms = document.querySelectorAll(".payment-details-form");
    const confirmPaymentBtns = document.querySelectorAll(".confirm-payment-btn");

    if (!bookingData || !bookingData.packageID) {
        alert("No booking data found. Please go back to packages and book first.");
        window.location.href = "travelPackages.html";
        return;
    }

    // Populate booking summary
    summaryPackageName.textContent = bookingData.packageName;
    summaryLocation.textContent = bookingData.location;
    summaryPeople.textContent = bookingData.people;

    let roomSummary = [];
    if (bookingData.rooms.single > 0) roomSummary.push(`${bookingData.rooms.single} Single`);
    if (bookingData.rooms.double > 0) roomSummary.push(`${bookingData.rooms.double} Double`);
    if (bookingData.rooms.family > 0) roomSummary.push(`${bookingData.rooms.family} Family`);
    summaryRoomType.textContent = roomSummary.join(', ') || 'N/A';

    const grandTotal = bookingData.totals.grand;
    summaryTotalCost.textContent = grandTotal;
    bkashAmount.textContent = grandTotal;
    nagadAmount.textContent = grandTotal;

    // Handle payment method selection
    methodCards.forEach(card => {
        card.addEventListener("click", () => {
            methodCards.forEach(c => c.classList.remove("selected"));
            paymentDetailsForms.forEach(form => form.style.display = "none");
            card.classList.add("selected");

            const method = card.dataset.method;
            const formToShow = document.getElementById(`${method}-details`);
            if (formToShow) {
                formToShow.style.display = "block";
            }
        });
    });

    // Handle confirm payment button clicks
    confirmPaymentBtns.forEach(button => {
        button.addEventListener("click", (event) => {
            const method = event.target.dataset.method;
            const user = JSON.parse(localStorage.getItem("currentUser") || "null");

            if (!user || !user.email) {
                alert("You need to sign in before confirming payment.");
                window.location.href = "user.html?mode=signin";
                return;
            }

            if (method === "bkash") {
                const trxId = document.getElementById("bkash-trxid").value.trim();
                if (!trxId) {
                    alert("Please enter your bKash Transaction ID.");
                    return;
                }
                if (trxId.length < 8 || trxId.length > 15) {
                    alert("Please enter a valid bKash Transaction ID.");
                    return;
                }
                processPayment("bKash", trxId);
            } else if (method === "nagad") {
                const trxId = document.getElementById("nagad-trxid").value.trim();
                if (!trxId) {
                    alert("Please enter your Nagad Transaction ID.");
                    return;
                }
                if (trxId.length < 8 || trxId.length > 15) {
                    alert("Please enter a valid Nagad Transaction ID.");
                    return;
                }
                processPayment("Nagad", trxId);
            } else if (method === "bank-transfer") {
                alert("Redirecting to secure bank payment gateway...");
                processPayment("Online Banking", "N/A");
            }
        });
    });

    // Process payment and move to confirmed bookings
    function processPayment(paymentMethod, transactionId) {
        const user = JSON.parse(localStorage.getItem("currentUser") || "null");
        if (!user || !user.email) {
            alert("Error: User not logged in. Please sign in.");
            window.location.href = "user.html?mode=signin";
            return;
        }

        const bookingData = JSON.parse(localStorage.getItem("pendingBooking") || "null");
        if (!bookingData) {
            alert("Error: No pending booking found to process.");
            window.location.href = "travelPackages.html";
            return;
        }

        alert(`Payment of ${bookingData.totals.grand} BDT confirmed via ${paymentMethod} (TRX ID: ${transactionId || 'N/A'}). Your booking is successful!`);

        // Save booking into completed bookings under the user
        let allCompletedBookings = JSON.parse(localStorage.getItem("completedBookings") || "{}");
        let userBookings = allCompletedBookings[user.email] || [];

        const completedBooking = {
            ...bookingData,
            paymentMethod: paymentMethod,
            transactionId: transactionId,
            status: "Confirmed",
            bookingTime: Date.now()
        };

        userBookings.push(completedBooking);
        allCompletedBookings[user.email] = userBookings;
        localStorage.setItem("completedBookings", JSON.stringify(allCompletedBookings));

        // Clear pending booking
        localStorage.removeItem("pendingBooking");

        // Redirect to userProfile page
        window.location.href = "userProfile.html?tab=bookings";
    }
});
