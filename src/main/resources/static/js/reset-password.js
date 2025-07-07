// ===============================
// Reset Password - Token & Submit
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("resetPasswordForm");
    const tokenField = document.getElementById("token");
    const resetMessage = document.getElementById("resetMessage");

    // 🔐 Preluăm tokenul din URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
        resetMessage.textContent = "Invalid or missing token.";
        resetMessage.style.color = "red";
        resetMessage.style.display = "block";
        form.style.display = "none";
        return;
    }

    // We inject the token into the hidden input
    tokenField.value = token;

    // 📤 Submit handler
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const password = document.getElementById("newPassword").value.trim();
        const confirm = document.getElementById("confirmPassword").value.trim();

        // 🔍 Validate password presence
        if (!password) {
            showToast("Password is required.", false);
            return;
        }

        // 🔍 Validate confirm password presence
        if (!confirm) {
            showToast("Please confirm your password.", false);
            return;
        }

        // 🔍 Validate password length
        if (password.length < 8 || password.length > 64) {
            showToast("Password must be between 8 and 64 characters.", false);
            return;
        }

        // 🔍 Validate password match
        if (password !== confirm) {
            showToast("Passwords do not match.", false);
            return;
        }

        try {
            const response = await fetch("/api/reset-password", {
            	method: "POST",
            	headers: { "Content-Type": "application/json" },
            	body: JSON.stringify({ token, newPassword: password })
            });


            const message = await response.text();
            showToast(message, response.ok);

            if (response.ok) {
                // ✅ Afișăm toast și redirecționăm la login după 2 secunde
                showToast("Password updated successfully. Redirecting to login...", true);
                setTimeout(() => {
                    window.location.href = "/login?resetSuccess=true";
                }, 2000);
            }
        } catch (err) {
            showToast("Something went wrong. Try again later.", false);
            console.error("Reset error:", err);
        }
    });
});
