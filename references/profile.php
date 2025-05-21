<?php
require_once __DIR__ . '/../includes/env_loader.php';
require_once __DIR__ . '/../includes/database.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/users.php';

// Start the session and check login status
session_start();
if (!isLoggedIn()) {
    // Redirect to login page if not logged in
    header('Location: login.php');
    exit;
}

// Get user information and notification preferences
$userId = $_SESSION['user_id'];
$user = getUserById($userId);

// Initialize message variables
$profileMessage = '';
$profileMessageType = '';
$passwordMessage = '';
$passwordMessageType = '';

// Process profile update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_profile'])) {
    $firstName = trim($_POST['first_name'] ?? '');
    $lastName = trim($_POST['last_name'] ?? '');
    
    $updateData = [
        'first_name' => $firstName,
        'last_name' => $lastName
    ];
    
    $result = updateUserProfile($userId, $updateData);
    
    if ($result['success']) {
        $profileMessage = $result['message'];
        $profileMessageType = 'success';
        // Refresh user data
        $user = getUserById($userId);
    } else {
        $profileMessage = $result['message'];
        $profileMessageType = 'error';
    }
}

// Process password change
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['change_password'])) {
    $currentPassword = $_POST['current_password'] ?? '';
    $newPassword = $_POST['new_password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    
    if (empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
        $passwordMessage = 'All password fields are required';
        $passwordMessageType = 'error';
    } elseif ($newPassword !== $confirmPassword) {
        $passwordMessage = 'New password and confirmation do not match';
        $passwordMessageType = 'error';
    } else {
        $result = changeUserPassword($userId, $currentPassword, $newPassword);
        
        if ($result['success']) {
            $passwordMessage = $result['message'];
            $passwordMessageType = 'success';
        } else {
            $passwordMessage = $result['message'];
            $passwordMessageType = 'error';
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Profile - CheapCC</title>
    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <link rel="icon" type="image/png" href="favicon.png">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="<?php echo getBaseUrl(); ?>/public/css/style.css">
    <link rel="stylesheet" href="<?php echo getBaseUrl(); ?>/public/css/dashboard.css">
    <style>
        /* Profile page specific styles */
        body {
            margin: 0;
            background-color: var(--light);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        /* Updated Header styles to match dashboard.php */
        .header {
            background-color: #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 1000;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .header .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 1.5rem;
            max-width: 1280px;
            margin: 0 auto;
        }
        
        .logo a {
            text-decoration: none;
            color: var(--primary);
            letter-spacing: -0.5px;
            transition: color 0.2s ease;
        }
        
        .logo a:hover {
            color: var(--primary-dark);
        }
        
        .logo h1 {
            font-size: 1.75rem;
            font-weight: 700;
            margin: 0;
        }
        
        /* Main Navigation */
        .main-nav ul {
            display: flex;
            list-style: none;
            margin: 0;
            padding: 0;
            align-items: center;
            gap: 0.75rem;
        }
        
        .main-nav li {
            display: flex;
            align-items: center;
        }
        
        .main-nav a {
            color: var(--gray-dark);
            text-decoration: none;
            padding: 0.5rem 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            transition: var(--transition);
            border-radius: var(--radius-sm);
            font-size: 0.9rem;
        }
        
        .main-nav a:hover {
            color: var(--accent);
            background-color: var(--primary-ultra-light);
        }
        
        .user-email {
            display: flex;
            align-items: center;
            padding-right: 0.75rem;
            border-right: 1px solid var(--gray-light);
            margin-right: 0.25rem;
        }
        
        .user-email span {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
            color: var(--primary);
            font-weight: 500;
        }
        
        .user-email i {
            color: var(--accent);
            font-size: 1.1rem;
        }
        
        .mobile-nav-toggle {
            display: none;
            flex-direction: column;
            cursor: pointer;
            padding: 0.5rem;
        }
        
        .mobile-nav-toggle span {
            display: block;
            width: 24px;
            height: 2px;
            background-color: var(--gray-dark);
            margin-bottom: 4px;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .mobile-nav-toggle span:last-child {
            margin-bottom: 0;
        }
        
        .mobile-nav-toggle.active span:first-child {
            transform: translateY(6px) rotate(45deg);
        }
        
        .mobile-nav-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-nav-toggle.active span:last-child {
            transform: translateY(-6px) rotate(-45deg);
        }
        
        .dashboard-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            width: 100%;
            margin-top: var(--header-height);
            padding-top: 0;
        }
        
        .profile-tabs {
            display: flex;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid var(--gray-light);
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }
        
        .profile-tabs::-webkit-scrollbar {
            height: 4px;
        }
        
        .profile-tabs::-webkit-scrollbar-thumb {
            background-color: var(--primary-light);
            border-radius: 2px;
        }
        
        .profile-tab {
            padding: 0.75rem 1.25rem;
            font-weight: 500;
            color: var(--gray);
            cursor: pointer;
            position: relative;
            white-space: nowrap;
            transition: var(--transition);
        }
        
        .profile-tab:after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 100%;
            height: 2px;
            background-color: transparent;
            transition: background-color 0.2s ease;
        }
        
        .profile-tab.active {
            color: var(--primary);
        }
        
        .profile-tab.active:after {
            background-color: var(--primary);
        }
        
        .profile-tab:hover {
            color: var(--primary-dark);
        }
        
        .profile-tab-content {
            display: none;
        }
        
        .profile-tab-content.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }
        
        .profile-form {
            max-width: 600px;
            margin-bottom: 2rem;
        }
        
        .form-row {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .form-group {
            margin-bottom: 1.25rem;
            flex: 1;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: var(--gray-dark);
        }
        
        .form-group input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--gray-light);
            border-radius: var(--radius-md);
            font-size: 0.95rem;
            transition: var(--transition);
        }
        
        .form-group input:focus {
            border-color: var(--primary-light);
            box-shadow: 0 0 0 3px rgba(44, 45, 90, 0.1);
            outline: none;
        }
        
        .checkbox-group {
            display: flex;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .checkbox-group input[type="checkbox"] {
            margin-right: 0.5rem;
            width: auto;
        }
        
        .password-requirements {
            background-color: var(--light);
            border-radius: var(--radius-md);
            padding: 1rem;
            margin-top: 1rem;
            font-size: 0.9rem;
            color: var(--gray-dark);
        }
        
        .password-requirements h4 {
            margin-top: 0;
            margin-bottom: 0.5rem;
            font-size: 0.95rem;
        }
        
        .password-requirements ul {
            margin: 0;
            padding-left: 1.25rem;
        }
        
        .password-requirements li {
            margin-bottom: 0.25rem;
        }
        
        .password-strength {
            margin-top: 0.5rem;
        }
        
        .password-strength-meter {
            height: 4px;
            background-color: var(--gray-light);
            border-radius: 2px;
            overflow: hidden;
            margin-top: 0.25rem;
        }
        
        .password-strength-meter div {
            height: 100%;
            border-radius: 2px;
            width: 0%;
            transition: width 0.3s ease, background-color 0.3s ease;
        }
        
        .activity-logs {
            margin-top: 1.5rem;
        }
        
        .activity-log-item {
            display: flex;
            gap: 1rem;
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--gray-light);
        }
        
        .activity-log-item:last-child {
            border-bottom: none;
        }
        
        .activity-log-icon {
            width: 2.5rem;
            height: 2.5rem;
            background-color: var(--primary-ultra-light);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary);
            flex-shrink: 0;
        }
        
        .activity-log-details {
            flex: 1;
        }
        
        .activity-log-action {
            font-weight: 500;
            color: var(--dark);
            margin-bottom: 0.25rem;
        }
        
        .activity-log-time {
            font-size: 0.85rem;
            color: var(--gray);
        }
        
        .view-all-logs {
            display: block;
            text-align: center;
            margin-top: 1rem;
            color: var(--primary);
            text-decoration: none;
            font-weight: 500;
        }
        
        .view-all-logs:hover {
            text-decoration: underline;
        }
        
        /* Alert styles for messages */
        .alert {
            padding: 0.75rem 1rem;
            border-radius: var(--radius-md);
            margin-bottom: 1.25rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .alert i {
            font-size: 1.25rem;
        }
        
        .alert-success {
            background-color: rgba(0, 200, 81, 0.1);
            color: rgb(0, 160, 65);
            border: 1px solid rgba(0, 200, 81, 0.2);
        }
        
        .alert-error {
            background-color: rgba(255, 51, 102, 0.1);
            color: rgb(220, 38, 76);
            border: 1px solid rgba(255, 51, 102, 0.2);
        }
        
        @media (max-width: 768px) {
            .form-row {
                flex-direction: column;
                gap: 0;
            }
            
            .profile-tabs {
                overflow-x: auto;
            }
            
            .footer-content {
                flex-direction: column;
                gap: 1.5rem;
            }
            
            .footer-links {
                flex-direction: column;
                gap: 1.5rem;
            }
            
            /* Mobile header styles */
            .header .container {
                padding: 0.75rem 1rem;
            }
            
            .mobile-nav-toggle {
                display: flex;
            }
            
            .main-nav {
                position: fixed;
                top: var(--header-height);
                right: 0;
                width: 200px;
                background-color: var(--white);
                padding: 1rem;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                transform: translateX(100%);
                transition: transform 0.3s ease;
                z-index: 999;
                border-radius: var(--radius-md) 0 0 var(--radius-md);
            }
            
            .main-nav.show {
                transform: translateX(0);
            }
            
            .main-nav ul {
                flex-direction: column;
                gap: 1rem;
                align-items: flex-start;
            }
            
            .user-email {
                padding: 0 0 0.75rem 0;
                border-right: none;
                border-bottom: 1px solid var(--gray-light);
                margin: 0 0 0.5rem 0;
                width: 100%;
            }
        }
        
        .footer {
            background-color: var(--primary);
            color: var(--white);
            padding: 3rem 0 1.5rem;
            margin-top: auto;
            width: 100%;
        }
        
        .footer .container {
            max-width: var(--content-width);
            margin: 0 auto;
            padding: 0 1.5rem;
        }
        
        .footer-content {
            display: flex;
            flex-wrap: wrap;
            gap: 2rem;
        }
        
        .footer-logo {
            flex: 1;
            min-width: 250px;
        }
        
        .footer-logo h2 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-top: 0;
            margin-bottom: 0.5rem;
            color: var(--white);
        }
        
        .footer-logo p {
            color: rgba(255, 255, 255, 0.7);
            max-width: 300px;
        }
        
        .footer-links {
            display: flex;
            flex-wrap: wrap;
            gap: 2rem;
        }
        
        .footer-links-column {
            min-width: 160px;
        }
        
        .footer-links-column h3 {
            font-size: 1rem;
            font-weight: 600;
            margin-top: 0;
            margin-bottom: 1rem;
            position: relative;
            display: inline-block;
            color: var(--white);
        }
        
        .footer-links-column h3::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 40px;
            height: 2px;
            background-color: var(--accent);
        }
        
        .footer-links-column ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .footer-links-column li {
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
        }
        
        .footer-links-column a {
            color: rgba(255, 255, 255, 0.7);
            text-decoration: none;
            transition: var(--transition);
            font-size: 0.9rem;
            padding: 0;
            display: inline-block;
            position: relative;
            z-index: 2;
        }
        
        .footer-links-column a:hover {
            color: var(--white);
            text-decoration: none;
        }
        
        .footer-links-column .btn-link {
            color: rgba(255, 255, 255, 0.7);
            padding: 0.25rem 0;
            text-decoration: none;
            display: inline-block;
            background-color: transparent;
            position: relative;
            z-index: 2;
            cursor: pointer;
        }
        
        .footer-links-column .btn-link:hover {
            color: var(--white);
            text-decoration: none;
        }
        
        .footer-bottom {
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            text-align: center;
        }
        
        .footer-bottom p {
            margin: 0;
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.85rem;
        }
        
        /* Remove dashboard navigation style since it's now in the header */
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="logo">
                <a href="<?php echo getBaseUrl(); ?>/index.php">
                    <h1>CheapCC</h1>
                </a>
            </div>
            <nav class="main-nav">
                <ul>
                    <li class="user-email">
                        <span><i class="fas fa-user-circle"></i> <?php echo htmlspecialchars($user['email']); ?></span>
                    </li>
                    <li>
                        <a href="<?php echo getBaseUrl(); ?>/src/dashboard.php"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                    </li>
                    <li>
                        <a href="<?php echo getBaseUrl(); ?>/src/logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a>
                    </li>
                </ul>
            </nav>
            <div class="mobile-nav-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </header>

    <!-- Dashboard -->
    <div class="dashboard-container">
        <!-- Main Content -->
        <main class="dashboard-content">
            <div class="dashboard-welcome">
                <h1>My Profile</h1>
                <p>Manage your account settings and preferences.</p>
            </div>

            <!-- Profile Navigation Tabs -->
            <div class="profile-tabs">
                <div class="profile-tab active" data-tab="profile-info">
                    <i class="fas fa-user"></i> Profile Information
                </div>
                <div class="profile-tab" data-tab="security">
                    <i class="fas fa-lock"></i> Security
                </div>
            </div>

            <!-- Profile Information Tab -->
            <div class="profile-tab-content active" id="profile-info">
                <div class="content-card">
                    <h2>Profile Information</h2>
                    
                    <?php if (!empty($profileMessage)): ?>
                        <div class="alert alert-<?php echo $profileMessageType; ?>">
                            <i class="fas fa-<?php echo $profileMessageType === 'success' ? 'check-circle' : 'exclamation-circle'; ?>"></i>
                            <?php echo htmlspecialchars($profileMessage); ?>
                        </div>
                    <?php endif; ?>
                    
                    <form method="POST" class="profile-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="first_name">First Name</label>
                                <input type="text" id="first_name" name="first_name" value="<?php echo htmlspecialchars($user['first_name'] ?? ''); ?>">
                            </div>
                            <div class="form-group">
                                <label for="last_name">Last Name</label>
                                <input type="text" id="last_name" name="last_name" value="<?php echo htmlspecialchars($user['last_name'] ?? ''); ?>">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="email">Email Address</label>
                            <input type="email" id="email" value="<?php echo htmlspecialchars($user['email']); ?>" disabled>
                            <p class="form-note">Your email cannot be changed. Contact support if you need to update your email address.</p>
                        </div>
                        
                        <div class="form-group">
                            <label for="account_created">Account Created</label>
                            <input type="text" id="account_created" value="<?php echo date('F j, Y', strtotime($user['created_at'])); ?>" disabled>
                        </div>
                        
                        <button type="submit" name="update_profile" class="btn btn-primary">Save Changes</button>
                    </form>
                </div>
            </div>

            <!-- Security Tab -->
            <div class="profile-tab-content" id="security">
                <div class="content-card">
                    <h2>Change Password</h2>
                    
                    <?php if (!empty($passwordMessage)): ?>
                        <div class="alert alert-<?php echo $passwordMessageType; ?>">
                            <i class="fas fa-<?php echo $passwordMessageType === 'success' ? 'check-circle' : 'exclamation-circle'; ?>"></i>
                            <?php echo htmlspecialchars($passwordMessage); ?>
                        </div>
                    <?php endif; ?>
                    
                    <form method="POST" class="profile-form">
                        <div class="form-group">
                            <label for="current_password">Current Password</label>
                            <input type="password" id="current_password" name="current_password" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="new_password">New Password</label>
                            <input type="password" id="new_password" name="new_password" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="confirm_password">Confirm New Password</label>
                            <input type="password" id="confirm_password" name="confirm_password" required>
                        </div>
                        
                        <div class="password-requirements">
                            <h4>Password Requirements:</h4>
                            <ul>
                                <li>At least 8 characters long</li>
                                <li>Contains at least one uppercase letter</li>
                                <li>Contains at least one lowercase letter</li>
                                <li>Contains at least one number</li>
                                <li>Contains at least one special character</li>
                            </ul>
                            
                            <div class="password-strength">
                                <span class="strength-label">Password Strength: <span id="strength-text">Not entered</span></span>
                                <div class="password-strength-meter">
                                    <div id="strength-meter"></div>
                                </div>
                            </div>
                        </div>
                        
                        <button type="submit" name="change_password" class="btn btn-primary">Change Password</button>
                    </form>
                </div>
            </div>

        </main>
    </div>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-logo">
                    <h2>CheapCC</h2>
                    <p>Affordable Adobe Creative Cloud access for everyone.</p>
                </div>
                <div class="footer-links">
                    <div class="footer-links-column">
                        <h3>Help</h3>
                        <ul>
                            <li><a href="<?php echo getBaseUrl(); ?>/src/support.php" class="btn-link" onclick="window.location='<?php echo getBaseUrl(); ?>/src/support.php';">Support</a></li>
                            <li><a href="<?php echo getBaseUrl(); ?>/src/faq.php" class="btn-link" onclick="window.location='<?php echo getBaseUrl(); ?>/src/faq.php';">FAQ</a></li>
                        </ul>
                    </div>
                    <div class="footer-links-column">
                        <h3>Legal</h3>
                        <ul>
                            <li><a href="<?php echo getBaseUrl(); ?>/src/terms.php" class="btn-link" onclick="window.location='<?php echo getBaseUrl(); ?>/src/terms.php';">Terms</a></li>
                            <li><a href="<?php echo getBaseUrl(); ?>/src/privacy.php" class="btn-link" onclick="window.location='<?php echo getBaseUrl(); ?>/src/privacy.php';">Privacy</a></li>
                        </ul>
                    </div>
                    <div class="footer-links-column">
                        <h3>Account</h3>
                        <ul>
                            <li><a href="<?php echo getBaseUrl(); ?>/src/profile.php" class="btn-link" onclick="window.location='<?php echo getBaseUrl(); ?>/src/profile.php';">My Profile</a></li>
                            <li><a href="<?php echo getBaseUrl(); ?>/src/orders.php" class="btn-link" onclick="window.location='<?php echo getBaseUrl(); ?>/src/orders.php';">My Orders</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; <?php echo date('Y'); ?> CheapCC. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Tab navigation
            const tabs = document.querySelectorAll('.profile-tab');
            const tabContents = document.querySelectorAll('.profile-tab-content');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    // Remove active class from all tabs and contents
                    tabs.forEach(t => t.classList.remove('active'));
                    tabContents.forEach(c => c.classList.remove('active'));
                    
                    // Add active class to clicked tab
                    this.classList.add('active');
                    
                    // Activate corresponding content
                    const tabId = this.getAttribute('data-tab');
                    document.getElementById(tabId).classList.add('active');
                });
            });
            
            // Enable dropdown toggle in header
            const dropdownToggle = document.querySelector('.dropdown-toggle');
            const dropdownMenu = document.querySelector('.dropdown-menu');
            
            if (dropdownToggle && dropdownMenu) {
                dropdownToggle.addEventListener('click', function(e) {
                    e.stopPropagation();
                    dropdownMenu.classList.toggle('show');
                    
                    // Handle clicking outside to close
                    document.addEventListener('click', function closeDropdown(event) {
                        if (!event.target.closest('.dropdown')) {
                            dropdownMenu.classList.remove('show');
                            document.removeEventListener('click', closeDropdown);
                        }
                    });
                });
            }
            
            // Password strength meter
            const passwordInput = document.getElementById('new_password');
            const strengthMeter = document.getElementById('strength-meter');
            const strengthText = document.getElementById('strength-text');
            
            if (passwordInput) {
                passwordInput.addEventListener('input', function() {
                    const password = this.value;
                    let strength = 0;
                    let strengthClass = '';
                    let strengthLabel = 'Weak';
                    
                    if (password.length === 0) {
                        strength = 0;
                        strengthLabel = 'Not entered';
                    } else {
                        // Check length
                        if (password.length >= 8) strength += 1;
                        if (password.length >= 12) strength += 1;
                        
                        // Check for different character types
                        if (/[0-9]/.test(password)) strength += 1;
                        if (/[a-z]/.test(password)) strength += 1;
                        if (/[A-Z]/.test(password)) strength += 1;
                        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
                        
                        // Set strength class and label based on score
                        if (strength < 3) {
                            strengthClass = 'weak';
                            strengthLabel = 'Weak';
                        } else if (strength < 5) {
                            strengthClass = 'medium';
                            strengthLabel = 'Medium';
                        } else if (strength < 7) {
                            strengthClass = 'strong';
                            strengthLabel = 'Strong';
                        } else {
                            strengthClass = 'very-strong';
                            strengthLabel = 'Very Strong';
                        }
                    }
                    
                    // Update meter width and color based on strength
                    strengthMeter.style.width = (strength / 7 * 100) + '%';
                    strengthMeter.className = strengthClass;
                    strengthText.textContent = strengthLabel;
                    
                    // Set color based on strength class
                    if (strengthClass === 'weak') {
                        strengthMeter.style.backgroundColor = '#f44336';
                    } else if (strengthClass === 'medium') {
                        strengthMeter.style.backgroundColor = '#ffa726';
                    } else if (strengthClass === 'strong') {
                        strengthMeter.style.backgroundColor = '#2c2d5a';
                    } else if (strengthClass === 'very-strong') {
                        strengthMeter.style.backgroundColor = '#00c851';
                    }
                });
            }
            
            // Toggle password visibility
            const toggleButtons = document.querySelectorAll('.password-toggle');
            
            toggleButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const passwordField = this.previousElementSibling;
                    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordField.setAttribute('type', type);
                    
                    // Toggle the eye icon
                    const icon = this.querySelector('i');
                    icon.classList.toggle('fa-eye');
                    icon.classList.toggle('fa-eye-slash');
                });
            });
            
            // Make sure footer links are clickable
            const footerLinks = document.querySelectorAll('.footer-links-column a');
            footerLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    if (href) {
                        window.location.href = href;
                    }
                });
            });
            
            // Mobile navigation toggle
            const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
            const mainNav = document.querySelector('.main-nav');
            
            if (mobileNavToggle && mainNav) {
                mobileNavToggle.addEventListener('click', function() {
                    this.classList.toggle('active');
                    mainNav.classList.toggle('show');
                });
            }
        });
    </script>
</body>
</html> 