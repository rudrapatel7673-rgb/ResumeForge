/* ============================================
   Utility Helpers
   ============================================ */
const Helpers = {
  generateId() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  },

  formatDateFull(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  timeAgo(dateStr) {
    const now = new Date();
    const d = new Date(dateStr);
    const seconds = Math.floor((now - d) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return Helpers.formatDateFull(dateStr);
  },

  debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  },

  animateCounter(el, target, duration = 2000) {
    let start = 0;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  observeElements(selector, callback, options = {}) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target);
          if (!options.repeat) observer.unobserve(entry.target);
        }
      });
    }, { threshold: options.threshold || 0.1 });
    document.querySelectorAll(selector).forEach(el => observer.observe(el));
    return observer;
  },

  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  getDefaultResumeData() {
    return {
      id: Helpers.generateId(),
      name: 'Untitled Resume',
      template: 'modern',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      personal: {
        fullName: '',
        jobTitle: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        summary: ''
      },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: []
    };
  },

  getSampleResumeData(templateId = 'modern') {
    switch (templateId) {
      case 'modern': // Premium (Project Manager - Chris Flims)
        return {
          personal: {
            fullName: 'Chris Flims',
            jobTitle: 'Project Manager',
            email: 'chris.flims@email.com',
            phone: '+1 (555) 019-9234',
            location: 'Seattle, WA',
            website: 'chrisflims.pm',
            linkedin: 'linkedin.com/in/chrisflims',
            summary: 'Dynamic and goal-oriented Project Manager with over 6 years of comprehensive experience in software project management, agile frameworks, and team delivery. Skilled in cost analysis, risk management, and vendor strategy.'
          },
          experience: [
            {
              id: 'exp1',
              title: 'Project Manager',
              company: 'UHI Logistics',
              location: 'Seattle, WA',
              startDate: '2022-01',
              endDate: '',
              current: true,
              description: 'Queue responsibility for the management of multiple software projects, while establishing and maintaining communication|Oversee overall implementation alongside vendor strategy, organization, and consistent system integration'
            },
            {
              id: 'exp2',
              title: 'Assistant Project Manager',
              company: 'Sunshine Blog Enterprise',
              location: 'Seattle, WA',
              startDate: '2019-06',
              endDate: '2021-12',
              current: false,
              description: 'Demonstrated cross-functionality by serving as a subject matter expert on several project boards|Offered execution assistance, assessed project risks, and recommended improvements'
            }
          ],
          education: [
            {
              id: 'edu1',
              degree: 'Master of Science in Project Management',
              school: 'University of Washington',
              location: 'Seattle, WA',
              startDate: '2017-09',
              endDate: '2019-05',
              description: 'Graduated with Honors | Focus on Agile and SDLC Methodologies'
            }
          ],
          skills: ['Project Management', 'Agile & Scrum', 'Risk Management', 'Resource Optimization', 'Budgeting & Cost Control', 'Team Leadership'],
          projects: [
            {
              id: 'proj1',
              name: 'Enterprise Logistics Sync',
              description: 'Led end-to-end deployment of an enterprise logistics platform coordinating 4 distinct vendor API channels.',
              technologies: 'Jira, Slack, MS Project',
              link: 'projects.chrisflims.pm/logistics'
            }
          ],
          certifications: [
            { id: 'cert1', name: 'Project Management Professional (PMP)', issuer: 'Project Management Institute', date: '2023-01' }
          ],
          languages: [
            { id: 'lang1', name: 'English', level: 'Native' },
            { id: 'lang2', name: 'French', level: 'Fluent' }
          ]
        };

      case 'classic': // Free (Retail Manager - Carolyn Potter)
        return {
          personal: {
            fullName: 'Carolyn Potter',
            jobTitle: 'Retail Manager',
            email: 'carolyn.potter@email.com',
            phone: '+1 (555) 012-2345',
            location: 'Austin, TX',
            website: 'carolynpotter.shop',
            linkedin: 'linkedin.com/in/carolynpotter',
            summary: 'Certified Retail Manager with 8+ years of experience in driving sales growth, optimizing store performance, and reducing operational costs. Proven track record of managing and mentoring teams to improve visual merchandising.'
          },
          experience: [
            {
              id: 'exp1',
              title: 'Freelance Retail Consultant',
              company: 'Independent Consultant',
              location: 'Austin, TX',
              startDate: '2022-03',
              endDate: '',
              current: true,
              description: 'Provide strategic store layout advisory to local Austin boutiques, improving foot traffic and sales by 15%|Conduct operational audits to identify areas for inventory cost reduction'
            },
            {
              id: 'exp2',
              title: 'Retail Manager',
              company: 'Best Buy Co.',
              location: 'Austin, TX',
              startDate: '2018-05',
              endDate: '2022-02',
              current: false,
              description: 'Managed a team of 25 staff members and retail associates|Drove visual merchandising strategy and hit monthly store sales targets consistently|Reduced inventory shrinkage by 12% in the first year of management'
            }
          ],
          education: [
            {
              id: 'edu1',
              degree: 'B.A. in Business Administration',
              school: 'The University of Texas at Austin',
              location: 'Austin, TX',
              startDate: '2014-09',
              endDate: '2018-05',
              description: 'Focus on Sales Operations & Marketing'
            }
          ],
          skills: ['Retail Management', 'Sales Strategy', 'Visual Merchandising', 'Inventory Control', 'Customer Service Excellence', 'Staff Scheduling'],
          projects: [
            {
              id: 'proj1',
              name: 'Austin Merchandising Launch',
              description: 'Re-designed complete store visual planogram for Austin outlet, leading to a 20% growth in impulse purchases.',
              technologies: 'Planogram, MS Excel',
              link: 'carolynpotter.shop/visuals'
            }
          ],
          certifications: [
            { id: 'cert1', name: 'Certified Retail Manager (CRM)', issuer: 'National Retail Federation', date: '2020-10' }
          ],
          languages: [
            { id: 'lang1', name: 'English', level: 'Native' },
            { id: 'lang2', name: 'Spanish', level: 'Professional' }
          ]
        };

      case 'minimal': // Student (Computer Science Student - Claire Russel)
        return {
          personal: {
            fullName: 'Claire Russel',
            jobTitle: 'Computer Science Student',
            email: 'claire.russel@email.com',
            phone: '+1 (555) 017-7456',
            location: 'Boston, MA',
            website: 'clairerussel.github.io',
            linkedin: 'linkedin.com/in/clairerussel',
            summary: 'Dedicated and detail-oriented undergraduate Computer Science student seeking a summer internship to leverage solid foundations in software engineering, data structures, and database systems.'
          },
          experience: [
            {
              id: 'exp1',
              title: 'Lead Programming Instructor',
              company: 'CodeKids Youth Initiative',
              location: 'Boston, MA',
              startDate: '2023-09',
              endDate: '',
              current: true,
              description: 'Led weekly programming workshops in Scratch and Python for underrepresented high school students|Designed and managed curriculum, receiving 95% positive feedback from parents'
            },
            {
              id: 'exp2',
              title: 'Event Coordinator',
              company: 'Community STEM Outreach Program',
              location: 'Boston, MA',
              startDate: '2022-09',
              endDate: '2023-05',
              current: false,
              description: 'Coordinated logistics for 12 STEM workshops, including scheduling, food, and speaker arrangements|Managed a small budget of $5,000, optimizing resource allocations'
            }
          ],
          education: [
            {
              id: 'edu1',
              degree: 'Bachelor of Science in Computer Science',
              school: 'Boston University',
              location: 'Boston, MA',
              startDate: '2021-09',
              endDate: '2025-05',
              description: 'GPA: 3.9/4.0 | Dean\'s List | CS Student Association'
            }
          ],
          skills: ['Python', 'Java', 'Data Structures & Algorithms', 'Web Development (HTML/CSS/JS)', 'SQL & Database Systems', 'Software Engineering Principles'],
          projects: [
            {
              id: 'proj1',
              name: 'Retail Analytics Dashboard',
              description: 'Developed a retail sales data visualizer using React and Chart.js, rendering interactive monthly charts.',
              technologies: 'React, Chart.js, SQL',
              link: 'clairerussel.github.io/retail-analytics'
            }
          ],
          certifications: [
            { id: 'cert1', name: 'Google IT Support Professional Certificate', issuer: 'Coursera', date: '2022-12' }
          ],
          languages: [
            { id: 'lang1', name: 'English', level: 'Native' },
            { id: 'lang2', name: 'German', level: 'Basic' }
          ]
        };

      case 'creative': // Professional (Event Photographer - Nick Koe)
        return {
          personal: {
            fullName: 'Nick Koe',
            jobTitle: 'Event Photographer',
            email: 'nick.koe@email.com',
            phone: '+1 (555) 018-8567',
            location: 'Chicago, IL',
            website: 'nickkoephotography.com',
            linkedin: 'instagram.com/nick.koe',
            summary: 'Creative and professional Event Photographer with 5+ years of experience capturing high-quality editorial, corporate, and private event photography. Expert in Adobe Lightroom and professional studio lighting setups.'
          },
          experience: [
            {
              id: 'exp1',
              title: 'Wedding Photographer',
              company: 'Elegant Bridal Magazines',
              location: 'Chicago, IL',
              startDate: '2021-04',
              endDate: '',
              current: true,
              description: 'Photographed over 100 high-profile weddings, delivering editorial-ready shots under tight deadlines|Coordinated visual styling, lighting placement, and shot lists with wedding coordinators'
            },
            {
              id: 'exp2',
              title: 'Event Photographer',
              company: 'Tiffany Jones Photography',
              location: 'Chicago, IL',
              startDate: '2019-02',
              endDate: '2021-03',
              current: false,
              description: 'Conducted pre-event client consultations to define artistic style guidelines|Edited and retouched photos using Adobe Lightroom, reducing delivery turnaround by 25%'
            }
          ],
          education: [
            {
              id: 'edu1',
              degree: 'BFA in Photography',
              school: 'Columbia State University',
              location: 'Chicago, IL',
              startDate: '2014-09',
              endDate: '2018-05',
              description: 'Focus on Studio Lighting & Portraiture'
            }
          ],
          skills: ['Studio Lighting', 'Digital Photo Editing', 'Adobe Lightroom', 'Adobe Photoshop', 'Portrait Photography', 'Event Coordination'],
          projects: [
            {
              id: 'proj1',
              name: 'Urban Portraits Portfolio',
              description: 'Curated a street-photography exhibition documenting local Chicago artists in their workshop environments.',
              technologies: 'Canon EOS, Lightroom',
              link: 'nickkoephotography.com/urban-portraits'
            }
          ],
          certifications: [
            { id: 'cert1', name: 'Adobe Certified Professional in Photoshop', issuer: 'Adobe', date: '2020-11' }
          ],
          languages: [
            { id: 'lang1', name: 'English', level: 'Native' },
            { id: 'lang2', name: 'Japanese', level: 'Conversational' }
          ]
        };

      default:
        return {
          personal: {}, experience: [], education: [], skills: [], projects: [], certifications: [], languages: []
        };
    }
  }
};
