/* ============================================
   Resume Context
   ============================================ */
const ResumeContext = {
  currentResume: null,
  listeners: [],

  subscribe(fn) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  },

  notify() {
    this.listeners.forEach(fn => fn(this.currentResume));
  },

  loadResume(id) {
    this.currentResume = Storage.getResume(id);
    this.notify();
    return this.currentResume;
  },

  createResume(templateId = 'modern') {
    const resume = Helpers.getDefaultResumeData();
    resume.template = templateId;
    
    // Apply sample data for a better first experience
    const sample = Helpers.getSampleResumeData(templateId);
    resume.personal = { ...sample.personal };
    resume.experience = [ ...sample.experience ];
    resume.education = [ ...sample.education ];
    resume.skills = [ ...sample.skills ];
    resume.projects = [ ...sample.projects ];
    resume.certifications = [ ...sample.certifications ];
    resume.languages = [ ...sample.languages ];
    resume.name = sample.personal.fullName + "'s Resume";
    
    Storage.saveResume(resume);
    this.currentResume = resume;
    this.notify();
    return resume;
  },

  updateResume(data) {
    if (!this.currentResume) return;
    Object.assign(this.currentResume, data);
    this.currentResume.updatedAt = new Date().toISOString();
    Storage.saveResume(this.currentResume);
    this.notify();
  },

  updatePersonal(field, value) {
    if (!this.currentResume) return;
    this.currentResume.personal[field] = value;
    this.currentResume.updatedAt = new Date().toISOString();
    Storage.saveResume(this.currentResume);
    this.notify();
  },

  addExperience() {
    if (!this.currentResume) return;
    const item = {
      id: Helpers.generateId(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    this.currentResume.experience.push(item);
    Storage.saveResume(this.currentResume);
    this.notify();
    return item;
  },

  updateExperience(id, field, value) {
    if (!this.currentResume) return;
    const item = this.currentResume.experience.find(e => e.id === id);
    if (item) {
      item[field] = value;
      this.currentResume.updatedAt = new Date().toISOString();
      Storage.saveResume(this.currentResume);
      this.notify();
    }
  },

  removeExperience(id) {
    if (!this.currentResume) return;
    this.currentResume.experience = this.currentResume.experience.filter(e => e.id !== id);
    Storage.saveResume(this.currentResume);
    this.notify();
  },

  addEducation() {
    if (!this.currentResume) return;
    const item = {
      id: Helpers.generateId(),
      degree: '',
      school: '',
      location: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    this.currentResume.education.push(item);
    Storage.saveResume(this.currentResume);
    this.notify();
    return item;
  },

  updateEducation(id, field, value) {
    if (!this.currentResume) return;
    const item = this.currentResume.education.find(e => e.id === id);
    if (item) {
      item[field] = value;
      this.currentResume.updatedAt = new Date().toISOString();
      Storage.saveResume(this.currentResume);
      this.notify();
    }
  },

  removeEducation(id) {
    if (!this.currentResume) return;
    this.currentResume.education = this.currentResume.education.filter(e => e.id !== id);
    Storage.saveResume(this.currentResume);
    this.notify();
  },

  addSkill(skill) {
    if (!this.currentResume) return;
    if (skill && !this.currentResume.skills.includes(skill)) {
      this.currentResume.skills.push(skill);
      Storage.saveResume(this.currentResume);
      this.notify();
    }
  },

  removeSkill(skill) {
    if (!this.currentResume) return;
    this.currentResume.skills = this.currentResume.skills.filter(s => s !== skill);
    Storage.saveResume(this.currentResume);
    this.notify();
  },

  addProject() {
    if (!this.currentResume) return;
    const item = {
      id: Helpers.generateId(),
      name: '',
      description: '',
      technologies: '',
      link: ''
    };
    this.currentResume.projects.push(item);
    Storage.saveResume(this.currentResume);
    this.notify();
    return item;
  },

  updateProject(id, field, value) {
    if (!this.currentResume) return;
    const item = this.currentResume.projects.find(p => p.id === id);
    if (item) {
      item[field] = value;
      Storage.saveResume(this.currentResume);
      this.notify();
    }
  },

  removeProject(id) {
    if (!this.currentResume) return;
    this.currentResume.projects = this.currentResume.projects.filter(p => p.id !== id);
    Storage.saveResume(this.currentResume);
    this.notify();
  },

  setTemplate(templateId) {
    if (!this.currentResume) return;
    this.currentResume.template = templateId;
    Storage.saveResume(this.currentResume);
    this.notify();
  },

  getAllResumes() {
    return Storage.getResumes();
  },

  deleteResume(id) {
    Storage.deleteResume(id);
    if (this.currentResume && this.currentResume.id === id) {
      this.currentResume = null;
    }
    this.notify();
  },

  duplicateResume(id) {
    return Storage.duplicateResume(id);
  }
};
