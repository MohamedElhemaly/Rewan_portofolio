/**
 * Rewan Hassan - Admin Panel Logic
 * Modules: Authentication, Data Management, Section Editors, Image Handling, Toasts
 */

(function () {
    'use strict';

    // ========================================
    // CONFIGURATION
    // ========================================

    // SHA-256 hash of the password "rewan2024"
    const PASSWORD_HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'; // placeholder, computed at runtime
    const ACTUAL_PASSWORD = 'rewan2026'; // Simple check — for production use hashed comparison
    const SESSION_KEY = 'admin_session';
    const DATA_PREFIX = 'admin_';
    const IMG_PREFIX = 'img:';

    // Section definitions for the editor
    const SECTIONS = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'hero', label: 'Hero Section' },
        { id: 'about', label: 'About' },
        { id: 'experience', label: 'Experience' },
        { id: 'skills', label: 'Skills' },
        { id: 'certifications', label: 'Certifications' },
        { id: 'education', label: 'Education' },
        { id: 'contact', label: 'Contact' },
        { id: 'seo', label: 'SEO & Meta' },
        { id: 'footer', label: 'Footer' }
    ];

    // ========================================
    // DOM REFERENCES
    // ========================================

    const loginScreen = document.getElementById('login-screen');
    const adminLayout = document.getElementById('admin-layout');
    const loginForm = document.getElementById('login-form');
    const loginPassword = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');
    const adminContent = document.getElementById('admin-content');
    const headerTitle = document.getElementById('admin-header-title');
    const logoutBtn = document.getElementById('logout-btn');
    const exportBtn = document.getElementById('export-btn');
    const importInput = document.getElementById('import-input');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const adminSidebar = document.getElementById('admin-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle');
    const toastContainer = document.getElementById('toast-container');

    let currentSection = 'dashboard';

    // ========================================
    // TOAST NOTIFICATIONS
    // ========================================

    function showToast(type, title, message, duration = 4000) {
        const icons = {
            success: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            <button class="toast-close" onclick="this.parentElement.classList.add('removing'); setTimeout(() => this.parentElement.remove(), 300);">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        `;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // ========================================
    // AUTHENTICATION
    // ========================================

    function isLoggedIn() {
        return sessionStorage.getItem(SESSION_KEY) === 'true';
    }

    function login(password) {
        if (password === ACTUAL_PASSWORD) {
            sessionStorage.setItem(SESSION_KEY, 'true');
            return true;
        }
        return false;
    }

    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        loginScreen.style.display = '';
        adminLayout.classList.remove('visible');
        loginPassword.value = '';
        loginError.classList.remove('visible');
    }

    function showDashboard() {
        loginScreen.style.display = 'none';
        adminLayout.classList.add('visible');
        navigateTo('dashboard');
    }

    // Login form handler
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pw = loginPassword.value.trim();
        if (login(pw)) {
            showDashboard();
            showToast('success', 'Welcome back!', 'You are now logged in.');
        } else {
            loginError.classList.add('visible');
            loginPassword.value = '';
            loginPassword.focus();
        }
    });

    loginPassword.addEventListener('input', () => {
        loginError.classList.remove('visible');
    });

    logoutBtn.addEventListener('click', () => {
        logout();
        showToast('info', 'Logged out', 'Session ended successfully.');
    });

    // Check session on load
    if (isLoggedIn()) {
        showDashboard();
    }

    // ========================================
    // SIDEBAR NAVIGATION
    // ========================================

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            navigateTo(section);
            // Close mobile sidebar
            adminSidebar.classList.remove('open');
            sidebarOverlay.classList.remove('visible');
        });
    });

    // Mobile sidebar toggle
    mobileSidebarToggle.addEventListener('click', () => {
        adminSidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('visible');
    });

    sidebarOverlay.addEventListener('click', () => {
        adminSidebar.classList.remove('open');
        sidebarOverlay.classList.remove('visible');
    });

    function navigateTo(sectionId) {
        currentSection = sectionId;

        // Update sidebar active state
        sidebarLinks.forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.sidebar-link[data-section="${sectionId}"]`);
        if (activeLink) activeLink.classList.add('active');

        // Update header title
        const sectionDef = SECTIONS.find(s => s.id === sectionId);
        headerTitle.textContent = sectionDef ? sectionDef.label : 'Dashboard';

        // Render the section editor
        renderSection(sectionId);
    }

    // ========================================
    // DATA MANAGEMENT
    // ========================================

    function getData(section) {
        try {
            const raw = localStorage.getItem(DATA_PREFIX + section);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function saveData(section, data) {
        localStorage.setItem(DATA_PREFIX + section, JSON.stringify(data));
    }

    function removeData(section) {
        localStorage.removeItem(DATA_PREFIX + section);
    }

    function getImage(path) {
        return localStorage.getItem(IMG_PREFIX + path);
    }

    function saveImage(path, base64) {
        localStorage.setItem(IMG_PREFIX + path, base64);
    }

    function removeImage(path) {
        localStorage.removeItem(IMG_PREFIX + path);
    }

    function getAllData() {
        const data = {};
        const allSections = ['hero', 'about', 'experience', 'skills', 'certifications', 'education', 'contact', 'seo', 'footer'];
        allSections.forEach(s => {
            const d = getData(s);
            if (d) data[s] = d;
        });
        // Collect images
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(IMG_PREFIX)) {
                if (!data._images) data._images = {};
                data._images[key] = localStorage.getItem(key);
            }
        }
        return data;
    }

    function importAllData(data) {
        const allSections = ['hero', 'about', 'experience', 'skills', 'certifications', 'education', 'contact', 'seo', 'footer'];
        allSections.forEach(s => {
            if (data[s]) {
                saveData(s, data[s]);
            }
        });
        if (data._images) {
            Object.entries(data._images).forEach(([key, value]) => {
                localStorage.setItem(key, value);
            });
        }
    }

    // Export handler
    exportBtn.addEventListener('click', () => {
        const data = getAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio_admin_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('success', 'Data Exported', 'Your backup file has been downloaded.');
    });

    // Import handler
    importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                importAllData(data);
                showToast('success', 'Data Imported', 'All sections have been updated from the backup.');
                renderSection(currentSection);
            } catch (err) {
                showToast('error', 'Import Failed', 'Invalid JSON file format.');
            }
        };
        reader.readAsText(file);
        importInput.value = '';
    });

    // ========================================
    // IMAGE COMPRESSION
    // ========================================

    function compressImage(file, maxWidth = 800, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const base64 = canvas.toDataURL('image/jpeg', quality);
                    resolve(base64);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // ========================================
    // HELPER: Create image upload zone
    // ========================================

    function createImageUpload(currentSrc, imagePath, onUpload) {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';

        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = 'Profile Image';

        const zone = document.createElement('div');
        zone.className = 'image-upload-zone';
        zone.innerHTML = `
            <input type="file" accept="image/*">
            <div class="upload-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
            </div>
            <div class="upload-text">Drop an image here or <strong>browse</strong></div>
            <div class="upload-hint">JPEG, PNG — max 2MB recommended</div>
        `;

        const preview = document.createElement('div');
        preview.className = 'image-preview';

        // Show current image
        const savedImg = getImage(imagePath);
        if (savedImg || currentSrc) {
            preview.classList.add('visible');
            preview.innerHTML = `
                <img src="${savedImg || currentSrc}" alt="Preview">
                <button class="image-preview-remove" type="button" title="Remove image">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            `;
            const removeBtn = preview.querySelector('.image-preview-remove');
            removeBtn.addEventListener('click', () => {
                removeImage(imagePath);
                preview.classList.remove('visible');
                preview.innerHTML = '';
                if (onUpload) onUpload(null);
                showToast('info', 'Image Removed', 'The image will revert to the default on next load.');
            });
        }

        // File input handling
        const fileInput = zone.querySelector('input[type="file"]');
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const base64 = await compressImage(file);
                saveImage(imagePath, base64);

                preview.classList.add('visible');
                preview.innerHTML = `
                    <img src="${base64}" alt="Preview">
                    <button class="image-preview-remove" type="button" title="Remove image">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                `;
                const removeBtn = preview.querySelector('.image-preview-remove');
                removeBtn.addEventListener('click', () => {
                    removeImage(imagePath);
                    preview.classList.remove('visible');
                    preview.innerHTML = '';
                    if (onUpload) onUpload(null);
                    showToast('info', 'Image Removed', '');
                });

                if (onUpload) onUpload(base64);
                showToast('success', 'Image Updated', 'New image saved successfully.');
            } catch (err) {
                showToast('error', 'Upload Failed', 'Could not process the image.');
            }
        });

        // Drag and drop
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                fileInput.dispatchEvent(new Event('change'));
            }
        });

        wrapper.appendChild(label);
        wrapper.appendChild(zone);
        wrapper.appendChild(preview);
        return wrapper;
    }

    // ========================================
    // HELPER: Create tags editor
    // ========================================

    function createTagsEditor(labelText, tags, placeholder) {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';

        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = labelText;

        const editor = document.createElement('div');
        editor.className = 'tags-editor';
        editor._tags = [...tags];

        function renderTags() {
            editor.innerHTML = '';
            editor._tags.forEach((tag, i) => {
                const tagEl = document.createElement('span');
                tagEl.className = 'tag-item';
                tagEl.innerHTML = `${escapeHtml(tag)}<button type="button" title="Remove">&times;</button>`;
                tagEl.querySelector('button').addEventListener('click', () => {
                    editor._tags.splice(i, 1);
                    renderTags();
                });
                editor.appendChild(tagEl);
            });
            const input = document.createElement('input');
            input.className = 'tags-input';
            input.placeholder = editor._tags.length === 0 ? placeholder : 'Add more...';
            input.addEventListener('keydown', (e) => {
                if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
                    e.preventDefault();
                    editor._tags.push(input.value.trim().replace(/,/g, ''));
                    renderTags();
                }
                if (e.key === 'Backspace' && !input.value && editor._tags.length > 0) {
                    editor._tags.pop();
                    renderTags();
                }
            });
            editor.appendChild(input);
            // Focus input on click
            editor.addEventListener('click', () => input.focus());
        }

        renderTags();

        wrapper.appendChild(label);
        wrapper.appendChild(editor);
        const hint = document.createElement('div');
        hint.className = 'form-hint';
        hint.textContent = 'Press Enter or comma to add a tag. Backspace to remove last.';
        wrapper.appendChild(hint);
        return wrapper;
    }

    // ========================================
    // HELPER: Create bullet list editor
    // ========================================

    function createBulletEditor(labelText, bullets) {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';

        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = labelText;

        const list = document.createElement('div');
        list.className = 'bullet-list-editor';
        list._bullets = [...bullets];

        function renderBullets() {
            list.innerHTML = '';
            list._bullets.forEach((bullet, i) => {
                const item = document.createElement('div');
                item.className = 'bullet-item';
                const textarea = document.createElement('textarea');
                textarea.className = 'form-textarea';
                textarea.value = bullet;
                textarea.rows = 2;
                textarea.addEventListener('input', () => {
                    list._bullets[i] = textarea.value;
                });
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'remove-bullet';
                removeBtn.title = 'Remove';
                removeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
                removeBtn.addEventListener('click', () => {
                    list._bullets.splice(i, 1);
                    renderBullets();
                });
                item.appendChild(textarea);
                item.appendChild(removeBtn);
                list.appendChild(item);
            });
            // Add button
            const addBtn = document.createElement('button');
            addBtn.type = 'button';
            addBtn.className = 'add-item-btn';
            addBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Bullet Point';
            addBtn.addEventListener('click', () => {
                list._bullets.push('');
                renderBullets();
            });
            list.appendChild(addBtn);
        }

        renderBullets();
        wrapper.appendChild(label);
        wrapper.appendChild(list);
        return wrapper;
    }

    // ========================================
    // HTML ESCAPE HELPER
    // ========================================

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========================================
    // SECTION RENDERERS
    // ========================================

    function renderSection(sectionId) {
        adminContent.innerHTML = '';
        const renderers = {
            dashboard: renderDashboard,
            hero: renderHeroEditor,
            about: renderAboutEditor,
            experience: renderExperienceEditor,
            skills: renderSkillsEditor,
            certifications: renderCertificationsEditor,
            education: renderEducationEditor,
            contact: renderContactEditor,
            seo: renderSEOEditor,
            footer: renderFooterEditor
        };
        const renderer = renderers[sectionId];
        if (renderer) renderer();
    }

    // --- DASHBOARD ---
    function renderDashboard() {
        const sections = ['hero', 'about', 'experience', 'skills', 'certifications', 'education', 'contact', 'seo', 'footer'];
        const customized = sections.filter(s => getData(s) !== null).length;
        const imageCount = Object.keys(localStorage).filter(k => k.startsWith(IMG_PREFIX)).length;

        const html = `
            <div class="editor-section active">
                <div class="editor-header">
                    <h2 class="editor-title">Dashboard Overview</h2>
                    <p class="editor-description">Manage your portfolio content from one place.</p>
                </div>

                <div class="dashboard-stats">
                    <div class="dashboard-stat-card">
                        <div class="dashboard-stat-icon purple">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        </div>
                        <div class="dashboard-stat-info">
                            <h4>${sections.length}</h4>
                            <span>Total Sections</span>
                        </div>
                    </div>
                    <div class="dashboard-stat-card">
                        <div class="dashboard-stat-icon teal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                        </div>
                        <div class="dashboard-stat-info">
                            <h4>${customized}</h4>
                            <span>Customized</span>
                        </div>
                    </div>
                    <div class="dashboard-stat-card">
                        <div class="dashboard-stat-icon green">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                        <div class="dashboard-stat-info">
                            <h4>${imageCount}</h4>
                            <span>Custom Images</span>
                        </div>
                    </div>
                    <div class="dashboard-stat-card">
                        <div class="dashboard-stat-icon orange">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </div>
                        <div class="dashboard-stat-info">
                            <h4>${isLoggedIn() ? 'Active' : 'Inactive'}</h4>
                            <span>Session</span>
                        </div>
                    </div>
                </div>

                <div class="editor-card">
                    <h3 class="editor-card-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        Quick Edit
                    </h3>
                    <div class="dashboard-quicklinks" id="dashboard-quicklinks"></div>
                </div>

                <div class="editor-card mt-2">
                    <h3 class="editor-card-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>
                        Danger Zone
                    </h3>
                    <p class="text-muted mb-2" style="font-size:0.85rem;">Reset all customizations and revert to the original HTML content.</p>
                    <button class="admin-btn admin-btn-danger admin-btn-sm" id="reset-all-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                        Reset All Data
                    </button>
                </div>
            </div>
        `;
        adminContent.innerHTML = html;

        // Quicklinks
        const quicklinks = document.getElementById('dashboard-quicklinks');
        const editSections = SECTIONS.filter(s => s.id !== 'dashboard');
        editSections.forEach(s => {
            const link = document.createElement('div');
            link.className = 'dashboard-quicklink';
            link.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                ${s.label}
            `;
            link.addEventListener('click', () => navigateTo(s.id));
            quicklinks.appendChild(link);
        });

        // Reset all
        document.getElementById('reset-all-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset ALL customizations? This cannot be undone.')) {
                const allSections = ['hero', 'about', 'experience', 'skills', 'certifications', 'education', 'contact', 'seo', 'footer'];
                allSections.forEach(s => removeData(s));
                // Remove images
                const imgKeys = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(IMG_PREFIX)) imgKeys.push(key);
                }
                imgKeys.forEach(k => localStorage.removeItem(k));
                showToast('success', 'All Data Reset', 'All customizations have been cleared.');
                renderDashboard();
            }
        });
    }

    // --- HERO EDITOR ---
    function renderHeroEditor() {
        const data = getData('hero') || {};
        const defaults = {
            badge: 'Available for Internships & Entry-Level Roles',
            title: 'High-Potential <span>Commerce Student</span> Ready to Drive Operations & Growth',
            headline: 'Business Development Specialist • HR Operations • Sales Executive',
            description: 'Hi, I\'m <strong>Rewan Hassan</strong>. A commerce student with active hands-on experience in Sales Management, CRM pipeline development, and B2B/B2C negotiations in a fast-paced real estate startup, alongside student leadership roles.',
            stat1Value: '1.5+',
            stat1Label: 'Years Sales Exp',
            stat2Value: 'Very Good',
            stat2Label: 'Academic Grade',
            cvFileName: 'Rewan_Hassan_CV_v2.pdf'
        };
        const d = { ...defaults, ...data };

        const section = document.createElement('div');
        section.className = 'editor-section active';
        section.innerHTML = `
            <div class="editor-header">
                <h2 class="editor-title">Hero Section</h2>
                <p class="editor-description">Edit the main landing area of your portfolio.</p>
            </div>

            <div class="editor-card">
                <h3 class="editor-card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    Hero Content
                </h3>
                <div class="form-group">
                    <label class="form-label">Availability Badge</label>
                    <input type="text" class="form-input" id="hero-badge" value="${escapeHtml(d.badge)}">
                </div>
                <div class="form-group">
                    <label class="form-label">Hero Title (HTML allowed)</label>
                    <textarea class="form-textarea" id="hero-title" rows="2">${d.title}</textarea>
                    <div class="form-hint">Use &lt;span&gt; tags for gradient-colored text.</div>
                </div>
                <div class="form-group">
                    <label class="form-label">Headline</label>
                    <input type="text" class="form-input" id="hero-headline" value="${escapeHtml(d.headline)}">
                </div>
                <div class="form-group">
                    <label class="form-label">Description (HTML allowed)</label>
                    <textarea class="form-textarea" id="hero-description" rows="4">${d.description}</textarea>
                </div>
            </div>

            <div class="editor-card">
                <h3 class="editor-card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    Profile Image
                </h3>
                <div id="hero-image-upload"></div>
            </div>

            <div class="editor-card">
                <h3 class="editor-card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    Stats & CV
                </h3>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Stat 1 Value</label>
                        <input type="text" class="form-input" id="hero-stat1-value" value="${escapeHtml(d.stat1Value)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Stat 1 Label</label>
                        <input type="text" class="form-input" id="hero-stat1-label" value="${escapeHtml(d.stat1Label)}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Stat 2 Value</label>
                        <input type="text" class="form-input" id="hero-stat2-value" value="${escapeHtml(d.stat2Value)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Stat 2 Label</label>
                        <input type="text" class="form-input" id="hero-stat2-label" value="${escapeHtml(d.stat2Label)}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">CV Filename</label>
                    <input type="text" class="form-input" id="hero-cv" value="${escapeHtml(d.cvFileName)}">
                    <div class="form-hint">Filename of the CV in the project root (e.g., Rewan_Hassan_CV_v2.pdf)</div>
                </div>
            </div>

            <div class="editor-actions">
                <button class="admin-btn admin-btn-primary" id="hero-save">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Save Hero
                </button>
                <div class="editor-actions-right">
                    <button class="admin-btn admin-btn-danger admin-btn-sm" id="hero-reset">Reset to Default</button>
                </div>
            </div>
        `;

        adminContent.appendChild(section);

        // Image upload
        const imgContainer = document.getElementById('hero-image-upload');
        imgContainer.appendChild(createImageUpload('assets/images/Rewan_photo.jpg', 'assets/images/Rewan_photo.jpg'));

        // Save
        document.getElementById('hero-save').addEventListener('click', () => {
            saveData('hero', {
                badge: document.getElementById('hero-badge').value,
                title: document.getElementById('hero-title').value,
                headline: document.getElementById('hero-headline').value,
                description: document.getElementById('hero-description').value,
                stat1Value: document.getElementById('hero-stat1-value').value,
                stat1Label: document.getElementById('hero-stat1-label').value,
                stat2Value: document.getElementById('hero-stat2-value').value,
                stat2Label: document.getElementById('hero-stat2-label').value,
                cvFileName: document.getElementById('hero-cv').value
            });
            showToast('success', 'Hero Saved', 'Hero section updated. Refresh the portfolio to see changes.');
        });

        // Reset
        document.getElementById('hero-reset').addEventListener('click', () => {
            if (confirm('Reset hero section to defaults?')) {
                removeData('hero');
                removeImage('assets/images/Rewan_photo.jpg');
                showToast('info', 'Hero Reset', 'Hero section reverted to defaults.');
                renderHeroEditor();
            }
        });
    }

    // --- ABOUT EDITOR ---
    function renderAboutEditor() {
        const data = getData('about') || {};
        const defaults = {
            leadParagraph: 'Commerce student (English Section) with hands-on experience in Sales Management, Business Development, HR Operations, and Client Relationship Management (CRM) within a real estate startup environment.',
            paragraph2: 'I possess practical skills in client acquisition, market research, team coordination, and business operations. Having completed structured training programs in Digital Marketing and Data Analysis, I bring a structured, analytical, and digital-first mindset to my roles.',
            paragraph3: 'I am actively seeking entry-level opportunities and internships where I can apply my leadership, communication, and organizational capabilities to support company objectives and drive business growth.',
            feature1Title: 'Business & Sales',
            feature1Desc: 'Experienced in lead management, property presentations, competitor research, and closing B2B and B2C deals.',
            feature2Title: 'HR & Operations',
            feature2Desc: 'Skilled in screening applications, conducting onboarding interviews, and driving positive organizational engagement.',
            location: 'Damanhur, Egypt',
            educationFocus: 'B.Sc. Commerce (English Section)',
            graduationYear: 'Expected June 2027',
            languages: 'Arabic (Native) • English (Advanced B2)'
        };
        const d = { ...defaults, ...data };

        const section = document.createElement('div');
        section.className = 'editor-section active';
        section.innerHTML = `
            <div class="editor-header">
                <h2 class="editor-title">About Section</h2>
                <p class="editor-description">Edit the introduction and personal details.</p>
            </div>

            <div class="editor-card">
                <h3 class="editor-card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    About Text
                </h3>
                <div class="form-group">
                    <label class="form-label">Lead Paragraph</label>
                    <textarea class="form-textarea" id="about-lead" rows="3">${escapeHtml(d.leadParagraph)}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Second Paragraph</label>
                    <textarea class="form-textarea" id="about-p2" rows="3">${escapeHtml(d.paragraph2)}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Third Paragraph</label>
                    <textarea class="form-textarea" id="about-p3" rows="3">${escapeHtml(d.paragraph3)}</textarea>
                </div>
            </div>

            <div class="editor-card">
                <h3 class="editor-card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                    Feature Cards
                </h3>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Feature 1 Title</label>
                        <input type="text" class="form-input" id="about-f1-title" value="${escapeHtml(d.feature1Title)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Feature 2 Title</label>
                        <input type="text" class="form-input" id="about-f2-title" value="${escapeHtml(d.feature2Title)}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Feature 1 Description</label>
                    <textarea class="form-textarea" id="about-f1-desc" rows="2">${escapeHtml(d.feature1Desc)}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Feature 2 Description</label>
                    <textarea class="form-textarea" id="about-f2-desc" rows="2">${escapeHtml(d.feature2Desc)}</textarea>
                </div>
            </div>

            <div class="editor-card">
                <h3 class="editor-card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Candidate Details Sidebar
                </h3>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Current Location</label>
                        <input type="text" class="form-input" id="about-location" value="${escapeHtml(d.location)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Education Focus</label>
                        <input type="text" class="form-input" id="about-edu-focus" value="${escapeHtml(d.educationFocus)}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Graduation Year</label>
                        <input type="text" class="form-input" id="about-grad" value="${escapeHtml(d.graduationYear)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Languages</label>
                        <input type="text" class="form-input" id="about-languages" value="${escapeHtml(d.languages)}">
                    </div>
                </div>
            </div>

            <div class="editor-actions">
                <button class="admin-btn admin-btn-primary" id="about-save">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Save About
                </button>
                <div class="editor-actions-right">
                    <button class="admin-btn admin-btn-danger admin-btn-sm" id="about-reset">Reset to Default</button>
                </div>
            </div>
        `;
        adminContent.appendChild(section);

        document.getElementById('about-save').addEventListener('click', () => {
            saveData('about', {
                leadParagraph: document.getElementById('about-lead').value,
                paragraph2: document.getElementById('about-p2').value,
                paragraph3: document.getElementById('about-p3').value,
                feature1Title: document.getElementById('about-f1-title').value,
                feature1Desc: document.getElementById('about-f1-desc').value,
                feature2Title: document.getElementById('about-f2-title').value,
                feature2Desc: document.getElementById('about-f2-desc').value,
                location: document.getElementById('about-location').value,
                educationFocus: document.getElementById('about-edu-focus').value,
                graduationYear: document.getElementById('about-grad').value,
                languages: document.getElementById('about-languages').value
            });
            showToast('success', 'About Saved', 'About section updated.');
        });

        document.getElementById('about-reset').addEventListener('click', () => {
            if (confirm('Reset about section to defaults?')) {
                removeData('about');
                showToast('info', 'About Reset', '');
                renderAboutEditor();
            }
        });
    }

    // --- EXPERIENCE EDITOR ---
    function renderExperienceEditor() {
        const data = getData('experience') || {};
        const defaults = {
            entries: [
                {
                    role: 'Sales Manager',
                    company: 'Re-Lease',
                    badge: 'Real Estate Startup',
                    duration: 'Oct 2024 – Nov 2025',
                    bullets: [
                        'Led end-to-end B2B and B2C sales operations, managing client acquisition, property presentations, and contract negotiations to close deals efficiently.',
                        'Developed and maintained a structured client relationship management (CRM) pipeline of prospective buyers and investors, ensuring consistent follow-up and deal progression.',
                        'Coordinated with marketing and operations teams to align sales strategies with business targets, supporting business growth objectives.',
                        'Conducted ongoing market research and competitor analysis to identify emerging opportunities and refine the company\'s value proposition.',
                        'Demonstrated strong time management and organizational skills in managing multiple client accounts simultaneously within a fast-paced startup environment.'
                    ],
                    skills: ['Sales Management', 'Business Development', 'CRM Systems', 'B2B & B2C Negotiation', 'Market Research']
                },
                {
                    role: 'HR Leader',
                    company: 'Enactus Damanhour',
                    badge: 'Student Organization',
                    duration: '2024 – 2025',
                    bullets: [
                        'Oversaw HR operations for a student-run entrepreneurship organization, supporting recruitment, onboarding, and member engagement initiatives.',
                        'Coordinated internal communication and team scheduling to maintain alignment across project teams and organizational activities.',
                        'Supported talent acquisition efforts by screening applications, conducting interviews, and onboarding new members into active projects.',
                        'Contributed to building a positive team culture through organized engagement activities and transparent internal communication channels.'
                    ],
                    skills: ['HR Operations', 'Recruitment Support', 'Team Coordination', 'Internal Communication', 'Talent Acquisition']
                },
                {
                    role: 'Accounting & Finance Intern',
                    company: 'Mohamed Qinawy',
                    badge: 'Certified Public Accountant',
                    duration: 'Feb 2026 – Jun 2026',
                    bullets: [
                        'Supported daily accounting operations including bookkeeping, financial record maintenance, and client document review.',
                        'Gained practical exposure to financial reporting standards, tax documentation procedures, and structured account management processes.',
                        'Applied analytical thinking and attention to detail while working with real client financial data under professional supervision.'
                    ],
                    skills: ['Accounting Operations', 'Financial Reporting', 'Tax Documentation', 'Bookkeeping', 'Attention to Detail']
                }
            ]
        };
        const d = { ...defaults, ...data };

        const section = document.createElement('div');
        section.className = 'editor-section active';

        const header = document.createElement('div');
        header.className = 'editor-header';
        header.innerHTML = `
            <h2 class="editor-title">Experience Section</h2>
            <p class="editor-description">Add, edit, or remove work experience entries.</p>
        `;
        section.appendChild(header);

        const list = document.createElement('div');
        list.className = 'dynamic-list';

        function renderEntries() {
            list.innerHTML = '';
            d.entries.forEach((entry, i) => {
                const item = document.createElement('div');
                item.className = 'dynamic-item';
                item.innerHTML = `
                    <div class="dynamic-item-header">
                        <span class="dynamic-item-title">Entry #${i + 1}: ${escapeHtml(entry.role)} at ${escapeHtml(entry.company)}</span>
                        <div class="dynamic-item-actions">
                            <button class="admin-btn admin-btn-danger admin-btn-icon" title="Remove" data-remove="${i}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        </div>
                    </div>
                `;
                const body = document.createElement('div');

                // Role & company
                const row1 = document.createElement('div');
                row1.className = 'form-row';
                row1.innerHTML = `
                    <div class="form-group">
                        <label class="form-label">Role Title</label>
                        <input type="text" class="form-input exp-role" data-idx="${i}" value="${escapeHtml(entry.role)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Company</label>
                        <input type="text" class="form-input exp-company" data-idx="${i}" value="${escapeHtml(entry.company)}">
                    </div>
                `;
                body.appendChild(row1);

                const row2 = document.createElement('div');
                row2.className = 'form-row';
                row2.innerHTML = `
                    <div class="form-group">
                        <label class="form-label">Badge</label>
                        <input type="text" class="form-input exp-badge" data-idx="${i}" value="${escapeHtml(entry.badge)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Duration</label>
                        <input type="text" class="form-input exp-duration" data-idx="${i}" value="${escapeHtml(entry.duration)}">
                    </div>
                `;
                body.appendChild(row2);

                // Bullets
                const bulletsEditor = createBulletEditor('Bullet Points', entry.bullets);
                bulletsEditor._entryIndex = i;
                body.appendChild(bulletsEditor);

                // Skills tags
                const tagsEditor = createTagsEditor('Skills Tags', entry.skills, 'Type a skill...');
                tagsEditor._entryIndex = i;
                body.appendChild(tagsEditor);

                item.appendChild(body);
                list.appendChild(item);

                // Remove handler
                item.querySelector(`[data-remove="${i}"]`).addEventListener('click', () => {
                    if (confirm(`Remove "${entry.role}" entry?`)) {
                        d.entries.splice(i, 1);
                        renderEntries();
                    }
                });
            });

            // Add button
            const addBtn = document.createElement('button');
            addBtn.type = 'button';
            addBtn.className = 'add-item-btn';
            addBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Experience Entry';
            addBtn.addEventListener('click', () => {
                d.entries.push({
                    role: 'New Role',
                    company: 'Company Name',
                    badge: 'Type',
                    duration: 'Start – End',
                    bullets: ['Describe your responsibility...'],
                    skills: ['Skill']
                });
                renderEntries();
            });
            list.appendChild(addBtn);
        }

        renderEntries();
        section.appendChild(list);

        // Actions
        const actions = document.createElement('div');
        actions.className = 'editor-actions';
        actions.innerHTML = `
            <button class="admin-btn admin-btn-primary" id="exp-save">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Save Experience
            </button>
            <div class="editor-actions-right">
                <button class="admin-btn admin-btn-danger admin-btn-sm" id="exp-reset">Reset to Default</button>
            </div>
        `;
        section.appendChild(actions);
        adminContent.appendChild(section);

        document.getElementById('exp-save').addEventListener('click', () => {
            // Collect data from DOM
            d.entries.forEach((entry, i) => {
                const roleInput = document.querySelector(`.exp-role[data-idx="${i}"]`);
                const companyInput = document.querySelector(`.exp-company[data-idx="${i}"]`);
                const badgeInput = document.querySelector(`.exp-badge[data-idx="${i}"]`);
                const durationInput = document.querySelector(`.exp-duration[data-idx="${i}"]`);
                if (roleInput) entry.role = roleInput.value;
                if (companyInput) entry.company = companyInput.value;
                if (badgeInput) entry.badge = badgeInput.value;
                if (durationInput) entry.duration = durationInput.value;

                // Get bullets from bullet editors
                const bulletEditors = document.querySelectorAll('.bullet-list-editor');
                if (bulletEditors[i]) {
                    entry.bullets = bulletEditors[i]._bullets;
                }

                // Get tags
                const tagEditors = document.querySelectorAll('.tags-editor');
                if (tagEditors[i]) {
                    entry.skills = tagEditors[i]._tags;
                }
            });

            saveData('experience', { entries: d.entries });
            showToast('success', 'Experience Saved', 'Experience section updated.');
        });

        document.getElementById('exp-reset').addEventListener('click', () => {
            if (confirm('Reset experience to defaults?')) {
                removeData('experience');
                showToast('info', 'Experience Reset', '');
                renderExperienceEditor();
            }
        });
    }

    // --- SKILLS EDITOR ---
    function renderSkillsEditor() {
        const data = getData('skills') || {};
        const defaults = {
            entries: [
                { name: 'Sales Management', category: 'business', progress: 90 },
                { name: 'Business Development', category: 'business', progress: 88 },
                { name: 'Client Relationship Management (CRM)', category: 'business', progress: 85 },
                { name: 'B2B & B2C Sales', category: 'business', progress: 92 },
                { name: 'Pipeline Management', category: 'business', progress: 85 },
                { name: 'Negotiation & Persuasion', category: 'business', progress: 88 },
                { name: 'Market Research', category: 'business', progress: 80 },
                { name: 'Account Management', category: 'business', progress: 83 },
                { name: 'HR Operations', category: 'hr', progress: 85 },
                { name: 'Recruitment Support', category: 'hr', progress: 82 },
                { name: 'Team Coordination', category: 'hr', progress: 90 },
                { name: 'Microsoft Office Suite (Word, Excel, PPT)', category: 'technical', progress: 85 },
                { name: 'Data Analysis', category: 'technical', progress: 80 },
                { name: 'Digital Marketing', category: 'technical', progress: 78 },
                { name: 'Social Media Marketing', category: 'technical', progress: 82 },
                { name: 'Content Strategy', category: 'technical', progress: 75 },
                { name: 'Google Workspace', category: 'technical', progress: 87 },
                { name: 'Financial Reporting & Bookkeeping', category: 'technical', progress: 76 },
                { name: 'Leadership', category: 'soft', progress: 92 },
                { name: 'Communication & Persuasion', category: 'soft', progress: 90 },
                { name: 'Problem-Solving', category: 'soft', progress: 85 },
                { name: 'Time Management', category: 'soft', progress: 88 },
                { name: 'Adaptability', category: 'soft', progress: 85 },
                { name: 'Attention to Detail', category: 'soft', progress: 90 },
                { name: 'Organizational Skills', category: 'soft', progress: 88 }
            ]
        };
        const d = { ...defaults, ...data };

        const section = document.createElement('div');
        section.className = 'editor-section active';

        const header = document.createElement('div');
        header.className = 'editor-header';
        header.innerHTML = `
            <h2 class="editor-title">Skills Section</h2>
            <p class="editor-description">Manage your professional skills with categories and proficiency levels.</p>
        `;
        section.appendChild(header);

        const list = document.createElement('div');
        list.className = 'dynamic-list';

        function renderSkills() {
            list.innerHTML = '';
            d.entries.forEach((skill, i) => {
                const item = document.createElement('div');
                item.className = 'dynamic-item';
                item.innerHTML = `
                    <div class="dynamic-item-header">
                        <span class="dynamic-item-title">${escapeHtml(skill.name)} (${skill.progress}%)</span>
                        <div class="dynamic-item-actions">
                            <button class="admin-btn admin-btn-danger admin-btn-icon" title="Remove" data-remove="${i}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Skill Name</label>
                            <input type="text" class="form-input skill-name" data-idx="${i}" value="${escapeHtml(skill.name)}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Category</label>
                            <select class="form-select skill-category" data-idx="${i}">
                                <option value="business" ${skill.category === 'business' ? 'selected' : ''}>Business & Sales</option>
                                <option value="hr" ${skill.category === 'hr' ? 'selected' : ''}>HR & Operations</option>
                                <option value="technical" ${skill.category === 'technical' ? 'selected' : ''}>Technical & Tools</option>
                                <option value="soft" ${skill.category === 'soft' ? 'selected' : ''}>Soft Skills</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Proficiency (${skill.progress}%)</label>
                        <div class="form-range-wrapper">
                            <input type="range" class="form-range skill-progress" data-idx="${i}" min="0" max="100" value="${skill.progress}">
                            <span class="form-range-value">${skill.progress}%</span>
                        </div>
                    </div>
                `;

                // Range value live update
                const rangeInput = item.querySelector('.form-range');
                const rangeValue = item.querySelector('.form-range-value');
                const progLabel = item.querySelector('.form-group:last-child .form-label');
                rangeInput.addEventListener('input', () => {
                    rangeValue.textContent = rangeInput.value + '%';
                    progLabel.textContent = `Proficiency (${rangeInput.value}%)`;
                });

                // Remove
                item.querySelector(`[data-remove="${i}"]`).addEventListener('click', () => {
                    d.entries.splice(i, 1);
                    renderSkills();
                });

                list.appendChild(item);
            });

            // Add
            const addBtn = document.createElement('button');
            addBtn.type = 'button';
            addBtn.className = 'add-item-btn';
            addBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Skill';
            addBtn.addEventListener('click', () => {
                d.entries.push({ name: 'New Skill', category: 'business', progress: 75 });
                renderSkills();
            });
            list.appendChild(addBtn);
        }

        renderSkills();
        section.appendChild(list);

        const actions = document.createElement('div');
        actions.className = 'editor-actions';
        actions.innerHTML = `
            <button class="admin-btn admin-btn-primary" id="skills-save">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Save Skills
            </button>
            <div class="editor-actions-right">
                <button class="admin-btn admin-btn-danger admin-btn-sm" id="skills-reset">Reset to Default</button>
            </div>
        `;
        section.appendChild(actions);
        adminContent.appendChild(section);

        document.getElementById('skills-save').addEventListener('click', () => {
            d.entries.forEach((skill, i) => {
                const nameInput = document.querySelector(`.skill-name[data-idx="${i}"]`);
                const catSelect = document.querySelector(`.skill-category[data-idx="${i}"]`);
                const progRange = document.querySelector(`.skill-progress[data-idx="${i}"]`);
                if (nameInput) skill.name = nameInput.value;
                if (catSelect) skill.category = catSelect.value;
                if (progRange) skill.progress = parseInt(progRange.value);
            });
            saveData('skills', { entries: d.entries });
            showToast('success', 'Skills Saved', 'Skills section updated.');
        });

        document.getElementById('skills-reset').addEventListener('click', () => {
            if (confirm('Reset skills to defaults?')) {
                removeData('skills');
                showToast('info', 'Skills Reset', '');
                renderSkillsEditor();
            }
        });
    }

    // --- CERTIFICATIONS EDITOR ---
    function renderCertificationsEditor() {
        const data = getData('certifications') || {};
        const defaults = {
            entries: [
                {
                    title: 'Digital Marketing Professional',
                    issuer: 'Creativa • MCIT Egypt',
                    summary: 'Applied digital marketing principles including campaign planning, audience segmentation, and content strategy through structured practical exercises.'
                },
                {
                    title: 'Data Analysis Fundamentals',
                    issuer: 'Creativa • MCIT Egypt',
                    summary: 'Utilized data analysis techniques to interpret datasets, identify trends, and generate insights through hands-on case studies and assignments.'
                }
            ]
        };
        const d = { ...defaults, ...data };

        const section = document.createElement('div');
        section.className = 'editor-section active';

        const header = document.createElement('div');
        header.className = 'editor-header';
        header.innerHTML = `
            <h2 class="editor-title">Certifications Section</h2>
            <p class="editor-description">Manage certifications and training projects.</p>
        `;
        section.appendChild(header);

        const list = document.createElement('div');
        list.className = 'dynamic-list';

        function renderCerts() {
            list.innerHTML = '';
            d.entries.forEach((cert, i) => {
                const item = document.createElement('div');
                item.className = 'dynamic-item';
                item.innerHTML = `
                    <div class="dynamic-item-header">
                        <span class="dynamic-item-title">${escapeHtml(cert.title)}</span>
                        <div class="dynamic-item-actions">
                            <button class="admin-btn admin-btn-danger admin-btn-icon" title="Remove" data-remove="${i}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Certification Title</label>
                        <input type="text" class="form-input cert-title" data-idx="${i}" value="${escapeHtml(cert.title)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Issuer</label>
                        <input type="text" class="form-input cert-issuer" data-idx="${i}" value="${escapeHtml(cert.issuer)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Training Project Summary</label>
                        <textarea class="form-textarea cert-summary" data-idx="${i}" rows="3">${escapeHtml(cert.summary)}</textarea>
                    </div>
                `;
                item.querySelector(`[data-remove="${i}"]`).addEventListener('click', () => {
                    d.entries.splice(i, 1);
                    renderCerts();
                });
                list.appendChild(item);
            });

            const addBtn = document.createElement('button');
            addBtn.type = 'button';
            addBtn.className = 'add-item-btn';
            addBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Certification';
            addBtn.addEventListener('click', () => {
                d.entries.push({ title: 'New Certification', issuer: 'Issuer Name', summary: 'Description...' });
                renderCerts();
            });
            list.appendChild(addBtn);
        }

        renderCerts();
        section.appendChild(list);

        const actions = document.createElement('div');
        actions.className = 'editor-actions';
        actions.innerHTML = `
            <button class="admin-btn admin-btn-primary" id="certs-save">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Save Certifications
            </button>
            <div class="editor-actions-right">
                <button class="admin-btn admin-btn-danger admin-btn-sm" id="certs-reset">Reset to Default</button>
            </div>
        `;
        section.appendChild(actions);
        adminContent.appendChild(section);

        document.getElementById('certs-save').addEventListener('click', () => {
            d.entries.forEach((cert, i) => {
                const t = document.querySelector(`.cert-title[data-idx="${i}"]`);
                const is = document.querySelector(`.cert-issuer[data-idx="${i}"]`);
                const s = document.querySelector(`.cert-summary[data-idx="${i}"]`);
                if (t) cert.title = t.value;
                if (is) cert.issuer = is.value;
                if (s) cert.summary = s.value;
            });
            saveData('certifications', { entries: d.entries });
            showToast('success', 'Certifications Saved', '');
        });

        document.getElementById('certs-reset').addEventListener('click', () => {
            if (confirm('Reset certifications to defaults?')) {
                removeData('certifications');
                showToast('info', 'Certifications Reset', '');
                renderCertificationsEditor();
            }
        });
    }

    // --- EDUCATION EDITOR ---
    function renderEducationEditor() {
        const data = getData('education') || {};
        const defaults = {
            institution: 'Damanhur University, Egypt',
            degree: 'B.Sc. in Commerce — English Section',
            faculty: 'Faculty of Commerce',
            graduationDate: 'Expected Graduation: June 2027',
            curriculum: 'English Section Commercial Curriculum',
            grade: 'Very Good'
        };
        const d = { ...defaults, ...data };

        const section = document.createElement('div');
        section.className = 'editor-section active';
        section.innerHTML = `
            <div class="editor-header">
                <h2 class="editor-title">Education Section</h2>
                <p class="editor-description">Edit your educational background.</p>
            </div>

            <div class="editor-card">
                <h3 class="editor-card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 6 3 6 3s6-1 6-3v-5"/></svg>
                    Education Details
                </h3>
                <div class="form-group">
                    <label class="form-label">Institution</label>
                    <input type="text" class="form-input" id="edu-institution" value="${escapeHtml(d.institution)}">
                </div>
                <div class="form-group">
                    <label class="form-label">Degree</label>
                    <input type="text" class="form-input" id="edu-degree" value="${escapeHtml(d.degree)}">
                </div>
                <div class="form-group">
                    <label class="form-label">Faculty</label>
                    <input type="text" class="form-input" id="edu-faculty" value="${escapeHtml(d.faculty)}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Graduation Date</label>
                        <input type="text" class="form-input" id="edu-grad" value="${escapeHtml(d.graduationDate)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Cumulative Grade</label>
                        <input type="text" class="form-input" id="edu-grade" value="${escapeHtml(d.grade)}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Curriculum</label>
                    <input type="text" class="form-input" id="edu-curriculum" value="${escapeHtml(d.curriculum)}">
                </div>
            </div>

            <div class="editor-actions">
                <button class="admin-btn admin-btn-primary" id="edu-save">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Save Education
                </button>
                <div class="editor-actions-right">
                    <button class="admin-btn admin-btn-danger admin-btn-sm" id="edu-reset">Reset to Default</button>
                </div>
            </div>
        `;
        adminContent.appendChild(section);

        document.getElementById('edu-save').addEventListener('click', () => {
            saveData('education', {
                institution: document.getElementById('edu-institution').value,
                degree: document.getElementById('edu-degree').value,
                faculty: document.getElementById('edu-faculty').value,
                graduationDate: document.getElementById('edu-grad').value,
                grade: document.getElementById('edu-grade').value,
                curriculum: document.getElementById('edu-curriculum').value
            });
            showToast('success', 'Education Saved', '');
        });

        document.getElementById('edu-reset').addEventListener('click', () => {
            if (confirm('Reset education to defaults?')) {
                removeData('education');
                showToast('info', 'Education Reset', '');
                renderEducationEditor();
            }
        });
    }

    // --- CONTACT EDITOR ---
    function renderContactEditor() {
        const data = getData('contact') || {};
        const defaults = {
            introParagraph: 'I am open to internships, entry-level opportunities, and graduate development programs in HR Operations, Business Development, Sales, and Administration. Please feel free to reach out via phone, email, or LinkedIn.',
            email: 'rewanhassan2772005@gmail.com',
            phone: '+20 102 952 9200',
            location: 'Damanhur, Egypt',
            linkedin: 'https://www.linkedin.com/in/rewan-hassan-361643332',
            linkedinDisplay: 'www.linkedin.com/in/rewan-hassan-361643332',
            web3formsKey: '8df93f83-afbd-483e-b3c6-919891f8498a'
        };
        const d = { ...defaults, ...data };

        const section = document.createElement('div');
        section.className = 'editor-section active';
        section.innerHTML = `
            <div class="editor-header">
                <h2 class="editor-title">Contact Section</h2>
                <p class="editor-description">Manage contact information and form settings.</p>
            </div>

            <div class="editor-card">
                <h3 class="editor-card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                    Contact Info
                </h3>
                <div class="form-group">
                    <label class="form-label">Intro Paragraph</label>
                    <textarea class="form-textarea" id="contact-intro" rows="3">${escapeHtml(d.introParagraph)}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" id="contact-email" value="${escapeHtml(d.email)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Phone</label>
                        <input type="text" class="form-input" id="contact-phone" value="${escapeHtml(d.phone)}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Location</label>
                        <input type="text" class="form-input" id="contact-location" value="${escapeHtml(d.location)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">LinkedIn URL</label>
                        <input type="url" class="form-input" id="contact-linkedin" value="${escapeHtml(d.linkedin)}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">LinkedIn Display Text</label>
                    <input type="text" class="form-input" id="contact-linkedin-display" value="${escapeHtml(d.linkedinDisplay)}">
                </div>
            </div>

            <div class="editor-card">
                <h3 class="editor-card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Form Settings
                </h3>
                <div class="form-group">
                    <label class="form-label">Web3Forms Access Key</label>
                    <input type="text" class="form-input" id="contact-web3key" value="${escapeHtml(d.web3formsKey)}">
                    <div class="form-hint">Get your free key at web3forms.com. This key is used to receive form submissions to your email.</div>
                </div>
            </div>

            <div class="editor-actions">
                <button class="admin-btn admin-btn-primary" id="contact-save">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Save Contact
                </button>
                <div class="editor-actions-right">
                    <button class="admin-btn admin-btn-danger admin-btn-sm" id="contact-reset">Reset to Default</button>
                </div>
            </div>
        `;
        adminContent.appendChild(section);

        document.getElementById('contact-save').addEventListener('click', () => {
            saveData('contact', {
                introParagraph: document.getElementById('contact-intro').value,
                email: document.getElementById('contact-email').value,
                phone: document.getElementById('contact-phone').value,
                location: document.getElementById('contact-location').value,
                linkedin: document.getElementById('contact-linkedin').value,
                linkedinDisplay: document.getElementById('contact-linkedin-display').value,
                web3formsKey: document.getElementById('contact-web3key').value
            });
            showToast('success', 'Contact Saved', '');
        });

        document.getElementById('contact-reset').addEventListener('click', () => {
            if (confirm('Reset contact to defaults?')) {
                removeData('contact');
                showToast('info', 'Contact Reset', '');
                renderContactEditor();
            }
        });
    }

    // --- SEO EDITOR ---
    function renderSEOEditor() {
        const data = getData('seo') || {};
        const defaults = {
            pageTitle: 'Rewan Hassan | Business Development, HR Operations & Sales Professional',
            metaDescription: 'Professional portfolio of Rewan Hassan, a Commerce student specializing in Business Development, HR Operations, Sales Management, and Client Relationship Management. Ready for entry-level opportunities.',
            metaKeywords: 'Rewan Hassan, HR Operations, Business Development, Sales, Real Estate Sales, Enactus HR, Damanhur University, Commerce English, Creativa MCIT',
            ogTitle: 'Rewan Hassan | Professional Portfolio',
            ogDescription: 'Explore the professional experience, skills, and certifications of Rewan Hassan in Sales, HR Operations, and Business Development.'
        };
        const d = { ...defaults, ...data };

        const section = document.createElement('div');
        section.className = 'editor-section active';
        section.innerHTML = `
            <div class="editor-header">
                <h2 class="editor-title">SEO & Meta Tags</h2>
                <p class="editor-description">Optimize your portfolio for search engines.</p>
            </div>

            <div class="editor-card">
                <h3 class="editor-card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    Search Engine Optimization
                </h3>
                <div class="form-group">
                    <label class="form-label">Page Title</label>
                    <input type="text" class="form-input" id="seo-title" value="${escapeHtml(d.pageTitle)}">
                </div>
                <div class="form-group">
                    <label class="form-label">Meta Description</label>
                    <textarea class="form-textarea" id="seo-description" rows="3">${escapeHtml(d.metaDescription)}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Meta Keywords</label>
                    <textarea class="form-textarea" id="seo-keywords" rows="2">${escapeHtml(d.metaKeywords)}</textarea>
                </div>
            </div>

            <div class="editor-card">
                <h3 class="editor-card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Open Graph (Social Sharing)
                </h3>
                <div class="form-group">
                    <label class="form-label">OG Title</label>
                    <input type="text" class="form-input" id="seo-og-title" value="${escapeHtml(d.ogTitle)}">
                </div>
                <div class="form-group">
                    <label class="form-label">OG Description</label>
                    <textarea class="form-textarea" id="seo-og-desc" rows="2">${escapeHtml(d.ogDescription)}</textarea>
                </div>
            </div>

            <div class="editor-actions">
                <button class="admin-btn admin-btn-primary" id="seo-save">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Save SEO
                </button>
                <div class="editor-actions-right">
                    <button class="admin-btn admin-btn-danger admin-btn-sm" id="seo-reset">Reset to Default</button>
                </div>
            </div>
        `;
        adminContent.appendChild(section);

        document.getElementById('seo-save').addEventListener('click', () => {
            saveData('seo', {
                pageTitle: document.getElementById('seo-title').value,
                metaDescription: document.getElementById('seo-description').value,
                metaKeywords: document.getElementById('seo-keywords').value,
                ogTitle: document.getElementById('seo-og-title').value,
                ogDescription: document.getElementById('seo-og-desc').value
            });
            showToast('success', 'SEO Saved', 'Meta tags will update on next portfolio load.');
        });

        document.getElementById('seo-reset').addEventListener('click', () => {
            if (confirm('Reset SEO to defaults?')) {
                removeData('seo');
                showToast('info', 'SEO Reset', '');
                renderSEOEditor();
            }
        });
    }

    // --- FOOTER EDITOR ---
    function renderFooterEditor() {
        const data = getData('footer') || {};
        const defaults = {
            copyrightText: '© 2026 Mohamed El-hemaly. All Rights Reserved.',
            copyrightLink: 'https://mohamedelhemaly.github.io/portfolio/'
        };
        const d = { ...defaults, ...data };

        const section = document.createElement('div');
        section.className = 'editor-section active';
        section.innerHTML = `
            <div class="editor-header">
                <h2 class="editor-title">Footer Section</h2>
                <p class="editor-description">Edit footer content and copyright information.</p>
            </div>

            <div class="editor-card">
                <h3 class="editor-card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
                    Footer Content
                </h3>
                <div class="form-group">
                    <label class="form-label">Copyright Text</label>
                    <input type="text" class="form-input" id="footer-text" value="${escapeHtml(d.copyrightText)}">
                </div>
                <div class="form-group">
                    <label class="form-label">Copyright Link URL</label>
                    <input type="url" class="form-input" id="footer-link" value="${escapeHtml(d.copyrightLink)}">
                </div>
            </div>

            <div class="editor-actions">
                <button class="admin-btn admin-btn-primary" id="footer-save">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Save Footer
                </button>
                <div class="editor-actions-right">
                    <button class="admin-btn admin-btn-danger admin-btn-sm" id="footer-reset">Reset to Default</button>
                </div>
            </div>
        `;
        adminContent.appendChild(section);

        document.getElementById('footer-save').addEventListener('click', () => {
            saveData('footer', {
                copyrightText: document.getElementById('footer-text').value,
                copyrightLink: document.getElementById('footer-link').value
            });
            showToast('success', 'Footer Saved', '');
        });

        document.getElementById('footer-reset').addEventListener('click', () => {
            if (confirm('Reset footer to defaults?')) {
                removeData('footer');
                showToast('info', 'Footer Reset', '');
                renderFooterEditor();
            }
        });
    }

})();
