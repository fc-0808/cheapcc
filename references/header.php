<?php
require_once __DIR__ . '/env_loader.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/production.php'; // Add production helper functions

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Apply CSRF protection middleware
require_once __DIR__ . '/security.php';
csrfProtectionMiddleware();

// Check login status
$isLoggedIn = isLoggedIn();
$user = $isLoggedIn ? getCurrentUser() : null;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title><?php echo isset($pageTitle) ? htmlspecialchars($pageTitle) . ' - CheapCC' : 'CheapCC - Adobe Creative Cloud at Affordable Prices'; ?></title>
    
    <!-- Favicon -->
    <link rel="icon" href="<?php echo getBaseUrl(); ?>/public/assets/favicon.svg" type="image/svg+xml">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Main CSS (optimized loading) -->
    <?php 
    // Define CSS loading function with absolute path to ensure it works from any location
    function css_tag($file) {
        $baseUrl = getBaseUrl();
        // Make sure we're using absolute URLs to prevent path resolution issues
        $cssPath = $baseUrl . '/public/css/' . $file;
        
        // Add cache-busting parameter
        $cssPath .= (strpos($cssPath, '?') === false) ? '?v=' . time() : '&v=' . time();
        
        echo "<link rel=\"stylesheet\" href=\"{$cssPath}\">\n";
    }
    
    // Load main CSS
    css_tag('style.css'); 
    
    // Load page-specific CSS if defined
    if (isset($pageStylesheet) && $pageStylesheet !== 'style.css') {
        css_tag($pageStylesheet);
    }
    ?>
</head>
<body data-logged-in="<?php echo $isLoggedIn ? 'true' : 'false'; ?>">
<header>
    <div class="container header-container">
        <a href="<?php echo getBaseUrl(); ?>/index.php" class="logo">cheap<span>CC</span>.online</a>
        
        <?php if ($isLoggedIn): ?>
            <!-- Logged in state -->
            <div class="account-nav">
                <div class="dropdown user-dropdown">
                    <button aria-haspopup="true" aria-expanded="false" class="dropdown-toggle" style="display: flex; align-items: center; gap: 8px; background-color: #f0f0ff; border: 1px solid rgba(44, 45, 90, 0.2); border-radius: 6px; padding: 8px 16px; font-size: 14px; font-weight: 500; color: #2c2d5a; cursor: pointer;">
                        <i class="fas fa-user-circle" aria-hidden="true" style="color: #ff3366; font-size: 1.1rem;"></i>
                        <span><?php echo htmlspecialchars($user['email']); ?></span>
                        <i class="fas fa-chevron-down" aria-hidden="true" style="font-size: 12px; transition: transform 0.2s;"></i>
                    </button>
                    <ul role="menu" class="dropdown-menu" style="position: absolute; top: 100%; right: -10; background: white; list-style: none; margin: 5px 0 0; padding: 8px 0; min-width: 200px; border-radius: 8px; box-shadow: 0 4px 15px rgba(44, 45, 90, 0.15); border: 1px solid rgba(44, 45, 90, 0.08); opacity: 0; visibility: hidden; transform: translateY(10px); transition: all 0.2s;">
                        <li style="list-style: none;">
                            <a href="<?php echo getBaseUrl(); ?>/src/dashboard.php" role="menuitem" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; color: #374151; text-decoration: none; font-size: 0.95rem; transition: all 0.2s ease;">
                                <i class="fas fa-tachometer-alt" aria-hidden="true" style="color: #2c2d5a; width: 1rem; text-align: center;"></i> Dashboard
                            </a>
                        </li>
                        <li style="list-style: none;">
                            <a href="<?php echo getBaseUrl(); ?>/src/profile.php" role="menuitem" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; color: #374151; text-decoration: none; font-size: 0.95rem; transition: all 0.2s ease;">
                                <i class="fas fa-user" aria-hidden="true" style="color: #2c2d5a; width: 1rem; text-align: center;"></i> My Profile
                            </a>
                        </li>
                        <li style="list-style: none; border-top: 1px solid rgba(44, 45, 90, 0.1); margin-top: 0.5rem; padding-top: 0.5rem;">
                            <a href="<?php echo getBaseUrl(); ?>/src/logout.php" role="menuitem" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; color: #ff3366; text-decoration: none; font-size: 0.95rem; transition: all 0.2s ease;">
                                <i class="fas fa-sign-out-alt" aria-hidden="true" style="color: #ff3366; width: 1rem; text-align: center;"></i> Logout
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        <?php else: ?>
            <!-- Logged out state -->
            <div class="account-nav">
                <a href="<?php echo getBaseUrl(); ?>/src/login.php" class="account-btn login-btn"><i class="fas fa-sign-in-alt" aria-hidden="true"></i>Login</a>
                <a href="<?php echo getBaseUrl(); ?>/src/register.php" class="account-btn register-btn"><i class="fas fa-user-plus" aria-hidden="true"></i>Register</a>
            </div>
        <?php endif; ?>
    </div>
</header> 