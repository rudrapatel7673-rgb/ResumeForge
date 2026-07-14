/* ============================================
   Local Storage Manager
   ============================================ */
const Storage = {
  PREFIX: 'resumeforge_',

  get(key) {
    try {
      const data = localStorage.getItem(this.PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Storage get error:', e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage set error:', e);
    }
  },

  remove(key) {
    localStorage.removeItem(this.PREFIX + key);
  },

  // Auth
  getUser() { return this.get('user'); },
  setUser(user) { this.set('user', user); },
  clearUser() { this.remove('user'); },

  // Resumes
  getResumes() { return this.get('resumes') || []; },
  setResumes(resumes) { this.set('resumes', resumes); },
  
  getResume(id) {
    const resumes = this.getResumes();
    return resumes.find(r => r.id === id) || null;
  },

  saveResume(resume) {
    const resumes = this.getResumes();
    const idx = resumes.findIndex(r => r.id === resume.id);
    resume.updatedAt = new Date().toISOString();
    if (idx >= 0) {
      resumes[idx] = resume;
    } else {
      resumes.unshift(resume);
    }
    this.setResumes(resumes);
  },

  deleteResume(id) {
    const resumes = this.getResumes().filter(r => r.id !== id);
    this.setResumes(resumes);
  },

  duplicateResume(id) {
    const resume = this.getResume(id);
    if (!resume) return null;
    const newResume = JSON.parse(JSON.stringify(resume));
    newResume.id = Helpers.generateId();
    newResume.name = resume.name + ' (Copy)';
    newResume.createdAt = new Date().toISOString();
    newResume.updatedAt = new Date().toISOString();
    const resumes = this.getResumes();
    resumes.unshift(newResume);
    this.setResumes(resumes);
    return newResume;
  },

  // Theme
  getTheme() { return this.get('theme') || 'dark'; },
  setTheme(theme) { this.set('theme', theme); },

  // Profile
  getProfile() {
    return this.get('profile') || {
      name: '',
      email: '',
    };
  },
  setProfile(profile) { this.set('profile', profile); }
};
