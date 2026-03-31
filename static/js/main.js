document.addEventListener('DOMContentLoaded', function () {

    /* ========================================
       1. INTERSECTION OBSERVER — scroll reveal
    ======================================== */
    const revealItems = document.querySelectorAll(
        '.product-card, .stat-card, .cta-card, .category-card, .feature-card'
    );

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, i) => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        // Stagger siblings slightly
                        setTimeout(() => {
                            el.style.opacity = '1';
                            el.style.transform = 'translateY(0)';
                        }, i * 60);
                        observer.unobserve(el);
                    }
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
        );

        revealItems.forEach((el) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(24px)';
            el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
            observer.observe(el);
        });
    } else {
        // Fallback: just make visible
        revealItems.forEach((el) => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }

    /* ========================================
       2. SMOOTH ANCHOR SCROLL
    ======================================== */
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* ========================================
       3. IMAGE UPLOAD VALIDATION
    ======================================== */
    const imageInput = document.getElementById('image');
    if (imageInput) {
        imageInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 16 * 1024 * 1024) {
                alert('File size must be less than 16MB');
                this.value = '';
                return;
            }
            const valid = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
            if (!valid.includes(file.type)) {
                alert('Please select a valid image file (PNG, JPG, GIF, or WEBP)');
                this.value = '';
            }
        });
    }

    /* ========================================
       4. AUTO-DISMISS ALERTS (5 s)
    ======================================== */
    document.querySelectorAll('.alert').forEach((alert) => {
        setTimeout(() => {
            try {
                const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
                bsAlert.close();
            } catch (_) {
                alert.remove();
            }
        }, 5000);
    });

    /* ========================================
       5. DESKTOP SEARCH TOGGLE
    ======================================== */
    const desktopSearchBtn = document.getElementById('desktopSearchBtn');
    const searchWrapper   = document.querySelector('.search-wrapper');

    if (desktopSearchBtn && searchWrapper) {
        desktopSearchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            searchWrapper.classList.toggle('active');
            const inp = searchWrapper.querySelector('input');
            if (searchWrapper.classList.contains('active') && inp) inp.focus();
        });

        document.addEventListener('click', (e) => {
            if (!searchWrapper.contains(e.target)) {
                searchWrapper.classList.remove('active');
            }
        });
    }

    /* ========================================
       6. BACK TO TOP BUTTON
    ======================================== */
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            backToTopBtn.style.display = window.pageYOffset > 300 ? 'flex' : 'none';
        }, { passive: true });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ========================================
       7. CLOSE MOBILE MENU ON LINK CLICK
    ======================================== */
    document.querySelectorAll('.mobile-item[href]').forEach((item) => {
        item.addEventListener('click', () => {
            const navbar = document.getElementById('navbarNav');
            if (navbar && navbar.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(navbar);
                if (bsCollapse) bsCollapse.hide();
            }
        });
    });

    /* ========================================
       8. ADD-TO-CART ANIMATION HELPERS
    ======================================== */

    /**
     * Show a bottom-center toast notification.
     */
    function showCartToast(message) {
        let toast = document.getElementById('cart-success-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'cart-success-toast';
            toast.innerHTML = `
                <div class="toast-icon"><i class="fas fa-check"></i></div>
                <span id="cart-toast-msg">${message}</span>
            `;
            document.body.appendChild(toast);
        } else {
            document.getElementById('cart-toast-msg').textContent = message;
        }

        // Reset & show
        toast.classList.remove('show');
        void toast.offsetWidth; // force reflow
        toast.classList.add('show');

        clearTimeout(toast._hideTimer);
        toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 2800);
    }

    /**
     * Pop the cart badge with a bounce animation and update its count.
     */
    function updateCartBadge(count) {
        document.querySelectorAll('.cart-badge').forEach((badge) => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
            badge.classList.remove('cart-badge-pop');
            void badge.offsetWidth;
            badge.classList.add('cart-badge-pop');
            badge.addEventListener('animationend', () => badge.classList.remove('cart-badge-pop'), { once: true });
        });
    }

    /**
     * Animate a floating "+1 Added!" label from the button up towards the cart.
     */
    function spawnFloatLabel(btn) {
        const rect = btn.getBoundingClientRect();
        const label = document.createElement('div');
        label.className = 'cart-add-float';
        label.textContent = '+ Added to Cart';
        label.style.left = (rect.left + rect.width / 2 - 70) + 'px';
        label.style.top  = (rect.top + window.scrollY - 10) + 'px';
        document.body.appendChild(label);
        label.addEventListener('animationend', () => label.remove());
    }

    /* ========================================
       9. AJAX ADD-TO-CART (product detail page)
    ======================================== */
    document.querySelectorAll('.ajax-cart-form').forEach((form) => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalHtml = btn.innerHTML;

            btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Adding…';
            btn.disabled = true;

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    headers: { Accept: 'application/json' }
                });

                if (response.ok) {
                    const data = await response.json();

                    updateCartBadge(data.cart_count);
                    showCartToast(data.message || 'Item added to cart!');
                    spawnFloatLabel(btn);

                    btn.innerHTML = '<i class="fas fa-check me-2"></i>Added!';
                    btn.classList.add('btn-success');
                    btn.classList.remove('btn-outline-primary');

                    setTimeout(() => {
                        btn.innerHTML = originalHtml;
                        btn.disabled = false;
                        btn.classList.remove('btn-success');
                        btn.classList.add('btn-outline-primary');
                    }, 2200);
                } else {
                    throw new Error('Server error');
                }
            } catch (err) {
                btn.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Try again';
                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                    btn.disabled = false;
                }, 2000);
            }
        });
    });

    /* ========================================
       10. AJAX ADD-TO-CART (search results — inline forms)
    ======================================== */
    document.querySelectorAll('.add-to-cart-form').forEach((form) => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const productId = form.dataset.productId;
            const btn = form.querySelector('button[type="submit"]');
            const originalHtml = btn.innerHTML;

            btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>';
            btn.disabled = true;

            try {
                const res = await fetch(`/cart/add/${productId}`, {
                    method: 'POST',
                    headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' }
                });

                if (res.ok) {
                    const data = await res.json();
                    updateCartBadge(data.cart_count);
                    showCartToast(data.message || 'Item added to cart!');
                    spawnFloatLabel(btn);

                    btn.innerHTML = '<i class="fas fa-check me-1"></i>Added!';
                    btn.classList.add('btn-success');
                    btn.classList.remove('btn-outline-success');

                    setTimeout(() => {
                        btn.innerHTML = originalHtml;
                        btn.disabled = false;
                        btn.classList.remove('btn-success');
                        btn.classList.add('btn-outline-success');
                    }, 2200);
                } else {
                    throw new Error('Error');
                }
            } catch {
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        });
    });

    /* ========================================
       11. AJAX REMOVE FROM CART
    ======================================== */
    document.querySelectorAll('.ajax-remove-form').forEach((form) => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            btn.disabled = true;

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    headers: { Accept: 'application/json' }
                });

                if (response.ok) {
                    const data = await response.json();

                    // Animate row out
                    const rowId = form.getAttribute('data-row-id');
                    const row   = document.getElementById(rowId);
                    if (row) {
                        row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        row.style.opacity    = '0';
                        row.style.transform  = 'translateX(-20px)';
                        setTimeout(() => row.remove(), 320);
                    }

                    updateCartBadge(data.cart_count);

                    const totalEl = document.getElementById('cart-total');
                    if (totalEl) totalEl.textContent = 'MWK ' + data.total.toLocaleString();

                    if (data.cart_count === 0) {
                        setTimeout(() => location.reload(), 400);
                    }
                }
            } catch (_) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-trash me-1"></i>Remove';
            }
        });
    });

    /* ========================================
       12. LEGACY TOAST (Bootstrap) — kept for flash messages
    ======================================== */
    function showLegacyToast(message) {
        const toastEl = document.getElementById('liveToast');
        if (!toastEl) return;
        const msgEl = document.getElementById('toastMessage');
        if (msgEl) msgEl.textContent = message;
        new bootstrap.Toast(toastEl).show();
    }

    window.showLegacyToast = showLegacyToast; // expose if needed
});
