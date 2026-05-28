/* =============================================================
   Computer Aid MW – main.js
   Scroll & load animations + UI interactions
   ============================================================= */

/* ── 1. SCROLL ANIMATION ENGINE ───────────────────────────── */
(function initAnimations() {

    /* Easing function used for CSS transitions */
    const EASE   = 'cubic-bezier(0.22, 1, 0.36, 1)';  /* ease-out-quint */
    const EASE_S = 'cubic-bezier(0.34, 1.56, 0.64, 1)'; /* spring-like scale */

    /* Animation presets: [initial-transform, transition-property] */
    const PRESETS = {
        'up'    : ['translateY(36px)',   'opacity, transform'],
        'down'  : ['translateY(-28px)',  'opacity, transform'],
        'left'  : ['translateX(-40px)',  'opacity, transform'],
        'right' : ['translateX(40px)',   'opacity, transform'],
        'scale' : ['scale(0.88)',        'opacity, transform'],
        'fade'  : ['none',               'opacity'],
    };

    /* Apply initial (hidden) state to an element */
    function hide(el, preset) {
        const [tf, props] = PRESETS[preset] || PRESETS['up'];
        el.style.opacity   = '0';
        el.style.transform = tf === 'none' ? '' : tf;
        el.style.willChange = 'opacity, transform';
    }

    /* Reveal an element (called by observer) */
    function reveal(el, delay = 0) {
        const preset = el.dataset.animatePreset || 'up';
        const dur    = el.dataset.animateDur    || '620';
        const [, props] = PRESETS[preset] || PRESETS['up'];

        el.style.transitionProperty = props;
        el.style.transitionDuration = `${dur}ms`;
        el.style.transitionTimingFunction = preset === 'scale' ? EASE_S : EASE;
        el.style.transitionDelay = `${delay}ms`;

        /* Force reflow so transition actually fires */
        void el.offsetWidth;

        el.style.opacity   = '1';
        el.style.transform = '';
        el.dataset.animated = 'true';
    }

    /* Build the observer */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            if (el.dataset.animated) return;

            const delay = parseInt(el.dataset.animateDelay || '0', 10);
            reveal(el, delay);
            observer.unobserve(el);
        });
    }, { threshold: 0.10, rootMargin: '0px 0px -48px 0px' });

    /* -----------------------------------------------------------
       Auto-register elements by selector rules
       Each rule: { selector, preset, dur?, stagger?, delay? }
    ----------------------------------------------------------- */
    const RULES = [
        /* Section titles + subtitles */
        { selector: '.section-title',      preset: 'up',    dur: 560 },
        { selector: '.section-subtitle',   preset: 'up',    dur: 560, delay: 80 },
        { selector: '.section-header',     preset: 'up',    dur: 580 },

        /* Category hero */
        { selector: '.category-hero-section .hero-title',    preset: 'up',  dur: 520, delay: 60 },
        { selector: '.category-hero-section .hero-subtitle', preset: 'up',  dur: 520, delay: 140 },
        { selector: '.category-hero-section i.fa-3x',        preset: 'scale', dur: 480, delay: 0 },

        /* Category cards — staggered */
        { selector: '.category-card',    preset: 'up',    dur: 580, stagger: 90 },

        /* Product cards — staggered */
        { selector: '.product-card',     preset: 'up',    dur: 600, stagger: 70 },

        /* CTA / stat cards */
        { selector: '.cta-card',         preset: 'scale', dur: 640, delay: 0 },
        { selector: '.stat-card',        preset: 'up',    dur: 560, stagger: 80 },

        /* About page blocks */
        { selector: '.about-block',      preset: 'up',    dur: 600, stagger: 100 },
        { selector: '.about-value',      preset: 'scale', dur: 560, stagger: 80 },

        /* Product detail */
        { selector: '.product-gallery',  preset: 'left',  dur: 640 },
        { selector: '.product-meta',     preset: 'right', dur: 640, delay: 80 },

        /* Cart rows */
        { selector: '.cart-item-row',    preset: 'up',    dur: 500, stagger: 60 },
        { selector: '.order-summary',    preset: 'right', dur: 600, delay: 120 },

        /* Search results */
        { selector: '.search-result-card', preset: 'up', dur: 560, stagger: 60 },

        /* Generic breadcrumb / nav pills */
        { selector: '.category-nav',     preset: 'fade',  dur: 480, delay: 40 },

        /* Footer columns */
        { selector: '.footer-col',       preset: 'up',    dur: 540, stagger: 90 },
    ];

    /* Track which elements have been registered so stagger counts are correct */
    const registered = new WeakSet();

    /* Stagger counters per selector group (reset each page load) */
    const staggerCounters = new Map();

    RULES.forEach(rule => {
        const els = document.querySelectorAll(rule.selector);
        if (!els.length) return;

        /* Each selector starts its own stagger counter */
        if (rule.stagger && !staggerCounters.has(rule.selector)) {
            staggerCounters.set(rule.selector, 0);
        }

        els.forEach(el => {
            if (registered.has(el)) return;
            registered.add(el);

            /* Determine delay: explicit > stagger-based > 0 */
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


/* ── 2. HERO LOAD SEQUENCE (CSS-class driven) ──────────────── */
(function heroEntrance() {
    const seq = [
        { sel: '.hero-section .hero-title',    delay: 120 },
        { sel: '.hero-section .hero-subtitle', delay: 260 },
        { sel: '.hero-section .hero-btn',      delay: 400 },
    ];
    seq.forEach(({ sel, delay }) => {
        const el = document.querySelector(sel);
        if (!el) return;
        el.classList.add('hero-hidden');
        setTimeout(() => el.classList.add('hero-visible'), delay);
    });
})();


/* ── 3. STICKY NAVBAR SHADOW ───────────────────────────────── */
(function navbarScroll() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    const onScroll = () => {
        if (window.scrollY > 20) {
            nav.style.boxShadow = '0 4px 24px rgba(0,0,0,.35)';
        } else {
            nav.style.boxShadow = '0 2px 16px rgba(0,0,0,.25)';
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ── 4. UI INTERACTIONS ────────────────────────────────────── */
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
            if (nav?.classList.contains('show')) {
                bootstrap.Collapse.getInstance(nav)?.hide();
            }
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
            const files = Array.from(e.target.files);
            const OK_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
            for (const f of files) {
                if (f.size > 16 * 1024 * 1024) {
                    alert('Each file must be under 16 MB.');
                    e.target.value = ''; return;
                }
                if (!OK_TYPES.includes(f.type)) {
                    alert('Only PNG, JPG, GIF or WEBP images are allowed.');
                    e.target.value = ''; return;
                }
            }
        });
    }

    /* Smooth scroll for anchor links */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
        });
    });

    /* AJAX Add-to-Cart */
    document.querySelectorAll('.add-to-cart-form').forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const id = form.dataset.productId;
            fetch(`/cart/add/${id}`, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data) return;
                /* Update all cart badge instances */
                document.querySelectorAll('.cart-badge').forEach(b => {
                    b.textContent = data.cart_count;
                });
                /* Pulse the cart button */
                document.querySelectorAll('.nav-cart-btn').forEach(btn => {
                    btn.classList.add('cart-pulse');
                    setTimeout(() => btn.classList.remove('cart-pulse'), 400);
                });
            })
            .catch(() => location.reload());
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
