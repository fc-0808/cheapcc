<?php
/**
 * Privacy Policy Page
 */

// Load environment variables and required files
require_once __DIR__ . '/../includes/env_loader.php';
loadEnv();
require_once __DIR__ . '/../includes/production.php';

// Define page-specific variables
$pageTitle = 'Privacy Policy';

// Start session for user data
session_start();

// Include header
include __DIR__ . '/../includes/header.php';
?>

<section class="privacy-section">
    <div class="container">
        <div class="section-heading">
            <h1>Privacy Policy</h1>
            <p>Last updated: <?php echo date('F d, Y'); ?></p>
        </div>

        <div class="privacy-content">
            <div class="privacy-block">
                <h2>1. Introduction</h2>
                <p>At CheapCC, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website (cheapcc.online) or use our services.</p>
                <p>Please read this Privacy Policy carefully. If you do not agree with our policies and practices, your choice is not to use our website. By accessing or using our website, you agree to this Privacy Policy.</p>
            </div>

            <div class="privacy-block">
                <h2>2. Information We Collect</h2>
                <p>We collect several types of information from and about users of our website, including:</p>
                <ul>
                    <li><strong>Personal Information:</strong> Name, email address, billing information, and payment details when you register for an account or make a purchase.</li>
                    <li><strong>Usage Data:</strong> Information about how you use our website, such as the pages you visit, time spent on those pages, and other diagnostic data.</li>
                    <li><strong>Device Information:</strong> Information about your device, including IP address, browser type, operating system, and other technology identifiers.</li>
                </ul>
            </div>

            <div class="privacy-block">
                <h2>3. How We Collect Information</h2>
                <p>We collect this information:</p>
                <ul>
                    <li>Directly from you when you provide it to us (e.g., when you register, make a purchase, or contact us).</li>
                    <li>Automatically as you navigate through the site (information collected automatically may include usage details, IP addresses, and information collected through cookies).</li>
                    <li>From third parties, for example, our payment processors or other service providers.</li>
                </ul>
            </div>

            <div class="privacy-block">
                <h2>4. How We Use Your Information</h2>
                <p>We use information that we collect about you or that you provide to us:</p>
                <ul>
                    <li>To present our website and its contents to you.</li>
                    <li>To provide you with information, products, or services that you request from us.</li>
                    <li>To fulfill our obligations and enforce our rights arising from any contracts entered into between you and us.</li>
                    <li>To notify you about changes to our website or any products or services we offer.</li>
                    <li>To improve our website, products, services, and customer communications.</li>
                    <li>In any other way we may describe when you provide the information.</li>
                    <li>For any other purpose with your consent.</li>
                </ul>
            </div>

            <div class="privacy-block">
                <h2>5. Cookies and Tracking Technologies</h2>
                <p>We use cookies and similar tracking technologies to track the activity on our website and store certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.</p>
                <p>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.</p>
            </div>

            <div class="privacy-block">
                <h2>6. Data Security</h2>
                <p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.</p>
            </div>

            <div class="privacy-block">
                <h2>7. Third-Party Services</h2>
                <p>Our website may contain links to other websites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.</p>
                <p>We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.</p>
            </div>

            <div class="privacy-block">
                <h2>8. Data Retention</h2>
                <p>We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.</p>
            </div>

            <div class="privacy-block">
                <h2>9. Your Data Protection Rights</h2>
                <p>Depending on your location, you may have certain rights regarding your personal information, such as:</p>
                <ul>
                    <li>The right to access the personal information we have about you</li>
                    <li>The right to request correction of inaccurate personal information</li>
                    <li>The right to request deletion of your personal information</li>
                    <li>The right to withdraw consent</li>
                    <li>The right to object to processing of your personal information</li>
                </ul>
                <p>To exercise any of these rights, please contact us at <a href="mailto:support@cheapcc.online">support@cheapcc.online</a>.</p>
            </div>

            <div class="privacy-block">
                <h2>10. Children's Privacy</h2>
                <p>Our services are not intended for use by children under the age of 16. We do not knowingly collect personally identifiable information from children under 16. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us.</p>
            </div>

            <div class="privacy-block">
                <h2>11. Changes to This Privacy Policy</h2>
                <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>
                <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
            </div>

            <div class="privacy-block">
                <h2>12. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@cheapcc.online">support@cheapcc.online</a>.</p>
            </div>
        </div>
    </div>
</section>

<style>
    .privacy-section {
        padding: 60px 0;
        background-color: #f8f9fa;
    }

    .privacy-content {
        max-width: 800px;
        margin: 0 auto;
        background-color: #fff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .privacy-block {
        margin-bottom: 30px;
    }

    .privacy-block:last-child {
        margin-bottom: 0;
    }

    .privacy-block h2 {
        color: #2c2d5a;
        font-size: 1.5rem;
        margin-bottom: 15px;
        font-weight: 600;
    }

    .privacy-block p {
        color: #4a4a4a;
        line-height: 1.6;
        margin-bottom: 15px;
    }

    .privacy-block p:last-child {
        margin-bottom: 0;
    }

    .privacy-block ul {
        padding-left: 20px;
        margin-bottom: 15px;
    }

    .privacy-block ul li {
        color: #4a4a4a;
        margin-bottom: 8px;
        line-height: 1.6;
    }

    .privacy-block a {
        color: #ff3366;
        text-decoration: none;
        transition: color 0.2s;
    }

    .privacy-block a:hover {
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
        .privacy-section {
            padding: 40px 0;
        }

        .privacy-content {
            padding: 20px;
            margin: 0 15px;
        }

        .section-heading h1 {
            font-size: 1.8rem;
        }

        .privacy-block h2 {
            font-size: 1.3rem;
        }
    }
</style>

<?php
// Include footer
include __DIR__ . '/../includes/footer.php';
?> 