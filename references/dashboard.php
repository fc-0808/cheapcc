<?php
require_once __DIR__ . '/../includes/env_loader.php';
require_once __DIR__ . '/../includes/database.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/orders.php';
require_once __DIR__ . '/../includes/users.php';

// Start the session and check login status
session_start();
if (!isLoggedIn()) {
    // Redirect to login page if not logged in
    header('Location: login.php');
    exit;
}

// Get user information and order statistics
$userId = $_SESSION['user_id'];
$user = getUserById($userId);
$orderStats = getUserOrderStats($userId);
$activeOrders = getActiveOrders($userId);
$recentOrders = getUserOrders($userId, 5); // Get most recent 5 orders

// Check if user is admin (for database tools access)
$isAdmin = ($userId === 1); // Assuming user ID 1 is admin
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Customer Dashboard - CheapCC</title>
    <link rel="icon" type="image/svg+xml" href="<?php echo getBaseUrl(); ?>/public/assets/favicon.svg">
    <link rel="icon" type="image/png" href="<?php echo getBaseUrl(); ?>/public/assets/favicon.png">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="<?php echo getBaseUrl(); ?>/public/css/style.css">
    <link rel="stylesheet" href="<?php echo getBaseUrl(); ?>/public/css/dashboard.css">
    <style>
        /* Override styles for dashboard layout */
        :root {
            --header-height: 60px;
        }
        
        body {
            padding-top: var(--header-height);
            background-color: var(--light);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        /* Updated Header styles */
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
        
        /* Updated Main Navigation */
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
        
        /* Main container */
        .dashboard-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            width: 100%;
        }
        
        .dashboard-content {
            flex: 1;
            width: 100%;
            max-width: 1280px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        /* Dashboard sections */
        .dashboard-welcome {
            background-color: var(--primary-ultra-light);
            border-radius: var(--radius-lg);
            padding: 1.5rem;
            margin-bottom: 2rem;
            border-left: 4px solid var(--primary);
        }
        
        .dashboard-welcome h1 {
            margin-top: 0;
            margin-bottom: 0.5rem;
            font-size: 1.75rem;
            color: var(--dark);
        }
        
        .dashboard-welcome p {
            margin: 0;
            color: var(--gray-dark);
        }
        
        .dashboard-nav {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-bottom: 2rem;
        }
        
        .dashboard-nav a {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.25rem;
            background-color: var(--white);
            border-radius: var(--radius-md);
            color: var(--gray-dark);
            text-decoration: none;
            font-weight: 500;
            transition: var(--transition);
            border: 1px solid var(--gray-light);
        }
        
        .dashboard-nav a:hover {
            background-color: var(--primary-ultra-light);
            color: var(--primary);
            border-color: var(--primary-light);
        }
        
        .dashboard-nav a i {
            font-size: 1rem;
        }
        
        .dashboard-nav a.active {
            background-color: var(--primary);
            color: var(--white);
            border-color: var(--primary);
        }
        
        /* Footer styles */
        .footer {
            background-color: var(--gray-dark);
            color: var(--white);
            padding: 3rem 0 1.5rem;
            margin-top: auto;
            width: 100%;
            position: relative;
            z-index: 5;
        }
        
        .footer .container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 1.5rem;
            position: relative;
            z-index: 5;
        }
        
        .footer-content {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 2rem;
            margin-bottom: 2rem;
            position: relative;
            z-index: 1;
        }
        
        .footer-logo {
            flex: 1;
            min-width: 250px;
        }
        
        .footer-logo h2 {
            font-size: 1.75rem;
            margin: 0 0 1rem;
            color: var(--white);
        }
        
        .footer-logo p {
            color: var(--gray-light);
            margin: 0;
        }
        
        .footer-links {
            display: flex;
            flex-wrap: wrap;
            gap: 2rem;
            position: relative;
            z-index: 1;
        }
        
        .footer-links-column {
            min-width: 150px;
            position: relative;
            z-index: 1;
        }
        
        .footer-links-column h3 {
            font-size: 1rem;
            color: var(--white);
            margin-bottom: 1rem;
        }
        
        .footer-links-column ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .footer-links-column ul li {
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
        }
        
        .footer-links-column ul li a {
            color: var(--gray-light);
            text-decoration: none;
            transition: color 0.2s ease;
            padding: 0;
            display: inline-block;
            position: relative;
            z-index: 2;
        }
        
        .footer-links-column ul li a:hover {
            color: var(--white);
            text-decoration: none;
        }
        
        .footer-links-column .btn-link {
            color: var(--gray-light);
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
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 1.5rem;
            text-align: center;
        }
        
        .footer-bottom p {
            margin: 0;
            color: var(--gray-light);
            font-size: 0.875rem;
        }
        
        /* Responsive styles */
        @media (max-width: 768px) {
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
            
            .main-nav.active {
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
            
            .footer-content {
                flex-direction: column;
                gap: 2rem;
            }
            
            .footer-links {
                flex-direction: column;
                gap: 1.5rem;
            }
        }
        
        @media (max-width: 576px) {
            .dashboard-content {
                padding: 1rem;
            }
            
            .stats-grid {
                gap: 1rem;
            }
            
            .dashboard-welcome {
                padding: 1.25rem;
            }
            
            .dashboard-welcome h1 {
                font-size: 1.5rem;
            }
        }
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
                        <a href="<?php echo getBaseUrl(); ?>/src/profile.php"><i class="fas fa-user"></i> Profile</a>
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
                <h1>Welcome back, <?php echo htmlspecialchars($user['first_name'] ?? 'Customer'); ?></h1>
                <p>Here's an overview of your account and services.</p>
            </div>
            
            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Active Subscriptions</h3>
                    <div class="stat-value"><?php echo $orderStats['active_orders']; ?></div>
                    <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                </div>
                <div class="stat-card">
                    <h3>Total Orders</h3>
                    <div class="stat-value"><?php echo $orderStats['total_orders']; ?></div>
                    <div class="stat-icon"><i class="fas fa-shopping-cart"></i></div>
                </div>
                <div class="stat-card">
                    <h3>Total Spent</h3>
                    <div class="stat-value">$<?php echo number_format($orderStats['total_spent'], 2); ?></div>
                    <div class="stat-icon"><i class="fas fa-credit-card"></i></div>
                </div>
                <div class="stat-card">
                    <h3>Total Saved</h3>
                    <div class="stat-value">$<?php echo number_format($orderStats['total_savings'], 2); ?></div>
                    <div class="stat-icon"><i class="fas fa-piggy-bank"></i></div>
                </div>
            </div>

            <!-- Active Subscriptions -->
            <div class="content-card">
                <h2>
                    Active Subscriptions
                    <span class="badge"><?php echo count($activeOrders); ?></span>
                </h2>
                
                <?php if (count($activeOrders) > 0): ?>
                    <?php foreach ($activeOrders as $order): ?>
                        <div class="credential-card">
                            <h3><?php echo htmlspecialchars($order['plan_name']); ?></h3>
                            <ul class="credential-details">
                                <li>
                                    <span class="detail-label">Order Number</span>
                                    <span class="detail-value"><?php echo htmlspecialchars($order['order_number']); ?></span>
                                </li>
                                <li>
                                    <span class="detail-label">Status</span>
                                    <span class="detail-value">
                                        <span class="status-badge active">Active</span>
                                    </span>
                                </li>
                                <li>
                                    <span class="detail-label">Purchase Date</span>
                                    <span class="detail-value"><?php echo date('M d, Y', strtotime($order['created_at'])); ?></span>
                                </li>
                                <li>
                                    <span class="detail-label">Expires</span>
                                    <span class="detail-value"><?php echo date('M d, Y', strtotime($order['credentials']['expiry_date'])); ?></span>
                                </li>
                                <li>
                                    <span class="detail-label">Adobe Account</span>
                                    <span class="detail-value"><?php echo htmlspecialchars($order['credentials']['email']); ?></span>
                                </li>
                                <li>
                                    <span class="detail-label">Password</span>
                                    <span class="detail-value">
                                        <span class="credential-password"><?php echo str_repeat('•', 8); ?></span>
                                        <button class="btn-show-password" data-id="<?php echo $order['credentials']['id']; ?>" title="Show Password">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </span>
                                </li>
                            </ul>
                            <div class="credential-actions">
                                <a href="credentials.php?id=<?php echo $order['credentials']['id']; ?>" class="btn btn-sm btn-outline">View Details</a>
                                <a href="support.php?order=<?php echo $order['order_number']; ?>" class="btn btn-sm btn-ghost">Report Issue</a>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <div class="empty-state">
                        <i class="fas fa-box-open"></i>
                        <p>You don't have any active subscriptions.</p>
                        <a href="index.php#plans" class="btn btn-accent">View Available Plans</a>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Recent Orders -->
            <div class="content-card">
                <h2>
                    Recent Orders
                    <a href="<?php echo getBaseUrl(); ?>/src/orders.php" class="btn btn-sm btn-outline">View All</a>
                </h2>
                
                <?php if (count($recentOrders) > 0): ?>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Date</th>
                                <th>Plan</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($recentOrders as $order): ?>
                                <tr>
                                    <td><?php echo htmlspecialchars($order['order_number']); ?></td>
                                    <td><?php echo date('M d, Y', strtotime($order['created_at'])); ?></td>
                                    <td><?php echo htmlspecialchars($order['plan_name']); ?></td>
                                    <td>$<?php echo number_format($order['amount'], 2); ?></td>
                                    <td>
                                        <span class="status-badge <?php echo strtolower($order['status']); ?>">
                                            <?php echo ucfirst($order['status']); ?>
                                        </span>
                                    </td>
                                    <td>
                                        <a href="order-details.php?id=<?php echo $order['id']; ?>" class="table-action">
                                            <i class="fas fa-eye"></i> View
                                        </a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php else: ?>
                    <div class="empty-state">
                        <i class="fas fa-shopping-cart"></i>
                        <p>You haven't placed any orders yet.</p>
                        <a href="index.php#plans" class="btn btn-accent">Browse Plans</a>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Account Help -->
            <div class="content-card">
                <h2>Need Help?</h2>
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <div>
                        <strong>Having trouble with your account?</strong> 
                        <p>Our support team is here to help. You can reach out via our support page or contact us directly at support@cheapcc.online</p>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 1rem;">
                    <a href="<?php echo getBaseUrl(); ?>/src/support.php" class="btn btn-outline">Contact Support</a>
                </div>
            </div>

            <?php if ($isAdmin): ?>
            <div class="content-card">
                <h2><i class="fas fa-database"></i> Database Tools</h2>
                <p>Access database management tools for your website.</p>
                
                <div class="action-buttons" style="margin-top: 1rem;">
                    <a href="phpmyadmin/" class="btn btn-primary">
                        <i class="fas fa-database"></i> Access phpMyAdmin
                    </a>
                </div>
                
                <div class="note" style="margin-top: 1rem; background-color: #f8f9fa; border-left: 4px solid #2c2d5a; padding: 1rem;">
                    <p><strong>Note:</strong> Database tools are only available to administrators.</p>
                    <p>Use phpMyAdmin to manage your database structure, execute SQL queries, and view data.</p>
                </div>
            </div>
            <?php endif; ?>
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

    <script src="dashboard.js"></script>
    <script>
        // Mobile navigation toggle
        document.addEventListener('DOMContentLoaded', function() {
            const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
            const mainNav = document.querySelector('.main-nav');
            
            if (mobileNavToggle && mainNav) {
                mobileNavToggle.addEventListener('click', function() {
                    mainNav.classList.toggle('active');
                    mobileNavToggle.classList.toggle('active');
                });
            }
            
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
        });
    </script>
</body>
</html> 