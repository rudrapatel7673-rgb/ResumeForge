/* ============================================
   Footer Component
   ============================================ */
const Footer = {
  render() {
    return `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <div class="footer-brand-logo">
                <div class="navbar-logo-icon">📄</div>
                <span class="footer-brand-text">ResumeForge</span>
              </div>
              <p>Create stunning, professional resumes in minutes. Choose from premium templates, customize with live preview, and land your dream job.</p>
              <div class="footer-socials">
                <button class="footer-social-btn" aria-label="Twitter">𝕏</button>
                <button class="footer-social-btn" aria-label="LinkedIn">in</button>
                <button class="footer-social-btn" aria-label="GitHub">⌂</button>
                <button class="footer-social-btn" aria-label="Email">✉</button>
              </div>
            </div>
            <div>
              <h4 class="footer-col-title">Product</h4>
              <ul class="footer-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#/auth">Templates</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 class="footer-col-title">Support</h4>
              <ul class="footer-links">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">FAQs</a></li>
                <li><a href="#">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 class="footer-col-title">Legal</h4>
              <ul class="footer-links">
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© ${new Date().getFullYear()} ResumeForge. All rights reserved.</span>
            <span>Crafted with ❤️ for job seekers everywhere</span>
          </div>
        </div>
      </footer>
    `;
  }
};
