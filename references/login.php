<?php
// Error reporting only in development
$isDebug = getenv('APP_DEBUG') === 'true';
if ($isDebug) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

require_once __DIR__ . '/../includes/env_loader.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/security.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if already logged in
if (isLoggedIn()) {
    // Handle redirect parameter if present
    if (isset($_GET['redirect']) && $_GET['redirect'] === 'phpmyadmin') {
        header('Location: ../phpmyadmin/index.php');
        exit;
    }
    
    header('Location: dashboard.php');
    exit;
}

$error = '';
$email = '';
$rememberMe = false;

// Process login form
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $rememberMe = isset($_POST['remember_me']);
        $redirect = isset($_POST['redirect']) ? $_POST['redirect'] : '';
        
        if (empty($email) || empty($password)) {
            $error = 'Please enter both email and password';
        } else {
            $result = loginUser($email, $password, $rememberMe);
            
            if ($result['success']) {
                // Handle redirect
                if ($redirect === 'phpmyadmin') {
                    header('Location: ../phpmyadmin/index.php');
                    exit;
                }
                
                // Default redirect to dashboard
                header('Location: dashboard.php');
                exit;
            } else {
                $error = $result['message'];
            }
        }
    } catch (Exception $e) {
        // Log the exception
        error_log("Login error: " . $e->getMessage());
        $error = "An error occurred. Please try again.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - CheapCC</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="<?php echo getBaseUrl(); ?>/public/css/style.css">
    <link rel="stylesheet" href="<?php echo getBaseUrl(); ?>/public/css/auth.css">
    <link rel="stylesheet" href="<?php echo getBaseUrl(); ?>/public/css/login-fix.css">
    <link rel="icon" href="<?php echo getBaseUrl(); ?>/public/assets/favicon.svg" type="image/svg+xml">
</head>
<body class="auth-page">
    <div class="auth-container">
        <div class="auth-box" role="main">
            <div class="auth-logo">
                <a href="<?php echo getBaseUrl(); ?>/index.php">cheap<span>CC</span>.online</a>
            </div>
            <h2>Login to Your Account</h2>
            <p class="auth-subtitle">Welcome back! Please enter your details.</p>
            
            <?php if (!empty($error)): ?>
                <div class="alert alert-danger" role="alert"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>
            
            <form action="<?php echo getBaseUrl(); ?>/src/process-login.php" method="POST" class="auth-form">
                <?php
                // Generate CSRF token
                $userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0;
                $token = generateCsrfToken($userId, 'login');
                ?>
                <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($token); ?>">
                
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($email); ?>" required autocomplete="email" aria-required="true">
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="password-field">
                        <input type="password" id="password" name="password" required autocomplete="current-password" aria-required="true">
                        <button type="button" class="password-toggle" id="password-toggle" aria-label="Toggle password visibility" tabindex="0">
                            <i class="fas fa-eye" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
                
                <div class="form-group">
                    <div class="remember-me">
                    <input type="checkbox" id="remember" name="remember_me" <?php echo $rememberMe ? 'checked' : ''; ?>>
                    <label for="remember">Remember me</label>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary btn-block">Login</button>
                
                <?php if (isset($_GET['redirect']) && $_GET['redirect'] === 'phpmyadmin'): ?>
                    <input type="hidden" name="redirect" value="phpmyadmin">
                <?php endif; ?>
                
                <div class="auth-link">
                    <a href="<?php echo getBaseUrl(); ?>/src/reset-password.php">Forgot your password?</a>
                </div>
            </form>
            
            <div class="auth-link">
                Don't have an account? <a href="<?php echo getBaseUrl(); ?>/src/register.php">Register here</a>
            </div>
        </div>
    </div>
    
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        // Focus on email field when page loads
        document.getElementById('email').focus();
        
        // Password visibility toggle
        const passwordField = document.getElementById('password');
        const passwordToggle = document.getElementById('password-toggle');
        
        passwordToggle.addEventListener('click', function() {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            
            // Toggle the eye icon
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
            
            // Update the aria-label for screen readers
            const isVisible = type === 'text';
            this.setAttribute('aria-label', isVisible ? 'Hide password' : 'Show password');
        });
        
        // Add keyboard support for password toggle
        passwordToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    </script>
</body>
</html> 