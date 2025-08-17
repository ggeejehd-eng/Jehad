// Data Management - إدارة البيانات والحالة
class DataManager {
    constructor() {
        this.storageKey = 'mj36_app_data';
        this.defaultData = {
            users: [
                {
                    id: 1,
                    username: 'جهاد',
                    avatar: 'assets/images/avatar-male.png',
                    password: this.hashPassword('123456'), // كلمة سر تجريبية
                    isAdmin: false,
                    createdAt: new Date().toISOString(),
                    lastActive: new Date().toISOString()
                },
                {
                    id: 2,
                    username: 'حبيبتي',
                    avatar: 'assets/images/avatar-female.png',
                    password: this.hashPassword('123456'), // كلمة سر تجريبية
                    isAdmin: false,
                    createdAt: new Date().toISOString(),
                    lastActive: new Date().toISOString()
                }
            ],
            posts: [
                {
                    id: 1,
                    userId: 1,
                    content: 'أجمل لحظات حياتي معك يا حبيبتي ❤️',
                    image: 'assets/images/romantic-sunset.png',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    likes: 1,
                    likedBy: [2]
                },
                {
                    id: 2,
                    userId: 2,
                    content: 'شكرًا لك على الورود الجميلة 🌹',
                    image: 'assets/images/romantic-flowers.png',
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    likes: 1,
                    likedBy: [1]
                },
                {
                    id: 3,
                    userId: 1,
                    content: 'موعدنا في المقهى كان رائعًا ☕',
                    image: 'assets/images/coffee-date.png',
                    timestamp: new Date(Date.now() - 10800000).toISOString(),
                    likes: 1,
                    likedBy: [2]
                }
            ],
            messages: [
                {
                    id: 1,
                    senderId: 1,
                    receiverId: 2,
                    content: 'صباح الخير حبيبتي ☀️',
                    timestamp: new Date(Date.now() - 1800000).toISOString(),
                    type: 'text'
                },
                {
                    id: 2,
                    senderId: 2,
                    receiverId: 1,
                    content: 'صباح النور يا حبيبي 💕',
                    timestamp: new Date(Date.now() - 1500000).toISOString(),
                    type: 'text'
                },
                {
                    id: 3,
                    senderId: 1,
                    receiverId: 2,
                    content: 'كيف حالك اليوم؟',
                    timestamp: new Date(Date.now() - 1200000).toISOString(),
                    type: 'text'
                },
                {
                    id: 4,
                    senderId: 2,
                    receiverId: 1,
                    content: 'بخير والحمد لله، أشتاق إليك ❤️',
                    timestamp: new Date(Date.now() - 900000).toISOString(),
                    type: 'text'
                }
            ],
            stories: [
                {
                    id: 1,
                    userId: 1,
                    content: 'يوم جميل مع حبيبتي',
                    media: 'assets/images/romantic-sunset.png',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    expiresAt: new Date(Date.now() + 82800000).toISOString() // 24 ساعة
                }
            ],
            novels: [
                {
                    id: 1,
                    title: 'قصة حبنا',
                    content: 'في يوم من الأيام التقينا، وكانت بداية أجمل قصة حب في حياتنا. كل لحظة معك هي ذكرى جميلة أحتفظ بها في قلبي إلى الأبد.',
                    authorId: 1,
                    timestamp: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    id: 2,
                    title: 'رسالة حب',
                    content: 'حبيبي الغالي، أكتب لك هذه الكلمات من القلب. أنت نور حياتي وسر سعادتي. أحبك أكثر من كل شيء في هذا العالم.',
                    authorId: 2,
                    timestamp: new Date(Date.now() - 172800000).toISOString()
                }
            ],
            settings: {
                globalCode: 'mj36mhajehad',
                adminCode: 'Wwsdjehadadmen56780097gg',
                features: {
                    posts: true,
                    messages: true,
                    stories: true,
                    watch: true,
                    novels: true
                },
                theme: 'light',
                language: 'ar',
                lockEnabled: false,
                lockPin: null
            },
            screenshots: [
                {
                    id: 1,
                    userId: 1,
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    page: 'الصفحة الرئيسية'
                },
                {
                    id: 2,
                    userId: 2,
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    page: 'الدردشة'
                }
            ]
        };
        
        this.initializeData();
    }

    // تشفير كلمة المرور بسيط (للعرض فقط)
    hashPassword(password) {
        // استخدام تشفير بسيط للعرض - في التطبيق الحقيقي استخدم bcrypt أو مشابه
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // تحويل إلى 32bit integer
        }
        return hash.toString();
    }

    // التحقق من كلمة المرور
    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }

    // تهيئة البيانات
    initializeData() {
        const existingData = localStorage.getItem(this.storageKey);
        if (!existingData) {
            this.saveData(this.defaultData);
        }
    }

    // جلب البيانات
    getData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : this.defaultData;
    }

    // حفظ البيانات
    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        this.notifyWatchers('dataChanged', data);
    }

    // جلب المستخدمين
    getUsers() {
        return this.getData().users;
    }

    // جلب مستخدم بالمعرف
    getUserById(id) {
        return this.getUsers().find(user => user.id === id);
    }

    // جلب مستخدم بالاسم
    getUserByUsername(username) {
        return this.getUsers().find(user => user.username === username);
    }

    // إضافة مستخدم جديد
    addUser(userData) {
        const data = this.getData();
        const newUser = {
            id: Date.now(),
            ...userData,
            password: this.hashPassword(userData.password),
            isAdmin: false,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };
        data.users.push(newUser);
        this.saveData(data);
        return newUser;
    }

    // تحديث نشاط المستخدم
    updateUserActivity(userId) {
        const data = this.getData();
        const user = data.users.find(u => u.id === userId);
        if (user) {
            user.lastActive = new Date().toISOString();
            this.saveData(data);
        }
    }

    // جلب المنشورات
    getPosts() {
        return this.getData().posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // إضافة منشور
    addPost(postData) {
        const data = this.getData();
        const newPost = {
            id: Date.now(),
            ...postData,
            timestamp: new Date().toISOString(),
            likes: 0,
            likedBy: []
        };
        data.posts.push(newPost);
        this.saveData(data);
        return newPost;
    }

    // إعجاب بمنشور
    togglePostLike(postId, userId) {
        const data = this.getData();
        const post = data.posts.find(p => p.id === postId);
        if (post) {
            const likedIndex = post.likedBy.indexOf(userId);
            if (likedIndex > -1) {
                post.likedBy.splice(likedIndex, 1);
                post.likes--;
            } else {
                post.likedBy.push(userId);
                post.likes++;
            }
            this.saveData(data);
        }
        return post;
    }

    // حذف منشور
    deletePost(postId) {
        const data = this.getData();
        data.posts = data.posts.filter(p => p.id !== postId);
        this.saveData(data);
    }

    // جلب الرسائل
    getMessages() {
        return this.getData().messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    // إضافة رسالة
    addMessage(messageData) {
        const data = this.getData();
        const newMessage = {
            id: Date.now(),
            ...messageData,
            timestamp: new Date().toISOString()
        };
        data.messages.push(newMessage);
        this.saveData(data);
        return newMessage;
    }

    // جلب الستوريات النشطة
    getActiveStories() {
        const now = new Date();
        return this.getData().stories.filter(story => new Date(story.expiresAt) > now);
    }

    // إضافة ستوري
    addStory(storyData) {
        const data = this.getData();
        const newStory = {
            id: Date.now(),
            ...storyData,
            timestamp: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 ساعة
        };
        data.stories.push(newStory);
        this.saveData(data);
        return newStory;
    }

    // جلب الروايات
    getNovels() {
        return this.getData().novels.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // إضافة رواية
    addNovel(novelData) {
        const data = this.getData();
        const newNovel = {
            id: Date.now(),
            ...novelData,
            timestamp: new Date().toISOString()
        };
        data.novels.push(newNovel);
        this.saveData(data);
        return newNovel;
    }

    // جلب الإعدادات
    getSettings() {
        return this.getData().settings;
    }

    // تحديث الإعدادات
    updateSettings(newSettings) {
        const data = this.getData();
        data.settings = { ...data.settings, ...newSettings };
        this.saveData(data);
        return data.settings;
    }

    // تحديث حالة الميزة
    updateFeatureStatus(feature, status) {
        const data = this.getData();
        data.settings.features[feature] = status;
        this.saveData(data);
        this.notifyWatchers('featureChanged', { feature, status });
    }

    // جلب سجلات لقطات الشاشة
    getScreenshots() {
        return this.getData().screenshots.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // إضافة سجل لقطة شاشة
    addScreenshot(userId, page) {
        const data = this.getData();
        const newScreenshot = {
            id: Date.now(),
            userId,
            page,
            timestamp: new Date().toISOString()
        };
        data.screenshots.push(newScreenshot);
        this.saveData(data);
        return newScreenshot;
    }

    // مراقبة التغييرات
    watchers = [];

    addWatcher(callback) {
        this.watchers.push(callback);
    }

    removeWatcher(callback) {
        this.watchers = this.watchers.filter(w => w !== callback);
    }

    notifyWatchers(event, data) {
        this.watchers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Error in watcher:', error);
            }
        });
    }

    // تنظيف البيانات القديمة
    cleanup() {
        const data = this.getData();
        const now = new Date();
        
        // حذف الستوريات المنتهية الصلاحية
        data.stories = data.stories.filter(story => new Date(story.expiresAt) > now);
        
        // حذف سجلات لقطات الشاشة القديمة (أكثر من 30 يوم)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        data.screenshots = data.screenshots.filter(screenshot => new Date(screenshot.timestamp) > thirtyDaysAgo);
        
        this.saveData(data);
    }

    // إعادة تعيين البيانات
    resetData() {
        localStorage.removeItem(this.storageKey);
        this.initializeData();
        this.notifyWatchers('dataReset', this.getData());
    }

    // تصدير البيانات
    exportData() {
        return JSON.stringify(this.getData(), null, 2);
    }

    // استيراد البيانات
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            this.saveData(data);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}

// إنشاء مثيل عام لإدارة البيانات
window.dataManager = new DataManager();

// تنظيف دوري للبيانات
setInterval(() => {
    window.dataManager.cleanup();
}, 60 * 60 * 1000); // كل ساعة

