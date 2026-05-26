document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.product-card, .stat-card, .cta-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    document.querySelectorAll('.animate-visible').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });

    const style = document.createElement('style');
    style.textContent = `
        .animate-visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
        document.querySelectorAll('.product-card, .stat-card, .cta-card').forEach(el => {
            if (!el.classList.contains('animate-visible')) {
                el.classList.add('animate-visible');
            }
        });
    }, 100);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    const imageInput = document.getElementById('image');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 16 * 1024 * 1024) {
                    alert('File size must be less than 16MB');
                    this.value = '';
                    return;
                }
                
                const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    alert('Please select a valid image file (PNG, JPG, GIF, or WEBP)');
                    this.value = '';
                }
            }
        });
    }

    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 150);
        }, 5000);
    });
});

document.querySelectorAll(".add-to-cart-form").forEach(form => {
    form.addEventListener("submit", e => {
        e.preventDefault();

        const productId = form.dataset.productId;

        fetch(`/cart/add/${productId}`, {
            method: "POST",
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (!data) return;

            // update cart badge
            const badge = document.querySelector(".badge");
            if (badge) {
                badge.textContent = data.cart_count;
            } else {
                location.reload();
            }
        });
    });
});

const toggle = document.getElementById("searchToggle");
const form = document.getElementById("searchForm");

if (toggle && form) {
    toggle.addEventListener("click", () => {
        form.classList.toggle("d-none");
        form.querySelector("input").focus();
    });
}
