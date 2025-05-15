<?php
/**
 * CheapCC Main Page
 */

// Load required files
require_once __DIR__ . '/../includes/env_loader.php';
require_once __DIR__ . '/../includes/security.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/production.php';

// Load environment variables
loadEnv();

// Validate encryption keys on startup
try {
    validateEncryptionKeys();
} catch (Exception $e) {
    error_log("Critical security error: " . $e->getMessage());
    if (getenv('APP_ENV') === 'production') {
        die("Application cannot start due to security configuration error. Please contact system administrator.");
    } else {
        die("Development Error: " . $e->getMessage());
    }
}

// Define page-specific variables
$pageTitle = 'Adobe Creative Cloud at Unbeatable Prices';
$pageStylesheet = 'style.css';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Include header
include __DIR__ . '/../includes/header.php';
?>

		<a href="#main-content" class="skip-link">Skip to main content</a>

		<main id="main-content" role="main">
			<!-- Live users badge -->
			<div class="live-users-badge">
				<div class="pulse-dot"></div>
				<span class="live-count"><span id="active-users">5</span> users currently viewing</span>
			</div>

			<section class="hero">
				<div class="container">
					<div class="savings-badge"><i class="fas fa-tags"></i> Save up to 86% vs Official Pricing</div>
					<h1>Unleash Your Creativity with<br /><span class="highlight">Adobe Creative Cloud</span></h1>
					<p>Get the complete suite with all premium applications at a fraction of the official cost. Same powerful tools, same features, massive savings.</p>
					<div class="hero-features">
						<div class="hero-feature"><i class="fas fa-check-circle"></i> All Creative Cloud Apps</div>
						<div class="hero-feature"><i class="fas fa-check-circle"></i> 100GB Cloud Storage</div>
						<div class="hero-feature"><i class="fas fa-check-circle"></i> Adobe Firefly Included</div>
					</div>
					<a href="#pricing" class="primary-btn"><i class="fas fa-bolt"></i> View Plans & Pricing</a>
				</div>
			</section>

			<section class="social-proof fade-in">
				<div class="container">
					<div class="counter-container">
						<div class="counter-item stagger-item">
							<i class="fas fa-users"></i>
							<div class="counter-value"><span class="count-up" data-count="150">0</span>+</div>
							<div class="counter-label">Happy Customers</div>
						</div>
						<div class="counter-item stagger-item delay-100">
							<i class="fas fa-check-circle"></i>
							<div class="counter-value"><span class="count-up" data-count="250">0</span>+</div>
							<div class="counter-label">Successful Activations</div>
						</div>
						<div class="counter-item stagger-item delay-200">
							<i class="fas fa-star"></i>
							<div class="counter-value"><span class="count-up" data-count="99">0</span>%</div>
							<div class="counter-label">Customer Satisfaction</div>
						</div>
						<div class="counter-item stagger-item delay-300">
							<i class="fas fa-headset"></i>
							<div class="counter-value"><span class="count-up" data-count="24">0</span>/7</div>
							<div class="counter-label">Support Availability</div>
						</div>
					</div>
				</div>
			</section>

			<section class="benefits fade-in">
				<div class="container">
					<div class="section-heading">
						<h2>Why Choose CheapCC?</h2>
						<p>Authorized Adobe Creative Cloud subscriptions at significantly reduced prices compared to official channels</p>
					</div>
					<div class="benefits-container benefits-grid">
						<div class="benefit-card stagger-item">
							<i class="fas fa-piggy-bank"></i>
							<h3>Massive Savings</h3>
							<p>Pay up to 86% less than official Adobe pricing while getting the exact same product and benefits.</p>
						</div>
						<div class="benefit-card stagger-item delay-100">
							<i class="fas fa-bolt"></i>
							<h3>Email Delivery</h3>
							<p>Receive your Adobe account details via email after purchase with all apps ready to download.</p>
						</div>
						<div class="benefit-card stagger-item delay-200">
							<i class="fas fa-check-circle"></i>
							<h3>100% Genuine</h3>
							<p>Full access to all Creative Cloud apps and services with regular updates and cloud storage.</p>
						</div>
						<div class="benefit-card stagger-item delay-300">
							<i class="fas fa-exchange-alt"></i>
							<h3>Alternative to cheapcc.net</h3>
							<p>cheapcc.online is your alternative destination to cheapcc.net for affordable Adobe Creative Cloud subscriptions.</p>
						</div>
					</div>
				</div>
			</section>

			<section class="pricing scale-in" id="pricing">
				<div class="container">
					<div class="section-heading">
						<h2>Choose Your Plan</h2>
						<p>Select the subscription duration that works best for you</p>
					</div>
					<div class="plans-container">
						<div class="plan-card featured-card" data-plan="14days" data-price="2.99" data-official="29.99" style="border: none; background: linear-gradient(135deg, #ffffff, #f8faff); box-shadow: 0 15px 30px rgba(44, 45, 90, 0.15), 0 5px 15px rgba(44, 45, 90, 0.1); transform: scale(1.05); backdrop-filter: blur(20px);">
							<div class="ribbon" style="background: linear-gradient(90deg, #2e1065, #7e22ce); box-shadow: 0 3px 10px rgba(46, 16, 101, 0.3); font-weight: 700; letter-spacing: 0.03em;">Most Popular</div>
							<div class="plan-duration" style="color: #2c2d5a; font-weight: 700; font-size: 1.3rem; border-bottom: 1px solid rgba(72, 74, 158, 0.15); padding-bottom: 1.25rem; margin-bottom: 1.5rem; position: relative;">
								14-Day Trial
								<span style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 40px; height: 4px; background: linear-gradient(90deg, #2e1065, #4c1d95); border-radius: 2px;"></span>
							</div>
							<div class="plan-price" style="color: transparent; background: linear-gradient(90deg, #2e1065, #4c1d95); background-clip: text; -webkit-background-clip: text; font-weight: 800; font-size: 2.5rem; margin-bottom: 0.3rem; line-height: 1.1;">$2.99<span style="position: absolute; top: -12px; right: -20px; background: linear-gradient(90deg, #4c1d95, #6d28d9); color: white; font-size: 0.9rem; padding: 4px 9px; border-radius: 20px; font-weight: 700; box-shadow: 0 4px 12px rgba(76, 29, 149, 0.25); animation: pulse 2s infinite; text-transform: uppercase; letter-spacing: 0.02em;">Wow!</span></div>
							<div class="official-price" style="color: #6b7280; font-size: 1.1rem; margin-bottom: 0.8rem;">Official: $29.99</div>
							<div class="savings" style="background: linear-gradient(90deg, #4c1d95, #6d28d9); color: white; box-shadow: 0 4px 12px rgba(76, 29, 149, 0.25); padding: 0.45rem 1.2rem; transform: scale(1.05); font-weight: 700; letter-spacing: 0.04em; border-radius: 20px;">Save 90%</div>
							<ul class="plan-features" style="margin: 2rem 0 2.2rem;">
								<li style="margin-bottom: 1rem; color: #1f2937; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									All Creative Cloud Apps
								</li>
								<li style="margin-bottom: 1rem; color: #1f2937; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									100GB Cloud Storage
								</li>
								<li style="margin-bottom: 1rem; color: #1f2937; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									Adobe Firefly
								</li>
								<li style="margin-bottom: 1rem; color: #1f2937; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									24/7 Support
								</li>
								<li style="color: #1f2937; font-weight: 600; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									<span style="position: relative; display: inline-block;">One-time purchase<span style="position: absolute; bottom: 1px; left: 0; width: 100%; height: 3px; background-color: rgba(76, 29, 149, 0.1);"></span></span>
								</li>
							</ul>
							<div class="plan-button">
								<a href="#checkout" class="btn btn-primary btn-block shimmer" data-plan="14days">Get Started</a>
							</div>
						</div>

						<div class="plan-card" data-plan="1month" data-price="12.99" data-official="59.99" style="border: none; background: linear-gradient(135deg, #ffffff, #fafafa); box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08); transform: translateY(0); transition: all 0.4s ease;">
							<div class="plan-duration" style="color: #1f2937; font-weight: 700; font-size: 1.2rem; border-bottom: 1px solid rgba(107, 114, 128, 0.15); padding-bottom: 1rem; margin-bottom: 1.25rem; position: relative;">
								1 Month
								<span style="position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); width: 30px; height: 3px; background: linear-gradient(90deg, #2e1065, #4c1d95); border-radius: 2px;"></span>
							</div>
							<div class="plan-price" style="color: #1f2937; font-weight: 800; font-size: 2.5rem; margin-bottom: 0.3rem; line-height: 1.1;">$12.99</div>
							<div class="official-price" style="color: #6b7280; font-size: 1rem; margin-bottom: 0.8rem;">Official: $59.99</div>
							<div class="savings" style="background: linear-gradient(90deg, #ddd6fe, #ede9fe); color: #4c1d95; box-shadow: 0 2px 8px rgba(76, 29, 149, 0.15); padding: 0.4rem 1rem; font-weight: 600; letter-spacing: 0.02em; border-radius: 20px;">Save 78%</div>
							<ul class="plan-features" style="margin: 1.8rem 0 2.2rem;">
								<li style="margin-bottom: 0.9rem; color: #374151; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									All Creative Cloud Apps
								</li>
								<li style="margin-bottom: 0.9rem; color: #374151; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									100GB Cloud Storage
								</li>
								<li style="margin-bottom: 0.9rem; color: #374151; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									Adobe Firefly
								</li>
								<li style="margin-bottom: 0; color: #374151; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									24/7 Support
								</li>
							</ul>
							<div class="plan-button">
								<a href="#checkout" class="btn btn-primary btn-block shimmer" data-plan="1month">Get Started</a>
							</div>
						</div>

						<div class="plan-card" data-plan="3month" data-price="32.99" data-official="179.97" style="border: none; background: linear-gradient(135deg, #ffffff, #fafafa); box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08); transform: translateY(0); transition: all 0.4s ease;">
							<div class="plan-duration" style="color: #1f2937; font-weight: 700; font-size: 1.2rem; border-bottom: 1px solid rgba(107, 114, 128, 0.15); padding-bottom: 1rem; margin-bottom: 1.25rem; position: relative;">
								3 Months
								<span style="position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); width: 30px; height: 3px; background: linear-gradient(90deg, #2e1065, #4c1d95); border-radius: 2px;"></span>
							</div>
							<div class="plan-price" style="color: #1f2937; font-weight: 800; font-size: 2.5rem; margin-bottom: 0.3rem; line-height: 1.1;">$32.99</div>
							<div class="official-price" style="color: #6b7280; font-size: 1rem; margin-bottom: 0.8rem;">Official: $179.97</div>
							<div class="savings" style="background: linear-gradient(90deg, #ddd6fe, #ede9fe); color: #4c1d95; box-shadow: 0 2px 8px rgba(76, 29, 149, 0.15); padding: 0.4rem 1rem; font-weight: 600; letter-spacing: 0.02em; border-radius: 20px;">Save 82%</div>
							<ul class="plan-features" style="margin: 1.8rem 0 2.2rem;">
								<li style="margin-bottom: 0.9rem; color: #374151; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									All Creative Cloud Apps
								</li>
								<li style="margin-bottom: 0.9rem; color: #374151; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									100GB Cloud Storage
								</li>
								<li style="margin-bottom: 0.9rem; color: #374151; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									Adobe Firefly
								</li>
								<li style="margin-bottom: 0; color: #374151; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									24/7 Support
								</li>
							</ul>
							<div class="plan-button">
								<a href="#checkout" class="btn btn-primary btn-block shimmer" data-plan="3month">Get Started</a>
							</div>
						</div>

						<div class="plan-card" data-plan="6month" data-price="59.99" data-official="359.94" style="border: none; background: linear-gradient(135deg, #ffffff, #fafafa); box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08); transform: translateY(0); transition: all 0.4s ease;">
							<div class="plan-duration" style="color: #1f2937; font-weight: 700; font-size: 1.2rem; border-bottom: 1px solid rgba(107, 114, 128, 0.15); padding-bottom: 1rem; margin-bottom: 1.25rem; position: relative;">
								6 Months
								<span style="position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); width: 30px; height: 3px; background: linear-gradient(90deg, #2e1065, #4c1d95); border-radius: 2px;"></span>
							</div>
							<div class="plan-price" style="color: #1f2937; font-weight: 800; font-size: 2.5rem; margin-bottom: 0.3rem; line-height: 1.1;">$59.99</div>
							<div class="official-price" style="color: #6b7280; font-size: 1rem; margin-bottom: 0.8rem;">Official: $359.94</div>
							<div class="savings" style="background: linear-gradient(90deg, #ddd6fe, #ede9fe); color: #4c1d95; box-shadow: 0 2px 8px rgba(76, 29, 149, 0.15); padding: 0.4rem 1rem; font-weight: 600; letter-spacing: 0.02em; border-radius: 20px;">Save 83%</div>
							<ul class="plan-features" style="margin: 1.8rem 0 2.2rem;">
								<li style="margin-bottom: 0.9rem; color: #374151; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									All Creative Cloud Apps
								</li>
								<li style="margin-bottom: 0.9rem; color: #374151; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									100GB Cloud Storage
								</li>
								<li style="margin-bottom: 0.9rem; color: #374151; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									Adobe Firefly
								</li>
								<li style="margin-bottom: 0; color: #374151; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									24/7 Support
								</li>
							</ul>
							<div class="plan-button">
								<a href="#checkout" class="btn btn-primary btn-block shimmer" data-plan="6month">Get Started</a>
							</div>
						</div>

						<div class="plan-card" data-plan="12month" data-price="99.99" data-official="719.88" style="border: none; background: linear-gradient(135deg, #ffffff, #f9fafb); box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08); transform: translateY(0); transition: all 0.4s ease;">
							<div class="plan-duration" style="color: #1f2937; font-weight: 700; font-size: 1.2rem; border-bottom: 1px solid rgba(107, 114, 128, 0.15); padding-bottom: 1rem; margin-bottom: 1.25rem; position: relative;">
								12 Months
								<span style="position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); width: 30px; height: 3px; background: linear-gradient(90deg, #2e1065, #4c1d95); border-radius: 2px;"></span>
							</div>
							<div class="plan-price" style="color: #1f2937; font-weight: 800; font-size: 2.5rem; margin-bottom: 0.3rem; line-height: 1.1;">$99.99</div>
							<div class="official-price" style="color: #6b7280; font-size: 1rem; margin-bottom: 0.8rem;">Official: $719.88</div>
							<div class="savings" style="background: linear-gradient(90deg, #ddd6fe, #ede9fe); color: #4c1d95; box-shadow: 0 2px 8px rgba(76, 29, 149, 0.15); padding: 0.4rem 1rem; font-weight: 600; letter-spacing: 0.02em; border-radius: 20px;">Save 86%</div>
							<ul class="plan-features" style="margin: 1.8rem 0 2.2rem;">
								<li style="margin-bottom: 0.9rem; color: #374151; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									All Creative Cloud Apps
								</li>
								<li style="margin-bottom: 0.9rem; color: #374151; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									100GB Cloud Storage
								</li>
								<li style="margin-bottom: 0.9rem; color: #374151; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									Adobe Firefly
								</li>
								<li style="margin-bottom: 0; color: #374151; padding-left: 1.8rem; position: relative;">
									<i class="fas fa-check-circle" style="color: #059669; position: absolute; left: 0; top: 2px;"></i>
									24/7 Support
								</li>
							</ul>
							<div class="plan-button">
								<a href="#checkout" class="btn btn-primary btn-block shimmer" data-plan="12month">Get Started</a>
							</div>
						</div>
					</div>
				</div>

				<!-- Recent purchases toast notifications -->
				<div class="recent-purchase-container" id="recent-purchase-container"></div>
			</section>

			<section class="how-it-works slide-in-left">
				<div class="container">
					<div class="section-heading">
						<h2>How It Works</h2>
						<p>Getting your Adobe Creative Cloud subscription is simple and fast</p>
					</div>
					<div class="steps-container">
						<div class="step stagger-item">
							<div class="step-number">1</div>
							<h3>Choose a Plan</h3>
							<p>Select the subscription duration that best fits your needs.</p>
						</div>
						<div class="step stagger-item delay-100">
							<div class="step-number">2</div>
							<h3>Complete Purchase</h3>
							<p>Enter your email and pay securely with PayPal.</p>
						</div>
						<div class="step stagger-item delay-200">
							<div class="step-number">3</div>
							<h3>Receive Details</h3>
							<p>Get your Adobe account information delivered via email.</p>
						</div>
					</div>
				</div>
			</section>

			<section class="checkout slide-in-right" id="checkout">
				<div class="container">
					<div class="section-heading">
						<h2>Complete Your Order</h2>
						<p>You're just moments away from accessing Adobe Creative Cloud</p>
					</div>
					<div class="checkout-container">
						<div class="checkout-form">
							<form id="checkout-form">
								<div class="form-group">
									<label for="email">Email Address</label>
									<input type="email" id="email" name="email" required placeholder="Where we'll send your account details" />
								</div>
								<div class="form-group">
									<label for="name">Name</label>
									<input type="text" id="name" name="name" placeholder="Your name" required />
								</div>
								<div class="form-group">
									<label for="special-instructions">Special Instructions (Optional)</label>
									<textarea id="special-instructions" rows="3" placeholder="Any specific requests or questions"></textarea>
								</div>

								<!-- PayPal Button Container -->
								<div id="paypal-button-container" style="display: none">
									<style>
										.pp-direct-button {
											text-align: center;
											border: none;
											border-radius: 1.5rem;
											width: 100%;
											padding: 0 2rem;
											height: 3.125rem;
											font-weight: bold;
											background-color: #4f46e5;
											color: #ffffff;
											font-family: 'Helvetica Neue', Arial, sans-serif;
											font-size: 1.125rem;
											line-height: 3.125rem;
											cursor: pointer;
											margin-bottom: 15px;
											display: block;
											text-decoration: none;
										}
										.pp-direct-button:hover {
											background-color: #3c35c9;
										}
										.pp-direct-button.disabled {
											background-color: #9e9e9e;
											cursor: not-allowed;
											opacity: 0.7;
										}
										.validation-message {
											color: #dc3545;
											font-size: 14px;
											margin-bottom: 10px;
											display: none;
										}
										.paypal-cards {
											text-align: center;
											margin-bottom: 10px;
										}
										.paypal-powered {
											text-align: center;
										}
									</style>
									<div class="validation-message" id="validation-message">Please enter your name and email address before proceeding to payment.</div>
									<a href="https://www.sandbox.paypal.com/ncp/payment/LCKF73QGJTFCU" target="_blank" class="pp-direct-button disabled" id="paypal-button" onclick="return validateCheckoutForm()">Buy Now</a>
									<div class="paypal-cards">
										<img class="lazy" 
											data-src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg" 
											data-srcset="https://www.paypalobjects.com/images/Debit_Credit_APM.svg 1x"
											src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 40'%3E%3C/svg%3E"
											alt="Payment cards accepted" 
											width="200" 
											height="20" />
									</div>
									<div class="paypal-powered">Powered by <img class="lazy" 
										data-src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" 
										src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 25'%3E%3C/svg%3E"
										alt="PayPal" 
										width="70" 
										height="20" 
										style="height: 0.875rem; vertical-align: middle" /></div>
								</div>

						<p class="form-disclaimer">By completing your purchase, you agree to our <a href="<?php echo getBaseUrl(); ?>/src/terms.php">Terms of Service</a> and <a href="<?php echo getBaseUrl(); ?>/src/privacy.php">Privacy Policy</a>.</p>
							</form>
						</div>

						<div class="selected-plan-summary">
							<h3>Your Selected Plan <span id="selected-plan-name">Not Selected</span></h3>
							<p>Subscription Duration <span id="selected-plan-duration">-</span></p>
							<p>Regular Price <span id="selected-plan-official">-</span></p>
							<p>Your Savings <span id="selected-plan-savings">-</span></p>
							<p>Total <span id="selected-plan-price">-</span></p>

							<!-- Trust Guarantee Section -->
							<div class="trust-guarantee">
								<div class="guarantee-badge">
									<i class="fas fa-check"></i>
									<span>100% Satisfaction Guarantee</span>
								</div>
								<div class="guarantee-badge">
									<i class="fas fa-check"></i>
									<span>24/7 Customer Support</span>
								</div>
								<div class="guarantee-badge">
									<i class="fas fa-check"></i>
									<span>Email Delivery</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section class="faq fade-in" id="faq">
				<div class="container">
					<div class="section-heading">
						<h2>Frequently Asked Questions</h2>
						<p>Quick answers to common questions about our Adobe Creative Cloud subscriptions</p>
					</div>

					<div class="faq-accordion">
						<div class="faq-item">
							<div class="faq-question">
								<h3>How does cheapcc.online offer such low prices?</h3>
								<span class="faq-icon"><i class="fas fa-chevron-down"></i></span>
							</div>
							<div class="faq-answer">
								<p>As an alternative to cheapcc.net, we specialize in offering Adobe Creative Cloud subscriptions at significantly reduced prices. We achieve these savings through volume licensing agreements and strategic partnerships that allow us to pass the savings onto you. This is why we can offer up to 86% off compared to Adobe's official pricing while providing the same authentic product.</p>
							</div>
						</div>

						<div class="faq-item">
							<div class="faq-question">
								<h3>Are these genuine Adobe Creative Cloud subscriptions?</h3>
								<span class="faq-icon"><i class="fas fa-chevron-down"></i></span>
							</div>
							<div class="faq-answer">
								<p>Yes, absolutely. You will receive genuine Adobe Creative Cloud accounts with full access to all Creative Cloud applications and services. The subscriptions include regular updates, cloud storage, and all the features you would get from purchasing directly from Adobe, but at a much lower price.</p>
							</div>
						</div>

						<div class="faq-item">
							<div class="faq-question">
								<h3>How quickly will I receive my Adobe account details?</h3>
								<span class="faq-icon"><i class="fas fa-chevron-down"></i></span>
							</div>
							<div class="faq-answer">
								<p>In most cases, you will receive your Adobe account information immediately after your payment is confirmed. The details will be sent to the email address you provided during checkout. Occasionally, during periods of high demand, delivery may take up to 24 hours, but this is rare.</p>
							</div>
						</div>

						<div class="faq-item">
							<div class="faq-question">
								<h3>What payment methods do you accept?</h3>
								<span class="faq-icon"><i class="fas fa-chevron-down"></i></span>
							</div>
							<div class="faq-answer">
								<p>We currently accept payments through PayPal, which allows you to pay using your PayPal balance, linked bank account, or credit/debit card. This ensures your payment information is secure and protected.</p>
							</div>
						</div>

						<div class="faq-item">
							<div class="faq-question">
								<h3>What is your refund policy?</h3>
								<span class="faq-icon"><i class="fas fa-chevron-down"></i></span>
							</div>
							<div class="faq-answer">
								<p>We offer a 7-day money-back guarantee if you are unable to access the Adobe Creative Cloud services with the credentials provided. If you encounter any issues, please contact our support team at support@cheapcc.online with your order details, and we'll assist you promptly.</p>
							</div>
						</div>
					</div>

					<div class="view-all-faqs">
						<a href="<?php echo getBaseUrl(); ?>/src/faq.php" class="btn btn-outline">View All FAQs <i class="fas fa-arrow-right"></i></a>
					</div>
				</div>
			</section>
		</main>

<!-- Add Modal HTML for login/signup popup -->
		<div class="auth-modal" id="auth-modal" style="display: none;">
			<div class="auth-modal-overlay"></div>
			<div class="auth-modal-container">
				<div class="auth-modal-header">
					<h3>Create an Account</h3>
					<button class="auth-modal-close" aria-label="Close modal">&times;</button>
				</div>
				<div class="auth-modal-body">
					<p>Create an account or sign in to access exclusive benefits:</p>
					<ul class="auth-benefits">
						<li><i class="fas fa-check-circle"></i> Access your Adobe accounts anytime</li>
						<li><i class="fas fa-check-circle"></i> Track your orders and subscriptions</li>
						<li><i class="fas fa-check-circle"></i> Get priority customer support</li>
					</ul>
					
					<div class="auth-modal-buttons">
				<a href="<?php echo getBaseUrl(); ?>/register.php" class="btn btn-primary auth-btn">
							<i class="fas fa-user-plus"></i> Create Account
						</a>
				<a href="<?php echo getBaseUrl(); ?>/login.php" class="btn btn-outline auth-btn">
							<i class="fas fa-sign-in-alt"></i> Login
						</a>
						<button class="btn btn-ghost auth-btn guest-checkout-btn">
							<i class="fas fa-shopping-cart"></i> Continue as Guest
						</button>
					</div>
				</div>
			</div>
		</div>

		<style>
			/* Modal styles */
			.auth-modal {
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				z-index: 1000;
			}
			
			.auth-modal-overlay {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background-color: rgba(0, 0, 0, 0.6);
				backdrop-filter: blur(3px);
				animation: fadeIn 0.3s ease-out;
			}
			
			.auth-modal-container {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				width: 90%;
				max-width: 480px;
				background-color: var(--white);
				border-radius: var(--radius-lg);
				box-shadow: var(--shadow-xl);
				overflow: hidden;
				animation: scaleReveal 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
			}
			
			.auth-modal-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 1.25rem 1.5rem;
				border-bottom: 1px solid var(--gray-200);
				background: linear-gradient(90deg, var(--primary), var(--primary-light));
			}
			
			.auth-modal-header h3 {
				color: var(--white);
				margin: 0;
				font-size: 1.25rem;
			}
			
			.auth-modal-close {
				background: none;
				border: none;
				color: var(--white);
				font-size: 1.75rem;
				cursor: pointer;
				line-height: 1;
				padding: 0;
				opacity: 0.8;
				transition: opacity 0.2s;
			}
			
			.auth-modal-close:hover {
				opacity: 1;
			}
			
			.auth-modal-body {
				padding: 1.5rem;
			}
			
			.auth-modal-body p {
				color: var(--gray-800);
				font-size: 1rem;
				margin-bottom: 1.25rem;
			}
			
			.auth-benefits {
				list-style: none;
				padding: 0;
				margin: 0 0 1.5rem;
			}
			
			.auth-benefits li {
				padding: 0.5rem 0;
				display: flex;
				align-items: center;
				gap: 0.75rem;
				font-size: 0.95rem;
				color: var(--gray-700);
			}
			
			.auth-benefits li i {
				color: var(--success);
				font-size: 1rem;
				flex-shrink: 0;
			}
			
			.auth-modal-buttons {
				display: flex;
				flex-direction: column;
				gap: 0.75rem;
			}
			
			.auth-btn {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 0.5rem;
				padding: 0.8rem 1rem;
				width: 100%;
				font-weight: 600;
			}
			
			.guest-checkout-btn {
				margin-top: 0.5rem;
			}
			
			@media (max-width: 576px) {
				.auth-modal-container {
					width: 95%;
				}
			}
		</style>

<?php
// Setup page-specific scripts
$pageScripts = [];
// Include footer
include __DIR__ . '/../includes/footer.php';
?> 
