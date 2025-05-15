<?php
// Load environment variables and required files
require_once __DIR__ . '/../includes/env_loader.php';
loadEnv();
require_once __DIR__ . '/../includes/auth.php';

// Define page-specific variables
$pageTitle = 'Frequently Asked Questions';

// Start session for user data
session_start();

// Include header
include __DIR__ . '/../includes/header.php';
?>

<main class="faq-page">
    <section class="faq-hero">
        <div class="container faq-hero-container">
            <h1>Frequently Asked Questions</h1>
            <p>Find answers to the most common questions about our services and products</p>
        </div>
    </section>

    <section class="faq-content">
        <div class="container">
            <div class="faq-search">
                <input type="text" id="faqSearch" placeholder="Search questions..." onkeyup="searchFAQ()">
                <i class="fas fa-search"></i>
            </div>

            <div class="faq-categories">
                <button class="faq-tab active" onclick="filterFAQ('all')">All Questions</button>
                <button class="faq-tab" onclick="filterFAQ('account')">Account</button>
                <button class="faq-tab" onclick="filterFAQ('payment')">Payment</button>
                <button class="faq-tab" onclick="filterFAQ('services')">Services</button>
                <button class="faq-tab" onclick="filterFAQ('support')">Support</button>
            </div>

            <div class="faq-list">
                <!-- Account Questions -->
                <div class="faq-item account">
                    <div class="faq-question">
                        <h3>How do I create an account?</h3>
                        <span class="faq-toggle"><i class="fas fa-plus"></i></span>
                    </div>
                    <div class="faq-answer">
                        <p>Creating an account is simple. Click on the "Register" button in the top right corner of our homepage. Fill in your details, verify your email address, and you're ready to go!</p>
                    </div>
                </div>

                <div class="faq-item account">
                    <div class="faq-question">
                        <h3>What should I do if I forget my password?</h3>
                        <span class="faq-toggle"><i class="fas fa-plus"></i></span>
                    </div>
                    <div class="faq-answer">
                        <p>If you forget your password, click on the "Forgot Password" link on the login page. Enter your email address, and we'll send you instructions to reset your password.</p>
                    </div>
                </div>

                <div class="faq-item account">
                    <div class="faq-question">
                        <h3>Are these genuine Adobe Creative Cloud subscriptions?</h3>
                        <span class="faq-toggle"><i class="fas fa-plus"></i></span>
                    </div>
                    <div class="faq-answer">
                        <p>Yes, absolutely. You will receive genuine Adobe Creative Cloud accounts with full access to all Creative Cloud applications and services. The subscriptions include regular updates, cloud storage, and all the features you would get from purchasing directly from Adobe, but at a much lower price.</p>
                    </div>
                </div>

                <!-- Payment Questions -->
                <div class="faq-item payment">
                    <div class="faq-question">
                        <h3>What payment methods do you accept?</h3>
                        <span class="faq-toggle"><i class="fas fa-plus"></i></span>
                    </div>
                    <div class="faq-answer">
                        <p>We currently accept payments through PayPal, which allows you to pay using your PayPal balance, linked bank account, or credit/debit card. This ensures your payment information is secure and protected.</p>
                    </div>
                </div>

                <div class="faq-item payment">
                    <div class="faq-question">
                        <h3>Are there any recurring charges?</h3>
                        <span class="faq-toggle"><i class="fas fa-plus"></i></span>
                    </div>
                    <div class="faq-answer">
                        <p>No, all our services are one-time purchases for the duration you select. There are no automatic subscription renewals or hidden charges. You only pay for what you purchase.</p>
                    </div>
                </div>

                <div class="faq-item payment">
                    <div class="faq-question">
                        <h3>What is your refund policy?</h3>
                        <span class="faq-toggle"><i class="fas fa-plus"></i></span>
                    </div>
                    <div class="faq-answer">
                        <p>We offer a 7-day money-back guarantee if you are unable to access the Adobe Creative Cloud services with the credentials provided. If you encounter any issues, please contact our support team at support@cheapcc.online with your order details, and we'll assist you promptly.</p>
                    </div>
                </div>

                <!-- Services Questions -->
                <div class="faq-item services">
                    <div class="faq-question">
                        <h3>How does cheapcc.online offer such low prices?</h3>
                        <span class="faq-toggle"><i class="fas fa-plus"></i></span>
                    </div>
                    <div class="faq-answer">
                        <p>As an alternative to cheapcc.net, we specialize in offering Adobe Creative Cloud subscriptions at significantly reduced prices. We achieve these savings through volume licensing agreements and strategic partnerships that allow us to pass the savings onto you. This is why we can offer up to 86% off compared to Adobe's official pricing while providing the same authentic product.</p>
                    </div>
                </div>

                <div class="faq-item services">
                    <div class="faq-question">
                        <h3>How quickly will I receive my Adobe account details?</h3>
                        <span class="faq-toggle"><i class="fas fa-plus"></i></span>
                    </div>
                    <div class="faq-answer">
                        <p>In most cases, you will receive your Adobe account information immediately after your payment is confirmed. The details will be sent to the email address you provided during checkout. Occasionally, during periods of high demand, delivery may take up to 24 hours, but this is rare.</p>
                    </div>
                </div>

                <div class="faq-item services">
                    <div class="faq-question">
                        <h3>Which Adobe apps are included in the subscription?</h3>
                        <span class="faq-toggle"><i class="fas fa-plus"></i></span>
                    </div>
                    <div class="faq-answer">
                        <p>Our subscriptions include the complete Adobe Creative Cloud suite with all apps, including Photoshop, Illustrator, InDesign, Premiere Pro, After Effects, Lightroom, Dreamweaver, and many more. You'll have access to the same apps and services as with an official Adobe Creative Cloud All Apps subscription.</p>
                    </div>
                </div>

                <!-- Support Questions -->
                <div class="faq-item support">
                    <div class="faq-question">
                        <h3>How can I contact customer support?</h3>
                        <span class="faq-toggle"><i class="fas fa-plus"></i></span>
                    </div>
                    <div class="faq-answer">
                        <p>You can reach our customer support team by emailing support@cheapcc.online. We typically respond within 24 hours. Please include your order number if you have a question about a specific purchase.</p>
                    </div>
                </div>

                <div class="faq-item support">
                    <div class="faq-question">
                        <h3>What if I have trouble accessing my Adobe account?</h3>
                        <span class="faq-toggle"><i class="fas fa-plus"></i></span>
                    </div>
                    <div class="faq-answer">
                        <p>If you encounter any issues accessing your Adobe account, please contact our support team immediately. We'll work quickly to resolve the issue or provide alternative credentials. Most access issues can be resolved within 24 hours.</p>
                    </div>
                </div>

                <div class="faq-item support">
                    <div class="faq-question">
                        <h3>How do I check the status of my order?</h3>
                        <span class="faq-toggle"><i class="fas fa-plus"></i></span>
                    </div>
                    <div class="faq-answer">
                        <p>You can check the status of your order by logging into your dashboard on our website. All your orders and their current status will be displayed there. If you haven't received access to your dashboard, please contact support with your order confirmation email.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="still-have-questions">
        <div class="container">
            <h2>Still Have Questions?</h2>
            <p>Our support team is here to help you with any questions or concerns.</p>
            <a href="mailto:support@cheapcc.online" class="btn btn-primary">Contact Support</a>
            <div class="home-link-container">
                <a href="<?php echo getBaseUrl(); ?>/index.php" class="home-link">Back to Homepage <i class="fas fa-home"></i></a>
            </div>
        </div>
    </section>
</main>

<script>
// Toggle FAQ answers
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const icon = question.querySelector('.faq-toggle i');
        
        // Toggle answer visibility
        if (answer.style.maxHeight) {
            answer.style.maxHeight = null;
            icon.classList.remove('fa-minus');
            icon.classList.add('fa-plus');
        } else {
            answer.style.maxHeight = answer.scrollHeight + "px";
            icon.classList.remove('fa-plus');
            icon.classList.add('fa-minus');
        }
    });
});

// Filter FAQ by category
function filterFAQ(category) {
    // Update active tab
    document.querySelectorAll('.faq-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show/hide FAQ items based on category
    document.querySelectorAll('.faq-item').forEach(item => {
        if (category === 'all' || item.classList.contains(category)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Search functionality
function searchFAQ() {
    const searchTerm = document.getElementById('faqSearch').value.toLowerCase();
    
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('h3').textContent.toLowerCase();
        const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
        
        if (question.includes(searchTerm) || answer.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}
</script>

<style>
/* Define variables locally to ensure they're available */
:root {
    --faq-primary: #2c2d5a;
    --faq-primary-light: #484a9e;
    --faq-accent: #ff3366;
    --faq-accent-light: #ff6b8b;
    --faq-dark: #111827;
    --faq-white: #ffffff;
    --faq-gray-200: #e5e7eb;
    --faq-gray-700: #374151;
    --faq-transition-normal: 200ms cubic-bezier(0.4, 0, 0.2, 1);
    --faq-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --faq-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --faq-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --faq-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    --faq-radius-lg: 0.75rem;
    --faq-radius-full: 9999px;
    --faq-container-padding: 1.5rem;
    --faq-section-spacing: 5rem;
}

.faq-page {
    padding-bottom: 5rem;
    background-color: #ffffff;
}

.faq-hero {
    background: linear-gradient(135deg, #2c2d5a 0%, #111827 100%);
    color: #ffffff;
    text-align: center;
    padding: 8rem 0 5rem;
    margin-bottom: 4rem;
    position: relative;
    overflow: hidden;
}

.faq-hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwMCIgaGVpZ2h0PSIxMDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMDAwIDUwMEMxMDAwIDc3Ni4xNDIgNzc2LjE0MiAxMDAwIDUwMCAxMDAwQzIyMy44NTggMTAwMCAwIDc3Ni4xNDIgMCA1MDBDMCA0MzIuMzkgMTAgMzY3LjExNyAyOSAzMDYuNTk1QzEyOCAxMjUuMDY0IDI5OC4wNjQgMCA1MDAgMEM3NzYuMTQyIDAgMTAwMCAyMjMuODU4IDEwMDAgNTAweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==') no-repeat center center;
    opacity: 0.05;
    z-index: 1;
}

.faq-hero .container {
    position: relative;
    z-index: 2;
}

.back-to-home-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background-color: #ff3366;
    color: #ffffff;
    border-radius: 9999px;
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 200ms ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);  
}

.back-to-home-btn:hover {
    background-color: #ff6b8b;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    color: #ffffff;
}

.faq-hero h1 {
    font-size: 3rem;
    margin-bottom: 1.5rem;
    letter-spacing: -0.02em;
    color: #ffffff;
    font-weight: 700;
}

.faq-hero p {
    font-size: 1.25rem;
    max-width: 700px;
    margin: 0 auto;
    opacity: 0.9;
}

.faq-hero-container {
    position: absolute;
    top: -50;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
}

.faq-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.faq-search {
    position: relative;
    margin-bottom: 2.5rem;
}

.faq-search input {
    width: 100%;
    padding: 1.25rem 1.5rem;
    padding-right: 3.5rem;
    border-radius: 9999px;
    border: 1px solid #e5e7eb;
    font-size: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.faq-search input:focus {
    outline: none;
    border-color: #ff3366;
    box-shadow: 0 0 0 3px rgba(255, 51, 102, 0.25);
}

.faq-search i {
    position: absolute;
    right: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: #ff3366;
    font-size: 1.1rem;
}

.faq-categories {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 2.5rem;
    justify-content: center;
}

.faq-tab {
    background: none;
    border: 1px solid #e5e7eb;
    border-radius: 9999px;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #374151;
}

.faq-tab:hover, .faq-tab.active {
    background: #ff3366;
    color: #ffffff;
    border-color: #ff3366;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
}

.faq-list {
    margin-top: 1rem;
}

.faq-item {
    margin-bottom: 1.5rem;
    border: 1px solid rgba(44, 45, 90, 0.1);
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    background-color: #ffffff;
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.faq-item:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
    border-color: rgba(255, 51, 102, 0.2);
}

.faq-question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    cursor: pointer;
    position: relative;
    z-index: 1;
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.faq-question h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #2c2d5a;
    font-weight: 600;
}

.faq-toggle {
    font-size: 0.9rem;
    color: #ff3366;
    transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.faq-toggle i {
    transition: transform 0.3s ease;
}

.faq-answer {
    padding: 0 1.5rem;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
}

.faq-answer p {
    padding: 0 0 1.5rem;
    margin: 0;
    line-height: 1.6;
    color: #374151;
}

.still-have-questions {
    text-align: center;
    background: rgba(44, 45, 90, 0.03);
    padding: 5rem 0;
    margin-top: 4rem;
    border-top: 1px solid rgba(44, 45, 90, 0.06);
}

.still-have-questions h2 {
    margin-bottom: 1rem;
    font-size: 2rem;
    color: #2c2d5a;
}

.still-have-questions p {
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    color: #374151;
    font-size: 1.1rem;
}

.still-have-questions .btn-primary {
    padding: 0.85rem 2rem;
    font-weight: 600;
    font-size: 1.05rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
    background-color: #ff3366;
    color: #ffffff;
}

.still-have-questions .btn-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    background-color: #ff6b8b;
}

.home-link-container {
    margin-top: 2rem;
}

.home-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #2c2d5a;
    font-weight: 500;
    text-decoration: none;
    transition: all 200ms ease;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
}

.home-link:hover {
    color: #ff3366;
    background-color: rgba(255, 51, 102, 0.05);
}

.home-link i {
    font-size: 1rem;
}

@media (max-width: 992px) {
    .faq-hero h1 {
        font-size: 2.5rem;
    }
    
    .faq-hero p {
        font-size: 1.1rem;
    }
}

@media (max-width: 768px) {
    .faq-hero {
        padding: 6rem 0 4rem;
    }
    
    .faq-hero h1 {
        font-size: 2rem;
    }
    
    .faq-categories {
        flex-direction: column;
        align-items: center;
    }
    
    .faq-tab {
        width: 100%;
        text-align: center;
    }
    
    .faq-question h3 {
        font-size: 1rem;
    }
    
    .still-have-questions h2 {
        font-size: 1.75rem;
    }
    
    .still-have-questions p {
        font-size: 1rem;
    }
    
    .back-to-home-container {
        top: 10px;
        left: 10px;
    }
    
    .back-to-home-btn {
        padding: 0.5rem 1rem;
        font-size: 0.85rem;
    }
}

@media (max-width: 576px) {
    .faq-hero {
        padding: 5rem 0 3rem;
    }
    
    .faq-hero h1 {
        font-size: 1.75rem;
    }
    
    .faq-search input {
        padding: 1rem 1.25rem;
        padding-right: 3rem;
    }
}
</style>

<?php
// Include footer
include __DIR__ . '/../includes/footer.php';
?>