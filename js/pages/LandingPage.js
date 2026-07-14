/* ============================================
   Landing Page
   ============================================ */
const LandingPage = {
  render() {
    return `
      <div class="landing-page">
        ${Navbar.render({ showNav: false })}

        <!-- Hero Section -->
        <section class="hero" id="hero">
          <div class="hero-bg-orbs">
            <div class="hero-orb hero-orb-1"></div>
            <div class="hero-orb hero-orb-2"></div>
            <div class="hero-orb hero-orb-3"></div>
          </div>
          <div class="hero-content">
            <div class="hero-text fade-in-up">
              <div class="hero-badge">
                <span class="hero-badge-dot"></span>
                AI-Powered Resume Builder
              </div>
              <h1>Build Your <span>Dream Resume</span> in Minutes</h1>
              <p class="hero-subtitle">Create stunning, ATS-friendly resumes with our intelligent builder. Choose from premium templates, customize with live preview, and export to PDF instantly.</p>
              <div class="hero-cta">
                <a href="#/auth" class="btn btn-primary btn-lg">
                  Get Started Free →
                </a>
                <a href="#features" class="btn btn-secondary btn-lg">
                  See Features
                </a>
              </div>
              <div class="hero-stats-row">
                <div class="hero-stat">
                  <div class="hero-stat-value" data-count="50000">0</div>
                  <div class="hero-stat-label">Resumes Created</div>
                </div>
                <div class="hero-stat">
                  <div class="hero-stat-value" data-count="12000">0</div>
                  <div class="hero-stat-label">Users</div>
                </div>
                <div class="hero-stat">
                  <div class="hero-stat-value" data-count="4">0</div>
                  <div class="hero-stat-label">Templates</div>
                </div>
              </div>
            </div>
            <div class="hero-visual fade-in-up stagger-3">
              <div class="hero-resume-preview">
                <div class="hero-resume-header">
                  <div class="hero-resume-avatar">AJ</div>
                  <div>
                    <div class="hero-resume-name">Alex Johnson</div>
                    <div class="hero-resume-title">Senior Developer</div>
                  </div>
                </div>
                <div class="hero-resume-section">
                  <div class="hero-resume-section-title">Experience</div>
                  <div class="hero-resume-line w-90"></div>
                  <div class="hero-resume-line w-70"></div>
                  <div class="hero-resume-line w-80"></div>
                </div>
                <div class="hero-resume-section">
                  <div class="hero-resume-section-title">Education</div>
                  <div class="hero-resume-line w-80"></div>
                  <div class="hero-resume-line w-60"></div>
                </div>
                <div class="hero-resume-section">
                  <div class="hero-resume-section-title">Skills</div>
                  <div class="hero-resume-line w-50"></div>
                  <div class="hero-resume-line w-70"></div>
                  <div class="hero-resume-line w-40"></div>
                </div>
              </div>
              <div class="hero-float-badge top-right">
                <span style="color: var(--accent-tertiary);">✓</span> ATS Optimized
              </div>
              <div class="hero-float-badge bottom-left">
                <span style="color: var(--accent-primary);">⚡</span> Live Preview
              </div>
              <div class="hero-float-badge top-left">
                <span style="color: var(--accent-secondary);">🎨</span> 4 Templates
              </div>
            </div>
          </div>
        </section>

        <!-- Features Section -->
        <section class="features-section container" id="features">
          <div class="section-header">
            <div class="section-badge">✨ Features</div>
            <h2 class="section-title">Everything You Need to <span class="text-gradient">Stand Out</span></h2>
            <p class="section-subtitle">Powerful tools designed to help you create professional resumes that get you hired.</p>
          </div>
          <div class="features-grid">
            <div class="feature-card animate-on-scroll">
              <div class="feature-icon purple">🎨</div>
              <h3>Premium Templates</h3>
              <p>Choose from 4 professionally designed templates — Modern, Classic, Minimal, and Creative — each crafted to impress.</p>
            </div>
            <div class="feature-card animate-on-scroll">
              <div class="feature-icon pink">⚡</div>
              <h3>Live Preview</h3>
              <p>See your resume update in real-time as you type. What you see is exactly what you'll download.</p>
            </div>
            <div class="feature-card animate-on-scroll">
              <div class="feature-icon green">📱</div>
              <h3>Responsive Design</h3>
              <p>Build your resume from any device — desktop, tablet, or phone. Your workspace adapts perfectly.</p>
            </div>
            <div class="feature-card animate-on-scroll">
              <div class="feature-icon blue">📥</div>
              <h3>PDF Export</h3>
              <p>Download your finished resume as a professional PDF file, ready to send to employers.</p>
            </div>
            <div class="feature-card animate-on-scroll">
              <div class="feature-icon orange">💾</div>
              <h3>Auto-Save</h3>
              <p>Never lose your progress. Every change is automatically saved to your browser locally.</p>
            </div>
            <div class="feature-card animate-on-scroll">
              <div class="feature-icon red">🔒</div>
              <h3>OTP Login</h3>
              <p>Secure, passwordless authentication. Just enter your email and a 6-digit code to access your resumes.</p>
            </div>
          </div>
        </section>

        <!-- How It Works -->
        <section class="how-it-works" id="how-it-works">
          <div class="container">
            <div class="section-header">
              <div class="section-badge">🚀 How It Works</div>
              <h2 class="section-title">Create Your Resume in <span class="text-gradient">3 Steps</span></h2>
              <p class="section-subtitle">Getting your professional resume ready has never been easier.</p>
            </div>
            <div class="steps-container">
              <div class="step-card animate-on-scroll">
                <div class="step-number">1</div>
                <h3>Choose a Template</h3>
                <p>Pick from our curated collection of premium resume templates.</p>
                <div class="step-connector"></div>
              </div>
              <div class="step-card animate-on-scroll">
                <div class="step-number">2</div>
                <h3>Fill Your Details</h3>
                <p>Add your experience, education, and skills with our easy form builder.</p>
                <div class="step-connector"></div>
              </div>
              <div class="step-card animate-on-scroll">
                <div class="step-number">3</div>
                <h3>Download & Share</h3>
                <p>Export as PDF and start applying to your dream job right away!</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Testimonials -->
        <section class="testimonials-section container" id="testimonials">
          <div class="section-header">
            <div class="section-badge">💬 Testimonials</div>
            <h2 class="section-title">Loved by <span class="text-gradient">Job Seekers</span></h2>
            <p class="section-subtitle">Join thousands who've already built their perfect resume.</p>
          </div>
          <div class="testimonials-grid">
            <div class="testimonial-card animate-on-scroll">
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-text">"I landed 3 interviews in the first week after using ResumeForge. The modern template really made my application stand out from the crowd!"</p>
              <div class="testimonial-author">
                <div class="testimonial-avatar">SK</div>
                <div>
                  <div class="testimonial-name">Sarah Kim</div>
                  <div class="testimonial-role">UX Designer at Google</div>
                </div>
              </div>
            </div>
            <div class="testimonial-card animate-on-scroll">
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-text">"The live preview feature is incredible. Being able to see changes in real-time saved me hours of formatting. Highly recommended!"</p>
              <div class="testimonial-author">
                <div class="testimonial-avatar">MR</div>
                <div>
                  <div class="testimonial-name">Marcus Rivera</div>
                  <div class="testimonial-role">Software Engineer at Meta</div>
                </div>
              </div>
            </div>
            <div class="testimonial-card animate-on-scroll">
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-text">"Best resume builder I've ever used. Clean interface, beautiful templates, and the PDF export is flawless. Worth every minute spent!"</p>
              <div class="testimonial-author">
                <div class="testimonial-avatar">EP</div>
                <div>
                  <div class="testimonial-name">Emily Park</div>
                  <div class="testimonial-role">Product Manager at Amazon</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="cta-section">
          <div class="container">
            <div class="cta-card animate-on-scroll">
              <h2>Ready to Build Your <span class="text-gradient">Perfect Resume</span>?</h2>
              <p>Join 12,000+ professionals who trust ResumeForge for their career success.</p>
              <a href="#/auth" class="btn btn-primary btn-lg">Start Building Now — It's Free →</a>
            </div>
          </div>
        </section>

        ${Footer.render()}
      </div>
    `;
  },

  init() {
    Navbar.init();

    // Animate stats counters
    Helpers.observeElements('.hero-stat-value[data-count]', (el) => {
      const target = parseInt(el.getAttribute('data-count'));
      Helpers.animateCounter(el, target);
    });

    // Scroll animations
    Helpers.observeElements('.animate-on-scroll', (el) => {
      el.classList.add('fade-in-up');
    }, { threshold: 0.15 });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (href.startsWith('#/') || href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
};
