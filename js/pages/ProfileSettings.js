/* ============================================
   Profile Settings Page
   ============================================ */
const ProfileSettings = {
  render() {
    const user = AuthContext.user;
    const profile = Storage.getProfile();
    const initials = Helpers.getInitials(profile.name || user?.name || user?.email || '?');

    return `
      ${Navbar.render()}
      <div class="main-with-sidebar" style="margin-top:70px;">
        <div class="profile-page fade-in">
          <h1>⚙️ Profile Settings</h1>

          <!-- Profile Section -->
          <div class="settings-section">
            <h2>👤 Profile Information</h2>
            <div class="profile-avatar-section">
              <div class="profile-avatar-large">${initials}</div>
              <div>
                <div style="font-weight: 700; font-size: var(--text-lg);">${Helpers.escapeHtml(profile.name || 'User')}</div>
                <div style="color: var(--text-secondary); font-size: var(--text-sm);">${Helpers.escapeHtml(profile.email || user?.email || '')}</div>
              </div>
            </div>
            <div class="form-group">
              <input type="text" class="form-input" id="profile-name" placeholder=" " value="${Helpers.escapeHtml(profile.name || '')}">
              <label class="form-label">Full Name</label>
            </div>
            <div class="form-group">
              <input type="email" class="form-input" id="profile-email" placeholder=" " value="${Helpers.escapeHtml(profile.email || user?.email || '')}" readonly style="opacity:0.7; cursor:not-allowed;">
              <label class="form-label">Email Address</label>
            </div>
            <button class="btn btn-primary" id="save-profile-btn">Save Changes</button>
          </div>

          <!-- Appearance -->
          <div class="settings-section">
            <h2>🎨 Appearance</h2>
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <div>
                <div style="font-weight:600;">Theme</div>
                <div style="font-size: var(--text-sm); color: var(--text-secondary);">Choose between dark and light mode</div>
              </div>
              <div class="tabs" style="width: auto;">
                <button class="tab ${UIContext.theme === 'dark' ? 'active' : ''}" data-theme="dark">🌙 Dark</button>
                <button class="tab ${UIContext.theme === 'light' ? 'active' : ''}" data-theme="light">☀️ Light</button>
              </div>
            </div>
          </div>

          <!-- Data -->
          <div class="settings-section">
            <h2>📦 Data Management</h2>
            <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-4);">
              All your data is stored locally in your browser. Export your data to keep a backup.
            </p>
            <div style="display:flex; gap: var(--space-3);">
              <button class="btn btn-secondary" id="export-data-btn">📤 Export Data</button>
              <button class="btn btn-secondary" id="import-data-btn">📥 Import Data</button>
              <input type="file" id="import-file-input" accept=".json" style="display:none;">
            </div>
          </div>

          <!-- Danger Zone -->
          <div class="settings-section danger-zone">
            <h2>⚠️ Danger Zone</h2>
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <div>
                <div style="font-weight:600;">Delete All Data</div>
                <div style="font-size: var(--text-sm); color: var(--text-secondary);">Permanently remove all resumes and account data</div>
              </div>
              <button class="btn btn-danger" id="delete-all-btn">Delete All</button>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-top: var(--space-4);">
              <div>
                <div style="font-weight:600;">Logout</div>
                <div style="font-size: var(--text-sm); color: var(--text-secondary);">Sign out of your account</div>
              </div>
              <button class="btn btn-outline" id="logout-btn">🚪 Logout</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    Navbar.init();

    // Save profile
    const saveBtn = document.getElementById('save-profile-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const name = document.getElementById('profile-name').value.trim();
        const profile = Storage.getProfile();
        profile.name = name;
        Storage.setProfile(profile);
        
        // Update auth user name too
        if (AuthContext.user) {
          AuthContext.user.name = name;
          Storage.setUser(AuthContext.user);
        }
        
        Toast.success('Saved', 'Profile updated successfully');
        Router.navigate('/profile');
      });
    }

    // Theme tabs
    document.querySelectorAll('[data-theme]').forEach(tab => {
      tab.addEventListener('click', () => {
        UIContext.theme = tab.dataset.theme;
        document.documentElement.setAttribute('data-theme', UIContext.theme);
        Storage.setTheme(UIContext.theme);
        document.querySelectorAll('[data-theme]').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });

    // Export data
    const exportBtn = document.getElementById('export-data-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const data = {
          resumes: Storage.getResumes(),
          profile: Storage.getProfile(),
          exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resumeforge_backup.json';
        a.click();
        URL.revokeObjectURL(url);
        Toast.success('Exported', 'Data backup downloaded');
      });
    }

    // Import data
    const importBtn = document.getElementById('import-data-btn');
    const importFile = document.getElementById('import-file-input');
    if (importBtn && importFile) {
      importBtn.addEventListener('click', () => importFile.click());
      importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result);
            if (data.resumes) Storage.setResumes(data.resumes);
            if (data.profile) Storage.setProfile(data.profile);
            Toast.success('Imported', 'Data restored successfully');
            Router.navigate('/profile');
          } catch (err) {
            Toast.error('Import Failed', 'Invalid backup file');
          }
        };
        reader.readAsText(file);
      });
    }

    // Delete all
    const deleteAllBtn = document.getElementById('delete-all-btn');
    if (deleteAllBtn) {
      deleteAllBtn.addEventListener('click', async () => {
        const confirmed = await Modal.confirm({
          title: 'Delete All Data?',
          message: 'This will permanently delete all your resumes and profile data. This cannot be undone!',
          confirmText: 'Delete Everything',
          type: 'danger',
          icon: '⚠️'
        });
        if (confirmed) {
          Storage.setResumes([]);
          Toast.success('Deleted', 'All data has been removed');
          Router.navigate('/dashboard');
        }
      });
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => AuthContext.logout());
    }
  }
};
