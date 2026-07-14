/* ============================================
   Auth Context
   ============================================ */
const AuthContext = {
  user: null,
  isAuthenticated: false,
  listeners: [],

  init() {
    const user = Storage.getUser();
    if (user) {
      this.user = user;
      this.isAuthenticated = true;
    }
  },

  subscribe(fn) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  },

  notify() {
    this.listeners.forEach(fn => fn(this.getState()));
  },

  getState() {
    return { user: this.user, isAuthenticated: this.isAuthenticated };
  },

  // Send OTP via PHP Backend
  async sendOTP(email, type) {
    const response = await fetch('api/send-otp.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, type })
    });
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to send OTP.');
    }
    
    // Developer testing fallback: auto-display the OTP when on localhost
    if (result.otp) {
      console.log('Testing OTP (Local):', result.otp);
      Toast.info('Testing OTP (Local): ' + result.otp, 'Use this code to login');
    }
    return result;
  },

  // Verify OTP via PHP Backend
  async verifyOTP(email, otp, name) {
    const response = await fetch('api/verify-otp.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp, name })
    });
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Invalid OTP code.');
    }
    
    this.user = result.user;
    this.isAuthenticated = true;
    Storage.setUser(result.user);
    Storage.setProfile({ name: result.user.name, email: result.user.email });
    
    // Store session token in storage
    Storage.set('token', result.token);

    this.notify();
    return result;
  },

  logout() {
    this.user = null;
    this.isAuthenticated = false;
    Storage.clearUser();
    Storage.remove('token');
    this.notify();
    Router.navigate('/');
  }
};
