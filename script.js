/**
 * Rewan Hassan - Portfolio Interactivity Script
 * Contains: Admin data hydration, Theme toggling, mobile navigation, active section tracking,
 *           skills filtering, viewport-triggered skill bar animations, and form handling.
 */

// --- Admin Panel Redirect ---
// Supports: #/admin, #admin (works locally + deployed), and /admin (Vercel rewrite handles this)
(function() {
    const hash = window.location.hash;
    if (hash === '#/admin' || hash === '#admin') {
        window.location.replace('admin.html');
    }
})();

document.addEventListener('DOMContentLoaded', () => {

    // --- 0. Admin Data Hydration ---
    // Reads saved data from localStorage (set by admin panel) and applies it to the DOM
    (function hydrateFromAdmin() {
        const DATA_PREFIX = 'admin_';
        const IMG_PREFIX = 'img:';

        function getData(section) {
            try {
                const raw = localStorage.getItem(DATA_PREFIX + section);
                return raw ? JSON.parse(raw) : null;
            } catch { return null; }
        }

        function getImage(path) {
            return localStorage.getItem(IMG_PREFIX + path);
        }

        // --- SEO / Meta ---
        const seoData = getData('seo');
        if (seoData) {
            if (seoData.pageTitle) document.title = seoData.pageTitle;
            if (seoData.metaDescription) {
                const meta = document.querySelector('meta[name="description"]');
                if (meta) meta.setAttribute('content', seoData.metaDescription);
            }
            if (seoData.metaKeywords) {
                const meta = document.querySelector('meta[name="keywords"]');
                if (meta) meta.setAttribute('content', seoData.metaKeywords);
            }
            if (seoData.ogTitle) {
                const meta = document.querySelector('meta[property="og:title"]');
                if (meta) meta.setAttribute('content', seoData.ogTitle);
                const tw = document.querySelector('meta[property="twitter:title"]');
                if (tw) tw.setAttribute('content', seoData.ogTitle);
            }
            if (seoData.ogDescription) {
                const meta = document.querySelector('meta[property="og:description"]');
                if (meta) meta.setAttribute('content', seoData.ogDescription);
                const tw = document.querySelector('meta[property="twitter:description"]');
                if (tw) tw.setAttribute('content', seoData.ogDescription);
            }
        }

        // --- Hero ---
        const heroData = getData('hero');
        if (heroData) {
            const heroSection = document.getElementById('hero');
            if (heroSection) {
                if (heroData.badge) {
                    const badge = heroSection.querySelector('.hero-tag');
                    if (badge) badge.textContent = heroData.badge;
                }
                if (heroData.title) {
                    const title = heroSection.querySelector('.hero-title');
                    if (title) title.innerHTML = heroData.title;
                }
                if (heroData.headline) {
                    const hl = heroSection.querySelector('.hero-headline');
                    if (hl) hl.innerHTML = heroData.headline;
                }
                if (heroData.description) {
                    const desc = heroSection.querySelector('.hero-description');
                    if (desc) desc.innerHTML = heroData.description;
                }
                if (heroData.stat1Value || heroData.stat1Label) {
                    const stats = heroSection.querySelectorAll('.stat-item');
                    if (stats[0]) {
                        if (heroData.stat1Value) stats[0].querySelector('.stat-num').textContent = heroData.stat1Value;
                        if (heroData.stat1Label) stats[0].querySelector('.stat-label').textContent = heroData.stat1Label;
                    }
                }
                if (heroData.stat2Value || heroData.stat2Label) {
                    const stats = heroSection.querySelectorAll('.stat-item');
                    if (stats[1]) {
                        if (heroData.stat2Value) stats[1].querySelector('.stat-num').textContent = heroData.stat2Value;
                        if (heroData.stat2Label) stats[1].querySelector('.stat-label').textContent = heroData.stat2Label;
                    }
                }
                if (heroData.cvFileName) {
                    document.querySelectorAll('a[download]').forEach(a => {
                        a.setAttribute('href', heroData.cvFileName);
                    });
                }
            }
        }

        // Hero image
        const heroImg = getImage('assets/images/Rewan_photo.jpg');
        if (heroImg) {
            const img = document.querySelector('.hero-image');
            if (img) img.src = heroImg;
        }

        // --- About ---
        const aboutData = getData('about');
        if (aboutData) {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                const paragraphs = aboutSection.querySelectorAll('.about-text p');
                if (aboutData.leadParagraph && paragraphs[0]) paragraphs[0].textContent = aboutData.leadParagraph;
                if (aboutData.paragraph2 && paragraphs[1]) paragraphs[1].textContent = aboutData.paragraph2;
                if (aboutData.paragraph3 && paragraphs[2]) paragraphs[2].textContent = aboutData.paragraph3;

                const featureCards = aboutSection.querySelectorAll('.about-feature-card');
                if (featureCards[0]) {
                    if (aboutData.feature1Title) featureCards[0].querySelector('h4').textContent = aboutData.feature1Title;
                    if (aboutData.feature1Desc) featureCards[0].querySelector('p').textContent = aboutData.feature1Desc;
                }
                if (featureCards[1]) {
                    if (aboutData.feature2Title) featureCards[1].querySelector('h4').textContent = aboutData.feature2Title;
                    if (aboutData.feature2Desc) featureCards[1].querySelector('p').textContent = aboutData.feature2Desc;
                }

                const infoValues = aboutSection.querySelectorAll('.info-value');
                if (aboutData.location && infoValues[0]) infoValues[0].textContent = aboutData.location;
                if (aboutData.educationFocus && infoValues[1]) infoValues[1].textContent = aboutData.educationFocus;
                if (aboutData.graduationYear && infoValues[2]) infoValues[2].textContent = aboutData.graduationYear;
                if (aboutData.languages && infoValues[3]) infoValues[3].textContent = aboutData.languages;
            }
        }

        // --- Experience ---
        const expData = getData('experience');
        if (expData && expData.entries) {
            const timeline = document.querySelector('.experience-timeline');
            if (timeline) {
                timeline.innerHTML = '';
                expData.entries.forEach(entry => {
                    const item = document.createElement('div');
                    item.className = 'experience-item';
                    item.innerHTML = `
                        <div class="experience-dot"></div>
                        <div class="experience-card">
                            <div class="experience-header">
                                <div>
                                    <h3 class="role-title">${entry.role}</h3>
                                    <div class="company-meta">
                                        <span class="company-name">${entry.company}</span>
                                        <span class="badge">${entry.badge}</span>
                                    </div>
                                </div>
                                <span class="experience-duration">${entry.duration}</span>
                            </div>
                            <div class="experience-body">
                                <ul class="experience-bullets">
                                    ${entry.bullets.map(b => `<li>${b}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="experience-skills">
                                ${entry.skills.map(s => `<span class="badge badge-secondary">${s}</span>`).join('')}
                            </div>
                        </div>
                    `;
                    timeline.appendChild(item);
                });
            }
        }

        // --- Skills ---
        const skillsData = getData('skills');
        if (skillsData && skillsData.entries) {
            const grid = document.getElementById('skills-grid');
            if (grid) {
                grid.innerHTML = '';
                skillsData.entries.forEach(skill => {
                    const categoryLabels = { business: 'Business', hr: 'HR', technical: 'Technical', soft: 'Soft Skills' };
                    const card = document.createElement('div');
                    card.className = 'skill-card';
                    card.setAttribute('data-category', skill.category);
                    card.innerHTML = `
                        <div class="skill-info">
                            <span class="skill-name">${skill.name}</span>
                            <span class="skill-tag">${categoryLabels[skill.category] || skill.category}</span>
                        </div>
                        <div class="skill-progress-bg">
                            <div class="skill-progress-bar" data-progress="${skill.progress}%"></div>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            }
        }

        // --- Certifications ---
        const certData = getData('certifications');
        if (certData && certData.entries) {
            const grid = document.querySelector('.certifications-grid');
            if (grid) {
                grid.innerHTML = '';
                const icons = [
                    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
                    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>'
                ];
                certData.entries.forEach((cert, i) => {
                    const card = document.createElement('div');
                    card.className = 'cert-card';
                    card.innerHTML = `
                        <div class="cert-icon">${icons[i % icons.length]}</div>
                        <div class="cert-details">
                            <h3 class="cert-title">${cert.title}</h3>
                            <div class="cert-issuer">${cert.issuer}</div>
                            <p class="cert-project-summary">
                                <strong>Training Project:</strong> ${cert.summary}
                            </p>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            }
        }

        // --- Education ---
        const eduData = getData('education');
        if (eduData) {
            const eduSection = document.getElementById('education');
            if (eduSection) {
                if (eduData.institution) {
                    const inst = eduSection.querySelector('.education-institution');
                    if (inst) inst.textContent = eduData.institution;
                }
                if (eduData.degree) {
                    const deg = eduSection.querySelector('.education-degree');
                    if (deg) deg.innerHTML = eduData.degree;
                }
                if (eduData.faculty) {
                    const fac = eduSection.querySelector('.education-details p');
                    if (fac) fac.textContent = eduData.faculty;
                }
                if (eduData.graduationDate) {
                    const gradItems = eduSection.querySelectorAll('.education-meta-item span');
                    if (gradItems[0]) gradItems[0].textContent = eduData.graduationDate;
                }
                if (eduData.curriculum) {
                    const gradItems = eduSection.querySelectorAll('.education-meta-item span');
                    if (gradItems[1]) gradItems[1].textContent = eduData.curriculum;
                }
                if (eduData.grade) {
                    const gradeBadge = eduSection.querySelector('.education-grade-badge');
                    if (gradeBadge) {
                        gradeBadge.innerHTML = `<span>Cumulative Grade</span>${eduData.grade}`;
                    }
                }
            }
        }

        // --- Contact ---
        const contactData = getData('contact');
        if (contactData) {
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                if (contactData.introParagraph) {
                    const p = contactSection.querySelector('.contact-info-panel > p');
                    if (p) p.textContent = contactData.introParagraph;
                }
                if (contactData.email) {
                    const emailCard = contactSection.querySelector('a[href^="mailto:"]');
                    if (emailCard) {
                        emailCard.setAttribute('href', `mailto:${contactData.email}`);
                        const val = emailCard.querySelector('.contact-detail-value');
                        if (val) val.textContent = contactData.email;
                    }
                }
                if (contactData.phone) {
                    const phoneCard = contactSection.querySelector('a[href^="tel:"]');
                    if (phoneCard) {
                        phoneCard.setAttribute('href', `tel:${contactData.phone.replace(/\s/g, '')}`);
                        const val = phoneCard.querySelector('.contact-detail-value');
                        if (val) val.textContent = contactData.phone;
                    }
                }
                if (contactData.location) {
                    const locationCards = contactSection.querySelectorAll('.contact-detail-card:not(a)');
                    locationCards.forEach(card => {
                        const label = card.querySelector('.contact-detail-label');
                        if (label && label.textContent === 'Location') {
                            const val = card.querySelector('.contact-detail-value');
                            if (val) val.textContent = contactData.location;
                        }
                    });
                }
                if (contactData.linkedin) {
                    const linkedinCard = contactSection.querySelector('a[href*="linkedin"]');
                    if (linkedinCard) {
                        linkedinCard.setAttribute('href', contactData.linkedin);
                        const val = linkedinCard.querySelector('.contact-detail-value');
                        if (val) val.textContent = contactData.linkedinDisplay || contactData.linkedin;
                    }
                }
                if (contactData.web3formsKey) {
                    const keyInput = document.querySelector('input[name="access_key"]');
                    if (keyInput) keyInput.value = contactData.web3formsKey;
                }
            }
        }

        // --- Footer ---
        const footerData = getData('footer');
        if (footerData) {
            const footer = document.querySelector('.footer-content p');
            if (footer) {
                const link = footer.querySelector('a');
                if (link) {
                    if (footerData.copyrightText) link.textContent = footerData.copyrightText;
                    if (footerData.copyrightLink) link.setAttribute('href', footerData.copyrightLink);
                }
            }
        }
    })();

    // --- 1. Theme Configuration & Toggling ---
    const themeToggle = document.getElementById('theme-toggle');
    const storedTheme = localStorage.getItem('theme');
    
    // Determine initial theme: localStorage -> system preference -> default light
    const getPreferredTheme = () => {
        if (storedTheme) {
            return storedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };
    
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };
    
    // Initialize theme
    let currentTheme = getPreferredTheme();
    applyTheme(currentTheme);
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
    });

    // --- 2. Mobile Navigation Toggle ---
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        // Toggle mobile icon layout between menu (3 lines) and close (X)
        const isOpen = navMenu.classList.contains('open');
        
        // Prevent body scroll when mobile menu is open
        document.body.style.overflow = isOpen ? 'hidden' : '';
        
        mobileToggle.innerHTML = isOpen 
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`;
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            document.body.style.overflow = ''; // Restore body scrolling
            mobileToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`;
        });
    });

    // --- 3. Scrollspy (Active Navigation Link on Scroll) ---
    const sections = document.querySelectorAll('section[id]');
    
    const scrollActive = () => {
        const scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100; // Adjusted for sticky header offset
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);
            
            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            }
        });
    };
    
    window.addEventListener('scroll', scrollActive);
    scrollActive(); // Trigger once on load to highlight correct link

    // --- 4. Interactive Skills Filtering & Animations ---
    const tabButtons = document.querySelectorAll('.skills-tab-btn');
    const skillCards = document.querySelectorAll('.skill-card');
    const skillsToggleBtn = document.getElementById('skills-toggle-btn');
    const skillsToggleContainer = document.getElementById('skills-toggle-container');
    const skillsSection = document.getElementById('skills');
    
    let currentFilter = 'all';
    let isSkillsExpanded = false;
    let hasSkillsAnimated = false;
    const maxVisibleSkills = 8;
    
    const filterSkills = () => {
        let matchingCards = [];
        
        // 1. Separate matching and non-matching cards
        skillCards.forEach(card => {
            const category = card.getAttribute('data-category');
            if (currentFilter === 'all' || category === currentFilter) {
                matchingCards.push(card);
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
            }
        });
        
        // 2. Hide or show the Toggle Container based on matching cards length
        if (matchingCards.length > maxVisibleSkills) {
            skillsToggleContainer.style.display = 'flex';
        } else {
            skillsToggleContainer.style.display = 'none';
        }
        
        // 3. Apply visibility thresholds and stagger animations
        matchingCards.forEach((card, index) => {
            if (isSkillsExpanded || index < maxVisibleSkills) {
                card.style.display = 'flex';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                    // Animate progress bars only if viewport trigger has fired
                    if (hasSkillsAnimated) {
                        const progressBar = card.querySelector('.skill-progress-bar');
                        if (progressBar) {
                            progressBar.style.width = progressBar.getAttribute('data-progress');
                        }
                    }
                }, 50 + index * 15);
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                const progressBar = card.querySelector('.skill-progress-bar');
                if (progressBar) {
                    progressBar.style.width = '0%';
                }
            }
        });
    };
    
    // Tab Button Clicks
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentFilter = btn.getAttribute('data-filter');
            isSkillsExpanded = false; // Reset expansion state when changing tabs
            
            skillsToggleBtn.classList.remove('expanded');
            skillsToggleBtn.querySelector('span').innerText = 'Show More';
            
            filterSkills();
        });
    });
    
    // Toggle Button Clicks
    skillsToggleBtn.addEventListener('click', () => {
        isSkillsExpanded = !isSkillsExpanded;
        
        if (isSkillsExpanded) {
            skillsToggleBtn.classList.add('expanded');
            skillsToggleBtn.querySelector('span').innerText = 'Show Less';
        } else {
            skillsToggleBtn.classList.remove('expanded');
            skillsToggleBtn.querySelector('span').innerText = 'Show More';
            // Scroll back up to the skills section title to keep context
            skillsSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        filterSkills();
    });
    
    // Initial cards positioning setup
    filterSkills();

    // --- 5. Viewport Intersection Observer for Initial Skill Bar Animations ---
    const animateSkillsOnScroll = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                hasSkillsAnimated = true;
                filterSkills();
                observer.unobserve(skillsSection);
            }
        });
    };
    
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            threshold: 0.15
        };
        const skillsObserver = new IntersectionObserver(animateSkillsOnScroll, observerOptions);
        skillsObserver.observe(skillsSection);
    } else {
        // Fallback
        setTimeout(() => {
            hasSkillsAnimated = true;
            filterSkills();
        }, 1000);
    }

    // --- 6. Contact Form Submission (Web3Forms API Integration) ---
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('form-submit-btn');
    const statusDiv = document.getElementById('form-status');
    const submitBtnText = submitBtn.querySelector('span');
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Change button state to loading
        submitBtn.disabled = true;
        submitBtnText.innerText = 'Sending...';
        statusDiv.className = 'form-submit-status';
        statusDiv.style.display = 'none';
        
        const formData = new FormData(contactForm);
        const object = Object.fromEntries(formData);
        
        // If developer hasn't set their key, run a premium simulation to show UX flow
        if (object.access_key === 'YOUR_ACCESS_KEY_HERE') {
            console.warn('Portfolio Notice: Web3Forms access key is placeholder. Running beautiful local success simulation.');
            
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtnText.innerText = 'Send Inquiry';
                statusDiv.classList.add('success');
                statusDiv.style.display = 'block';
                statusDiv.innerHTML = `<strong>Inquiry Sent (Simulation Mode)!</strong><br>Thank you, your message has been processed successfully.<br><small style="color: var(--text-muted);">Developer tip: Set a real Web3Forms key in the HTML to receive direct emails.</small>`;
                contactForm.reset();
            }, 1500);
            return;
        }
        
        // Execute real request to Web3Forms API
        try {
            const json = JSON.stringify(object);
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            });
            
            const result = await response.json();
            
            submitBtn.disabled = false;
            submitBtnText.innerText = 'Send Inquiry';
            
            if (response.status === 200) {
                statusDiv.classList.add('success');
                statusDiv.style.display = 'block';
                statusDiv.innerHTML = `<strong>Thank you!</strong> Your message has been sent successfully. I will get back to you shortly.`;
                contactForm.reset();
            } else {
                console.error(result);
                statusDiv.classList.add('error');
                statusDiv.style.display = 'block';
                statusDiv.innerHTML = `<strong>Error:</strong> ${result.message || 'Something went wrong. Please try again.'}`;
            }
        } catch (error) {
            console.error(error);
            submitBtn.disabled = false;
            submitBtnText.innerText = 'Send Inquiry';
            statusDiv.classList.add('error');
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = `<strong>Network Error:</strong> Failed to connect. Please check your internet connection or email directly.`;
        }
    });

    // --- 7. Dynamic Footer Year ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});
