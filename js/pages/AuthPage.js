/* ============================================
   Auth Page — Email + OTP Login & Register
   ============================================ */
const AuthPage = {
  step: 1, // 1 = input details, 2 = OTP
  mode: 'login', // 'login' or 'register'
  fullName: '',
  email: '',
  otp: ['', '', '', '', '', ''],
  localOtp: '',
  isLoading: false,
  error: '',
  timer: 30,
  timerInterval: null,

  render() {
    // Redirect if already logged in
    if (AuthContext.isAuthenticated) {
      setTimeout(() => Router.navigate('/dashboard'), 0);
      return '<div></div>';
    }

    const title = this.mode === 'login' ? 'Welcome Back' : 'Create Account';
    const subtitle = this.step === 1 
      ? (this.mode === 'login' ? 'Enter your email to login' : 'Fill details to create your account')
      : 'Enter the 6-digit code sent to your email';

    return `
      <div class="auth-page">
        <div class="auth-bg-effects">
          <div class="hero-orb hero-orb-1"></div>
          <div class="hero-orb hero-orb-2"></div>
        </div>
        <div class="auth-card">
          <div class="auth-logo">
            <div class="auth-logo-icon">📄</div>
            <h2>${title}</h2>
            <p class="auth-subtitle">${subtitle}</p>
          </div>

          <!-- Mode Selector Tabs (only visible on step 1) -->
          ${this.step === 1 ? `
            <div class="tabs" style="margin-bottom: var(--space-6);">
              <button class="tab ${this.mode === 'login' ? 'active' : ''}" id="tab-login">Login</button>
              <button class="tab ${this.mode === 'register' ? 'active' : ''}" id="tab-register">Register</button>
            </div>
          ` : ''}

          <!-- Step Indicator -->
          <div class="auth-step-indicator">
            <div class="auth-step">
              <div class="auth-step-dot ${this.step >= 1 ? (this.step > 1 ? 'completed' : 'active') : 'inactive'}">
                ${this.step > 1 ? '✓' : '1'}
              </div>
            </div>
            <div class="auth-step-line ${this.step > 1 ? 'active' : ''}"></div>
            <div class="auth-step">
              <div class="auth-step-dot ${this.step === 2 ? 'active' : 'inactive'}">2</div>
            </div>
          </div>

          <div id="auth-form-content">
            ${this.step === 1 ? this.renderInputStep() : this.renderOTPStep()}
          </div>

          ${this.error ? `<div class="form-error" style="justify-content:center; margin-top: var(--space-4);">⚠ ${Helpers.escapeHtml(this.error)}</div>` : ''}
        </div>
      </div>
    `;
  },

  renderInputStep() {
    if (this.mode === 'register') {
      return `
        <form id="input-form" class="fade-in">
          <div class="form-group">
            <input type="text" 
                   id="auth-name" 
                   class="form-input" 
                   placeholder=" " 
                   value="${Helpers.escapeHtml(this.fullName)}"
                   required>
            <label class="form-label" for="auth-name">Full Name</label>
            <span class="form-icon">👤</span>
          </div>
          <div class="form-group">
            <input type="email" 
                   id="auth-email" 
                   class="form-input" 
                   placeholder=" " 
                   value="${Helpers.escapeHtml(this.email)}"
                   autocomplete="email"
                   required>
            <label class="form-label" for="auth-email">Email Address</label>
            <span class="form-icon">✉</span>
          </div>
          <button type="submit" class="btn btn-primary btn-lg" style="width:100%;" ${this.isLoading ? 'disabled' : ''}>
            ${this.isLoading ? '<span class="spinner"></span> Registering...' : 'Register & Send OTP →'}
          </button>
        </form>
      `;
    } else {
      return `
        <form id="input-form" class="fade-in">
          <div class="form-group">
            <input type="email" 
                   id="auth-email" 
                   class="form-input" 
                   placeholder=" " 
                   value="${Helpers.escapeHtml(this.email)}"
                   autocomplete="email"
                   required>
            <label class="form-label" for="auth-email">Email Address</label>
            <span class="form-icon">✉</span>
          </div>
          <button type="submit" class="btn btn-primary btn-lg" style="width:100%;" ${this.isLoading ? 'disabled' : ''}>
            ${this.isLoading ? '<span class="spinner"></span> Sending OTP...' : 'Send OTP →'}
          </button>
        </form>
      `;
    }
  },

  renderOTPStep() {
    return `
      <div class="fade-in">
        <p style="text-align:center; font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-2);">
          Code sent to <strong style="color: var(--accent-primary);">${Helpers.escapeHtml(this.email)}</strong>
        </p>
        <button class="btn btn-ghost btn-sm" style="display:block; margin: 0 auto var(--space-4);" id="change-email-btn">
          Change details
        </button>
        
        ${this.localOtp ? `
          <div style="text-align:center; margin-bottom: var(--space-4); border: 1px solid rgba(0, 212, 170, 0.2); background: rgba(0, 212, 170, 0.05); padding: var(--space-3); border-radius: 8px; font-size: var(--text-xs); color: #00D4AA; line-height: 1.4;">
            💡 <strong>Local Development Fallback</strong><br>
            Email could not be sent. We have pre-filled the OTP code (<strong>${this.localOtp}</strong>) for you.
          </div>
        ` : ''}

        <div class="otp-container" id="otp-container">
          ${this.otp.map((digit, i) => `
            <input type="text" 
                   class="otp-input ${digit ? 'filled' : ''}" 
                   id="otp-${i}" 
                   maxlength="1" 
                   inputmode="numeric" 
                   pattern="[0-9]"
                   value="${digit}"
                   autocomplete="one-time-code"
                   aria-label="OTP digit ${i + 1}">
          `).join('')}
        </div>

        <div class="otp-timer" id="otp-timer">
          ${this.timer > 0 ? 
            `Resend code in <span>${this.timer}s</span>` : 
            `<button class="otp-resend" id="resend-otp-btn">Resend Code</button>`
          }
        </div>

        <button class="btn btn-primary btn-lg" style="width:100%;" id="verify-otp-btn" ${this.isLoading ? 'disabled' : ''}>
          ${this.isLoading ? '<span class="spinner"></span> Verifying...' : 'Verify & Login'}
        </button>
      </div>
    `;
  },

  init() {
    if (this.step === 1) {
      this.initInputStep();
    } else {
      this.initOTPStep();
    }
  },

  initInputStep() {
    // Mode switcher buttons
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');

    if (tabLogin) {
      tabLogin.addEventListener('click', () => {
        if (this.mode !== 'login') {
          this.mode = 'login';
          this.error = '';
          this.rerender();
        }
      });
    }

    if (tabRegister) {
      tabRegister.addEventListener('click', () => {
        if (this.mode !== 'register') {
          this.mode = 'register';
          this.error = '';
          this.rerender();
        }
      });
    }

    const form = document.getElementById('input-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const emailInput = document.getElementById('auth-email');
        const nameInput = document.getElementById('auth-name');
        
        const email = emailInput.value.trim();
        const fullName = nameInput ? nameInput.value.trim() : '';

        if (!Helpers.validateEmail(email)) {
          this.error = 'Please enter a valid email address';
          this.rerender();
          return;
        }

        this.email = email;
        this.fullName = fullName;
        this.isLoading = true;
        this.error = '';
        this.rerender();

        try {
          const result = await AuthContext.sendOTP(email, this.mode);
          this.isLoading = false;
          this.step = 2;
          this.timer = 30;
          if (result && result.otp) {
            this.localOtp = result.otp;
            this.otp = result.otp.split('');
          } else {
            this.localOtp = '';
            this.otp = ['', '', '', '', '', ''];
          }
          this.rerender();
          this.startTimer();
          Toast.success('OTP Sent', `Verification code sent to ${email}`);
        } catch (err) {
          this.isLoading = false;
          this.error = err.message || 'Failed to send OTP';
          this.rerender();
        }
      });
    }
  },

  initOTPStep() {
    // OTP input auto-focus logic
    const inputs = document.querySelectorAll('.otp-input');
    inputs.forEach((input, i) => {
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        e.target.value = val;
        this.otp[i] = val;

        if (val && val.length === 1) {
          e.target.classList.add('filled');
          if (i < 5) inputs[i + 1].focus();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && i > 0) {
          inputs[i - 1].focus();
          inputs[i - 1].value = '';
          this.otp[i - 1] = '';
          inputs[i - 1].classList.remove('filled');
        }
      });

      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasteData = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
        pasteData.split('').forEach((char, j) => {
          if (inputs[j]) {
            inputs[j].value = char;
            inputs[j].classList.add('filled');
            this.otp[j] = char;
          }
        });
        if (pasteData.length > 0 && inputs[Math.min(pasteData.length, 5)]) {
          inputs[Math.min(pasteData.length, 5)].focus();
        }
      });
    });

    // Focus first empty input
    const firstEmpty = Array.from(inputs).find(i => !i.value);
    if (firstEmpty) firstEmpty.focus();
    else if (inputs[0]) inputs[0].focus();

    // Verify button
    const verifyBtn = document.getElementById('verify-otp-btn');
    if (verifyBtn) {
      verifyBtn.addEventListener('click', () => this.handleVerify());
    }

    // Change details/email
    const changeEmailBtn = document.getElementById('change-email-btn');
    if (changeEmailBtn) {
      changeEmailBtn.addEventListener('click', () => {
        this.step = 1;
        this.otp = ['', '', '', '', '', ''];
        this.error = '';
        this.clearTimer();
        this.rerender();
      });
    }

    // Resend
    const resendBtn = document.getElementById('resend-otp-btn');
    if (resendBtn) {
      resendBtn.addEventListener('click', async () => {
        this.timer = 30;
        this.startTimer();
        this.rerender();
        try {
          const result = await AuthContext.sendOTP(this.email, this.mode);
          if (result && result.otp) {
            this.localOtp = result.otp;
            this.otp = result.otp.split('');
          }
          this.rerender();
          Toast.info('OTP Resent', 'A new code has been sent');
        } catch (err) {
          this.error = err.message || 'Failed to resend OTP';
          this.rerender();
        }
      });
    }
  },

  async handleVerify() {
    const code = this.otp.join('');
    if (code.length !== 6) {
      this.error = 'Please enter all 6 digits';
      document.querySelectorAll('.otp-input').forEach(i => {
        if (!i.value) i.classList.add('error');
      });
      this.rerender();
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.rerender();

    try {
      await AuthContext.verifyOTP(this.email, code, this.fullName);
      this.clearTimer();
      Toast.success('Welcome!', 'You have been logged in successfully');
      setTimeout(() => Router.navigate('/dashboard'), 500);
    } catch (err) {
      this.isLoading = false;
      this.error = err.message || 'Verification failed';
      this.otp = ['', '', '', '', '', ''];
      this.rerender();
    }
  },

  startTimer() {
    this.clearTimer();
    this.timerInterval = setInterval(() => {
      this.timer--;
      const timerEl = document.getElementById('otp-timer');
      if (timerEl) {
        if (this.timer > 0) {
          timerEl.innerHTML = `Resend code in <span>${this.timer}s</span>`;
        } else {
          timerEl.innerHTML = `<button class="otp-resend" id="resend-otp-btn">Resend Code</button>`;
          const resendBtn = document.getElementById('resend-otp-btn');
          if (resendBtn) {
            resendBtn.addEventListener('click', async () => {
              this.timer = 30;
              this.startTimer();
              this.rerender();
              try {
                const result = await AuthContext.sendOTP(this.email, this.mode);
                if (result && result.otp) {
                  this.localOtp = result.otp;
                  this.otp = result.otp.split('');
                }
                this.rerender();
                Toast.info('OTP Resent', 'A new code has been sent');
              } catch (err) {
                this.error = err.message || 'Failed to resend OTP';
                this.rerender();
              }
            });
          }
          this.clearTimer();
        }
      }
    }, 1000);
  },

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  rerender() {
    const pageContent = document.getElementById('page-content');
    if (pageContent) {
      pageContent.innerHTML = this.render();
      this.init();
    }
  },

  cleanup() {
    this.clearTimer();
    this.step = 1;
    this.otp = ['', '', '', '', '', ''];
    this.localOtp = '';
    this.error = '';
    this.isLoading = false;
  }
};
