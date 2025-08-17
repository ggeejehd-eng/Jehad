// UI Management - إدارة واجهة المستخدم والتفاعلات
class UIManager {
    constructor() {
        this.currentTab = 'posts';
        this.currentTheme = 'light';
        this.currentLanguage = 'ar';
        this.toasts = [];
        
        this.initializeUI();
    }

    // تهيئة واجهة المستخدم
    initializeUI() {
        this.loadSettings();
        this.setupEventListeners();
        this.updateFeatureVisibility();
    }

    // تحميل الإعدادات
    loadSettings() {
        const settings = window.dataManager.getSettings();
        this.currentTheme = settings.theme || 'light';
        this.currentLanguage = settings.language || 'ar';
        
        this.applyTheme(this.currentTheme);
        this.applyLanguage(this.currentLanguage);
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // تبديل التبويبات
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-item')) {
                this.switchTab(e.target.dataset.tab);
            }
        });

        // تبديل الثيم
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('theme-toggle') || e.target.closest('.theme-toggle')) {
                this.toggleTheme();
            }
        });

        // تبديل اللغة
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('language-toggle')) {
                this.toggleLanguage();
            }
        });

        // زر لقطة الشاشة
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('screenshot-btn')) {
                this.takeScreenshot();
            }
        });

        // إغلاق النوافذ المنبثقة
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close')) {
                this.closeModal();
            }
        });

        // مراقبة تغييرات البيانات
        window.dataManager.addWatcher((event, data) => {
            if (event === 'featureChanged') {
                this.updateFeatureVisibility();
            }
        });
    }

    // تبديل التبويبات
    switchTab(tabName) {
        // التحقق من تفعيل الميزة
        const settings = window.dataManager.getSettings();
        if (!settings.features[tabName]) {
            this.showToast('هذه الميزة معطلة حالياً', 'warning');
            return;
        }

        this.currentTab = tabName;
        
        // تحديث التبويبات النشطة
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });

        // تفعيل التبويب الحالي
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        const activePane = document.getElementById(`${tabName}Tab`);
        
        if (activeTab) activeTab.classList.add('active');
        if (activePane) activePane.classList.add('active');

        // تحديث المحتوى
        this.updateTabContent(tabName);
        
        // حفظ آخر تبويب
        localStorage.setItem('mj36_last_tab', tabName);
    }

    // تحديث محتوى التبويب
    updateTabContent(tabName) {
        switch (tabName) {
            case 'posts':
                this.renderPosts();
                break;
            case 'messages':
                this.renderMessages();
                break;
            case 'stories':
                this.renderStories();
                break;
            case 'novels':
                this.renderNovels();
                break;
            case 'watch':
                this.renderWatchPage();
                break;
        }
    }

    // عرض المنشورات
    renderPosts() {
        const postsContainer = document.getElementById('postsContainer');
        if (!postsContainer) return;

        const posts = window.dataManager.getPosts();
        const currentUser = window.authManager.getCurrentUser();

        postsContainer.innerHTML = posts.map(post => {
            const author = window.dataManager.getUserById(post.userId);
            const isLiked = post.likedBy.includes(currentUser?.id);
            const timeAgo = this.getTimeAgo(post.timestamp);

            return `
                <div class="card post-card" data-post-id="${post.id}">
                    <div class="post-header">
                        <img src="${author?.avatar || 'assets/images/avatar-male.png'}" alt="${author?.username}" class="post-avatar">
                        <div class="post-author">
                            <h4 class="post-author-name">${author?.username || 'مستخدم'}</h4>
                            <p class="post-time">${timeAgo}</p>
                        </div>
                    </div>
                    <div class="post-content">
                        <p class="post-text">${post.content}</p>
                        ${post.image ? `<img src="${post.image}" alt="صورة المنشور" class="post-media">` : ''}
                    </div>
                    <div class="post-actions">
                        <button class="post-action like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
                            <svg class="tab-icon" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            <span>${post.likes}</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // إضافة مستمعي الأحداث للإعجاب
        postsContainer.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const postId = parseInt(btn.dataset.postId);
                this.togglePostLike(postId);
            });
        });
    }

    // عرض الرسائل
    renderMessages() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        const messages = window.dataManager.getMessages();
        const currentUser = window.authManager.getCurrentUser();

        messagesContainer.innerHTML = messages.map(message => {
            const isOwn = message.senderId === currentUser?.id;
            const sender = window.dataManager.getUserById(message.senderId);
            const timeAgo = this.getTimeAgo(message.timestamp);

            return `
                <div class="chat-message ${isOwn ? 'own' : ''}">
                    <div class="chat-bubble">
                        <div class="chat-text">${message.content}</div>
                        <div class="chat-time">${timeAgo}</div>
                    </div>
                </div>
            `;
        }).join('');

        // التمرير إلى آخر رسالة
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // عرض الستوريات
    renderStories() {
        const storiesContainer = document.getElementById('storiesContainer');
        if (!storiesContainer) return;

        const stories = window.dataManager.getActiveStories();

        if (stories.length === 0) {
            storiesContainer.innerHTML = `
                <div class="empty-state">
                    <p>لا توجد ستوريات حالياً</p>
                </div>
            `;
            return;
        }

        storiesContainer.innerHTML = stories.map(story => {
            const author = window.dataManager.getUserById(story.userId);
            const timeAgo = this.getTimeAgo(story.timestamp);

            return `
                <div class="card story-card">
                    <div class="story-header">
                        <img src="${author?.avatar || 'assets/images/avatar-male.png'}" alt="${author?.username}" class="post-avatar">
                        <div class="story-author">
                            <h4>${author?.username || 'مستخدم'}</h4>
                            <p>${timeAgo}</p>
                        </div>
                    </div>
                    <div class="story-content">
                        ${story.media ? `<img src="${story.media}" alt="ستوري" class="story-media">` : ''}
                        <p>${story.content}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // عرض الروايات
    renderNovels() {
        const novelsContainer = document.getElementById('novelsContainer');
        if (!novelsContainer) return;

        const novels = window.dataManager.getNovels();

        novelsContainer.innerHTML = novels.map(novel => {
            const author = window.dataManager.getUserById(novel.authorId);
            const timeAgo = this.getTimeAgo(novel.timestamp);

            return `
                <div class="card novel-card">
                    <div class="card-header">
                        <h3 class="card-title">${novel.title}</h3>
                        <p class="text-muted">بقلم: ${author?.username || 'مستخدم'} • ${timeAgo}</p>
                    </div>
                    <div class="card-body">
                        <p class="card-text">${novel.content}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // عرض صفحة المشاهدة
    renderWatchPage() {
        const watchContainer = document.getElementById('watchContainer');
        if (!watchContainer) return;

        watchContainer.innerHTML = `
            <div class="watch-layout">
                <div class="video-container">
                    <img src="assets/images/placeholder-video.png" alt="مشغل الفيديو" style="width: 100%; height: 100%; object-fit: contain;">
                </div>
                <div class="video-controls">
                    <div class="row">
                        <div class="col-md-6">
                            <h4>مشاهدة من الهاتف</h4>
                            <input type="file" id="localVideo" accept="video/*" class="form-control">
                        </div>
                        <div class="col-md-6">
                            <h4>مشاهدة من YouTube</h4>
                            <div class="d-flex gap-2">
                                <input type="url" id="youtubeUrl" placeholder="رابط YouTube" class="form-control">
                                <button class="btn btn-primary" onclick="loadYouTubeVideo()">تشغيل</button>
                            </div>
                        </div>
                    </div>
                    <div class="mt-3">
                        <button class="btn btn-secondary me-2" onclick="playVideo()">تشغيل</button>
                        <button class="btn btn-secondary me-2" onclick="pauseVideo()">إيقاف</button>
                        <button class="btn btn-secondary" onclick="skipVideo()">تقديم 10 ثواني</button>
                    </div>
                </div>
            </div>
        `;
    }

    // إعجاب بمنشور
    togglePostLike(postId) {
        const currentUser = window.authManager.getCurrentUser();
        if (!currentUser) return;

        window.dataManager.togglePostLike(postId, currentUser.id);
        this.renderPosts(); // إعادة عرض المنشورات
    }

    // تبديل الثيم
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        
        // حفظ الإعداد
        window.dataManager.updateSettings({ theme: this.currentTheme });
    }

    // تطبيق الثيم
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // تحديث أيقونة الثيم
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.classList.add('theme-changing');
            setTimeout(() => {
                themeToggle.classList.remove('theme-changing');
            }, 300);
        }
    }

    // تبديل اللغة
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'ar' ? 'en' : 'ar';
        this.applyLanguage(this.currentLanguage);
        
        // حفظ الإعداد
        window.dataManager.updateSettings({ language: this.currentLanguage });
    }

    // تطبيق اللغة
    applyLanguage(language) {
        document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', language);
        
        // تحديث النصوص (يمكن إضافة ترجمات هنا)
        if (language === 'en') {
            // تطبيق النصوص الإنجليزية
            this.applyEnglishTexts();
        } else {
            // تطبيق النصوص العربية
            this.applyArabicTexts();
        }
    }

    // تطبيق النصوص الإنجليزية
    applyEnglishTexts() {
        // يمكن إضافة ترجمات هنا
        const translations = {
            'المنشورات': 'Posts',
            'الرسائل': 'Messages',
            'الستوري': 'Stories',
            'المشاهدة': 'Watch',
            'الروايات': 'Novels',
            'الملف الشخصي': 'Profile'
        };

        // تطبيق الترجمات على العناصر
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });
    }

    // تطبيق النصوص العربية
    applyArabicTexts() {
        // إعادة النصوص العربية الأصلية
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            element.textContent = key;
        });
    }

    // تحديث رؤية الميزات
    updateFeatureVisibility() {
        const settings = window.dataManager.getSettings();
        const features = settings.features;

        // إخفاء/إظهار التبويبات
        Object.keys(features).forEach(feature => {
            const tabElement = document.querySelector(`[data-tab="${feature}"]`);
            if (tabElement) {
                tabElement.style.display = features[feature] ? 'flex' : 'none';
            }
        });

        // إخفاء الزر العائم إذا كانت المنشورات معطلة
        const floatingBtn = document.querySelector('.btn-floating');
        if (floatingBtn) {
            floatingBtn.style.display = features.posts ? 'flex' : 'none';
        }
    }

    // عرض رسالة تنبيه
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} show`;
        toast.innerHTML = `
            <div class="toast-content">
                <span>${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(toast);

        // إزالة التنبيه تلقائياً
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);

        return toast;
    }

    // عرض نافذة منبثقة
    showModal(title, content, actions = []) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${actions.length > 0 ? `
                    <div class="modal-footer">
                        ${actions.map(action => `
                            <button class="btn ${action.class || 'btn-secondary'}" onclick="${action.onclick || ''}">${action.text}</button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    }

    // إغلاق النافذة المنبثقة
    closeModal() {
        const modal = document.querySelector('.modal.show');
        if (modal) {
            modal.remove();
        }
    }

    // أخذ لقطة شاشة (محاكاة)
    takeScreenshot() {
        const currentUser = window.authManager.getCurrentUser();
        if (!currentUser) return;

        const currentPage = this.getCurrentPageName();
        window.dataManager.addScreenshot(currentUser.id, currentPage);
        
        this.showToast('تم تسجيل لقطة الشاشة', 'info');
    }

    // الحصول على اسم الصفحة الحالية
    getCurrentPageName() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '');
        
        const pageNames = {
            'index': 'الصفحة الرئيسية',
            'login': 'تسجيل الدخول',
            'admin': 'لوحة التحكم',
            'profile': 'الملف الشخصي',
            'watch': 'المشاهدة',
            'story': 'الستوري',
            'post': 'إنشاء منشور'
        };

        return pageNames[page] || 'صفحة غير معروفة';
    }

    // حساب الوقت المنقضي
    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);

        if (diffInSeconds < 60) {
            return 'الآن';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `منذ ${minutes} دقيقة`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `منذ ${hours} ساعة`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `منذ ${days} يوم`;
        }
    }

    // تنسيق التاريخ
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // تحديث الواجهة
    refresh() {
        this.updateTabContent(this.currentTab);
        this.updateFeatureVisibility();
    }

    // تحميل آخر تبويب
    loadLastTab() {
        const lastTab = localStorage.getItem('mj36_last_tab');
        if (lastTab) {
            this.switchTab(lastTab);
        } else {
            this.switchTab('posts');
        }
    }
}

// إنشاء مثيل عام لإدارة واجهة المستخدم
window.uiManager = new UIManager();

// تحميل آخر تبويب عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.uiManager.loadLastTab();
    }, 100);
});

// وظائف عامة للمشاهدة
function loadYouTubeVideo() {
    const url = document.getElementById('youtubeUrl').value;
    if (url) {
        window.uiManager.showToast('تم تحميل الفيديو (محاكاة)', 'success');
    }
}

function playVideo() {
    window.uiManager.showToast('تم تشغيل الفيديو (محاكاة)', 'info');
}

function pauseVideo() {
    window.uiManager.showToast('تم إيقاف الفيديو (محاكاة)', 'info');
}

function skipVideo() {
    window.uiManager.showToast('تم تقديم الفيديو 10 ثواني (محاكاة)', 'info');
}

