<?php
// Error reporting only in development mode
$isDebug = getenv('APP_DEBUG') === 'true' || getenv('APP_ENV') === 'development';
if ($isDebug) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

require_once __DIR__ . '/../includes/env_loader.php';
require_once __DIR__ . '/../includes/auth.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if already logged in
if (isLoggedIn()) {
    header('Location: ' . getBaseUrl() . '/src/dashboard.php');
    exit;
}

// Initialize variables
$error = '';
$success = '';
$email = '';
$firstName = '';
$lastName = '';

// Check if we're in development mode
$is_dev_mode = (getenv('APP_ENV') === 'development' || getenv('APP_DEBUG') === 'true');
$verification_url = '';
$verification_link_html = '';

// Process registration form
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get form data
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $confirmPassword = $_POST['confirm_password'] ?? '';
        $firstName = trim($_POST['first_name'] ?? '');
        $lastName = trim($_POST['last_name'] ?? '');
        
        // Basic validation
        if (empty($email) || empty($password) || empty($confirmPassword)) {
            $error = 'Please fill in all required fields';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $error = 'Please enter a valid email address';
        } elseif (strlen($password) < 8) {
            $error = 'Password must be at least 8 characters long';
        } elseif ($password !== $confirmPassword) {
            $error = 'Passwords do not match';
        } else {
            // Register the user
            $result = registerUser($email, $password, $firstName, $lastName);
            
            if ($result['success']) {
                // Try to send verification email
                if (isset($result['verification_token'])) {
                    try {
                        $emailSent = sendVerificationEmail($email, $result['verification_token']);
                        if (!$emailSent) {
                            // Email sending failed, but user was created
                            $success = 'Registration successful! However, we could not send a verification email. Please contact support.';
                        } else {
                            // Check if we're in development mode
                            if ($is_dev_mode) {
                                // In development mode, emails are saved to files
                                $success = 'Registration successful! In development mode, verification emails are saved to the "emails" folder instead of being sent.';
                                
                                // If we know the verification token, provide a direct verification link
                                if (isset($result['verification_token'])) {
                                    $verification_url = getBaseUrl() . '/src/verify.php?email=' . urlencode($email) . '&token=' . urlencode($result['verification_token']);
                                    $verification_link_html = ' <a href="' . $verification_url . '" target="_blank">Click here to verify your account directly</a>.';
                                }
                            } else {
                                $success = 'Registration successful! Please check your email to verify your account.';
                            }
                        }
                    } catch (Exception $emailEx) {
                        error_log("Error sending verification email: " . $emailEx->getMessage());
                        $success = 'Registration successful! However, we could not send a verification email. Please contact support.';
                    }
                } else {
                    $success = 'Registration successful! You can now log in to your account.';
                }
                
                // Clear the form data
                $email = $firstName = $lastName = '';
            } else {
                $error = $result['message'];
            }
        }
    } catch (Exception $e) {
        error_log("Registration error: " . $e->getMessage());
        $error = 'An error occurred during registration. Please try again.';
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Account - CheapCC</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="<?php echo getBaseUrl(); ?>/public/css/style.css">
    <link rel="stylesheet" href="<?php echo getBaseUrl(); ?>/public/css/auth.css">
    <link rel="icon" href="<?php echo getBaseUrl(); ?>/public/assets/favicon.svg" type="image/svg+xml">
</head>
<body class="auth-page">
    <div class="auth-container">
        <div class="auth-box">
            <div class="auth-logo">
                <a href="<?php echo getBaseUrl(); ?>/index.php">Cheap<span>CC</span></a>
            </div>
            <h2>Create Account</h2>
            <p class="auth-subtitle">Join CheapCC today</p>
            
            <?php if (!empty($error)): ?>
                <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>
            
            <?php if (!empty($success)): ?>
                <div class="alert alert-success"><?php echo htmlspecialchars($success); ?><?php echo $verification_link_html; ?></div>
                
                <?php if (!empty($verification_url)): ?>
                <div class="dev-verification-link">
                    <p>Development Environment Test Link:</p>
                    <a href="<?php echo $verification_url; ?>" class="verification-test-link" target="_blank">
                        <i class="fas fa-check-circle"></i> Verify your account
                    </a>
                </div>
                <?php endif; ?>
            <?php endif; ?>
            
            <form method="POST" action="" class="auth-form">
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($email); ?>" required autocomplete="email">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="first_name">First Name</label>
                        <input type="text" id="first_name" name="first_name" value="<?php echo htmlspecialchars($firstName); ?>" autocomplete="given-name">
                    </div>
                    
                    <div class="form-group">
                        <label for="last_name">Last Name</label>
                        <input type="text" id="last_name" name="last_name" value="<?php echo htmlspecialchars($lastName); ?>" autocomplete="family-name">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="password-field">
                        <input type="password" id="password" name="password" required autocomplete="new-password">
                        <span class="password-toggle" id="password-toggle">
                            <i class="far fa-eye"></i>
                        </span>
                    </div>
                    <div class="password-strength">
                        <div class="password-strength-meter" id="password-strength-meter"></div>
                    </div>
                    <div class="strength-text" id="strength-text"></div>
                </div>
                
                <div class="form-group">
                    <label for="confirm_password">Confirm Password</label>
                    <div class="password-field">
                        <input type="password" id="confirm_password" name="confirm_password" required autocomplete="new-password">
                        <span class="password-toggle" id="confirm-password-toggle">
                            <i class="far fa-eye"></i>
                        </span>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary btn-block">Create Account</button>
            </form>
            
            <div class="auth-link">
                Already have an account? <a href="<?php echo getBaseUrl(); ?>/src/login.php">Log in</a>
            </div>
        </div>
    </div>
    
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        // Focus on email field when page loads
        document.getElementById('email').focus();
        
        // Shared password toggle function
        function togglePasswordVisibility(field, toggle) {
            const type = field.getAttribute('type') === 'password' ? 'text' : 'password';
            field.setAttribute('type', type);
            
            // Toggle the eye icon
            const icon = toggle.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        }
        
        // Password visibility toggles
        const passwordField = document.getElementById('password');
        const passwordToggle = document.getElementById('password-toggle');
        const confirmPasswordField = document.getElementById('confirm_password');
        const confirmPasswordToggle = document.getElementById('confirm-password-toggle');
        
        passwordToggle.addEventListener('click', function() {
            togglePasswordVisibility(passwordField, this);
        });
        
        confirmPasswordToggle.addEventListener('click', function() {
            togglePasswordVisibility(confirmPasswordField, this);
        });
        
        // Password strength meter
        const strengthMeter = document.getElementById('password-strength-meter');
        const strengthText = document.getElementById('strength-text');
        
        passwordField.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            
            if (password.length >= 8) strength += 25;
            if (password.match(/[a-z]+/)) strength += 25;
            if (password.match(/[A-Z]+/)) strength += 25;
            if (password.match(/[0-9]+/)) strength += 25;
            
            strengthMeter.style.width = strength + '%';
            
            // Update strength class and text
            if (strength <= 25) {
                strengthMeter.className = 'password-strength-meter weak';
                strengthText.textContent = 'Weak';
            } else if (strength <= 50) {
                strengthMeter.className = 'password-strength-meter medium';
                strengthText.textContent = 'Medium';
            } else if (strength <= 75) {
                strengthMeter.className = 'password-strength-meter strong';
                strengthText.textContent = 'Strong';
            } else {
                strengthMeter.className = 'password-strength-meter very-strong';
                strengthText.textContent = 'Very Strong';
            }
        });
    });
    </script>
</body>
</html> 