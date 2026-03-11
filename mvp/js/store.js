/**
 * 一拍即租 MVP - 数据存储层
 * 使用 localStorage 实现完整的数据持久化
 */

const DB_KEYS = {
    USERS: 'mvp_users',
    PRODUCTS: 'mvp_products',
    ORDERS: 'mvp_orders',
    CART: 'mvp_cart',
    CURRENT_USER: 'mvp_current_user',
    CURRENT_MERCHANT: 'mvp_current_merchant',
    FAVORITES: 'mvp_favorites',
    NOTIFICATIONS: 'mvp_notifications',
    ADDRESSES: 'mvp_addresses',
    COUPONS: 'mvp_coupons',
    REVIEWS: 'mvp_reviews',
    MERCHANTS: 'mvp_merchants',
    CAMPAIGNS: 'mvp_campaigns',
    INITIALIZED: 'mvp_initialized'
};

const Store = {
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch { return null; }
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    remove(key) {
        localStorage.removeItem(key);
    }
};

// ==================== 种子数据 ====================

const SEED_PRODUCTS = [
    {
        id: 'p001',
        name: '富士 instax mini 9 拍立得相机',
        brand: '富士',
        category: 'instax',
        price: 15,
        originalPrice: 20,
        deposit: 299,
        rating: 4.8,
        reviewCount: 328,
        rentalCount: 2156,
        satisfaction: 98,
        stock: 15,
        status: 'active',
        images: [
            'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400',
            'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400',
            'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=400'
        ],
        specs: { '品牌': '富士 Fujifilm', '型号': 'instax mini 9', '颜色': '冰霜白', '相纸尺寸': '86mm×54mm', '电池': '2节AA电池', '重量': '307g' },
        description: '富士 instax mini 9 是一款经典入门级拍立得相机，小巧轻便，操作简单，非常适合日常拍照和聚会使用。配备自动曝光测量，内置自拍镜和近拍镜头附件。',
        tags: ['热门', '入门款'],
        isNew: false
    },
    {
        id: 'p002',
        name: '宝丽来 OneStep+ 拍立得相机',
        brand: '宝丽来',
        category: 'polaroid',
        price: 20,
        originalPrice: 28,
        deposit: 399,
        rating: 4.6,
        reviewCount: 156,
        rentalCount: 892,
        satisfaction: 96,
        stock: 8,
        status: 'active',
        images: [
            'https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?w=400',
            'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=400'
        ],
        specs: { '品牌': 'Polaroid', '型号': 'OneStep+', '颜色': '经典白', '相纸尺寸': '79mm×79mm', '电池': '内置锂电池', '重量': '460g' },
        description: '宝丽来 OneStep+ 支持蓝牙连接手机App，可实现双重曝光、光绘等创意拍摄模式。经典方画幅，复古风格，让每一张照片都独一无二。',
        tags: ['创意', '蓝牙'],
        isNew: false
    },
    {
        id: 'p003',
        name: '富士 instax mini LiPlay 拍立得',
        brand: '富士',
        category: 'instax',
        price: 25,
        originalPrice: 35,
        deposit: 499,
        rating: 4.9,
        reviewCount: 89,
        rentalCount: 567,
        satisfaction: 99,
        stock: 5,
        status: 'active',
        images: [
            'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
            'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=400'
        ],
        specs: { '品牌': '富士 Fujifilm', '型号': 'instax mini LiPlay', '颜色': '典雅黑', '相纸尺寸': '86mm×54mm', '电池': '内置锂电池', '重量': '255g' },
        description: '集数码相机与拍立得于一体，支持蓝牙连接手机操控。独特的录音功能可为照片添加10秒音频，通过二维码扫描即可回放。搭载LCD显示屏，可预览并选择心仪照片再打印。',
        tags: ['新品', '蓝牙', '高端'],
        isNew: true
    },
    {
        id: 'p004',
        name: '富士 instax SQUARE SQ1 方形拍立得',
        brand: '富士',
        category: 'instax',
        price: 22,
        originalPrice: 30,
        deposit: 350,
        rating: 4.7,
        reviewCount: 76,
        rentalCount: 423,
        satisfaction: 97,
        stock: 10,
        status: 'active',
        images: [
            'https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=400',
            'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=400'
        ],
        specs: { '品牌': '富士 Fujifilm', '型号': 'instax SQUARE SQ1', '颜色': '冰川蓝', '相纸尺寸': '86mm×72mm', '电池': '2节CR2锂电池', '重量': '390g' },
        description: '方形画幅拍立得相机，自动曝光功能，简洁的一键操作设计。对称的方形照片构图更具艺术感，非常适合社交分享和手账装饰。',
        tags: ['方画幅'],
        isNew: true
    },
    {
        id: 'p005',
        name: '富士 instax mini 11 拍立得相机',
        brand: '富士',
        category: 'instax',
        price: 18,
        originalPrice: 25,
        deposit: 299,
        rating: 4.7,
        reviewCount: 215,
        rentalCount: 1320,
        satisfaction: 97,
        stock: 12,
        status: 'active',
        images: [
            'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=400',
            'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400'
        ],
        specs: { '品牌': '富士 Fujifilm', '型号': 'instax mini 11', '颜色': '腮红粉', '相纸尺寸': '86mm×54mm', '电池': '2节AA电池', '重量': '293g' },
        description: 'mini 9 升级版，新增自动曝光功能，无需手动调节亮度。自拍模式一键切换，内置近拍镜头，30-50cm近距离拍摄清晰锐利。5种马卡龙配色可选。',
        tags: ['热门', '入门款'],
        isNew: false
    },
    {
        id: 'p006',
        name: '宝丽来 Now+ 二代拍立得',
        brand: '宝丽来',
        category: 'polaroid',
        price: 28,
        originalPrice: 38,
        deposit: 450,
        rating: 4.5,
        reviewCount: 63,
        rentalCount: 289,
        satisfaction: 95,
        stock: 6,
        status: 'active',
        images: [
            'https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?w=400',
            'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400'
        ],
        specs: { '品牌': 'Polaroid', '型号': 'Now+ Gen 2', '颜色': '森林绿', '相纸尺寸': '79mm×79mm', '电池': '内置锂电池', '重量': '434g' },
        description: '宝丽来 Now+ 二代配备5片创意滤光镜片，支持蓝牙App控制，拥有双重曝光、光绘、自拍定时器等丰富玩法。自动对焦系统，出片效果更稳定。',
        tags: ['创意', '蓝牙', '高端'],
        isNew: false
    },
    {
        id: 'p007',
        name: '新手入门套餐（mini 11 + 相纸20张）',
        brand: '富士',
        category: 'bundle',
        price: 22,
        originalPrice: 32,
        deposit: 350,
        rating: 4.9,
        reviewCount: 182,
        rentalCount: 978,
        satisfaction: 99,
        stock: 8,
        status: 'active',
        images: [
            'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400',
            'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=400'
        ],
        specs: { '包含': 'mini 11相机 + mini相纸20张 + 相机包 + 挂绳', '品牌': '富士 Fujifilm', '适合': '初次使用拍立得的用户' },
        description: '专为拍立得新手打造的超值套餐！包含富士 mini 11 相机一台、原装 mini 相纸20张、可爱相机保护包和肩带挂绳。拆箱即用，告别选择困难！',
        tags: ['套餐', '超值', '新手推荐'],
        isNew: false
    },
    {
        id: 'p008',
        name: '富士 instax mini Evo 数模混合拍立得',
        brand: '富士',
        category: 'instax',
        price: 32,
        originalPrice: 45,
        deposit: 599,
        rating: 4.8,
        reviewCount: 47,
        rentalCount: 198,
        satisfaction: 98,
        stock: 3,
        status: 'active',
        images: [
            'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
            'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=400'
        ],
        specs: { '品牌': '富士 Fujifilm', '型号': 'instax mini Evo', '颜色': '复古黑', '相纸尺寸': '86mm×54mm', '存储': 'microSD卡', '重量': '285g' },
        description: '数码与拍立得的完美融合！10种镜头效果 × 10种胶片效果，共100种创意组合。3.0英寸LCD屏幕预览，选中满意照片再打印，不浪费相纸。支持手机照片打印。',
        tags: ['高端', '数码', '创意'],
        isNew: true
    }
];

const SEED_COUPONS = [
    { id: 'c001', name: '新用户专享', discount: 20, type: 'fixed', minOrder: 50, expiry: '2026-04-30', used: false },
    { id: 'c002', name: '租赁85折券', discount: 15, type: 'percent', minOrder: 30, expiry: '2026-03-31', used: false },
    { id: 'c003', name: '春日特惠', discount: 10, type: 'fixed', minOrder: 0, expiry: '2026-04-15', used: false }
];

const SEED_REVIEWS = [
    { id: 'r001', productId: 'p001', userId: 'demo', username: '小林', rating: 5, content: '相机非常好用，拍出来的效果很棒！配送也很快，两天就收到了。下次还会再租。', date: '2026-02-15', avatar: '林' },
    { id: 'r002', productId: 'p001', userId: 'u002', username: '摄影爱好者', rating: 4, content: '总体满意，就是电池消耗有点快，建议多准备几节电池。相机本身功能不错，拍出来有复古感。', date: '2026-02-10', avatar: '摄' },
    { id: 'r003', productId: 'p002', userId: 'u003', username: '文艺青年', rating: 5, content: '宝丽来的质感真的无可替代！方形照片太好看了，蓝牙连接App拍出来更有创意。', date: '2026-01-28', avatar: '文' },
    { id: 'r004', productId: 'p003', userId: 'u004', username: '旅行达人', rating: 5, content: 'LiPlay 太棒了！可以先预览再打印，完全不浪费相纸。录音功能是亮点，给照片加上声音超有趣。', date: '2026-03-01', avatar: '旅' },
    { id: 'r005', productId: 'p005', userId: 'u005', username: '小白兔', rating: 5, content: '粉色款超级可爱！自动曝光比 mini 9 方便太多了，不用自己拼亮度。拍出来的照片颜色很正。', date: '2026-02-20', avatar: '白' },
    { id: 'r006', productId: 'p007', userId: 'u006', username: '新手小姐姐', rating: 5, content: '套餐太划算了！拆开箱就能直接拍，相纸也够用好几天了。非常推荐给第一次玩拍立得的朋友！', date: '2026-03-05', avatar: '新' }
];

// ==================== 数据库操作 ====================

const DB = {
    init() {
        if (Store.get(DB_KEYS.INITIALIZED)) return;
        Store.set(DB_KEYS.PRODUCTS, SEED_PRODUCTS);
        Store.set(DB_KEYS.ORDERS, []);
        Store.set(DB_KEYS.USERS, []);
        Store.set(DB_KEYS.MERCHANTS, []);
        Store.set(DB_KEYS.CAMPAIGNS, []);
        Store.set(DB_KEYS.FAVORITES, {});
        Store.set(DB_KEYS.NOTIFICATIONS, {});
        Store.set(DB_KEYS.ADDRESSES, {});
        Store.set(DB_KEYS.COUPONS, {});
        Store.set(DB_KEYS.REVIEWS, SEED_REVIEWS);
        Store.set(DB_KEYS.INITIALIZED, true);
    },

    reset() {
        Object.values(DB_KEYS).forEach(k => Store.remove(k));
        this.init();
    },

    // ---- 用户 ----
    getUsers() { return Store.get(DB_KEYS.USERS) || []; },

    findUser(phone) {
        return this.getUsers().find(u => u.phone === phone);
    },

    createUser(phone, password, name) {
        const users = this.getUsers();
        if (users.find(u => u.phone === phone)) return null;
        const user = {
            id: 'u_' + Date.now(),
            phone,
            password,
            name: name || ('用户' + phone.slice(-4)),
            avatar: null,
            balance: 0,
            createdAt: new Date().toISOString()
        };
        users.push(user);
        Store.set(DB_KEYS.USERS, users);

        // 给新用户发放优惠券
        const coupons = Store.get(DB_KEYS.COUPONS) || {};
        coupons[user.id] = JSON.parse(JSON.stringify(SEED_COUPONS));
        Store.set(DB_KEYS.COUPONS, coupons);

        // 给新用户创建欢迎通知
        const notifs = Store.get(DB_KEYS.NOTIFICATIONS) || {};
        notifs[user.id] = [
            { id: 'n_' + Date.now(), type: 'system', title: '欢迎加入一拍即租！', content: '您已成功注册，快去挑选心仪的拍立得相机吧～新用户专享优惠券已发放到您的账户。', time: new Date().toISOString(), read: false },
            { id: 'n_' + (Date.now() + 1), type: 'promo', title: '新用户¥20优惠券已到账', content: '满¥50可用，有效期至2026年4月30日，快去使用吧！', time: new Date().toISOString(), read: false }
        ];
        Store.set(DB_KEYS.NOTIFICATIONS, notifs);

        return user;
    },

    login(phone, password) {
        const user = this.findUser(phone);
        if (!user || user.password !== password) return null;
        Store.set(DB_KEYS.CURRENT_USER, user.id);
        return user;
    },

    logout() {
        Store.remove(DB_KEYS.CURRENT_USER);
    },

    getCurrentUser() {
        const uid = Store.get(DB_KEYS.CURRENT_USER);
        if (!uid) return null;
        return this.getUsers().find(u => u.id === uid) || null;
    },

    updateUser(updates) {
        const uid = Store.get(DB_KEYS.CURRENT_USER);
        if (!uid) return null;
        const users = this.getUsers();
        const idx = users.findIndex(u => u.id === uid);
        if (idx === -1) return null;
        Object.assign(users[idx], updates);
        Store.set(DB_KEYS.USERS, users);
        return users[idx];
    },

    // ---- 产品 ----
    getProducts() { return Store.get(DB_KEYS.PRODUCTS) || []; },

    getProduct(id) {
        return this.getProducts().find(p => p.id === id);
    },

    searchProducts(query) {
        const q = query.toLowerCase();
        return this.getProducts().filter(p =>
            p.status === 'active' && (
                p.name.toLowerCase().includes(q) ||
                p.brand.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) ||
                p.description.toLowerCase().includes(q)
            )
        );
    },

    getProductsByCategory(cat) {
        return this.getProducts().filter(p => p.status === 'active' && p.category === cat);
    },

    getActiveProducts() {
        return this.getProducts().filter(p => p.status === 'active');
    },

    // ---- 收藏 ----
    getFavorites() {
        const uid = Store.get(DB_KEYS.CURRENT_USER);
        if (!uid) return [];
        const favs = Store.get(DB_KEYS.FAVORITES) || {};
        return favs[uid] || [];
    },

    toggleFavorite(productId) {
        const uid = Store.get(DB_KEYS.CURRENT_USER);
        if (!uid) return false;
        const favs = Store.get(DB_KEYS.FAVORITES) || {};
        if (!favs[uid]) favs[uid] = [];
        const idx = favs[uid].indexOf(productId);
        if (idx > -1) {
            favs[uid].splice(idx, 1);
        } else {
            favs[uid].push(productId);
        }
        Store.set(DB_KEYS.FAVORITES, favs);
        return favs[uid].includes(productId);
    },

    isFavorite(productId) {
        return this.getFavorites().includes(productId);
    },

    // ---- 订单 ----
    getOrders() {
        const uid = Store.get(DB_KEYS.CURRENT_USER);
        if (!uid) return [];
        return (Store.get(DB_KEYS.ORDERS) || []).filter(o => o.userId === uid);
    },

    getAllOrders() {
        return Store.get(DB_KEYS.ORDERS) || [];
    },

    createOrder(productId, days, startDate) {
        const uid = Store.get(DB_KEYS.CURRENT_USER);
        if (!uid) return null;
        const product = this.getProduct(productId);
        if (!product) return null;

        const user = this.getCurrentUser();
        const totalPrice = product.price * days;
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + days);

        const order = {
            id: 'ORD' + Date.now(),
            userId: uid,
            userName: user.name,
            productId: product.id,
            productName: product.name,
            productImage: product.images[0],
            price: product.price,
            days,
            totalPrice,
            deposit: product.deposit,
            startDate,
            endDate: endDate.toISOString().split('T')[0],
            status: 'pending_payment',
            createdAt: new Date().toISOString(),
            paidAt: null,
            shippedAt: null,
            returnedAt: null,
            completedAt: null,
            couponId: null,
            couponDiscount: 0
        };

        const orders = Store.get(DB_KEYS.ORDERS) || [];
        orders.unshift(order);
        Store.set(DB_KEYS.ORDERS, orders);

        // 添加订单通知
        this.addNotification('order', '订单创建成功', `您的订单 ${order.id} 已创建，请在30分钟内完成支付。租赁${product.name}，${days}天，总计¥${totalPrice}。`);

        return order;
    },

    payOrder(orderId, couponId) {
        const orders = Store.get(DB_KEYS.ORDERS) || [];
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx === -1) return null;

        let discount = 0;
        if (couponId) {
            const uid = Store.get(DB_KEYS.CURRENT_USER);
            const coupons = Store.get(DB_KEYS.COUPONS) || {};
            const userCoupons = coupons[uid] || [];
            const coupon = userCoupons.find(c => c.id === couponId && !c.used);
            if (coupon) {
                if (coupon.type === 'fixed') discount = coupon.discount;
                else discount = Math.floor(orders[idx].totalPrice * coupon.discount / 100);
                coupon.used = true;
                Store.set(DB_KEYS.COUPONS, coupons);
                orders[idx].couponId = couponId;
                orders[idx].couponDiscount = discount;
            }
        }

        orders[idx].status = 'pending_shipment';
        orders[idx].paidAt = new Date().toISOString();
        Store.set(DB_KEYS.ORDERS, orders);

        this.addNotification('order', '支付成功', `订单 ${orderId} 已支付成功（¥${orders[idx].totalPrice - discount} + 押金¥${orders[idx].deposit}），商家将尽快为您发货。`);

        // Update product rentalCount
        const products = this.getProducts();
        const pi = products.findIndex(p => p.id === orders[idx].productId);
        if (pi > -1) {
            products[pi].rentalCount = (products[pi].rentalCount || 0) + 1;
            Store.set(DB_KEYS.PRODUCTS, products);
        }

        return orders[idx];
    },

    updateOrderStatus(orderId, status) {
        const orders = Store.get(DB_KEYS.ORDERS) || [];
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx === -1) return null;
        orders[idx].status = status;
        if (status === 'pending_return') orders[idx].shippedAt = new Date().toISOString();
        if (status === 'completed') {
            orders[idx].completedAt = new Date().toISOString();
            this.addNotification('order', '押金退还通知', `订单 ${orderId} 已完成，押金¥${orders[idx].deposit}将在3个工作日内退还至您的支付账户。`);
        }
        Store.set(DB_KEYS.ORDERS, orders);
        return orders[idx];
    },

    cancelOrder(orderId) {
        const orders = Store.get(DB_KEYS.ORDERS) || [];
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx === -1) return null;
        if (orders[idx].status !== 'pending_payment') return null;
        orders[idx].status = 'cancelled';
        Store.set(DB_KEYS.ORDERS, orders);
        this.addNotification('order', '订单已取消', `订单 ${orderId} 已取消。`);
        return orders[idx];
    },

    // ---- 通知 ----
    getNotifications() {
        const uid = Store.get(DB_KEYS.CURRENT_USER);
        if (!uid) return [];
        const notifs = Store.get(DB_KEYS.NOTIFICATIONS) || {};
        return notifs[uid] || [];
    },

    addNotification(type, title, content) {
        const uid = Store.get(DB_KEYS.CURRENT_USER);
        if (!uid) return;
        const notifs = Store.get(DB_KEYS.NOTIFICATIONS) || {};
        if (!notifs[uid]) notifs[uid] = [];
        notifs[uid].unshift({
            id: 'n_' + Date.now(),
            type,
            title,
            content,
            time: new Date().toISOString(),
            read: false
        });
        Store.set(DB_KEYS.NOTIFICATIONS, notifs);
    },

    markNotificationRead(notifId) {
        const uid = Store.get(DB_KEYS.CURRENT_USER);
        if (!uid) return;
        const notifs = Store.get(DB_KEYS.NOTIFICATIONS) || {};
        const list = notifs[uid] || [];
        const n = list.find(x => x.id === notifId);
        if (n) { n.read = true; Store.set(DB_KEYS.NOTIFICATIONS, notifs); }
    },

    getUnreadCount() {
        return this.getNotifications().filter(n => !n.read).length;
    },

    // ---- 地址 ----
    getAddresses() {
        const uid = Store.get(DB_KEYS.CURRENT_USER);
        if (!uid) return [];
        const addrs = Store.get(DB_KEYS.ADDRESSES) || {};
        return addrs[uid] || [];
    },

    addAddress(addr) {
        const uid = Store.get(DB_KEYS.CURRENT_USER);
        if (!uid) return null;
        const addrs = Store.get(DB_KEYS.ADDRESSES) || {};
        if (!addrs[uid]) addrs[uid] = [];
        const newAddr = { id: 'addr_' + Date.now(), ...addr, isDefault: addrs[uid].length === 0 };
        addrs[uid].push(newAddr);
        Store.set(DB_KEYS.ADDRESSES, addrs);
        return newAddr;
    },

    deleteAddress(addrId) {
        const uid = Store.get(DB_KEYS.CURRENT_USER);
        if (!uid) return;
        const addrs = Store.get(DB_KEYS.ADDRESSES) || {};
        if (!addrs[uid]) return;
        addrs[uid] = addrs[uid].filter(a => a.id !== addrId);
        Store.set(DB_KEYS.ADDRESSES, addrs);
    },

    // ---- 优惠券 ----
    getCoupons() {
        const uid = Store.get(DB_KEYS.CURRENT_USER);
        if (!uid) return [];
        const coupons = Store.get(DB_KEYS.COUPONS) || {};
        return coupons[uid] || [];
    },

    getAvailableCoupons(orderAmount) {
        return this.getCoupons().filter(c => !c.used && new Date(c.expiry) > new Date() && orderAmount >= c.minOrder);
    },

    // ---- 评价 ----
    getProductReviews(productId) {
        const reviews = Store.get(DB_KEYS.REVIEWS) || [];
        return reviews.filter(r => r.productId === productId);
    },

    addReview(productId, rating, content) {
        const user = this.getCurrentUser();
        if (!user) return null;
        const reviews = Store.get(DB_KEYS.REVIEWS) || [];
        const review = {
            id: 'r_' + Date.now(),
            productId,
            userId: user.id,
            username: user.name,
            rating,
            content,
            date: new Date().toISOString().split('T')[0],
            avatar: user.name.charAt(0)
        };
        reviews.unshift(review);
        Store.set(DB_KEYS.REVIEWS, reviews);

        // 更新产品评分
        const pReviews = reviews.filter(r => r.productId === productId);
        const avgRating = Math.round(pReviews.reduce((sum, r) => sum + r.rating, 0) / pReviews.length * 10) / 10;
        const products = this.getProducts();
        const pi = products.findIndex(p => p.id === productId);
        if (pi > -1) {
            products[pi].rating = avgRating;
            products[pi].reviewCount = pReviews.length;
            Store.set(DB_KEYS.PRODUCTS, products);
        }
        return review;
    },

    // ==================== 商户模块 ====================

    // ---- 商户认证 ----
    getMerchants() { return Store.get(DB_KEYS.MERCHANTS) || []; },

    findMerchant(account) {
        return this.getMerchants().find(m => m.account === account);
    },

    createMerchant(account, password, shopName) {
        const merchants = this.getMerchants();
        if (merchants.find(m => m.account === account)) return null;
        const merchant = {
            id: 'm_' + Date.now(),
            account,
            password,
            shopName: shopName || ('店铺' + account.slice(-4)),
            createdAt: new Date().toISOString()
        };
        merchants.push(merchant);
        Store.set(DB_KEYS.MERCHANTS, merchants);
        return merchant;
    },

    merchantLogin(account, password) {
        const m = this.findMerchant(account);
        if (!m || m.password !== password) return null;
        Store.set(DB_KEYS.CURRENT_MERCHANT, m.id);
        return m;
    },

    merchantLogout() {
        Store.remove(DB_KEYS.CURRENT_MERCHANT);
    },

    getCurrentMerchant() {
        const mid = Store.get(DB_KEYS.CURRENT_MERCHANT);
        if (!mid) return null;
        return this.getMerchants().find(m => m.id === mid) || null;
    },

    // ---- 商户商品管理 ----
    addProduct(data) {
        const products = this.getProducts();
        const product = {
            id: 'p_' + Date.now(),
            name: data.name,
            brand: data.brand || '',
            category: data.category || 'instax',
            price: parseFloat(data.price),
            originalPrice: parseFloat(data.originalPrice) || parseFloat(data.price) * 1.3,
            deposit: parseFloat(data.deposit) || 299,
            rating: 0,
            reviewCount: 0,
            rentalCount: 0,
            satisfaction: 0,
            stock: parseInt(data.stock) || 1,
            status: 'active',
            images: data.images || ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400'],
            specs: data.specs || {},
            description: data.description || '',
            tags: data.tags || [],
            isNew: true,
            merchantId: Store.get(DB_KEYS.CURRENT_MERCHANT)
        };
        products.push(product);
        Store.set(DB_KEYS.PRODUCTS, products);
        return product;
    },

    updateProduct(id, updates) {
        const products = this.getProducts();
        const idx = products.findIndex(p => p.id === id);
        if (idx === -1) return null;
        Object.assign(products[idx], updates);
        Store.set(DB_KEYS.PRODUCTS, products);
        return products[idx];
    },

    toggleProductStatus(id) {
        const products = this.getProducts();
        const idx = products.findIndex(p => p.id === id);
        if (idx === -1) return null;
        products[idx].status = products[idx].status === 'active' ? 'inactive' : 'active';
        Store.set(DB_KEYS.PRODUCTS, products);
        return products[idx];
    },

    deleteProduct(id) {
        const products = this.getProducts().filter(p => p.id !== id);
        Store.set(DB_KEYS.PRODUCTS, products);
    },

    // ---- 商户订单管理 ----
    getMerchantOrders() {
        // 商户可看所有订单（MVP简化：单商户模式）
        return Store.get(DB_KEYS.ORDERS) || [];
    },

    shipOrder(orderId) {
        const orders = Store.get(DB_KEYS.ORDERS) || [];
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx === -1 || orders[idx].status !== 'pending_shipment') return null;
        orders[idx].status = 'pending_return';
        orders[idx].shippedAt = new Date().toISOString();
        Store.set(DB_KEYS.ORDERS, orders);
        return orders[idx];
    },

    confirmReturn(orderId) {
        const orders = Store.get(DB_KEYS.ORDERS) || [];
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx === -1) return null;
        orders[idx].status = 'completed';
        orders[idx].completedAt = new Date().toISOString();
        Store.set(DB_KEYS.ORDERS, orders);
        return orders[idx];
    },

    // ---- 商户统计 ----
    getMerchantStats() {
        const orders = this.getMerchantOrders();
        const paidOrders = orders.filter(o => o.status !== 'pending_payment' && o.status !== 'cancelled');
        const completedOrders = orders.filter(o => o.status === 'completed');
        const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalPrice - (o.couponDiscount || 0), 0);
        const totalOrders = paidOrders.length;
        const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders * 10) / 10 : 0;

        // 按产品统计
        const productStats = {};
        paidOrders.forEach(o => {
            if (!productStats[o.productId]) productStats[o.productId] = { name: o.productName, count: 0, revenue: 0 };
            productStats[o.productId].count++;
            productStats[o.productId].revenue += o.totalPrice - (o.couponDiscount || 0);
        });
        const topProducts = Object.values(productStats).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        // 按日统计（最近7天）
        const dailyRevenue = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            dailyRevenue[key] = 0;
        }
        paidOrders.forEach(o => {
            const day = o.paidAt ? o.paidAt.split('T')[0] : o.createdAt.split('T')[0];
            if (dailyRevenue[day] !== undefined) dailyRevenue[day] += o.totalPrice - (o.couponDiscount || 0);
        });

        // 订单状态分布
        const statusCounts = {};
        orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

        return { totalRevenue, totalOrders, avgOrder, topProducts, dailyRevenue, statusCounts, completedCount: completedOrders.length };
    },

    // ---- 营销活动 ----
    getCampaigns() {
        return Store.get(DB_KEYS.CAMPAIGNS) || [];
    },

    createCampaign(data) {
        const campaigns = this.getCampaigns();
        const campaign = {
            id: 'camp_' + Date.now(),
            name: data.name,
            description: data.description || '',
            discountType: data.discountType || 'percent',
            discountValue: parseFloat(data.discountValue) || 10,
            startDate: data.startDate,
            endDate: data.endDate,
            status: 'active',
            views: 0,
            participants: 0,
            revenue: 0,
            createdAt: new Date().toISOString()
        };
        campaigns.push(campaign);
        Store.set(DB_KEYS.CAMPAIGNS, campaigns);
        return campaign;
    },

    updateCampaign(id, updates) {
        const campaigns = this.getCampaigns();
        const idx = campaigns.findIndex(c => c.id === id);
        if (idx === -1) return null;
        Object.assign(campaigns[idx], updates);
        Store.set(DB_KEYS.CAMPAIGNS, campaigns);
        return campaigns[idx];
    },

    deleteCampaign(id) {
        const campaigns = this.getCampaigns().filter(c => c.id !== id);
        Store.set(DB_KEYS.CAMPAIGNS, campaigns);
    }
};

// 初始化
DB.init();
