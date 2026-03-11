/**
 * 一拍即租平台通用脚本优化版
 * 包含所有页面共享的交互功能，优化了性能和用户体验
 */

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
    // 初始化返回按钮
    initBackButtons();

    // 初始化底部导航
    initNavigation();

    // 初始化表单验证
    initFormValidation();

    // 初始化密码显示/隐藏功能
    initPasswordToggle();

    // 初始化图片懒加载
    initLazyLoading();

    // 初始化触摸反馈
    initTouchFeedback();

    // 初始化选项卡切换
    initTabSwitching();

    // 初始化轮播图
    initCarousel();

    // 初始化搜索功能
    initSearch();

    // 检查暗色模式
    checkDarkMode();
});

// 初始化返回按钮功能
function initBackButtons() {
    const backButtons = document.querySelectorAll('.back-btn, .fas.fa-arrow-left');
    backButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            window.history.back();
        });
    });
}

// 初始化底部导航功能
function initNavigation() {
    // 用户端导航
    const userHomeNav = document.querySelector('.nav-bar .fas.fa-home');
    const userCategoryNav = document.querySelector('.nav-bar .fas.fa-compass');
    const userOrderNav = document.querySelector('.nav-bar .fas.fa-shopping-bag');
    const userProfileNav = document.querySelector('.nav-bar .fas.fa-user');

    if (userHomeNav) {
        userHomeNav.parentElement.addEventListener('click', function () {
            navigateTo('home.html');
        });
    }

    if (userCategoryNav) {
        userCategoryNav.parentElement.addEventListener('click', function () {
            navigateTo('categories.html');
        });
    }

    if (userOrderNav) {
        userOrderNav.parentElement.addEventListener('click', function () {
            navigateTo('orders.html');
        });
    }

    if (userProfileNav) {
        userProfileNav.parentElement.addEventListener('click', function () {
            navigateTo('profile.html');
        });
    }

    // 商家端导航
    const merchantProductNav = document.querySelector('.nav-bar .fas.fa-box');
    const merchantOrderNav = document.querySelector('.nav-bar .fas.fa-shopping-bag');
    const merchantStatsNav = document.querySelector('.nav-bar .fas.fa-chart-line');
    const merchantStoreNav = document.querySelector('.nav-bar .fas.fa-store');

    if (merchantProductNav) {
        merchantProductNav.parentElement.addEventListener('click', function () {
            navigateTo('merchant_products.html');
        });
    }

    if (merchantOrderNav) {
        merchantOrderNav.parentElement.addEventListener('click', function () {
            navigateTo('merchant_orders.html');
        });
    }

    if (merchantStatsNav) {
        merchantStatsNav.parentElement.addEventListener('click', function () {
            navigateTo('merchant_statistics.html');
        });
    }

    if (merchantStoreNav) {
        merchantStoreNav.parentElement.addEventListener('click', function () {
            navigateTo('merchant_marketing.html');
        });
    }
}

// 导航到指定页面，带有过渡效果
function navigateTo(url) {
    // 添加淡出效果
    document.body.classList.add('fade-out');

    // 延迟导航以显示过渡效果
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}

// 初始化表单验证
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required]');

        // 实时验证
        inputs.forEach(input => {
            input.addEventListener('blur', function () {
                validateInput(input);
            });

            input.addEventListener('input', function () {
                if (input.classList.contains('invalid')) {
                    validateInput(input);
                }
            });
        });

        // 表单提交验证
        form.addEventListener('submit', function (event) {
            let isValid = true;

            inputs.forEach(input => {
                if (!validateInput(input)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                event.preventDefault();
                showToast('请填写所有必填字段');
            }
        });
    });
}

// 验证单个输入字段
function validateInput(input) {
    let isValid = true;

    if (!input.value.trim()) {
        input.classList.add('border-red-500');
        input.classList.add('invalid');

        // 添加错误提示
        let errorMsg = input.nextElementSibling;
        if (!errorMsg || !errorMsg.classList.contains('error-msg')) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'text-xs text-red-500 mt-1 error-msg';
            errorMsg.textContent = '此字段不能为空';
            input.parentNode.appendChild(errorMsg);
        }

        isValid = false;
    } else {
        input.classList.remove('border-red-500');
        input.classList.remove('invalid');

        // 移除错误提示
        const errorMsg = input.nextElementSibling;
        if (errorMsg && errorMsg.classList.contains('error-msg')) {
            errorMsg.remove();
        }
    }

    return isValid;
}

// 显示提示消息
function showToast(message) {
    // 检查是否已存在toast
    let toast = document.querySelector('.toast-message');

    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-message fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full text-sm z-50 opacity-0 transition-opacity duration-300';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('opacity-90');

    // 3秒后隐藏
    setTimeout(() => {
        toast.classList.remove('opacity-90');

        // 动画结束后移除元素
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 初始化密码显示/隐藏功能
function initPasswordToggle() {
    const passwordToggles = document.querySelectorAll('.far.fa-eye, .far.fa-eye-slash');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function () {
            const passwordInput = this.previousElementSibling;

            // 切换密码显示状态
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }

            // 添加动画效果
            this.classList.add('animate-pulse');
            setTimeout(() => {
                this.classList.remove('animate-pulse');
            }, 500);
        });
    });
}

// 初始化图片懒加载
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img.lazy-load');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // 回退方案
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.add('loaded');
        });
    }
}

// 初始化触摸反馈
function initTouchFeedback() {
    const touchElements = document.querySelectorAll('.polaroid-card, .primary-btn, .social-login-btn');

    touchElements.forEach(element => {
        element.classList.add('touch-feedback');
    });
}

// 初始化选项卡切换
function initTabSwitching() {
    document.querySelectorAll('[data-tabs]').forEach(function (tabBar) {
        var tabs = Array.from(tabBar.children);
        var targetId = tabBar.dataset.tabs;
        var panelContainer = document.getElementById(targetId);
        if (!panelContainer) return;

        tabs.forEach(function (tab, index) {
            tab.style.cursor = 'pointer';
            tab.addEventListener('click', function () {
                // 更新选项卡激活状态
                tabs.forEach(function (t) {
                    t.classList.remove('tab-active');
                    t.classList.add('text-gray-500');
                });
                tab.classList.add('tab-active');
                tab.classList.remove('text-gray-500');

                // 筛选模式：根据 data-filter 属性筛选子项
                if (tab.dataset.filter !== undefined) {
                    var filter = tab.dataset.filter;
                    var items = panelContainer.querySelectorAll('[data-status]');
                    items.forEach(function (item) {
                        item.style.display = (filter === 'all' || item.dataset.status === filter) ? '' : 'none';
                    });
                } else {
                    // 面板切换模式：显示对应索引的面板
                    var panels = panelContainer.querySelectorAll('.tab-panel');
                    panels.forEach(function (panel, i) {
                        panel.style.display = (i === index) ? '' : 'none';
                    });
                }
            });
        });
    });
}

// 初始化轮播图
function initCarousel() {
    document.querySelectorAll('.carousel').forEach(function (carousel) {
        var slides = carousel.querySelectorAll('.carousel-slide');
        var dots = carousel.querySelectorAll('.carousel-dot');
        var current = 0;
        var total = slides.length;
        if (total <= 1) return;

        function goTo(index) {
            slides.forEach(function (s, i) {
                s.style.transform = 'translateX(' + ((i - index) * 100) + '%)';
            });
            dots.forEach(function (d, i) {
                if (i === index) {
                    d.classList.add('bg-white');
                    d.classList.remove('bg-white\/50');
                } else {
                    d.classList.remove('bg-white');
                    d.classList.add('bg-white\/50');
                }
            });
            current = index;
        }

        // 初始化位置
        slides.forEach(function (s, i) {
            s.style.transition = 'transform 0.5s ease';
            s.style.transform = 'translateX(' + (i * 100) + '%)';
        });

        // 自动轮播，每3秒切换
        setInterval(function () {
            goTo((current + 1) % total);
        }, 3000);

        // 点击指示器切换
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                goTo(i);
            });
        });
    });
}

// 初始化搜索功能
function initSearch() {
    document.querySelectorAll('[data-search-input]').forEach(function (input) {
        var targetId = input.dataset.searchInput;
        var container = document.getElementById(targetId);
        if (!container) return;

        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            var items = container.querySelectorAll('[data-search-text]');

            items.forEach(function (item) {
                if (!query) {
                    item.style.display = '';
                    return;
                }
                var text = item.dataset.searchText.toLowerCase();
                item.style.display = text.includes(query) ? '' : 'none';
            });

            // 显示/隐藏无结果提示
            var noResult = container.querySelector('.search-no-result');
            if (noResult) {
                var hasVisible = Array.from(items).some(function (item) {
                    return item.style.display !== 'none';
                });
                noResult.style.display = (query && !hasVisible) ? '' : 'none';
            }
        });
    });
}

// 检查暗色模式
function checkDarkMode() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
    }

    // 监听系统暗色模式变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (e.matches) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    });
}

// 用户认证相关功能
const auth = {
    // 模拟登录功能
    login: function (username, password) {
        // 实际项目中应该发送请求到服务器验证
        // 这里简单模拟
        if (username && password) {
            localStorage.setItem('user_logged_in', 'true');
            localStorage.setItem('username', username);

            // 添加登录时间
            localStorage.setItem('login_time', new Date().toISOString());

            return true;
        }
        return false;
    },

    // 模拟注册功能
    register: function (username, password) {
        // 实际项目中应该发送请求到服务器
        // 这里简单模拟
        if (username && password) {
            localStorage.setItem('user_logged_in', 'true');
            localStorage.setItem('username', username);

            // 添加注册和登录时间
            const now = new Date().toISOString();
            localStorage.setItem('register_time', now);
            localStorage.setItem('login_time', now);

            return true;
        }
        return false;
    },

    // 检查是否已登录
    isLoggedIn: function () {
        return localStorage.getItem('user_logged_in') === 'true';
    },

    // 获取用户名
    getUsername: function () {
        return localStorage.getItem('username');
    },

    // 退出登录
    logout: function () {
        localStorage.removeItem('user_logged_in');
        localStorage.removeItem('username');
        localStorage.removeItem('login_time');

        // 根据当前页面路径确定登录页地址
        var p = window.location.pathname;
        var loginUrl = (p.includes('/user/') || p.includes('/marchant/')) ? '../login.html' : 'login.html';
        window.location.href = loginUrl;
    },

    // 检查登录状态并重定向
    checkAuth: function () {
        if (!this.isLoggedIn()) {
            var p = window.location.pathname;
            var loginUrl = (p.includes('/user/') || p.includes('/marchant/')) ? '../login.html' : 'login.html';
            window.location.href = loginUrl;
            return false;
        }
        return true;
    }
};

// 页面加载时添加淡入效果
window.addEventListener('load', function () {
    document.body.classList.add('fade-in');
});

// 添加页面离开前的淡出效果样式
document.head.insertAdjacentHTML('beforeend', `
    <style>
        body {
            opacity: 1;
            transition: opacity 0.3s ease;
        }
        body.fade-out {
            opacity: 0;
        }
        .fade-in {
            animation: fadeIn 0.5s ease forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    </style>
`);
