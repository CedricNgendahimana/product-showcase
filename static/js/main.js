/* =============================================================
   Computer Aid MW – main.js
   ============================================================= */

/* ─────────────────────────────────────────────────────────────
   1.  CART ANIMATION SYSTEM
   ───────────────────────────────────────────────────────────── */

/* -- Toast notification ---------------------------------------- */
function showCartToast(name) {
    document.querySelectorAll('.cart-toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.innerHTML = `
        <div class="cart-toast-icon"><i class="fas fa-check"></i></div>
        <div class="cart-toast-body">
            <strong>Added to cart!</strong>
            <span>${name || 'Item'} added successfully</span>
        </div>
        <button class="cart-toast-close" aria-label="Dismiss">
            <i class="fas fa-times"></i>
        </button>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('show'));
    });

    const dismiss = () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 420);
    };

    toast.querySelector('.cart-toast-close').addEventListener('click', dismiss);
    setTimeout(dismiss, 3200);
}

/* -- Flying orb from element → cart button -------------------- */
function flyToCart(originEl) {
    /* Find visible cart target — desktop btn first, fallback to hamburger area */
    const cartBtn = document.querySelector('.nav-cart-btn');
    const cartTarget = (cartBtn && cartBtn.offsetParent) ? cartBtn : null;

    if (!originEl) return;

    const fromRect = originEl.getBoundingClientRect();
    const startX   = fromRect.left + fromRect.width  / 2;
    const startY   = fromRect.top  + fromRect.height / 2;

    /* Build the orb */
    const orb = document.createElement('div');
    orb.className = 'cart-fly-orb';
    orb.style.left = startX + 'px';
    orb.style.top  = startY + 'px';
    document.body.appendChild(orb);

    if (cartTarget) {
        const toRect = cartTarget.getBoundingClientRect();
        const endX   = toRect.left + toRect.width  / 2;
        const endY   = toRect.top  + toRect.height / 2;

        orb.style.setProperty('--tx', (endX - startX) + 'px');
        orb.style.setProperty('--ty', (endY - startY) + 'px');
        orb.classList.add('fly-to-btn');

        orb.addEventListener('animationend', () => {
            orb.remove();
            /* pulse the cart button */
            cartBtn.classList.add('cart-pulse');
            setTimeout(() => cartBtn.classList.remove('cart-pulse'), 420);
        }, { once: true });
    } else {
        /* Mobile: orb flies upward and fades */
        orb.style.setProperty('--tx', '0px');
        orb.style.setProperty('--ty', '-120px');
        orb.classList.add('fly-up');
        orb.addEventListener('animationend', () => orb.remove(), { once: true });
    }
}

/* -- Button loading state -------------------------------------- */
function setButtonState(btn, loading) {
    if (!btn) return;
    if (loading) {
        btn.dataset.origHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding…';
        btn.disabled  = true;
    } else {
        if (btn.dataset.origHtml) btn.innerHTML = btn.dataset.origHtml;
        btn.disabled = false;
    }
}

/* -- Update every cart badge on the page ---------------------- */
function updateCartBadges(count) {
    document.querySelectorAll('.cart-badge').forEach(b => {
        b.textContent = count;
        b.style.display = count > 0 ? '' : 'none';
    });

    /* If no badge exists yet on the cart btn, create one */
    const cartBtn = document.querySelector('.nav-cart-btn');
    if (cartBtn && count > 0 && !cartBtn.querySelector('.cart-badge')) {
        const badge = document.createElement('span');
        badge.className = 'cart-badge';
        badge.textContent = count;
        cartBtn.appendChild(badge);
    }
}

/* -- Unified AJAX submit handler ------------------------------ */
function handleCartSubmit(e) {
    e.preventDefault();
    const form   = e.currentTarget;
    const id     = form.dataset.productId;
    const name   = form.dataset.productName || 'Item';
    const btn    = form.querySelector('button[type="submit"]');

    /* Origin for the flying orb:
       on product detail → use the main product image
       on cards          → use the submit button itself         */
    const imgEl  = document.getElementById('mainProductImage');
    const origin = imgEl || btn;

    setButtonState(btn, true);

    fetch(`/cart/add/${id}`, {
        method:  'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(data => {
        flyToCart(origin);
        showCartToast(name);
        updateCartBadges(data.cart_count);
    })
    .catch(() => {
        /* Fallback: show toast without animation */
        showCartToast(name);
    })
    .finally(() => {
        setTimeout(() => setButtonState(btn, false), 800);
    });
}

/* Attach to all .add-to-cart-form elements */
document.querySelectorAll('.add-to-cart-form').forEach(form => {
    form.addEventListener('submit', handleCartSubmit);
});


/* ─────────────────────────────────────────────────────────────
   2.  SCROLL ANIMATION ENGINE
   ───────────────────────────────────────────────────────────── */
(function initAnimations() {
    const EASE   = 'cubic-bezier(0.22, 1, 0.36, 1)';
    const EASE_S = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

    const PRESETS = {
        'up'    : 'translateY(36px)',
        'down'  : 'translateY(-28px)',
        'left'  : 'translateX(-40px)',
        'right' : 'translateX(40px)',
        'scale' : 'scale(0.88)',
        'fade'  : '',
    };

    function hide(el, preset) {
        el.style.opacity   = '0';
        el.style.transform = PRESETS[preset] || PRESETS['up'];
        el.style.willChange = 'opacity, transform';
    }

    function reveal(el, delay) {
        const preset = el.dataset.animatePreset || 'up';
        const dur    = el.dataset.animateDur    || '620';
        el.style.transitionProperty      = 'opacity, transform';
        el.style.transitionDuration      = `${dur}ms`;
        el.style.transitionTimingFunction = preset === 'scale' ? EASE_S : EASE;
        el.style.transitionDelay         = `${delay}ms`;
        void el.offsetWidth;
        el.style.opacity   = '1';
        el.style.transform = '';
        el.dataset.animated = 'true';
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting || entry.target.dataset.animated) return;
            reveal(entry.target, parseInt(entry.target.dataset.animateDelay || '0', 10));
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.10, rootMargin: '0px 0px -48px 0px' });

    const RULES = [
        { selector: '.section-title',      preset: 'up',    dur: 560 },
        { selector: '.section-subtitle',   preset: 'up',    dur: 560, delay: 80 },
        { selector: '.section-header',     preset: 'up',    dur: 580 },
        { selector: '.category-hero-section .hero-title',    preset: 'up',    dur: 520, delay: 60 },
        { selector: '.category-hero-section .hero-subtitle', preset: 'up',    dur: 520, delay: 140 },
        { selector: '.category-hero-section i.fa-3x',        preset: 'scale', dur: 480, delay: 0 },
        { selector: '.category-card',   preset: 'up',    dur: 580, stagger: 90 },
        { selector: '.product-card',    preset: 'up',    dur: 600, stagger: 70 },
        { selector: '.cta-card',        preset: 'scale', dur: 640 },
        { selector: '.stat-card',       preset: 'up',    dur: 560, stagger: 80 },
        { selector: '.about-block',     preset: 'up',    dur: 600, stagger: 100 },
        { selector: '.about-value',     preset: 'scale', dur: 560, stagger: 80 },
        { selector: '.product-gallery', preset: 'left',  dur: 640 },
        { selector: '.product-meta',    preset: 'right', dur: 640, delay: 80 },
        { selector: '.cart-item-row',   preset: 'up',    dur: 500, stagger: 60 },
        { selector: '.order-summary',   preset: 'right', dur: 600, delay: 120 },
        { selector: '.search-result-card', preset: 'up', dur: 560, stagger: 60 },
        { selector: '.category-nav',    preset: 'fade',  dur: 480, delay: 40 },
        { selector: '.footer-col',      preset: 'up',    dur: 540, stagger: 90 },
    ];

    const registered = new WeakSet();
    const staggerCounters = new Map();

    RULES.forEach(rule => {
        const els = document.querySelectorAll(rule.selector);
        if (!els.length) return;
        if (rule.stagger && !staggerCounters.has(rule.selector))
            staggerCounters.set(rule.selector, 0);

        els.forEach(el => {
            if (registered.has(el)) return;
            registered.add(el);

            let delay = rule.delay || 0;
            if (rule.stagger) {
                const i = staggerCounters.get(rule.selector);
                delay = i * rule.stagger;
                staggerCounters.set(rule.selector, i + 1);
            }

            el.dataset.animatePreset = rule.preset;
            el.dataset.animateDur    = String(rule.dur || 600);
            el.dataset.animateDelay  = String(delay);
            hide(el, rule.preset);
            observer.observe(el);
        });
    });
})();


/* ─────────────────────────────────────────────────────────────
   3.  HERO LOAD SEQUENCE
   ───────────────────────────────────────────────────────────── */
(function heroEntrance() {
    [
        { sel: '.hero-section .hero-title',    delay: 120 },
        { sel: '.hero-section .hero-subtitle', delay: 260 },
        { sel: '.hero-section .hero-btn',      delay: 400 },
    ].forEach(({ sel, delay }) => {
        const el = document.querySelector(sel);
        if (!el) return;
        el.classList.add('hero-hidden');
        setTimeout(() => el.classList.add('hero-visible'), delay);
    });
})();


/* ─────────────────────────────────────────────────────────────
   4.  STICKY NAVBAR SHADOW
   ───────────────────────────────────────────────────────────── */
(function navbarScroll() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    window.addEventListener('scroll', () => {
        nav.style.boxShadow = window.scrollY > 20
            ? '0 4px 24px rgba(0,0,0,.35)'
            : '0 2px 16px rgba(0,0,0,.25)';
    }, { passive: true });
})();


/* ─────────────────────────────────────────────────────────────
   5.  GENERAL UI
   ───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {

    /* Back to top */
    const btt = document.getElementById('backToTop');
    if (btt) {
        window.addEventListener('scroll', () => {
            btt.style.display = window.pageYOffset > 320 ? 'flex' : 'none';
        }, { passive: true });
        btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    /* Auto-dismiss flash alerts */
    document.querySelectorAll('.alert').forEach(alert => {
        setTimeout(() => {
            try { bootstrap.Alert.getOrCreateInstance(alert).close(); } catch (_) { alert.remove(); }
        }, 5000);
    });

    /* Close mobile menu on link click */
    document.querySelectorAll('.mobile-item').forEach(item => {
        item.addEventListener('click', () => {
            const nav = document.getElementById('navbarNav');
            if (nav?.classList.contains('show'))
                bootstrap.Collapse.getInstance(nav)?.hide();
        });
    });

    /* Product thumbnail switcher */
    document.querySelectorAll('.product-thumbnail').forEach(thumb => {
        thumb.addEventListener('click', () => {
            const main = document.getElementById('mainProductImage');
            if (main) main.src = thumb.src;
            document.querySelectorAll('.product-thumbnail').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });

    /* Image file validation */
    const imgInput = document.querySelector('input[name="images"]');
    if (imgInput) {
        imgInput.addEventListener('change', e => {
            const OK = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
            for (const f of e.target.files) {
                if (f.size > 16 * 1024 * 1024) { alert('Max 16 MB per file.'); e.target.value = ''; return; }
                if (!OK.includes(f.type)) { alert('PNG, JPG, GIF or WEBP only.'); e.target.value = ''; return; }
            }
        });
    }

    /* Smooth scroll for anchor links */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const t = document.querySelector(a.getAttribute('href'));
            if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
        });
    });

    /* Admin sidebar mobile toggle */
    const sidebarToggle = document.getElementById('adminSidebarToggle');
    const sidebar = document.getElementById('adminSidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
        document.addEventListener('click', e => {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target))
                sidebar.classList.remove('open');
        });
    }
});
