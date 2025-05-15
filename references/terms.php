<?php
/**
 * Terms of Service Page
 */

// Load environment variables and required files
require_once __DIR__ . '/../includes/env_loader.php';
loadEnv();
require_once __DIR__ . '/../includes/production.php';

// Define page-specific variables
$pageTitle = 'Terms of Service';

// Start session for user data
session_start();

// Include header
include __DIR__ . '/../includes/header.php';
?>

<section class="terms-section">
    <div class="container">
        <div class="section-heading">
            <h1>Terms of Service</h1>
            <p>Last updated: <?php echo date('F d, Y'); ?></p>
        </div>

        <div class="terms-content">
            <div class="terms-block">
                <h2>1. Acceptance of Terms</h2>
                <p>By accessing and using CheapCC.online (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, you may not access the Service.</p>
            </div>

            <div class="terms-block">
                <h2>2. Description of Service</h2>
                <p>CheapCC provides users with access to Adobe Creative Cloud accounts at reduced prices. The Service includes the provision of account credentials that allow access to Adobe Creative Cloud applications and services.</p>
            </div>

            <div class="terms-block">
                <h2>3. Account Registration</h2>
                <p>To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>
                <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.</p>
            </div>

            <div class="terms-block">
                <h2>4. Payment Terms</h2>
                <p>All payments are processed through secure third-party payment processors. By making a purchase through our Service, you agree to be bound by the terms of our payment processors.</p>
                <p>All prices are shown in US Dollars unless otherwise stated. We reserve the right to change our prices at any time without notice.</p>
                <p>Subscription payments are non-refundable except as described in our <a href="<?php echo getBaseUrl(); ?>/src/refund.php">Refund Policy</a>.</p>
            </div>

            <div class="terms-block">
                <h2>5. Account Usage</h2>
                <p>Upon purchase, you will receive account credentials for Adobe Creative Cloud. These credentials are for your personal use only and are limited to a maximum of two devices simultaneously, as per Adobe's standard terms.</p>
                <p>You agree not to:</p>
                <ul>
                    <li>Share, resell, or transfer your account credentials to any third party</li>
                    <li>Use the account for any illegal purpose or in violation of any local, state, national, or international law</li>
                    <li>Attempt to gain unauthorized access to any portion of the Service or any other systems or networks</li>
                    <li>Exceed the scope of the license granted by Adobe through your account credentials</li>
                </ul>
            </div>

            <div class="terms-block">
                <h2>6. Account Support and Replacement</h2>
                <p>We provide full support for the duration of your subscription. If you encounter issues with your account, we will make reasonable efforts to resolve them within 24-48 hours.</p>
                <p>In cases where an account cannot be restored to working condition, we will provide a replacement account for the remainder of your subscription period.</p>
            </div>

            <div class="terms-block">
                <h2>7. Limitation of Liability</h2>
                <p>The Service is provided "as is" without warranties of any kind, either express or implied. In no event shall CheapCC be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
            </div>

            <div class="terms-block">
                <h2>8. Indemnification</h2>
                <p>You agree to defend, indemnify and hold harmless CheapCC and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses, resulting from or arising out of your use and access of the Service.</p>
            </div>

            <div class="terms-block">
                <h2>9. Termination</h2>
                <p>We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason, including but not limited to a breach of the Terms.</p>
                <p>Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service.</p>
            </div>

            <div class="terms-block">
                <h2>10. Governing Law</h2>
                <p>These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.</p>
            </div>

            <div class="terms-block">
                <h2>11. Changes to Terms</h2>
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
            </div>

            <div class="terms-block">
                <h2>12. Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us at <a href="mailto:support@cheapcc.online">support@cheapcc.online</a>.</p>
            </div>
        </div>
    </div>
</section>

<style>
    .terms-section {
        padding: 60px 0;
        background-color: #f8f9fa;
    }

    .terms-content {
        max-width: 800px;
        margin: 0 auto;
        background-color: #fff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .terms-block {
        margin-bottom: 30px;
    }

    .terms-block:last-child {
        margin-bottom: 0;
    }

    .terms-block h2 {
        color: #2c2d5a;
        font-size: 1.5rem;
        margin-bottom: 15px;
        font-weight: 600;
    }

    .terms-block p {
        color: #4a4a4a;
        line-height: 1.6;
        margin-bottom: 15px;
    }

    .terms-block p:last-child {
        margin-bottom: 0;
    }

    .terms-block ul {
        padding-left: 20px;
        margin-bottom: 15px;
    }

    .terms-block ul li {
        color: #4a4a4a;
        margin-bottom: 8px;
        line-height: 1.6;
    }

    .terms-block a {
        color: #ff3366;
        text-decoration: none;
        transition: color 0.2s;
    }

    .terms-block a:hover {
        color: #2c2d5a;
        text-decoration: underline;
    }

    .section-heading {
        text-align: center;
        margin-bottom: 30px;
    }

    .section-heading h1 {
        color: #2c2d5a;
        font-size: 2.2rem;
        margin-bottom: 10px;
    }

    .section-heading p {
        color: #666;
        font-size: 1rem;
    }

    @media (max-width: 768px) {
        .terms-section {
            padding: 40px 0;
        }

        .terms-content {
            padding: 20px;
            margin: 0 15px;
        }

        .section-heading h1 {
            font-size: 1.8rem;
        }

        .terms-block h2 {
            font-size: 1.3rem;
        }
    }
</style>

<?php
// Include footer
include __DIR__ . '/../includes/footer.php';
?> 