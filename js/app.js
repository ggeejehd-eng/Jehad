// Main Application - التطبيق الرئيسي
class MJ36App {
    constructor() {
        this.isInitialized = false;
        this.currentPage = this.getCurrentPage();
        
        this.initialize();
    }

    // تهيئة التطبيق
    initialize() {
        if (this.isInitialized) return;

        // التحقق من تسجيل الدخول
        this.checkAuthentication();
        
        // تهيئة الصفحة الحالية
        this.initializePage();
        
        // إعداد مستمعي الأحداث العامة
        this.setupGlobalEventListeners();
        
        this.isInitialized = true;
    }

    // التحقق من المصادقة
    checkAuthentication() {
        const isLoggedIn = window.authManager.isLoggedIn();
        const isLoginPage = this.currentPage === 'login';
        const isAdminPage = this.currentPage === 'admin';

        // إعادة توجيه إلى صفحة تسجيل الدخول إذا لم يكن مسجلاً
        if (!isLoggedIn && !isLoginPage && !isAdminPage) {
            window.location.href = 'login.html';
            return;
        }

        // إعادة توجيه إلى الصفحة الرئيسية إذا كان مسجلاً ويحاول الوصول لصفحة تسجيل الدخول
        if (isLoggedIn && isLoginPage) {
            window.location.href = 'index.html';
            return;
        }
    }

    // تهيئة الصفحة الحالية
    initializePage() {
        switch (this.currentPage) {
            case 'index':
                this.initializeMainPage();
                break;
            case 'login':
                this.initializeLoginPage();
                break;
            case 'admin':
                this.initializeAdminPage();
                break;
            case 'profile':
                this.initializeProfilePage();
                break;
            case 'post':
                this.initializePostPage();
                break;
            case 'story':
                this.initializeStoryPage();
                break;
            case 'novel':
                this.initializeNovelPage();
                break;
        }
    }

    // تهيئة الصفحة الرئيسية
    initializeMainPage() {
        // تحديث معلومات المستخدم
        this.updateUserInfo();
        
        // تحميل المحتوى
        setTimeout(() => {
            window.uiManager.refresh();
        }, 100);

        // إعداد الزر العائم
        this.setupFloatingButton();
        
        // إعداد شريط البحث
        this.setupSearchBar();
    }

    // تهيئة صفحة تسجيل الدخول
    initializeLoginPage() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const adminForm = document.getElementById('adminForm');

        // نموذج تسجيل الدخول
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin(e.target);
            });
        }

        // نموذج إنشاء الحساب
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleRegister(e.target);
            });
        }

        // نموذج دخول الآدمن
        if (adminForm) {
            adminForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleAdminLogin(e.target);
            });
        }

        // تبديل النماذج
        this.setupFormSwitching();
    }

    // تهيئة لوحة التحكم
    initializeAdminPage() {
        this.loadAdminData();
        this.setupAdminControls();
    }

    // تهيئة صفحة الملف الشخصي
    initializeProfilePage() {
        this.loadProfileData();
        this.setupProfileForm();
    }

    // تهيئة صفحة إنشاء المنشور
    initializePostPage() {
        this.setupPostForm();
        this.setupMediaUpload();
    }

    // تهيئة صفحة إنشاء الستوري
    initializeStoryPage() {
        this.setupStoryForm();
        this.setupStoryMediaUpload();
    }

    // تهيئة صفحة إنشاء الرواية
    initializeNovelPage() {
        this.setupNovelForm();
    }

    // معالجة تسجيل الدخول
    async handleLogin(form) {
        const formData = new FormData(form);
        const globalCode = formData.get('globalCode');
        const username = formData.get('username');
        const password = formData.get('password');

        this.showLoading(form);

        try {
            const result = await window.authManager.login(globalCode, username, password);
            
            if (result.success) {
                window.uiManager.showToast('تم تسجيل الدخول بنجاح', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                this.showError(form, result.error);
            }
        } catch (error) {
            this.showError(form, 'حدث خطأ غير متوقع');
        } finally {
            this.hideLoading(form);
        }
    }

    // معالجة إنشاء الحساب
    async handleRegister(form) {
        const formData = new FormData(form);
        const globalCode = formData.get('globalCode');
        const username = formData.get('username');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // التحقق من تطابق كلمات المرور
        if (password !== confirmPassword) {
            this.showError(form, 'كلمات المرور غير متطابقة');
            return;
        }

        this.showLoading(form);

        try {
            const result = await window.authManager.register(globalCode, username, password);
            
            if (result.success) {
                window.uiManager.showToast('تم إنشاء الحساب بنجاح', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                this.showError(form, result.error);
            }
        } catch (error) {
            this.showError(form, 'حدث خطأ غير متوقع');
        } finally {
            this.hideLoading(form);
        }
    }

    // معالجة دخول الآدمن
    async handleAdminLogin(form) {
        const formData = new FormData(form);
        const adminCode = formData.get('adminCode');

        this.showLoading(form);

        try {
            if (window.authManager.verifyAdminCode(adminCode)) {
                window.uiManager.showToast('تم التحقق من رمز الآدمن', 'success');
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                this.showError(form, 'رمز الآدمن غير صحيح');
            }
        } catch (error) {
            this.showError(form, 'حدث خطأ غير متوقع');
        } finally {
            this.hideLoading(form);
        }
    }

    // تحديث معلومات المستخدم
    updateUserInfo() {
        const currentUser = window.authManager.getCurrentUser();
        if (!currentUser) return;

        // تحديث الصورة الشخصية
        const avatarElements = document.querySelectorAll('.user-avatar');
        avatarElements.forEach(avatar => {
            avatar.src = currentUser.avatar;
            avatar.alt = currentUser.username;
        });

        // تحديث اسم المستخدم
        const usernameElements = document.querySelectorAll('.user-name');
        usernameElements.forEach(username => {
            username.textContent = currentUser.username;
        });
    }

    // إعداد الزر العائم
    setupFloatingButton() {
        const floatingBtn = document.querySelector('.btn-floating');
        if (floatingBtn) {
            floatingBtn.addEventListener('click', () => {
                this.showCreatePostModal();
            });
        }
    }

    // إعداد شريط البحث
    setupSearchBar() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }

    // إعداد تبديل النماذج
    setupFormSwitching() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('form-switch')) {
                const targetForm = e.target.dataset.target;
                this.switchForm(targetForm);
            }
        });
    }

    // تبديل النماذج
    switchForm(targetForm) {
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        const target = document.getElementById(targetForm);
        if (target) {
            target.classList.add('active');
        }
    }

    // عرض نافذة إنشاء منشور
    showCreatePostModal() {
        const modal = window.uiManager.showModal('إنشاء منشور جديد', `
            <form id="createPostForm">
                <div class="form-group">
                    <label for="postContent">المحتوى</label>
                    <textarea id="postContent" name="content" placeholder="ماذا تريد أن تشارك؟" required></textarea>
                </div>
                <div class="form-group">
                    <label for="postImage">صورة (اختياري)</label>
                    <input type="file" id="postImage" name="image" accept="image/*">
                </div>
            </form>
        `, [
            { text: 'إلغاء', class: 'btn-secondary', onclick: 'window.uiManager.closeModal()' },
            { text: 'نشر', class: 'btn-primary', onclick: 'window.app.createPost()' }
        ]);
    }

    // إنشاء منشور
    async createPost() {
        const form = document.getElementById('createPostForm');
        const formData = new FormData(form);
        const content = formData.get('content');
        const imageFile = formData.get('image');

        if (!content.trim()) {
            window.uiManager.showToast('يرجى كتابة محتوى المنشور', 'warning');
            return;
        }

        const currentUser = window.authManager.getCurrentUser();
        if (!currentUser) return;

        try {
            // معالجة الصورة إذا تم رفعها
            let imagePath = null;
            if (imageFile && imageFile.size > 0) {
                // في التطبيق الحقيقي، يتم رفع الصورة إلى الخادم
                // هنا نستخدم URL محلي للعرض
                imagePath = URL.createObjectURL(imageFile);
            }

            // إنشاء المنشور
            const newPost = window.dataManager.addPost({
                userId: currentUser.id,
                content: content.trim(),
                image: imagePath
            });

            window.uiManager.showToast('تم نشر المنشور بنجاح', 'success');
            window.uiManager.closeModal();
            window.uiManager.refresh();
        } catch (error) {
            window.uiManager.showToast('حدث خطأ أثناء النشر', 'error');
        }
    }

    // معالجة البحث
    handleSearch(query) {
        if (!query.trim()) {
            window.uiManager.refresh();
            return;
        }

        // البحث في المنشورات والرسائل والروايات
        const posts = window.dataManager.getPosts();
        const messages = window.dataManager.getMessages();
        const novels = window.dataManager.getNovels();

        const filteredPosts = posts.filter(post => 
            post.content.toLowerCase().includes(query.toLowerCase())
        );

        // عرض نتائج البحث
        this.displaySearchResults(filteredPosts, query);
    }

    // عرض نتائج البحث
    displaySearchResults(results, query) {
        const postsContainer = document.getElementById('postsContainer');
        if (!postsContainer) return;

        if (results.length === 0) {
            postsContainer.innerHTML = `
                <div class="empty-state">
                    <p>لا توجد نتائج للبحث عن "${query}"</p>
                </div>
            `;
            return;
        }

        // عرض النتائج
        window.uiManager.renderPosts();
    }

    // تحميل بيانات لوحة التحكم
    loadAdminData() {
        const users = window.dataManager.getUsers();
        const posts = window.dataManager.getPosts();
        const messages = window.dataManager.getMessages();
        const screenshots = window.dataManager.getScreenshots();
        const settings = window.dataManager.getSettings();

        // تحديث الإحصائيات
        this.updateAdminStats(users, posts, messages, screenshots);
        
        // تحديث قائمة المستخدمين
        this.updateUsersList(users);
        
        // تحديث سجل لقطات الشاشة
        this.updateScreenshotsList(screenshots);
        
        // تحديث إعدادات الميزات
        this.updateFeatureSettings(settings.features);
    }

    // تحديث إحصائيات لوحة التحكم
    updateAdminStats(users, posts, messages, screenshots) {
        const statsContainer = document.getElementById('adminStats');
        if (!statsContainer) return;

        statsContainer.innerHTML = `
            <div class="row">
                <div class="col-md-3">
                    <div class="stat-card">
                        <h3>${users.length}</h3>
                        <p>المستخدمين</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <h3>${posts.length}</h3>
                        <p>المنشورات</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <h3>${messages.length}</h3>
                        <p>الرسائل</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <h3>${screenshots.length}</h3>
                        <p>لقطات الشاشة</p>
                    </div>
                </div>
            </div>
        `;
    }

    // تحديث قائمة المستخدمين
    updateUsersList(users) {
        const usersContainer = document.getElementById('usersList');
        if (!usersContainer) return;

        usersContainer.innerHTML = users.map(user => `
            <div class="user-item">
                <img src="${user.avatar}" alt="${user.username}" class="user-avatar">
                <div class="user-info">
                    <h4>${user.username}</h4>
                    <p>آخر نشاط: ${window.uiManager.formatDate(user.lastActive)}</p>
                </div>
                <div class="user-actions">
                    <span class="badge ${user.isAdmin ? 'badge-primary' : 'badge-secondary'}">
                        ${user.isAdmin ? 'آدمن' : 'مستخدم'}
                    </span>
                </div>
            </div>
        `).join('');
    }

    // تحديث سجل لقطات الشاشة
    updateScreenshotsList(screenshots) {
        const screenshotsContainer = document.getElementById('screenshotsList');
        if (!screenshotsContainer) return;

        screenshotsContainer.innerHTML = screenshots.map(screenshot => {
            const user = window.dataManager.getUserById(screenshot.userId);
            return `
                <div class="screenshot-item">
                    <div class="screenshot-info">
                        <h4>${user?.username || 'مستخدم غير معروف'}</h4>
                        <p>${screenshot.page}</p>
                        <small>${window.uiManager.formatDate(screenshot.timestamp)}</small>
                    </div>
                </div>
            `;
        }).join('');
    }

    // تحديث إعدادات الميزات
    updateFeatureSettings(features) {
        const featuresContainer = document.getElementById('featureSettings');
        if (!featuresContainer) return;

        featuresContainer.innerHTML = Object.keys(features).map(feature => {
            const featureNames = {
                posts: 'المنشورات',
                messages: 'الرسائل',
                stories: 'الستوري',
                watch: 'المشاهدة',
                novels: 'الروايات'
            };

            return `
                <div class="feature-setting">
                    <label class="switch">
                        <input type="checkbox" ${features[feature] ? 'checked' : ''} 
                               onchange="window.app.toggleFeature('${feature}', this.checked)">
                        <span class="slider"></span>
                    </label>
                    <span class="feature-name">${featureNames[feature] || feature}</span>
                </div>
            `;
        }).join('');
    }

    // تبديل حالة الميزة
    toggleFeature(feature, enabled) {
        window.dataManager.updateFeatureStatus(feature, enabled);
        window.uiManager.showToast(`تم ${enabled ? 'تفعيل' : 'تعطيل'} ${feature}`, 'info');
    }

    // إعداد عناصر التحكم في لوحة الآدمن
    setupAdminControls() {
        // زر إعادة تعيين البيانات
        const resetBtn = document.getElementById('resetDataBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('هل أنت متأكد من إعادة تعيين جميع البيانات؟')) {
                    window.dataManager.resetData();
                    window.uiManager.showToast('تم إعادة تعيين البيانات', 'success');
                    this.loadAdminData();
                }
            });
        }

        // زر تصدير البيانات
        const exportBtn = document.getElementById('exportDataBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const data = window.dataManager.exportData();
                this.downloadFile('mj36-data.json', data);
            });
        }
    }

    // تحميل ملف
    downloadFile(filename, content) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    // إعداد مستمعي الأحداث العامة
    setupGlobalEventListeners() {
        // زر تسجيل الخروج
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('logout-btn')) {
                this.handleLogout();
            }
        });

        // زر القفل
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('lock-btn')) {
                this.handleLock();
            }
        });

        // اختصارات لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    // معالجة تسجيل الخروج
    handleLogout() {
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            window.authManager.logout();
        }
    }

    // معالجة القفل
    handleLock() {
        const settings = window.dataManager.getSettings();
        if (settings.lockEnabled) {
            window.authManager.lockApp();
        } else {
            const pin = prompt('أدخل رمز القفل الجديد (4 أرقام على الأقل):');
            if (pin) {
                try {
                    window.authManager.enableLock(pin);
                    window.uiManager.showToast('تم تفعيل القفل', 'success');
                } catch (error) {
                    window.uiManager.showToast(error.message, 'error');
                }
            }
        }
    }

    // معالجة اختصارات لوحة المفاتيح
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + L للقفل
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            this.handleLock();
        }

        // Ctrl/Cmd + Shift + S لأخذ لقطة شاشة
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            window.uiManager.takeScreenshot();
        }
    }

    // عرض حالة التحميل
    showLoading(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> جاري التحميل...';
        }
    }

    // إخفاء حالة التحميل
    hideLoading(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtn.dataset.originalText || 'تسجيل الدخول';
        }
    }

    // عرض رسالة خطأ
    showError(form, message) {
        let errorDiv = form.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            form.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    // الحصول على الصفحة الحالية
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'index';
        return page;
    }
}

// إنشاء مثيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MJ36App();
});

// تحديث نشاط المستخدم عند التفاعل
document.addEventListener('click', () => {
    if (window.authManager && window.authManager.isLoggedIn()) {
        window.authManager.updateUserActivity();
    }
});

// حفظ الحالة قبل إغلاق الصفحة
window.addEventListener('beforeunload', () => {
    if (window.authManager && window.authManager.isLoggedIn()) {
        window.authManager.updateUserActivity();
    }
});

