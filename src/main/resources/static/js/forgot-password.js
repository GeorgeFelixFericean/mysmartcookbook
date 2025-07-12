// ✅ CSRF token helper
function getCsrfToken() {
	const cookie = document.cookie
		.split("; ")
		.find(row => row.startsWith("XSRF-TOKEN="));
	return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
}

// ✅ Forgot Password - Secure Submit
document.addEventListener("DOMContentLoaded", () => {
	const forgotForm = document.getElementById("forgotPasswordForm");

	if (forgotForm) {
		forgotForm.addEventListener("submit", async (e) => {
			e.preventDefault();

			const email = document.getElementById("forgotEmail").value.trim();
			const emailPattern = /^[^@]+@[^@]+\.[^@]+$/;

			if (!email) {
				showToast("Email address is required.", false);
				return;
			}

			if (!emailPattern.test(email)) {
				showToast("Please enter a valid email address (e.g., yourname@domain.com).", false);
				return;
			}

			try {
				const response = await fetch("/api/forgot-password", {
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
						"X-XSRF-TOKEN": getCsrfToken()
					},
					credentials: "same-origin",
					body: new URLSearchParams({ email })
				});

				if (!response.ok) {
					const msg = await response.text();
					throw new Error(msg);
				}

				showToast("If this email is registered, you'll receive a link to reset your password, along with your username.", true);
			} catch (error) {
				console.error("Reset error:", error);
				showToast(error.message || "Something went wrong.", false);
			}
		});
	}
});
