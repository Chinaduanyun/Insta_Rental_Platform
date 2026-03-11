/**
 * 一拍即租 MVP - 应用主控制器 (SPA 路由 + 页面渲染)
 */

const App = {
    currentPage: null,
    container: null,

    init() {
        this.container = document.getElementById('app-content');
        window.addEventListener('hashchange', () => this.route());
        this.route();
    },

    route() {
        const hash = location.hash.slice(1) || 'home';
        const [page, ...params] = hash.split('/');
        const paramStr = params.join('/');

        // 需要用户登录的页面
        const authRequired = ['orders', 'profile', 'notifications', 'checkout', 'favorites'];
        if (authRequired.includes(page) && !DB.getCurrentUser()) {
            location.hash = '#login';
            return;
        }

        // 需要商户登录的页面
        const merchantRequired = ['m_products', 'm_orders', 'm_stats', 'm_marketing', 'm_product_edit', 'm_campaign_edit'];
        if (merchantRequired.includes(page) && !DB.getCurrentMerchant()) {
            location.hash = '#m_login';
            return;
        }

        this.currentPage = page;
        this.renderPage(page, paramStr);
        window.scrollTo(0, 0);
    },

    renderPage(page, params) {
        const pages = {
            home: () => Pages.home(),
            login: () => Pages.login(),
            register: () => Pages.register(),
            product: () => Pages.product(params),
            categories: () => Pages.categories(params),
            orders: () => Pages.orders(),
            profile: () => Pages.profile(),
            notifications: () => Pages.notifications(),
            checkout: () => Pages.checkout(params),
            favorites: () => Pages.favorites(),
            search: () => Pages.search(params),
            // 商户端
            m_login: () => MerchantPages.login(),
            m_register: () => MerchantPages.register(),
            m_products: () => MerchantPages.products(),
            m_orders: () => MerchantPages.orders(),
            m_stats: () => MerchantPages.stats(),
            m_marketing: () => MerchantPages.marketing(),
            m_product_edit: () => MerchantPages.productEdit(params),
            m_campaign_edit: () => MerchantPages.campaignEdit(params)
        };

        const renderer = pages[page];
        if (renderer) {
            this.container.innerHTML = renderer();
            this.bindEvents();
            this.updateNavBar();
        } else {
            this.container.innerHTML = Pages.home();
            this.bindEvents();
            this.updateNavBar();
        }
    },

    updateNavBar() {
        const nav = document.getElementById('bottom-nav');
        const merchantNav = document.getElementById('merchant-nav');
        const isMerchantPage = this.currentPage.startsWith('m_');
        const hideNav = ['login', 'register', 'product', 'checkout', 'm_login', 'm_register', 'm_product_edit', 'm_campaign_edit'].includes(this.currentPage);

        // 切换用户/商户导航栏
        if (hideNav) {
            nav.style.display = 'none';
            merchantNav.style.display = 'none';
        } else if (isMerchantPage) {
            nav.style.display = 'none';
            merchantNav.style.display = 'flex';
            merchantNav.querySelectorAll('.nav-item').forEach(item => {
                const target = item.dataset.page;
                item.classList.toggle('active', target === this.currentPage);
            });
        } else {
            nav.style.display = 'flex';
            merchantNav.style.display = 'none';
            nav.querySelectorAll('.nav-item').forEach(item => {
                const target = item.dataset.page;
                item.classList.toggle('active', target === this.currentPage);
            });
        }
        // 更新通知角标
        const badge = document.getElementById('nav-notification-badge');
        if (badge) {
            const count = DB.getUnreadCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    },

    bindEvents() {
        // 通用事件委托
        this.container.querySelectorAll('[data-action]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const action = el.dataset.action;
                const id = el.dataset.id;
                Actions[action] && Actions[action](id, el);
            });
        });

        // 表单提交
        this.container.querySelectorAll('form[data-submit]').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const handler = form.dataset.submit;
                Actions[handler] && Actions[handler](form);
            });
        });

        // Tab 切换
        this.container.querySelectorAll('.tab-bar').forEach(bar => {
            bar.querySelectorAll('.tab-item').forEach(tab => {
                tab.addEventListener('click', () => {
                    bar.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    const filter = tab.dataset.filter;
                    const target = bar.dataset.target;
                    const container = document.getElementById(target);
                    if (container) {
                        const panels = container.querySelectorAll('[data-status]');
                        const hasOrderCards = container.querySelector('.order-card');
                        panels.forEach(item => {
                            if (hasOrderCards) {
                                item.style.display = (!filter || filter === 'all' || item.dataset.status === filter) ? '' : 'none';
                            } else {
                                item.style.display = item.dataset.status === filter ? '' : 'none';
                            }
                        });
                    }
                });
            });
        });

        // 搜索框实时搜索(仅搜索页)
        const searchInput = this.container.querySelector('[data-search]:not([readonly])');
        if (searchInput) {
            searchInput.focus();
            let debounceTimer;
            searchInput.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    const query = searchInput.value.trim();
                    if (query) location.hash = '#search/' + encodeURIComponent(query);
                    else if (App.currentPage === 'search') location.hash = '#home';
                }, 400);
            });
        }

        // 轮播图
        this.initCarousel();

        // ===== 商户端表单 =====
        const merchantLoginForm = this.container.querySelector('[data-merchant-login]');
        if (merchantLoginForm) {
            merchantLoginForm.addEventListener('submit', e => { e.preventDefault(); Actions.submitMerchantLogin(merchantLoginForm); });
        }
        const merchantRegisterForm = this.container.querySelector('[data-merchant-register]');
        if (merchantRegisterForm) {
            merchantRegisterForm.addEventListener('submit', e => { e.preventDefault(); Actions.submitMerchantRegister(merchantRegisterForm); });
        }
        const productForm = this.container.querySelector('[data-product-form]');
        if (productForm) {
            productForm.addEventListener('submit', e => { e.preventDefault(); Actions.submitProduct(productForm); });
        }
        const campaignForm = this.container.querySelector('[data-campaign-form]');
        if (campaignForm) {
            campaignForm.addEventListener('submit', e => { e.preventDefault(); Actions.submitCampaign(campaignForm); });
        }

        // 商户订单 Tab 筛选
        this.container.querySelectorAll('.m-tabs .tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.container.querySelectorAll('.m-tabs .tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const status = tab.dataset.tab;
                this.container.querySelectorAll('.m-order-card').forEach(card => {
                    card.style.display = (status === 'all' || card.dataset.status === status) ? '' : 'none';
                });
            });
        });
    },

    initCarousel() {
        const carousel = this.container.querySelector('.carousel');
        if (!carousel) return;
        const slides = carousel.querySelectorAll('.carousel-slide');
        const dots = carousel.querySelectorAll('.carousel-dot');
        let current = 0;
        const total = slides.length;

        const show = (idx) => {
            slides.forEach((s, i) => {
                s.style.transform = `translateX(${(i - idx) * 100}%)`;
            });
            dots.forEach((d, i) => d.classList.toggle('active', i === idx));
            current = idx;
        };

        dots.forEach((d, i) => d.addEventListener('click', () => show(i)));
        show(0);
        setInterval(() => show((current + 1) % total), 4000);
    },

    toast(msg, type = 'info') {
        const existing = document.querySelector('.toast-msg');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = `toast-msg toast-${type}`;
        toast.textContent = msg;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2500);
    }
};

// ==================== 操作处理器 ====================

const Actions = {
    // 导航
    goto(page) { location.hash = '#' + page; },

    goBack() { window.history.back(); },

    // 登录
    submitLogin(form) {
        const phone = form.querySelector('[name="phone"]').value.trim();
        const password = form.querySelector('[name="password"]').value;
        if (!phone || !password) { App.toast('请填写手机号和密码', 'error'); return; }
        if (!/^1\d{10}$/.test(phone)) { App.toast('请输入正确的手机号', 'error'); return; }
        const user = DB.login(phone, password);
        if (user) {
            App.toast('登录成功！', 'success');
            setTimeout(() => location.hash = '#home', 500);
        } else {
            App.toast('手机号或密码错误', 'error');
        }
    },

    // 注册
    submitRegister(form) {
        const phone = form.querySelector('[name="phone"]').value.trim();
        const password = form.querySelector('[name="password"]').value;
        const confirm = form.querySelector('[name="confirm"]').value;
        const name = form.querySelector('[name="name"]').value.trim();
        const agree = form.querySelector('[name="agree"]')?.checked;

        if (!phone || !password) { App.toast('请填写完整信息', 'error'); return; }
        if (!/^1\d{10}$/.test(phone)) { App.toast('请输入正确的手机号', 'error'); return; }
        if (password.length < 6) { App.toast('密码至少6位', 'error'); return; }
        if (password !== confirm) { App.toast('两次密码不一致', 'error'); return; }
        if (!agree) { App.toast('请同意服务协议', 'error'); return; }

        const user = DB.createUser(phone, password, name || undefined);
        if (!user) { App.toast('该手机号已注册', 'error'); return; }

        DB.login(phone, password);
        App.toast('注册成功！', 'success');
        setTimeout(() => location.hash = '#home', 500);
    },

    // 登出
    logout() {
        DB.logout();
        App.toast('已退出登录');
        location.hash = '#login';
    },

    // 收藏
    toggleFav(productId) {
        if (!DB.getCurrentUser()) { location.hash = '#login'; return; }
        const isFav = DB.toggleFavorite(productId);
        App.toast(isFav ? '已收藏' : '已取消收藏', 'success');
        App.renderPage(App.currentPage, productId);
        App.bindEvents();
    },

    // 创建订单
    submitOrder(form) {
        const productId = form.querySelector('[name="productId"]').value;
        const days = parseInt(form.querySelector('[name="days"]').value);
        const startDate = form.querySelector('[name="startDate"]').value;
        const couponId = form.querySelector('[name="couponId"]')?.value || null;

        if (!startDate) { App.toast('请选择租赁开始日期', 'error'); return; }

        const order = DB.createOrder(productId, days, startDate);
        if (!order) { App.toast('下单失败', 'error'); return; }

        // 如果选择了优惠券，先支付
        if (couponId) {
            DB.payOrder(order.id, couponId);
            App.toast('下单并支付成功！', 'success');
        } else {
            App.toast('下单成功！请尽快完成支付', 'success');
        }
        setTimeout(() => location.hash = '#orders', 600);
    },

    // 支付订单
    payOrder(orderId) {
        const order = DB.payOrder(orderId);
        if (order) {
            App.toast('支付成功！', 'success');
            App.renderPage('orders', '');
            App.bindEvents();
        }
    },

    // 取消订单
    cancelOrder(orderId) {
        if (confirm('确定要取消此订单吗？')) {
            DB.cancelOrder(orderId);
            App.toast('订单已取消');
            App.renderPage('orders', '');
            App.bindEvents();
        }
    },

    // 确认收货 (模拟发货后)
    confirmReceive(orderId) {
        DB.updateOrderStatus(orderId, 'pending_return');
        App.toast('已确认收货，请在租期内归还设备');
        App.renderPage('orders', '');
        App.bindEvents();
    },

    // 申请归还
    requestReturn(orderId) {
        DB.updateOrderStatus(orderId, 'returning');
        App.toast('归还申请已提交，请尽快寄出设备');
        DB.addNotification('order', '归还提醒', `请将设备清洁后打包寄出，退货单号请在订单详情中填写。押金将在商家验收后3个工作日内退还。`);
        App.renderPage('orders', '');
        App.bindEvents();
    },

    // 完成订单
    completeOrder(orderId) {
        DB.updateOrderStatus(orderId, 'completed');
        App.toast('订单已完成，押金将在3个工作日内退还', 'success');
        App.renderPage('orders', '');
        App.bindEvents();
    },

    // 提交评价
    submitReview(form) {
        const productId = form.querySelector('[name="productId"]').value;
        const rating = parseInt(form.querySelector('[name="rating"]').value);
        const content = form.querySelector('[name="content"]').value.trim();
        if (!content) { App.toast('请输入评价内容', 'error'); return; }
        DB.addReview(productId, rating, content);
        App.toast('评价提交成功！', 'success');
        setTimeout(() => location.hash = '#product/' + productId, 500);
    },

    // 添加地址
    submitAddress(form) {
        const name = form.querySelector('[name="addrName"]').value.trim();
        const phone = form.querySelector('[name="addrPhone"]').value.trim();
        const detail = form.querySelector('[name="addrDetail"]').value.trim();
        if (!name || !phone || !detail) { App.toast('请填写完整地址信息', 'error'); return; }
        DB.addAddress({ name, phone, detail });
        App.toast('地址添加成功', 'success');
        App.renderPage('profile', '');
        App.bindEvents();
    },

    deleteAddress(addrId) {
        if (confirm('确定删除此地址？')) {
            DB.deleteAddress(addrId);
            App.toast('地址已删除');
            App.renderPage('profile', '');
            App.bindEvents();
        }
    },

    // 通知
    readNotification(notifId) {
        DB.markNotificationRead(notifId);
        const el = document.querySelector(`[data-notif-id="${notifId}"]`);
        if (el) el.classList.remove('unread');
        App.updateNavBar();
    },

    // 选择租赁天数
    selectDays(days, el) {
        const group = el.closest('.days-group');
        group.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
        el.classList.add('active');
        const input = document.querySelector('[name="days"]');
        if (input) input.value = days;
        // 更新价格
        const price = parseFloat(el.dataset.price);
        const totalEl = document.querySelector('.checkout-total');
        if (totalEl) totalEl.textContent = '¥' + (price * days);
    },

    // 选择星级
    selectRating(rating, el) {
        const group = el.closest('.rating-select');
        group.querySelectorAll('.star-btn').forEach((s, i) => {
            s.classList.toggle('active', i < rating);
        });
        const input = group.querySelector('[name="rating"]');
        if (input) input.value = rating;
    },

    // 切换密码可见
    togglePassword(_, el) {
        const input = el.parentElement.querySelector('input');
        if (input.type === 'password') {
            input.type = 'text';
            el.textContent = '🙈';
        } else {
            input.type = 'password';
            el.textContent = '👁';
        }
    },

    // 模拟发货（测试用）
    simulateShip(orderId) {
        DB.updateOrderStatus(orderId, 'pending_return');
        DB.addNotification('order', '商家已发货', `订单 ${orderId} 已发货，预计2-3天送达。`);
        App.toast('商家已发货！', 'success');
        App.renderPage('orders', '');
        App.bindEvents();
    },

    // ==================== 商户端操作 ====================

    // 商户登录
    submitMerchantLogin(form) {
        const account = form.querySelector('[name="account"]').value.trim();
        const password = form.querySelector('[name="password"]').value;
        if (!account || !password) { App.toast('请填写账号和密码', 'error'); return; }
        const m = DB.merchantLogin(account, password);
        if (m) {
            App.toast('登录成功！', 'success');
            setTimeout(() => location.hash = '#m_products', 500);
        } else {
            App.toast('账号或密码错误', 'error');
        }
    },

    // 商户注册
    submitMerchantRegister(form) {
        const account = form.querySelector('[name="account"]').value.trim();
        const password = form.querySelector('[name="password"]').value;
        const confirm = form.querySelector('[name="confirm"]').value;
        const shopName = form.querySelector('[name="shopName"]').value.trim();
        if (!account || !password) { App.toast('请填写完整信息', 'error'); return; }
        if (password.length < 6) { App.toast('密码至少6位', 'error'); return; }
        if (password !== confirm) { App.toast('两次密码不一致', 'error'); return; }
        const m = DB.createMerchant(account, password, shopName || undefined);
        if (!m) { App.toast('该账号已注册', 'error'); return; }
        DB.merchantLogin(account, password);
        App.toast('注册成功！', 'success');
        setTimeout(() => location.hash = '#m_products', 500);
    },

    // 商户登出
    merchantLogout() {
        DB.merchantLogout();
        App.toast('已退出商户后台');
        location.hash = '#m_login';
    },

    // 商户发货
    merchantShip(orderId) {
        const order = DB.shipOrder(orderId);
        if (order) {
            App.toast('发货成功！', 'success');
            App.renderPage('m_orders', '');
            App.bindEvents();
        } else {
            App.toast('发货失败', 'error');
        }
    },

    // 商户确认归还
    merchantConfirmReturn(orderId) {
        const order = DB.confirmReturn(orderId);
        if (order) {
            App.toast('已确认归还，订单完成', 'success');
            App.renderPage('m_orders', '');
            App.bindEvents();
        }
    },

    // 上下架
    toggleProductStatus(productId) {
        const p = DB.toggleProductStatus(productId);
        if (p) {
            App.toast(p.status === 'active' ? '已上架' : '已下架', 'success');
            App.renderPage('m_products', '');
            App.bindEvents();
        }
    },

    // 删除商品
    deleteProduct(productId) {
        if (confirm('确定要删除此商品吗？删除后不可恢复。')) {
            DB.deleteProduct(productId);
            App.toast('已删除');
            App.renderPage('m_products', '');
            App.bindEvents();
        }
    },

    // 保存商品
    submitProduct(form) {
        const id = form.querySelector('[name="productId"]')?.value;
        const data = {
            name: form.querySelector('[name="name"]').value.trim(),
            brand: form.querySelector('[name="brand"]').value.trim(),
            category: form.querySelector('[name="category"]').value,
            price: form.querySelector('[name="price"]').value,
            originalPrice: form.querySelector('[name="originalPrice"]').value,
            deposit: form.querySelector('[name="deposit"]').value,
            stock: form.querySelector('[name="stock"]').value,
            description: form.querySelector('[name="description"]').value.trim(),
            tags: form.querySelector('[name="tags"]').value.split(/[,，]/).map(t => t.trim()).filter(Boolean)
        };
        if (!data.name || !data.price) { App.toast('请填写产品名称和日租金', 'error'); return; }

        if (id) {
            DB.updateProduct(id, data);
            App.toast('商品已更新', 'success');
        } else {
            DB.addProduct(data);
            App.toast('商品已添加', 'success');
        }
        setTimeout(() => location.hash = '#m_products', 500);
    },

    // 保存营销活动
    submitCampaign(form) {
        const id = form.querySelector('[name="campaignId"]')?.value;
        const data = {
            name: form.querySelector('[name="name"]').value.trim(),
            description: form.querySelector('[name="description"]').value.trim(),
            discountType: form.querySelector('[name="discountType"]').value,
            discountValue: form.querySelector('[name="discountValue"]').value,
            startDate: form.querySelector('[name="startDate"]').value,
            endDate: form.querySelector('[name="endDate"]').value
        };
        if (!data.name || !data.startDate || !data.endDate) { App.toast('请填写活动名称和日期', 'error'); return; }

        if (id) {
            DB.updateCampaign(id, data);
            App.toast('活动已更新', 'success');
        } else {
            DB.createCampaign(data);
            App.toast('活动已创建', 'success');
        }
        setTimeout(() => location.hash = '#m_marketing', 500);
    },

    // 删除活动
    deleteCampaign(campId) {
        if (confirm('确定删除此活动？')) {
            DB.deleteCampaign(campId);
            App.toast('活动已删除');
            App.renderPage('m_marketing', '');
            App.bindEvents();
        }
    },

    // 结束活动
    endCampaign(campId) {
        DB.updateCampaign(campId, { status: 'ended' });
        App.toast('活动已结束');
        App.renderPage('m_marketing', '');
        App.bindEvents();
    }
};

// ==================== 页面渲染器 ====================

const Pages = {
    // --- 首页 ---
    home() {
        const products = DB.getActiveProducts();
        const hotProducts = products.filter(p => !p.isNew).sort((a, b) => b.rentalCount - a.rentalCount).slice(0, 4);
        const newProducts = products.filter(p => p.isNew);
        const user = DB.getCurrentUser();
        const unread = user ? DB.getUnreadCount() : 0;

        return `
      <div class="page page-home">
        <header class="home-header">
          <div class="header-top">
            <h1 class="brand">📸 一拍即租</h1>
            <div class="header-actions">
              ${user ? `
                <a href="#favorites" class="icon-btn" title="收藏">♥</a>
                <a href="#notifications" class="icon-btn" title="通知">🔔${unread > 0 ? `<span class="badge">${unread}</span>` : ''}</a>
              ` : `
                <a href="#login" class="icon-btn">登录</a>
              `}
            </div>
          </div>
          <div class="search-bar" onclick="location.hash='#search/'">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="搜索拍立得相机..." data-search readonly>
          </div>
        </header>

        <div class="carousel">
          <div class="carousel-track">
            <div class="carousel-slide" style="background: linear-gradient(135deg, #EC4899, #EF4444)">
              <div class="slide-content">
                <h3>🌸 春日特惠</h3>
                <p>全场拍立得限时<strong>7折</strong>起</p>
                <span class="slide-tag">HOT</span>
              </div>
            </div>
            <div class="carousel-slide" style="background: linear-gradient(135deg, #3B82F6, #8B5CF6)">
              <div class="slide-content">
                <h3>🎉 新用户福利</h3>
                <p>首单立减<strong>¥20</strong> + 免押金体验</p>
                <span class="slide-tag">NEW</span>
              </div>
            </div>
            <div class="carousel-slide" style="background: linear-gradient(135deg, #10B981, #06B6D4)">
              <div class="slide-content">
                <h3>📷 周末特价</h3>
                <p>租三天只付<strong>两天</strong>价格</p>
                <span class="slide-tag">DEAL</span>
              </div>
            </div>
          </div>
          <div class="carousel-dots">
            <span class="carousel-dot active"></span>
            <span class="carousel-dot"></span>
            <span class="carousel-dot"></span>
          </div>
        </div>

        <div class="categories-nav">
          <a href="#categories/instax" class="cat-item">
            <div class="cat-icon" style="background:#FEE2E2;color:#EF4444">📸</div>
            <span>拍立得</span>
          </a>
          <a href="#categories/polaroid" class="cat-item">
            <div class="cat-icon" style="background:#DBEAFE;color:#3B82F6">🎞</div>
            <span>宝丽来</span>
          </a>
          <a href="#categories/bundle" class="cat-item">
            <div class="cat-icon" style="background:#D1FAE5;color:#10B981">🎁</div>
            <span>套餐</span>
          </a>
          <a href="#categories/all" class="cat-item">
            <div class="cat-icon" style="background:#EDE9FE;color:#8B5CF6">✨</div>
            <span>全部</span>
          </a>
        </div>

        <section class="section">
          <div class="section-header">
            <h2>🔥 热门推荐</h2>
            <a href="#categories/all" class="more-link">更多 ›</a>
          </div>
          <div class="product-grid">
            ${hotProducts.map(p => this.productCard(p)).join('')}
          </div>
        </section>

        ${newProducts.length ? `
        <section class="section">
          <div class="section-header">
            <h2>✨ 新品上架</h2>
          </div>
          <div class="product-grid">
            ${newProducts.map(p => this.productCard(p, true)).join('')}
          </div>
        </section>
        ` : ''}
      </div>
    `;
    },

    productCard(p, showNew = false) {
        const isFav = DB.isFavorite(p.id);
        return `
      <div class="product-card" onclick="location.hash='#product/${p.id}'">
        <div class="product-img-wrap">
          <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
          ${showNew || p.isNew ? '<span class="tag-new">新品</span>' : ''}
          ${p.tags?.includes('热门') ? '<span class="tag-hot">热门</span>' : ''}
        </div>
        <div class="product-info">
          <h3 class="product-name">${p.name}</h3>
          <div class="product-meta">
            <span class="product-price">¥${p.price}<small>/天</small></span>
            <span class="product-rental">已租 ${p.rentalCount}</span>
          </div>
        </div>
      </div>
    `;
    },

    // --- 登录页 ---
    login() {
        return `
      <div class="page page-auth">
        <div class="auth-header">
          <h1>📸 一拍即租</h1>
          <p>高品质拍立得相机租赁平台</p>
        </div>
        <form class="auth-form" data-submit="submitLogin">
          <div class="form-group">
            <label>手机号</label>
            <input type="tel" name="phone" placeholder="请输入手机号" maxlength="11" required>
          </div>
          <div class="form-group">
            <label>密码</label>
            <div class="input-with-action">
              <input type="password" name="password" placeholder="请输入密码" required>
              <span class="input-action" data-action="togglePassword">👁</span>
            </div>
          </div>
          <button type="submit" class="btn-primary">登 录</button>
        </form>
        <div class="auth-footer">
          <p>还没有账号？<a href="#register">立即注册</a></p>
          <a href="#m_login" class="merchant-entry">🏪 我是商家，进入商户后台 ›</a>
          <p class="demo-hint">💡 演示提示：先注册一个新账号即可体验完整功能</p>
        </div>
      </div>
    `;
    },

    // --- 注册页 ---
    register() {
        return `
      <div class="page page-auth">
        <div class="auth-header">
          <h1>📸 创建账号</h1>
          <p>注册后即享新用户优惠</p>
        </div>
        <form class="auth-form" data-submit="submitRegister">
          <div class="form-group">
            <label>昵称</label>
            <input type="text" name="name" placeholder="输入昵称（选填）" maxlength="20">
          </div>
          <div class="form-group">
            <label>手机号</label>
            <input type="tel" name="phone" placeholder="请输入手机号" maxlength="11" required>
          </div>
          <div class="form-group">
            <label>密码</label>
            <div class="input-with-action">
              <input type="password" name="password" placeholder="请设置密码（至少6位）" minlength="6" required>
              <span class="input-action" data-action="togglePassword">👁</span>
            </div>
          </div>
          <div class="form-group">
            <label>确认密码</label>
            <input type="password" name="confirm" placeholder="请再次输入密码" required>
          </div>
          <label class="checkbox-label">
            <input type="checkbox" name="agree">
            <span>我已阅读并同意《服务协议》和《隐私政策》</span>
          </label>
          <button type="submit" class="btn-primary">注 册</button>
        </form>
        <div class="auth-footer">
          <p>已有账号？<a href="#login">立即登录</a></p>
        </div>
      </div>
    `;
    },

    // --- 产品详情页 ---
    product(id) {
        const p = DB.getProduct(id);
        if (!p) return '<div class="page"><p class="empty">产品不存在</p></div>';
        const isFav = DB.isFavorite(p.id);
        const reviews = DB.getProductReviews(p.id);
        const user = DB.getCurrentUser();

        return `
      <div class="page page-detail">
        <header class="detail-header">
          <span class="back-btn" data-action="goBack">←</span>
          <h2>产品详情</h2>
          <span class="fav-btn ${isFav ? 'active' : ''}" data-action="toggleFav" data-id="${p.id}">${isFav ? '♥' : '♡'}</span>
        </header>

        <div class="detail-image">
          <img src="${p.images[0]}" alt="${p.name}">
        </div>

        <div class="detail-info">
          <h1 class="detail-title">${p.name}</h1>
          <div class="detail-price-row">
            <span class="detail-price">¥${p.price}<small>/天</small></span>
            <span class="detail-original">¥${p.originalPrice}/天</span>
            <span class="detail-rating">⭐ ${p.rating} (${p.reviewCount}评价)</span>
          </div>
          <div class="detail-stats">
            <span>累计租赁 ${p.rentalCount} 次</span>
            <span>满意度 ${p.satisfaction}%</span>
            <span>押金 ¥${p.deposit}</span>
          </div>
          ${p.tags ? `<div class="detail-tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
        </div>

        <div class="detail-tabs">
          <div class="tab-bar" data-target="detail-panels">
            <span class="tab-item active" data-filter="desc">产品详情</span>
            <span class="tab-item" data-filter="specs">规格参数</span>
            <span class="tab-item" data-filter="reviews">用户评价(${reviews.length})</span>
          </div>
          <div id="detail-panels">
            <div class="tab-panel" data-status="desc">
              <p class="desc-text">${p.description}</p>
              <div class="rental-notice">
                <h4>📋 租赁须知</h4>
                <ul>
                  <li>租赁时长：3天/7天/15天可选</li>
                  <li>押金：¥${p.deposit}，归还后3个工作日退还</li>
                  <li>逾期费率：日租金×1.5倍/天</li>
                  <li>配送方式：顺丰快递，免费寄回</li>
                  <li>请保持设备清洁，归还时请确保配件齐全</li>
                </ul>
              </div>
            </div>
            <div class="tab-panel" data-status="specs" style="display:none">
              <table class="specs-table">
                ${Object.entries(p.specs).map(([k, v]) => `<tr><td class="spec-label">${k}</td><td>${v}</td></tr>`).join('')}
              </table>
            </div>
            <div class="tab-panel" data-status="reviews" style="display:none">
              ${reviews.length ? reviews.map(r => `
                <div class="review-item">
                  <div class="review-header">
                    <span class="review-avatar">${r.avatar}</span>
                    <div>
                      <span class="review-name">${r.username}</span>
                      <span class="review-stars">${'⭐'.repeat(r.rating)}</span>
                    </div>
                    <span class="review-date">${r.date}</span>
                  </div>
                  <p class="review-content">${r.content}</p>
                </div>
              `).join('') : '<p class="empty">暂无评价</p>'}

              ${user ? `
                <div class="write-review">
                  <h4>✍️ 写评价</h4>
                  <form data-submit="submitReview">
                    <input type="hidden" name="productId" value="${p.id}">
                    <div class="rating-select">
                      <input type="hidden" name="rating" value="5">
                      ${[1, 2, 3, 4, 5].map(i => `<span class="star-btn ${i <= 5 ? 'active' : ''}" data-action="selectRating" data-id="${i}">★</span>`).join('')}
                    </div>
                    <textarea name="content" placeholder="分享您的使用体验..." rows="3"></textarea>
                    <button type="submit" class="btn-small">提交评价</button>
                  </form>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <div class="detail-bottom-bar">
          <a href="#${user ? 'checkout/' + p.id : 'login'}" class="btn-primary btn-rent">立即租赁 ¥${p.price}/天</a>
        </div>
      </div>
    `;
    },

    // --- 结算页 ---
    checkout(productId) {
        const p = DB.getProduct(productId);
        if (!p) return '<div class="page"><p class="empty">产品不存在</p></div>';
        const user = DB.getCurrentUser();
        const addresses = DB.getAddresses();
        const coupons = DB.getAvailableCoupons(p.price * 3);
        const today = new Date().toISOString().split('T')[0];

        return `
      <div class="page page-checkout">
        <header class="detail-header">
          <span class="back-btn" data-action="goBack">←</span>
          <h2>确认订单</h2>
          <span></span>
        </header>

        <form data-submit="submitOrder" class="checkout-form">
          <input type="hidden" name="productId" value="${p.id}">
          <input type="hidden" name="days" value="3">

          <div class="checkout-product">
            <img src="${p.images[0]}" alt="${p.name}">
            <div>
              <h3>${p.name}</h3>
              <p class="checkout-price">¥${p.price}/天 · 押金¥${p.deposit}</p>
            </div>
          </div>

          <div class="checkout-section">
            <h4>📅 租赁时长</h4>
            <div class="days-group">
              <span class="day-btn active" data-action="selectDays" data-id="3" data-price="${p.price}">3天 ¥${p.price * 3}</span>
              <span class="day-btn" data-action="selectDays" data-id="7" data-price="${p.price}">7天 ¥${p.price * 7}</span>
              <span class="day-btn" data-action="selectDays" data-id="15" data-price="${p.price}">15天 ¥${p.price * 15}</span>
            </div>
          </div>

          <div class="checkout-section">
            <h4>📆 开始日期</h4>
            <input type="date" name="startDate" min="${today}" value="${today}" class="date-input">
          </div>

          ${addresses.length ? `
            <div class="checkout-section">
              <h4>📍 收货地址</h4>
              <div class="address-card">${addresses[0].name} ${addresses[0].phone}<br>${addresses[0].detail}</div>
            </div>
          ` : `
            <div class="checkout-section">
              <h4>📍 收货地址</h4>
              <p class="hint">请先在个人中心添加收货地址</p>
            </div>
          `}

          ${coupons.length ? `
            <div class="checkout-section">
              <h4>🎫 优惠券</h4>
              <select name="couponId" class="coupon-select">
                <option value="">不使用优惠券</option>
                ${coupons.map(c => `<option value="${c.id}">${c.name} ${c.type === 'fixed' ? '-¥' + c.discount : c.discount + '%OFF'}${c.minOrder > 0 ? '(满¥' + c.minOrder + ')' : ''}</option>`).join('')}
              </select>
            </div>
          ` : ''}

          <div class="checkout-summary">
            <div class="summary-row"><span>租金小计</span><span class="checkout-total">¥${p.price * 3}</span></div>
            <div class="summary-row"><span>押金（归还后退）</span><span>¥${p.deposit}</span></div>
            <div class="summary-row"><span>配送费</span><span class="free">免费</span></div>
          </div>

          <button type="submit" class="btn-primary">确认下单</button>
        </form>
      </div>
    `;
    },

    // --- 分类页 ---
    categories(cat) {
        const all = DB.getActiveProducts();
        let products, title;

        if (!cat || cat === 'all') {
            products = all;
            title = '全部产品';
        } else if (cat === 'instax') {
            products = all.filter(p => p.category === 'instax');
            title = '富士拍立得';
        } else if (cat === 'polaroid') {
            products = all.filter(p => p.category === 'polaroid');
            title = '宝丽来';
        } else if (cat === 'bundle') {
            products = all.filter(p => p.category === 'bundle');
            title = '套餐优惠';
        } else {
            products = all;
            title = '全部产品';
        }

        return `
      <div class="page page-categories">
        <header class="page-header">
          <h2>📋 ${title}</h2>
        </header>

        <div class="cat-filter">
          <a href="#categories/all" class="filter-btn ${(!cat || cat === 'all') ? 'active' : ''}">全部</a>
          <a href="#categories/instax" class="filter-btn ${cat === 'instax' ? 'active' : ''}">富士</a>
          <a href="#categories/polaroid" class="filter-btn ${cat === 'polaroid' ? 'active' : ''}">宝丽来</a>
          <a href="#categories/bundle" class="filter-btn ${cat === 'bundle' ? 'active' : ''}">套餐</a>
        </div>

        <div class="product-grid">
          ${products.length ? products.map(p => this.productCard(p)).join('') : '<p class="empty">该分类暂无产品</p>'}
        </div>
      </div>
    `;
    },

    // --- 搜索页 ---
    search(query) {
        query = decodeURIComponent(query || '');
        const results = query ? DB.searchProducts(query) : [];

        return `
      <div class="page page-search">
        <header class="page-header">
          <span class="back-btn" data-action="goBack">←</span>
          <div class="search-bar-inline">
            <input type="text" placeholder="搜索拍立得相机..." data-search value="${query}" autofocus>
          </div>
        </header>

        ${query ? `
          <p class="search-hint">搜索 "${query}" 找到 ${results.length} 个结果</p>
          <div class="product-grid">
            ${results.length ? results.map(p => this.productCard(p)).join('') : '<p class="empty">未找到相关产品，换个关键词试试吧</p>'}
          </div>
        ` : `
          <div class="search-suggestions">
            <h3>🔍 热门搜索</h3>
            <div class="suggestion-tags">
              <a href="#search/mini" class="suggestion-tag">mini</a>
              <a href="#search/宝丽来" class="suggestion-tag">宝丽来</a>
              <a href="#search/套餐" class="suggestion-tag">套餐</a>
              <a href="#search/LiPlay" class="suggestion-tag">LiPlay</a>
              <a href="#search/新品" class="suggestion-tag">新品</a>
              <a href="#search/入门" class="suggestion-tag">入门款</a>
            </div>
          </div>
        `}
      </div>
    `;
    },

    // --- 订单页 ---
    orders() {
        const orders = DB.getOrders();
        const statusMap = {
            pending_payment: { label: '待付款', color: '#F59E0B' },
            pending_shipment: { label: '待发货', color: '#3B82F6' },
            pending_return: { label: '使用中', color: '#10B981' },
            returning: { label: '归还中', color: '#8B5CF6' },
            completed: { label: '已完成', color: '#6B7280' },
            cancelled: { label: '已取消', color: '#9CA3AF' }
        };

        return `
      <div class="page page-orders">
        <header class="page-header">
          <h2>📦 我的订单</h2>
        </header>

        <div class="tab-bar" data-target="order-list">
          <span class="tab-item active" data-filter="all">全部</span>
          <span class="tab-item" data-filter="pending_payment">待付款</span>
          <span class="tab-item" data-filter="pending_shipment">待发货</span>
          <span class="tab-item" data-filter="pending_return">使用中</span>
          <span class="tab-item" data-filter="completed">已完成</span>
        </div>

        <div id="order-list">
          ${orders.length ? orders.map(o => {
            const s = statusMap[o.status] || { label: o.status, color: '#999' };
            return `
              <div class="order-card" data-status="${o.status}">
                <div class="order-header">
                  <span class="order-id">${o.id}</span>
                  <span class="order-status" style="color:${s.color}">${s.label}</span>
                </div>
                <div class="order-body" onclick="location.hash='#product/${o.productId}'">
                  <img src="${o.productImage}" alt="${o.productName}">
                  <div class="order-info">
                    <h4>${o.productName}</h4>
                    <p>¥${o.price}/天 × ${o.days}天</p>
                    <p class="order-dates">${o.startDate} 至 ${o.endDate}</p>
                  </div>
                  <div class="order-amount">¥${o.totalPrice - (o.couponDiscount || 0)}</div>
                </div>
                <div class="order-actions">
                  ${o.status === 'pending_payment' ? `
                    <button class="btn-outline btn-small" data-action="cancelOrder" data-id="${o.id}">取消订单</button>
                    <button class="btn-primary btn-small" data-action="payOrder" data-id="${o.id}">立即支付</button>
                  ` : ''}
                  ${o.status === 'pending_shipment' ? `
                    <span class="hint">等待商家发货...</span>
                    <button class="btn-outline btn-small" data-action="simulateShip" data-id="${o.id}">模拟发货</button>
                  ` : ''}
                  ${o.status === 'pending_return' ? `
                    <button class="btn-outline btn-small" data-action="requestReturn" data-id="${o.id}">申请归还</button>
                  ` : ''}
                  ${o.status === 'returning' ? `
                    <span class="hint">设备归还中，等待商家确认...</span>
                    <button class="btn-outline btn-small" data-action="completeOrder" data-id="${o.id}">模拟确认</button>
                  ` : ''}
                  ${o.status === 'completed' ? `
                    <a href="#product/${o.productId}" class="btn-outline btn-small">再次租赁</a>
                    <a href="#product/${o.productId}" class="btn-primary btn-small">去评价</a>
                  ` : ''}
                  ${o.status === 'cancelled' ? '<span class="hint">订单已取消</span>' : ''}
                </div>
              </div>
            `;
        }).join('') : `
            <div class="empty-state">
              <p>📭</p>
              <p>暂无订单</p>
              <a href="#home" class="btn-primary btn-small">去逛逛</a>
            </div>
          `}
        </div>
      </div>
    `;
    },

    // --- 个人中心 ---
    profile() {
        const user = DB.getCurrentUser();
        if (!user) return '';
        const orders = DB.getOrders();
        const favCount = DB.getFavorites().length;
        const coupons = DB.getCoupons().filter(c => !c.used);
        const addresses = DB.getAddresses();

        const orderCounts = {
            pending_payment: orders.filter(o => o.status === 'pending_payment').length,
            pending_shipment: orders.filter(o => o.status === 'pending_shipment').length,
            pending_return: orders.filter(o => o.status === 'pending_return').length,
            returning: orders.filter(o => o.status === 'returning').length
        };

        return `
      <div class="page page-profile">
        <div class="profile-header">
          <div class="profile-avatar">${user.name.charAt(0)}</div>
          <h2 class="profile-name">${user.name}</h2>
          <p class="profile-phone">${user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</p>
        </div>

        <div class="stats-row">
          <div class="stat-item" onclick="location.hash='#orders'">
            <strong>${orders.length}</strong><span>订单</span>
          </div>
          <div class="stat-item" onclick="location.hash='#favorites'">
            <strong>${favCount}</strong><span>收藏</span>
          </div>
          <div class="stat-item">
            <strong>${coupons.length}</strong><span>优惠券</span>
          </div>
        </div>

        <div class="profile-section">
          <h3>我的订单</h3>
          <div class="order-shortcuts">
            <a href="#orders" class="shortcut-item">
              <span class="shortcut-icon" style="color:#F59E0B">💰</span>
              <span>待付款${orderCounts.pending_payment ? `(${orderCounts.pending_payment})` : ''}</span>
            </a>
            <a href="#orders" class="shortcut-item">
              <span class="shortcut-icon" style="color:#3B82F6">📦</span>
              <span>待发货${orderCounts.pending_shipment ? `(${orderCounts.pending_shipment})` : ''}</span>
            </a>
            <a href="#orders" class="shortcut-item">
              <span class="shortcut-icon" style="color:#10B981">📸</span>
              <span>使用中${orderCounts.pending_return ? `(${orderCounts.pending_return})` : ''}</span>
            </a>
            <a href="#orders" class="shortcut-item">
              <span class="shortcut-icon" style="color:#8B5CF6">🔄</span>
              <span>归还中${orderCounts.returning ? `(${orderCounts.returning})` : ''}</span>
            </a>
          </div>
        </div>

        <div class="profile-section">
          <h3>优惠券</h3>
          ${coupons.length ? `
            <div class="coupon-list">
              ${coupons.map(c => `
                <div class="coupon-card">
                  <div class="coupon-amount">${c.type === 'fixed' ? '¥' + c.discount : c.discount + '%OFF'}</div>
                  <div class="coupon-info">
                    <span class="coupon-name">${c.name}</span>
                    <span class="coupon-expire">有效期至 ${c.expiry}</span>
                    ${c.minOrder > 0 ? `<span class="coupon-min">满¥${c.minOrder}可用</span>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<p class="empty-small">暂无可用优惠券</p>'}
        </div>

        <div class="profile-section">
          <h3>收货地址</h3>
          ${addresses.map(a => `
            <div class="address-item">
              <div>
                <strong>${a.name}</strong> <span>${a.phone}</span>
                <p>${a.detail}</p>
              </div>
              <span class="delete-btn" data-action="deleteAddress" data-id="${a.id}">✕</span>
            </div>
          `).join('')}
          <form data-submit="submitAddress" class="address-form">
            <h4>➕ 添加新地址</h4>
            <div class="form-row">
              <input type="text" name="addrName" placeholder="收件人" required>
              <input type="tel" name="addrPhone" placeholder="电话" maxlength="11" required>
            </div>
            <input type="text" name="addrDetail" placeholder="详细地址（省市区+街道门牌号）" required>
            <button type="submit" class="btn-outline btn-small">保存地址</button>
          </form>
        </div>

        <div class="profile-section">
          <div class="menu-item" onclick="location.hash='#notifications'">
            <span>🔔 消息通知</span>
            ${DB.getUnreadCount() > 0 ? `<span class="badge">${DB.getUnreadCount()}</span>` : ''}
            <span class="arrow">›</span>
          </div>
          <div class="menu-item" onclick="location.hash='#favorites'">
            <span>♥ 我的收藏</span>
            <span class="arrow">›</span>
          </div>
          <div class="menu-item" onclick="location.hash='#m_login'" style="color:var(--primary)">
            <span>🏪 商家入驻</span>
            <span class="arrow">›</span>
          </div>
        </div>

        <button class="btn-logout" data-action="logout">退出登录</button>
      </div>
    `;
    },

    // --- 通知页 ---
    notifications() {
        const notifs = DB.getNotifications();
        const typeIcons = { system: '🔔', order: '📦', promo: '🎁' };

        return `
      <div class="page page-notifications">
        <header class="page-header">
          <span class="back-btn" data-action="goBack">←</span>
          <h2>🔔 消息通知</h2>
          <span></span>
        </header>

        <div class="notification-list">
          ${notifs.length ? notifs.map(n => `
            <div class="notification-item ${n.read ? '' : 'unread'}" data-notif-id="${n.id}" onclick="Actions.readNotification('${n.id}')">
              <div class="notif-icon">${typeIcons[n.type] || '📌'}</div>
              <div class="notif-content">
                <h4>${n.title}</h4>
                <p>${n.content}</p>
                <span class="notif-time">${formatTime(n.time)}</span>
              </div>
              ${!n.read ? '<span class="notif-dot"></span>' : ''}
            </div>
          `).join('') : `
            <div class="empty-state">
              <p>🔕</p>
              <p>暂无消息</p>
            </div>
          `}
        </div>
      </div>
    `;
    },

    // --- 收藏页 ---
    favorites() {
        const favIds = DB.getFavorites();
        const products = favIds.map(id => DB.getProduct(id)).filter(Boolean);

        return `
      <div class="page page-favorites">
        <header class="page-header">
          <span class="back-btn" data-action="goBack">←</span>
          <h2>♥ 我的收藏</h2>
          <span></span>
        </header>

        <div class="product-grid">
          ${products.length ? products.map(p => this.productCard(p)).join('') : `
            <div class="empty-state">
              <p>💔</p>
              <p>还没有收藏任何产品</p>
              <a href="#home" class="btn-primary btn-small">去发现好物</a>
            </div>
          `}
        </div>
      </div>
    `;
    }
};

// ==================== 商户端页面 ====================

const MerchantPages = {

    login() {
        return `
      <div class="page merchant-page">
        <div class="merchant-header"><h2>商户登录</h2><p>InstaRental 商户管理后台</p></div>
        <form class="form-card" data-merchant-login>
          <div class="form-group"><label>账号</label><input type="text" name="account" placeholder="手机号/邮箱" required></div>
          <div class="form-group"><label>密码</label><input type="password" name="password" placeholder="请输入密码" required></div>
          <button type="submit" class="btn-primary btn-block">登 录</button>
          <p class="form-tip">还没有商户账号？<a href="#m_register">立即注册</a></p>
          <p class="form-tip"><a href="#home">← 返回用户端</a></p>
        </form>
      </div>`;
    },

    register() {
        return `
      <div class="page merchant-page">
        <div class="merchant-header"><h2>商户注册</h2><p>加入 InstaRental 开始出租商品</p></div>
        <form class="form-card" data-merchant-register>
          <div class="form-group"><label>账号</label><input type="text" name="account" placeholder="手机号/邮箱" required></div>
          <div class="form-group"><label>店铺名称</label><input type="text" name="shopName" placeholder="您的店铺名称（选填）"></div>
          <div class="form-group"><label>密码</label><input type="password" name="password" placeholder="至少6位" required></div>
          <div class="form-group"><label>确认密码</label><input type="password" name="confirm" placeholder="再次输入密码" required></div>
          <button type="submit" class="btn-primary btn-block">注 册</button>
          <p class="form-tip">已有账号？<a href="#m_login">去登录</a></p>
        </form>
      </div>`;
    },

    products() {
        const merchant = DB.getCurrentMerchant();
        const products = DB.getProducts().filter(p => p.merchantId === merchant.id);
        const active = products.filter(p => p.status === 'active').length;
        const inactive = products.filter(p => p.status === 'inactive').length;

        return `
      <div class="page merchant-page">
        <div class="m-topbar">
          <h2>商品管理</h2>
          <div class="m-topbar-actions">
            <a href="#m_product_edit" class="btn-primary btn-small">+ 添加商品</a>
            <button class="btn-ghost btn-small" onclick="Actions.merchantLogout()">退出</button>
          </div>
        </div>
        <div class="m-stats-row">
          <div class="m-stat"><span class="m-stat-num">${products.length}</span><span>全部</span></div>
          <div class="m-stat"><span class="m-stat-num">${active}</span><span>上架中</span></div>
          <div class="m-stat"><span class="m-stat-num">${inactive}</span><span>已下架</span></div>
        </div>
        <div class="m-product-list">
          ${products.length === 0 ? '<div class="empty-state"><p>暂无商品，点击上方按钮添加</p></div>' :
                products.map(p => `
            <div class="m-product-card ${p.status === 'inactive' ? 'inactive' : ''}">
              <div class="m-product-img">${p.image || '📦'}</div>
              <div class="m-product-info">
                <h4>${p.name}</h4>
                <p class="m-product-meta">¥${p.price}/天 · 库存${p.stock ?? '∞'} · ${p.status === 'active' ? '🟢 上架' : '🔴 下架'}</p>
              </div>
              <div class="m-product-actions">
                <a href="#m_product_edit/${p.id}" class="btn-ghost btn-xs">编辑</a>
                <button class="btn-ghost btn-xs" onclick="Actions.toggleProductStatus('${p.id}')">${p.status === 'active' ? '下架' : '上架'}</button>
                <button class="btn-ghost btn-xs btn-danger" onclick="Actions.deleteProduct('${p.id}')">删除</button>
              </div>
            </div>`).join('')}
        </div>
      </div>`;
    },

    orders() {
        const orders = DB.getMerchantOrders();
        const tabStatus = ['all', 'pending_ship', 'pending_return', 'returning', 'completed'];
        const tabLabel = ['全部', '待发货', '使用中', '待归还', '已完成'];

        return `
      <div class="page merchant-page">
        <div class="m-topbar">
          <h2>订单管理</h2>
          <button class="btn-ghost btn-small" onclick="Actions.merchantLogout()">退出</button>
        </div>
        <div class="tabs m-tabs">
          ${tabStatus.map((s, i) => `<div class="tab ${i === 0 ? 'active' : ''}" data-tab="${s}">${tabLabel[i]}</div>`).join('')}
        </div>
        <div class="m-order-list">
          ${orders.length === 0 ? '<div class="empty-state"><p>暂无订单</p></div>' :
                orders.map(o => {
                    const p = DB.getProducts().find(x => x.id === o.productId);
                    const statusMap = { pending_ship: '待发货', pending_return: '使用中', returning: '待归还', completed: '已完成', cancelled: '已取消' };
                    return `
            <div class="m-order-card" data-status="${o.status}">
              <div class="m-order-header">
                <span class="m-order-id">订单 ${o.id.slice(-8)}</span>
                <span class="m-order-status status-${o.status}">${statusMap[o.status] || o.status}</span>
              </div>
              <div class="m-order-body">
                <div class="m-order-product">${p ? p.name : '未知商品'}</div>
                <div class="m-order-detail">
                  <span>¥${o.totalPrice}</span>
                  <span>${o.rentalDays}天</span>
                  <span>${new Date(o.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
              <div class="m-order-actions">
                ${o.status === 'pending_ship'
                            ? `<button class="btn-primary btn-small" onclick="Actions.merchantShip('${o.id}')">确认发货</button>`
                            : o.status === 'returning'
                                ? `<button class="btn-primary btn-small" onclick="Actions.merchantConfirmReturn('${o.id}')">确认归还</button>`
                                : ''}
              </div>
            </div>`;
                }).join('')}
        </div>
      </div>`;
    },

    stats() {
        const s = DB.getMerchantStats();
        const barMax = s.dailyRevenue.length ? Math.max(...s.dailyRevenue.map(d => d.revenue), 1) : 1;

        return `
      <div class="page merchant-page">
        <div class="m-topbar">
          <h2>数据统计</h2>
          <button class="btn-ghost btn-small" onclick="Actions.merchantLogout()">退出</button>
        </div>
        <div class="m-stat-cards">
          <div class="m-stat-card"><span class="m-stat-label">总收入</span><span class="m-stat-value">¥${s.totalRevenue.toFixed(2)}</span></div>
          <div class="m-stat-card"><span class="m-stat-label">总订单</span><span class="m-stat-value">${s.totalOrders}</span></div>
          <div class="m-stat-card"><span class="m-stat-label">客单价</span><span class="m-stat-value">¥${s.avgOrder.toFixed(2)}</span></div>
          <div class="m-stat-card"><span class="m-stat-label">使用中</span><span class="m-stat-value">${s.statusCounts.pending_return || 0}</span></div>
        </div>

        <div class="m-section">
          <h3>近 7 日收入</h3>
          <div class="m-chart">
            ${s.dailyRevenue.map(d => `
              <div class="m-bar-group">
                <div class="m-bar" style="height:${Math.max(d.revenue / barMax * 100, 4)}%"></div>
                <span class="m-bar-label">${d.date.slice(5)}</span>
              </div>`).join('')}
          </div>
        </div>

        <div class="m-section">
          <h3>热门商品</h3>
          ${s.topProducts.length === 0 ? '<p class="empty-hint">暂无数据</p>' :
                s.topProducts.map((tp, i) => `
            <div class="m-top-item">
              <span class="m-top-rank">${i + 1}</span>
              <span class="m-top-name">${tp.name}</span>
              <span class="m-top-orders">${tp.orders}单</span>
              <span class="m-top-revenue">¥${tp.revenue.toFixed(0)}</span>
            </div>`).join('')}
        </div>
      </div>`;
    },

    marketing() {
        const campaigns = DB.getCampaigns();
        const statusMap = { active: '进行中', scheduled: '未开始', ended: '已结束' };

        return `
      <div class="page merchant-page">
        <div class="m-topbar">
          <h2>营销活动</h2>
          <div class="m-topbar-actions">
            <a href="#m_campaign_edit" class="btn-primary btn-small">+ 创建活动</a>
            <button class="btn-ghost btn-small" onclick="Actions.merchantLogout()">退出</button>
          </div>
        </div>
        <div class="m-campaign-list">
          ${campaigns.length === 0 ? '<div class="empty-state"><p>暂无活动，点击上方按钮创建</p></div>' :
                campaigns.map(c => `
            <div class="m-campaign-card">
              <div class="m-campaign-header">
                <h4>${c.name}</h4>
                <span class="m-campaign-status status-${c.status}">${statusMap[c.status] || c.status}</span>
              </div>
              <p class="m-campaign-desc">${c.description || '暂无描述'}</p>
              <div class="m-campaign-meta">
                <span>${c.discountType === 'percent' ? c.discountValue + '% 折扣' : '减 ¥' + c.discountValue}</span>
                <span>${c.startDate} ~ ${c.endDate}</span>
              </div>
              <div class="m-campaign-actions">
                <a href="#m_campaign_edit/${c.id}" class="btn-ghost btn-xs">编辑</a>
                ${c.status !== 'ended' ? `<button class="btn-ghost btn-xs" onclick="Actions.endCampaign('${c.id}')">结束</button>` : ''}
                <button class="btn-ghost btn-xs btn-danger" onclick="Actions.deleteCampaign('${c.id}')">删除</button>
              </div>
            </div>`).join('')}
        </div>
      </div>`;
    },

    productEdit(productId) {
        const isEdit = !!productId;
        const p = isEdit ? DB.getProducts().find(x => x.id === productId) : {};
        const cats = ['手机数码', '电脑办公', '摄影摄像', '家用电器', '户外装备', '服饰配件', '母婴玩具', '其他'];

        return `
      <div class="page merchant-page">
        <div class="m-topbar">
          <a href="#m_products" class="btn-ghost btn-small">← 返回</a>
          <h2>${isEdit ? '编辑商品' : '添加商品'}</h2>
        </div>
        <form class="form-card" data-product-form>
          ${isEdit ? `<input type="hidden" name="productId" value="${p.id}">` : ''}
          <div class="form-group"><label>商品名称 *</label><input type="text" name="name" value="${p.name || ''}" required></div>
          <div class="form-group"><label>品牌</label><input type="text" name="brand" value="${p.brand || ''}"></div>
          <div class="form-group"><label>分类</label>
            <select name="category">${cats.map(c => `<option value="${c}" ${p.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
          </div>
          <div class="form-row">
            <div class="form-group"><label>日租金(¥) *</label><input type="number" name="price" step="0.01" value="${p.price || ''}" required></div>
            <div class="form-group"><label>原价(¥)</label><input type="number" name="originalPrice" step="0.01" value="${p.originalPrice || ''}"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>押金(¥)</label><input type="number" name="deposit" step="0.01" value="${p.deposit || ''}"></div>
            <div class="form-group"><label>库存</label><input type="number" name="stock" value="${p.stock ?? ''}"></div>
          </div>
          <div class="form-group"><label>描述</label><textarea name="description" rows="3">${p.description || ''}</textarea></div>
          <div class="form-group"><label>标签(逗号分隔)</label><input type="text" name="tags" value="${(p.tags || []).join(',')}"></div>
          <button type="submit" class="btn-primary btn-block">保存商品</button>
        </form>
      </div>`;
    },

    campaignEdit(campId) {
        const isEdit = !!campId;
        const c = isEdit ? DB.getCampaigns().find(x => x.id === campId) : {};

        return `
      <div class="page merchant-page">
        <div class="m-topbar">
          <a href="#m_marketing" class="btn-ghost btn-small">← 返回</a>
          <h2>${isEdit ? '编辑活动' : '创建活动'}</h2>
        </div>
        <form class="form-card" data-campaign-form>
          ${isEdit ? `<input type="hidden" name="campaignId" value="${c.id}">` : ''}
          <div class="form-group"><label>活动名称 *</label><input type="text" name="name" value="${c.name || ''}" required></div>
          <div class="form-group"><label>活动描述</label><textarea name="description" rows="2">${c.description || ''}</textarea></div>
          <div class="form-row">
            <div class="form-group"><label>折扣类型</label>
              <select name="discountType">
                <option value="percent" ${c.discountType === 'percent' ? 'selected' : ''}>百分比折扣</option>
                <option value="fixed" ${c.discountType === 'fixed' ? 'selected' : ''}>固定减免</option>
              </select>
            </div>
            <div class="form-group"><label>折扣值</label><input type="number" name="discountValue" step="0.01" value="${c.discountValue || ''}"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>开始日期 *</label><input type="date" name="startDate" value="${c.startDate || ''}"></div>
            <div class="form-group"><label>结束日期 *</label><input type="date" name="endDate" value="${c.endDate || ''}"></div>
          </div>
          <button type="submit" class="btn-primary btn-block">保存活动</button>
        </form>
      </div>`;
    }
};

// ==================== 工具函数 ====================

function formatTime(isoStr) {
    const d = new Date(isoStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    if (diff < 172800000) return '昨天';
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
}

// ==================== 启动 ====================

document.addEventListener('DOMContentLoaded', () => App.init());
