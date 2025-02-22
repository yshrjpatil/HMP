document.addEventListener('DOMContentLoaded', () => {
    // Toggle panels for sign-up and sign-in
    const container = document.getElementById('container');
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');

    if (signUpButton && signInButton) {
        signUpButton.addEventListener('click', () => container.classList.add('right-panel-active'));
        signInButton.addEventListener('click', () => container.classList.remove('right-panel-active'));
    }

    // Helper function to show messages
    function showMessage(target, message, type = "error") {
        const messageDiv = document.getElementById(target);
        if (messageDiv) {
            messageDiv.style.display = "block";
            messageDiv.textContent = message;
            messageDiv.className = `message ${type}`; // Add class for styling (success/error)
        }
    }

    const NotificationSystem = {
        show(message, type = 'error', duration = 5000) {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => notification.remove(), duration);
        },
        
        error(message) {
            this.show(message, 'error');
        },
        
        success(message) {
            this.show(message, 'success');
        }
    };

    // Handle signup
    const signUpForm = document.querySelector("form[action='/signup']");
    if (signUpForm) {
        signUpForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const { name, email, password } = Object.fromEntries(new FormData(e.target));
            showMessage("signUpMessage", ""); // Clear previous messages

            try {
                const response = await fetch('/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password }),
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    document.getElementById("verificationModal").style.display = "flex";
                    document.getElementById("verificationEmail").value = email;
                    showMessage("signUpMessage", "Signup successful! Please verify your email.", "success");
                } else {
                    showMessage("signUpMessage", result.message || "Signup failed.", "error");
                }
            } catch (error) {
                console.error("Error during signup:", error);
                showMessage("signUpMessage", "An unexpected error occurred. Please try again.", "error");
            }
        });
    }

    // Handle login
    const signInForm = document.querySelector("form[action='/login']");
    if (signInForm) {
        signInForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const { email, password } = Object.fromEntries(new FormData(e.target));
            showMessage("signInMessage", ""); // Clear previous messages

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    window.location.href = "/dashboard";
                } else {
                    showMessage("signInMessage", result.message || "Invalid email or password.", "error");
                }
            } catch (error) {
                console.error("Error during login:", error);
                showMessage("signInMessage", "An unexpected error occurred. Please try again.", "error");
            }
        });
    }

    // Handle email verification (OTP submission)
    const verifyButton = document.getElementById("verifyButton");
    if (verifyButton) {
        verifyButton.addEventListener("click", async (e) => {
            e.preventDefault();
            const email = document.getElementById("verificationEmail").value;
            const code = document.getElementById("verificationCode").value;
            showMessage("verificationError", ""); // Clear previous messages

            try {
                const response = await fetch("/verify-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, code }),
                });
                const data = await response.json();
                if (data.success) {
                    window.location.href = "/dashboard";
                } else {
                    showMessage("verificationError", data.message || "Invalid code. Please try again.", "error");
                }
            } catch (error) {
                console.error('Error verifying code:', error);
                showMessage("verificationError", "An unexpected error occurred. Please try again.", "error");
            }
        });
    }

    // Forgot Password
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;
            showMessage("forgotPasswordMessage", ""); // Clear previous messages

            try {
                const response = await fetch('/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });
                const data = await response.json();
                if (data.success) {
                    showMessage("forgotPasswordMessage", "OTP sent to your email!", "success");
                    showOtpField();
                } else {
                    showMessage("forgotPasswordMessage", data.message || "Error sending OTP.", "error");
                }
            } catch (error) {
                console.error('Error sending OTP:', error);
                showMessage("forgotPasswordMessage", "An unexpected error occurred. Please try again.", "error");
            }
        });
    }

    // Helper Function to Show OTP Field
    function showOtpField() {
        const otpField = document.getElementById('otp');
        if (!otpField) {
            const otpInput = document.createElement('input');
            otpInput.type = 'text';
            otpInput.placeholder = 'Enter OTP';
            otpInput.id = 'otp';
            document.getElementById('forgot-password-form').appendChild(otpInput);

            const verifyButton = document.createElement('button');
            verifyButton.type = 'button';
            verifyButton.textContent = 'Verify OTP';
            verifyButton.id = 'verify-otp-button';
            verifyButton.addEventListener('click', verifyOtp);
            document.getElementById('forgot-password-form').appendChild(verifyButton);
        }
    }

    // Verify OTP
    async function verifyOtp() {
        const email = document.getElementById('forgot-email').value;
        const otp = document.getElementById('otp').value;
        showMessage("forgotPasswordMessage", ""); // Clear previous messages

        try {
            const response = await fetch('/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await response.json();
            if (data.success) {
                showMessage("forgotPasswordMessage", "OTP verified! You can reset your password.", "success");
                // Show password reset fields here
            } else {
                showMessage("forgotPasswordMessage", data.message || "Invalid OTP.", "error");
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            showMessage("forgotPasswordMessage", "An unexpected error occurred. Please try again.", "error");
        }
    }

    // Toggle between Sign In and Forgot Password
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const signInContainer = document.querySelector('.sign-in-container');

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function (e) {
            e.preventDefault();
            signInContainer.style.display = 'none';
            forgotPasswordForm.style.display = 'block';
        });
    }

    const backToSignInLink = document.getElementById('back-to-sign-in-link');
    if (backToSignInLink) {
        backToSignInLink.addEventListener('click', function (e) {
            e.preventDefault();
            signInContainer.style.display = 'block';
            forgotPasswordForm.style.display = 'none';
        });
    }
});