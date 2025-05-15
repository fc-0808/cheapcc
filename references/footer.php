    <footer>
        <div class="container footer-container">
            <div class="footer-section">
                <h3>CheapCC</h3>
                <p>Affordable Adobe Creative Cloud subscriptions for everyone.</p>
            </div>
            
            <div class="footer-section">
                <h3>Quick Links</h3>
                <ul class="footer-links">
                    <li><a href="<?php echo getBaseUrl(); ?>/index.php">Home</a></li>
                    <li><a href="<?php echo getBaseUrl(); ?>/index.php#pricing">Pricing</a></li>
                    <li><a href="<?php echo getBaseUrl(); ?>/src/support.php">Support</a></li>
                </ul>
            </div>
            
            <div class="footer-section">
                <h3>Legal</h3>
                <ul class="footer-links">
                    <li><a href="<?php echo getBaseUrl(); ?>/src/terms.php">Terms of Service</a></li>
                    <li><a href="<?php echo getBaseUrl(); ?>/src/privacy.php">Privacy Policy</a></li>
                    <li><a href="<?php echo getBaseUrl(); ?>/src/refund.php">Refund Policy</a></li>
                </ul>
            </div>
            
            <div class="footer-section">
                <h3>Contact</h3>
                <ul class="footer-links">
                    <li><a href="mailto:support@cheapcc.online">support@cheapcc.online</a></li>
                </ul>
            </div>
        </div>
        
        <div class="copyright">
            <div class="container">
                <p>&copy; <?php echo date('Y'); ?> CheapCC. All rights reserved.</p>
            </div>
        </div>
    </footer>
    
    <!-- Load scripts with defer for better performance -->
    <?php 
    // Define function to handle JavaScript files with new paths
    function js_tag($file, $defer = true) {
        $url = getBaseUrl() . '/public/js/' . $file;
        $defer_attr = $defer ? ' defer' : '';
        echo "<script src=\"{$url}\"{$defer_attr}></script>\n";
    }
    
    // Common script for all pages
    js_tag('script.js'); 
    
    // Page-specific scripts
    if (isset($pageScripts) && is_array($pageScripts)) {
        foreach ($pageScripts as $script) {
            js_tag($script);
        }
    }
    ?>
</body>
</html> 