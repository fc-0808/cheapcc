<?php
/**
 * Refund Policy Page
 */

// Load environment variables and required files
require_once __DIR__ . '/../includes/env_loader.php';
loadEnv();
require_once __DIR__ . '/../includes/production.php';

// Define page-specific variables
$pageTitle = 'Refund Policy';

// Start session for user data
session_start();

// Include header
include __DIR__ . '/../includes/header.php';
?>

<section class="refund-section">
    <div class="container">
        <div class="section-heading">
            <h1>Refund Policy</h1>
            <p>Last updated: <?php echo date('F d, Y'); ?></p>
        </div>

        <div class="refund-content">
            <div class="refund-block">
                <h2>1. Refund Eligibility</h2>
                <p>At CheapCC, we want you to be completely satisfied with your purchase. We offer a 7-day money-back guarantee on all purchases under the following conditions:</p>
                <ul>
                    <li>The account credentials provided do not work at all and cannot be accessed.</li>
                    <li>We are unable to provide replacement credentials within 48 hours of your report.</li>
                    <li>The service purchased is substantially different from what was advertised.</li>
                </ul>
            </div>

            <div class="refund-block">
                <h2>2. How to Request a Refund</h2>
                <p>To request a refund, please follow these steps:</p>
                <ol>
                    <li>Contact our support team at <a href="mailto:support@cheapcc.online">support@cheapcc.online</a> within 7 days of your purchase.</li>
                    <li>Include your order number and the email address used for the purchase.</li>
                    <li>Clearly explain the reason for your refund request.</li>
                    <li>Our support team will review your request and respond within 24-48 hours.</li>
                </ol>
            </div>

            <div class="refund-block">
                <h2>3. Refund Process</h2>
                <p>If your refund request is approved:</p>
                <ul>
                    <li>Refunds will be processed using the same payment method used for the original purchase.</li>
                    <li>It may take 5-10 business days for the refund to appear in your account, depending on your payment provider.</li>
                    <li>You will receive an email confirmation once the refund has been processed.</li>
                </ul>
            </div>

            <div class="refund-block">
                <h2>4. Non-Refundable Situations</h2>
                <p>Refunds will not be issued in the following situations:</p>
                <ul>
                    <li>More than 7 days have passed since the purchase date.</li>
                    <li>The issue reported is due to user error or misuse of the account.</li>
                    <li>You have violated our Terms of Service or Adobe's Terms of Service.</li>
                    <li>You have shared your account credentials with others.</li>
                    <li>You have exceeded the maximum number of devices allowed (2 devices) for the account.</li>
                    <li>Temporary service disruptions that are resolved within 48 hours.</li>
                </ul>
            </div>

            <div class="refund-block">
                <h2>5. Account Access After Refund</h2>
                <p>Once a refund is processed, your access to the Adobe Creative Cloud account will be terminated immediately. Any further use of the account after receiving a refund is prohibited and may result in legal action.</p>
            </div>

            <div class="refund-block">
                <h2>6. Partial Refunds</h2>
                <p>In some cases, we may offer partial refunds based on the time elapsed since purchase or the nature of the issue experienced. The decision to offer a partial refund is at the sole discretion of CheapCC.</p>
            </div>

            <div class="refund-block">
                <h2>7. Changes to This Policy</h2>
                <p>We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting to our website. Your continued use of our service following any changes indicates your acceptance of the updated policy.</p>
            </div>

            <div class="refund-block">
                <h2>8. Contact Us</h2>
                <p>If you have any questions about our Refund Policy, please contact our support team at <a href="mailto:support@cheapcc.online">support@cheapcc.online</a>.</p>
            </div>
        </div>
    </div>
</section>

<style>
    .refund-section {
        padding: 60px 0;
        background-color: #f8f9fa;
    }

    .refund-content {
        max-width: 800px;
        margin: 0 auto;
        background-color: #fff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .refund-block {
        margin-bottom: 30px;
    }

    .refund-block:last-child {
        margin-bottom: 0;
    }

    .refund-block h2 {
        color: #2c2d5a;
        font-size: 1.5rem;
        margin-bottom: 15px;
        font-weight: 600;
    }

    .refund-block p {
        color: #4a4a4a;
        line-height: 1.6;
        margin-bottom: 15px;
    }

    .refund-block p:last-child {
        margin-bottom: 0;
    }

    .refund-block ul, .refund-block ol {
        padding-left: 20px;
        margin-bottom: 15px;
    }

    .refund-block ul li, .refund-block ol li {
        color: #4a4a4a;
        margin-bottom: 8px;
        line-height: 1.6;
    }

    .refund-block a {
        color: #ff3366;
        text-decoration: none;
        transition: color 0.2s;
    }

    .refund-block a:hover {
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
        .refund-section {
            padding: 40px 0;
        }

        .refund-content {
            padding: 20px;
            margin: 0 15px;
        }

        .section-heading h1 {
            font-size: 1.8rem;
        }

        .refund-block h2 {
            font-size: 1.3rem;
        }
    }
</style>

<?php
// Include footer
include __DIR__ . '/../includes/footer.php';
?> 