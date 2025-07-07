// ===============================
// Forgot Password - Submit Logic
// ===============================
document.addEventListener("DOMContentLoaded", () => {
	const forgotForm = document.getElementById("forgotPasswordForm");
	const messageDiv = document.getElementById("forgotMessage");

	if (forgotForm) {
		forgotForm.addEventListener("submit", async (e) => {
			e.preventDefault();

			const email = document.getElementById("forgotEmail").value.trim();
			const emailPattern = /^[^@]+@[^@]+\.[^@]+$/;

			// Validate email presence
			if (!email) {
				showToast("Email address is required.", false);
				return;
			}

			// Validate email format
			if (!emailPattern.test(email)) {
				showToast("Please enter a valid email address (e.g., yourname@domain.com).", false);
				return;
			}

			try {
				const response = await fetch("/api/forgot-password", {
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					body: new URLSearchParams({ email })
				})
				showToast("If this email is registered, you'll receive a link to reset your password, along with your username.", true);
			} catch (error) {
				showToast("Something went wrong. Please try again later.", false);
				console.error("Reset error:", error);
			}
		});
	}
});
