// Authentication - المصادقة وإدارة الجلسات
class AuthManager {
    constructor() {
        this.sessionKey = 'mj36_session';
        this.lockKey = 'mj36_lock_state';
        this.currentUser = null;
        this.isLocked = false;
        
        this.initializeAuth();
    }

    // تهيئة المصادقة
    initializeAuth() {
        this.loadSession();
        this.checkLockState();
    }

    // تحميل الجلسة المحفوظة
    loadSession() {
        const sessionData = localStorage.getItem(this.sessionKey);
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                // التحقق من صحة الجلسة
                if (this.isValidSession(session)) {
                    this.currentUser = session.user;
                    this.updateUserActivity();
                } else {
                    this.clearSession();
                }
            } catch (error) {
                console.error('Error loading session:', error);
                this.clearSession();
            }
        }
    }

    // التحقق من صحة الجلسة
    isValidSession(session) {
        if (!session || !session.user || !session.timestamp) {
            return false;
        }
        
        // التحقق من انتهاء صلاحية الجلسة (7 أيام)
        const sessionAge = Date.now() - new Date(session.timestamp).getTime();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 أيام
        
        if (sessionAge > maxAge) {
            return false;
        }

        // التحقق من وجود المستخدم في قاعدة البيانات
        const user = window.dataManager.getUserById(session.user.id);
        return user !== undefined;
    }

    // حفظ الجلسة
    saveSession(user) {
        const sessionData = {
            user: {
                id: user.id,
                username: user.username,
                avatar: user.avatar,
                isAdmin: user.isAdmin
            },
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
        this.currentUser = sessionData.user;
    }

    // مسح الجلسة
    clearSession() {
        localStorage.removeItem(this.sessionKey);
        this.currentUser = null;
    }

    // التحقق من الرمز العام
    verifyGlobalCode(code) {
        const settings = window.dataManager.getSettings();
        return code === settings.globalCode;
    }

    // التحقق من رمز الآدمن
    verifyAdminCode(code) {
        const settings = window.dataManager.getSettings();
        return code === settings.adminCode;
    }

    // تسجيل الدخول
    async login(globalCode, username, password) {
        try {
            // التحقق من الرمز العام
            if (!this.verifyGlobalCode(globalCode)) {
                throw new Error('الرمز العام غير صحيح');
            }

            // البحث عن المستخدم
            const user = window.dataManager.getUserByUsername(username);
            if (!user) {
                throw new Error('اسم المستخدم غير موجود');
            }

            // التحقق من كلمة المرور
            if (!window.dataManager.verifyPassword(password, user.password)) {
                throw new Error('كلمة المرور غير صحيحة');
            }

            // حفظ الجلسة
            this.saveSession(user);
            this.updateUserActivity();

            return {
                success: true,
                user: this.currentUser
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // إنشاء حساب جديد
    async register(globalCode, username, password, avatar = null) {
        try {
            // التحقق من الرمز العام
            if (!this.verifyGlobalCode(globalCode)) {
                throw new Error('الرمز العام غير صحيح');
            }

            // التحقق من عدم وجود المستخدم
            const existingUser = window.dataManager.getUserByUsername(username);
            if (existingUser) {
                throw new Error('اسم المستخدم موجود بالفعل');
            }

            // التحقق من قوة كلمة المرور
            if (password.length < 6) {
                throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            }

            // إنشاء المستخدم الجديد
            const newUser = window.dataManager.addUser({
                username,
                password,
                avatar: avatar || 'assets/images/avatar-male.png'
            });

            // حفظ الجلسة
            this.saveSession(newUser);

            return {
                success: true,
                user: this.currentUser
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // تسجيل الخروج
    logout() {
        this.clearSession();
        this.clearLockState();
        window.location.href = 'login.html';
    }

    // التحقق من تسجيل الدخول
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // الحصول على المستخدم الحالي
    getCurrentUser() {
        return this.currentUser;
    }

    // التحقق من صلاحيات الآدمن
    isAdmin() {
        return this.currentUser && this.currentUser.isAdmin;
    }

    // تحديث نشاط المستخدم
    updateUserActivity() {
        if (this.currentUser) {
            window.dataManager.updateUserActivity(this.currentUser.id);
        }
    }

    // إدارة القفل الداخلي
    checkLockState() {
        const lockState = localStorage.getItem(this.lockKey);
        if (lockState) {
            const lockData = JSON.parse(lockState);
            this.isLocked = lockData.isLocked;
        }
    }

    // تفعيل القفل
    enableLock(pin) {
        if (!pin || pin.length < 4) {
            throw new Error('الرمز يجب أن يكون 4 أرقام على الأقل');
        }

        const settings = window.dataManager.getSettings();
        const hashedPin = window.dataManager.hashPassword(pin);
        
        window.dataManager.updateSettings({
            lockEnabled: true,
            lockPin: hashedPin
        });

        this.showLockOverlay();
        
        return true;
    }

    // تعطيل القفل
    disableLock() {
        window.dataManager.updateSettings({
            lockEnabled: false,
            lockPin: null
        });

        this.clearLockState();
        this.hideLockOverlay();
        
        return true;
    }

    // قفل التطبيق
    lockApp() {
        const settings = window.dataManager.getSettings();
        if (settings.lockEnabled) {
            this.isLocked = true;
            localStorage.setItem(this.lockKey, JSON.stringify({
                isLocked: true,
                timestamp: new Date().toISOString()
            }));
            this.showLockOverlay();
        }
    }

    // إلغاء قفل التطبيق
    unlockApp(pin) {
        const settings = window.dataManager.getSettings();
        
        if (!settings.lockEnabled || !settings.lockPin) {
            return { success: false, error: 'القفل غير مفعل' };
        }

        if (window.dataManager.verifyPassword(pin, settings.lockPin)) {
            this.isLocked = false;
            this.clearLockState();
            this.hideLockOverlay();
            return { success: true };
        } else {
            return { success: false, error: 'الرمز غير صحيح' };
        }
    }

    // مسح حالة القفل
    clearLockState() {
        localStorage.removeItem(this.lockKey);
        this.isLocked = false;
    }

    // عرض واجهة القفل
    showLockOverlay() {
        // إنشاء واجهة القفل إذا لم تكن موجودة
        let lockOverlay = document.getElementById('lockOverlay');
        if (!lockOverlay) {
            lockOverlay = this.createLockOverlay();
            document.body.appendChild(lockOverlay);
        }
        
        lockOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // إخفاء واجهة القفل
    hideLockOverlay() {
        const lockOverlay = document.getElementById('lockOverlay');
        if (lockOverlay) {
            lockOverlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // إنشاء واجهة القفل
    createLockOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'lockOverlay';
        overlay.className = 'lock-overlay';
        overlay.innerHTML = `
            <div class="lock-content">
                <div class="lock-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <circle cx="12" cy="16" r="1"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                </div>
                <h2>التطبيق مقفل</h2>
                <p>أدخل الرمز لإلغاء القفل</p>
                <form id="unlockForm">
                    <input type="password" id="unlockPin" placeholder="أدخل الرمز" maxlength="10" required>
                    <button type="submit" class="btn btn-primary">إلغاء القفل</button>
                </form>
                <div id="unlockError" class="error-message" style="display: none;"></div>
            </div>
        `;

        // إضافة الأنماط
        const style = document.createElement('style');
        style.textContent = `
            .lock-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(10px);
            }
            
            .lock-content {
                background: var(--bg-card);
                padding: 2rem;
                border-radius: 1rem;
                text-align: center;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            
            .lock-icon {
                color: var(--primary-color);
                margin-bottom: 1rem;
            }
            
            .lock-content h2 {
                margin-bottom: 0.5rem;
                color: var(--text-primary);
            }
            
            .lock-content p {
                margin-bottom: 1.5rem;
                color: var(--text-secondary);
            }
            
            .lock-content input {
                width: 100%;
                padding: 0.75rem;
                margin-bottom: 1rem;
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                background: var(--bg-secondary);
                color: var(--text-primary);
                text-align: center;
                font-size: 1.2rem;
                letter-spacing: 0.2em;
            }
            
            .error-message {
                color: var(--danger-color);
                margin-top: 1rem;
                font-size: 0.9rem;
            }
        `;
        document.head.appendChild(style);

        // إضافة معالج الأحداث
        overlay.querySelector('#unlockForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const pin = overlay.querySelector('#unlockPin').value;
            const result = this.unlockApp(pin);
            
            if (!result.success) {
                const errorDiv = overlay.querySelector('#unlockError');
                errorDiv.textContent = result.error;
                errorDiv.style.display = 'block';
                overlay.querySelector('#unlockPin').value = '';
            }
        });

        return overlay;
    }

    // التحقق من حالة القفل
    isAppLocked() {
        return this.isLocked;
    }

    // تغيير كلمة المرور
    async changePassword(currentPassword, newPassword) {
        try {
            if (!this.currentUser) {
                throw new Error('يجب تسجيل الدخول أولاً');
            }

            const user = window.dataManager.getUserById(this.currentUser.id);
            if (!user) {
                throw new Error('المستخدم غير موجود');
            }

            // التحقق من كلمة المرور الحالية
            if (!window.dataManager.verifyPassword(currentPassword, user.password)) {
                throw new Error('كلمة المرور الحالية غير صحيحة');
            }

            // التحقق من قوة كلمة المرور الجديدة
            if (newPassword.length < 6) {
                throw new Error('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
            }

            // تحديث كلمة المرور
            const data = window.dataManager.getData();
            const userIndex = data.users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                data.users[userIndex].password = window.dataManager.hashPassword(newPassword);
                window.dataManager.saveData(data);
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // تحديث الملف الشخصي
    async updateProfile(updates) {
        try {
            if (!this.currentUser) {
                throw new Error('يجب تسجيل الدخول أولاً');
            }

            const data = window.dataManager.getData();
            const userIndex = data.users.findIndex(u => u.id === this.currentUser.id);
            
            if (userIndex === -1) {
                throw new Error('المستخدم غير موجود');
            }

            // تحديث البيانات
            if (updates.username) {
                // التحقق من عدم وجود اسم المستخدم
                const existingUser = data.users.find(u => u.username === updates.username && u.id !== this.currentUser.id);
                if (existingUser) {
                    throw new Error('اسم المستخدم موجود بالفعل');
                }
                data.users[userIndex].username = updates.username;
                this.currentUser.username = updates.username;
            }

            if (updates.avatar) {
                data.users[userIndex].avatar = updates.avatar;
                this.currentUser.avatar = updates.avatar;
            }

            window.dataManager.saveData(data);
            this.saveSession(data.users[userIndex]);

            return { success: true, user: this.currentUser };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// إنشاء مثيل عام لإدارة المصادقة
window.authManager = new AuthManager();

// التحقق من حالة القفل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const settings = window.dataManager.getSettings();
    if (settings.lockEnabled && window.authManager.isAppLocked()) {
        window.authManager.showLockOverlay();
    }
});

// تحديث نشاط المستخدم دورياً
setInterval(() => {
    if (window.authManager.isLoggedIn()) {
        window.authManager.updateUserActivity();
    }
}, 5 * 60 * 1000); // كل 5 دقائق

