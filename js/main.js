/**
 * グローバル JavaScript コントローラー
 * - スクロールヘッダーアニメーション
 * - モバイルハンバーガーメニュー制御
 * - ページトップ戻るボタン
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollHeader();
    initMobileMenu();
    initPageTop();
    initScheduleTabs();
});

/**
 * スクロール時にヘッダーを縮小させる
 */
function initScrollHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/**
 * モバイルメニューのハンバーガーボタンとナビメニューの制御
 */
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        // メニュー開閉時にスクロールをロックする
        document.body.classList.toggle('menu-open');
    });

    // リンクをクリックした際にメニューを閉じる
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
}

/**
 * ページトップへ戻るボタンのスクロール表示およびクリック処理
 */
function initPageTop() {
    const pageTopBtn = document.querySelector('.page-top');
    if (!pageTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            pageTopBtn.classList.add('active');
        } else {
            pageTopBtn.classList.remove('active');
        }
    });

    pageTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * スケジュールページのタブ切り替え（簡易的なダミー切り替え）
 */
function initScheduleTabs() {
    const tabButtons = document.querySelectorAll('.schedule-tab');
    const scheduleContents = document.querySelectorAll('.schedule-day-content');

    if (!tabButtons.length || !scheduleContents.length) return;

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // アクティブなボタンの切り替え
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // 表示コンテンツの切り替え
            const targetDay = button.getAttribute('data-day');
            scheduleContents.forEach(content => {
                if (content.id === `schedule-${targetDay}`) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
}
