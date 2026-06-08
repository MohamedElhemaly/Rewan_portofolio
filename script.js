/**
 * Rewan Hassan - Portfolio Interactivity Script
 * Contains: Theme toggling, mobile navigation, active section tracking,
 *           skills filtering, viewport-triggered skill bar animations, and form handling.
 */

document.addEventListener('DOMContentLoaded', () => {
    
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
                statusDiv.innerHTML = `<strong>Thank you!</strong> Your message has been sent successfully. I will get back to you shortly.`;
                contactForm.reset();
            } else {
                console.error(result);
                statusDiv.classList.add('error');
                statusDiv.innerHTML = `<strong>Error:</strong> ${result.message || 'Something went wrong. Please try again.'}`;
            }
        } catch (error) {
            console.error(error);
            submitBtn.disabled = false;
            submitBtnText.innerText = 'Send Inquiry';
            statusDiv.classList.add('error');
            statusDiv.innerHTML = `<strong>Network Error:</strong> Failed to connect. Please check your internet connection or email directly.`;
        }
    });

    // --- 7. Dynamic Footer Year ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});
