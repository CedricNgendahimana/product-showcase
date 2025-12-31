document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // 1. ENHANCED INTERSECTION OBSERVER
    // ============================================
    const observerOptions = {
        threshold: 0.05, // Reduced for earlier triggering
        rootMargin: '50px 0px 50px 0px' // Trigger earlier on both sides
    };

    const animationObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add staggered animation based on element type
                const delay = getAnimationDelay(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('animate-visible');
                    observer.unobserve(entry.target);
                }, delay);
            }
        });
    }, observerOptions);

    // Enhanced animation observer for different element types
    const enhancedObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                enhancedObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // Observe all animated elements
    document.querySelectorAll('[data-animate]').forEach(el => {
        enhancedObserver.observe(el);
    });

    // Helper function for staggered delays
    function getAnimationDelay(element) {
        if (element.classList.contains('product-card')) return 50;
        if (element.classList.contains('stat-card')) return 100;
        if (element.classList.contains('cta-card')) return 150;
        return 0;
    }

    // Initialize animated elements with better visual feedback
    const animatedElements = document.querySelectorAll('.product-card, .stat-card, .cta-card, .category-card, .fade-in-up, .animate-fade-in');
    
    animatedElements.forEach(el => {
        if (!el.classList.contains('animate-visible')) {
            // Add subtle entrance animation setup
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px) scale(0.98)';
            el.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            el.style.willChange = 'opacity, transform';
            observer.observe(el);
        }
    });

    // Add enhanced CSS for animations
    const enhancedStyles = document.createElement('style');
    enhancedStyles.textContent = `
        .animate-visible {
            opacity: 1 !important;
            transform: translateY(0) scale(1) !important;
        }
        
        .in-view {
            animation: fadeInUpEnhanced 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
        }
        
        @keyframes fadeInUpEnhanced {
            0% {
                opacity: 0;
                transform: translateY(40px) scale(0.95);
            }
            100% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        /* Smooth scroll behavior enhancement */
        html {
            scroll-behavior: smooth;
            scroll-padding-top: 80px; /* Account for fixed navbar */
        }
        
        /* Focus styles for better accessibility */
        :focus-visible {
            outline: 2px solid #e94c2b;
            outline-offset: 2px;
            border-radius: 4px;
        }
        
        /* Loading skeleton animation */
        .loading-skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        
        /* Mobile touch feedback */
        @media (hover: none) and (pointer: coarse) {
            button, .btn, .nav-link, .product-card-link {
                transition: transform 0.2s ease, opacity 0.2s ease;
            }
            
            button:active, .btn:active, .nav-link:active, .product-card-link:active {
                transform: scale(0.98);
                opacity: 0.9;
            }
        }
        
        /* Reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
            
            .animate-visible, .in-view {
                opacity: 1 !important;
                transform: none !important;
                animation: none !important;
            }
        }
    `;
    document.head.appendChild(enhancedStyles);

    // Fallback for elements not triggered by observer
    setTimeout(() => {
        animatedElements.forEach(el => {
            if (!el.classList.contains('animate-visible') && 
                !el.classList.contains('in-view')) {
                el.classList.add('animate-visible');
            }
        });
    }, 500);

    // ============================================
    // 2. ENHANCED SMOOTH SCROLLING
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                // Calculate offset for fixed navbar
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetPosition - navbarHeight - 20;
                
                // Enhanced scroll animation
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Add focus to target for accessibility
                setTimeout(() => {
                    if (!target.hasAttribute('tabindex')) {
                        target.setAttribute('tabindex', '-1');
                    }
                    target.focus({ preventScroll: true });
                }, 300);
            }
        });
    });

    // ============================================
    // 3. ENHANCED IMAGE UPLOAD WITH PREVIEW
    // ============================================
    const imageInput = document.getElementById('image');
    if (imageInput) {
        const imagePreview = document.createElement('div');
        imagePreview.className = 'image-preview mt-2 d-none';
        imagePreview.style.cssText = `
            width: 200px;
            height: 200px;
            border: 2px dashed #ddd;
            border-radius: 8px;
            overflow: hidden;
            position: relative;
            background: #f8f9fa;
        `;
        
        const previewImg = document.createElement('img');
        previewImg.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: none;
        `;
        
        const previewText = document.createElement('div');
        previewText.textContent = 'Image preview will appear here';
        previewText.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #6c757d;
            text-align: center;
            font-size: 14px;
            width: 80%;
        `;
        
        imagePreview.appendChild(previewImg);
        imagePreview.appendChild(previewText);
        imageInput.parentNode.insertBefore(imagePreview, imageInput.nextSibling);

        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (file) {
                // File size validation
                if (file.size > 16 * 1024 * 1024) {
                    showToast('File size must be less than 16MB', 'error');
                    this.value = '';
                    imagePreview.classList.add('d-none');
                    return;
                }
                
                // File type validation
                const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    showToast('Please select a valid image file (PNG, JPG, GIF, or WEBP)', 'error');
                    this.value = '';
                    imagePreview.classList.add('d-none');
                    return;
                }
                
                // Show preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImg.src = e.target.result;
                    previewImg.style.display = 'block';
                    previewText.style.display = 'none';
                    imagePreview.classList.remove('d-none');
                    imagePreview.style.borderColor = '#e94c2b';
                    imagePreview.style.borderStyle = 'solid';
                    
                    // Add loading animation
                    previewImg.style.opacity = '0';
                    previewImg.style.transition = 'opacity 0.3s ease';
                    setTimeout(() => {
                        previewImg.style.opacity = '1';
                    }, 10);
                };
                reader.readAsDataURL(file);
                
                showToast('Image selected successfully!', 'success');
            } else {
                imagePreview.classList.add('d-none');
            }
        });
        
        // Drag and drop support
        imagePreview.addEventListener('dragover', (e) => {
            e.preventDefault();
            imagePreview.style.borderColor = '#e94c2b';
            imagePreview.style.backgroundColor = 'rgba(233, 76, 43, 0.1)';
        });
        
        imagePreview.addEventListener('dragleave', () => {
            imagePreview.style.borderColor = imageInput.files[0] ? '#e94c2b' : '#ddd';
            imagePreview.style.backgroundColor = '#f8f9fa';
        });
        
        imagePreview.addEventListener('drop', (e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length) {
                imageInput.files = e.dataTransfer.files;
                imageInput.dispatchEvent(new Event('change'));
            }
        });
    }

    // ============================================
    // 4. ENHANCED ALERT SYSTEM WITH ANIMATIONS
    // ============================================
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach((alert, index) => {
        // Add entrance animation
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-20px)';
        alert.style.transition = 'opacity 0.3s ease, transform 0.3s ease, margin 0.3s ease';
        
        setTimeout(() => {
            alert.style.opacity = '1';
            alert.style.transform = 'translateY(0)';
        }, index * 100);
        
        // Auto-dismiss with better animation
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-20px)';
            alert.style.marginTop = '0';
            alert.style.marginBottom = '0';
            alert.style.paddingTop = '0';
            alert.style.paddingBottom = '0';
            alert.style.height = '0';
            alert.style.overflow = 'hidden';
            
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 5000);
        
        // Manual dismiss with animation
        const dismissBtn = alert.querySelector('.btn-close');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                alert.style.opacity = '0';
                alert.style.transform = 'translateY(-20px)';
                alert.style.height = '0';
                alert.style.overflow = 'hidden';
                
                setTimeout(() => {
                    alert.remove();
                }, 300);
            });
        }
    });

    // ============================================
    // 5. ENHANCED ADD TO CART WITH ANIMATIONS
    // ============================================
    document.querySelectorAll(".add-to-cart-form").forEach(form => {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const productId = this.dataset.productId;
            const button = this.querySelector('button[type="submit"]');
            const originalText = button.innerHTML;
            
            // Add loading state
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Adding...';
            button.disabled = true;
            
            // Create cart animation element
            const cartIcon = document.querySelector('.cart-icon') || document.querySelector('[href*="cart"]');
            if (cartIcon) {
                const productImage = this.closest('.product-card')?.querySelector('.product-image');
                if (productImage) {
                    createCartAnimation(productImage, cartIcon);
                }
            }
            
            fetch(`/cart/add/${productId}`, {
                method: "POST",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ quantity: 1 })
            })
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(data => {
                // Update cart badge with animation
                const badge = document.querySelector(".badge");
                if (badge) {
                    badge.textContent = data.cart_count;
                    badge.style.transform = 'scale(1.5)';
                    badge.style.transition = 'transform 0.3s ease';
                    
                    setTimeout(() => {
                        badge.style.transform = 'scale(1)';
                    }, 300);
                    
                    showToast('Product added to cart!', 'success');
                }
                
                // Reset button
                button.innerHTML = originalText;
                button.disabled = false;
            })
            .catch(error => {
                console.error('Error:', error);
                button.innerHTML = originalText;
                button.disabled = false;
                showToast('Failed to add product to cart. Please try again.', 'error');
            });
        });
    });

    // ============================================
    // 6. ENHANCED SEARCH TOGGLE WITH ANIMATIONS
    // ============================================
    const toggle = document.getElementById("searchToggle");
    const form = document.getElementById("searchForm");

    if (toggle && form) {
        // Add animation styles
        form.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        form.style.maxHeight = '0';
        form.style.overflow = 'hidden';
        form.style.opacity = '0';
        
        toggle.addEventListener("click", () => {
            if (form.classList.contains("d-none")) {
                form.classList.remove("d-none");
                
                // Animate in
                setTimeout(() => {
                    form.style.maxHeight = '60px';
                    form.style.opacity = '1';
                    form.style.padding = '10px 0';
                    
                    const input = form.querySelector("input");
                    if (input) {
                        input.focus();
                        
                        // Add focus animation
                        input.style.transform = 'scale(0.95)';
                        input.style.transition = 'transform 0.2s ease';
                        
                        setTimeout(() => {
                            input.style.transform = 'scale(1)';
                        }, 200);
                    }
                }, 10);
            } else {
                // Animate out
                form.style.maxHeight = '0';
                form.style.opacity = '0';
                form.style.padding = '0';
                
                setTimeout(() => {
                    form.classList.add("d-none");
                }, 300);
            }
        });
        
        // Close search on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !form.classList.contains('d-none')) {
                toggle.click();
            }
        });
        
        // Close search when clicking outside
        document.addEventListener('click', (e) => {
            if (!form.classList.contains('d-none') && 
                !form.contains(e.target) && 
                e.target !== toggle && 
                !toggle.contains(e.target)) {
                toggle.click();
            }
        });
    }

    // ============================================
    // 7. ENHANCED MOBILE MENU INTERACTIONS
    // ============================================
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const navbarCollapse = document.querySelector('.navbar-collapse');
            
            if (navbarCollapse) {
                if (!isExpanded) {
                    // Opening animation
                    navbarCollapse.style.maxHeight = '0';
                    navbarCollapse.style.overflow = 'hidden';
                    navbarCollapse.style.transition = 'max-height 0.3s ease';
                    
                    setTimeout(() => {
                        navbarCollapse.style.maxHeight = navbarCollapse.scrollHeight + 'px';
                    }, 10);
                } else {
                    // Closing animation
                    navbarCollapse.style.maxHeight = navbarCollapse.scrollHeight + 'px';
                    
                    setTimeout(() => {
                        navbarCollapse.style.maxHeight = '0';
                    }, 10);
                }
            }
        });
    }

    // ============================================
    // 8. STICKY NAVBAR WITH SCROLL EFFECTS
    // ============================================
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add shadow on scroll
            if (scrollTop > 10) {
                navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
                navbar.style.backdropFilter = 'blur(10px)';
                navbar.style.backgroundColor = 'rgba(22, 33, 62, 0.95)';
            } else {
                navbar.style.boxShadow = 'none';
                navbar.style.backdropFilter = 'none';
                navbar.style.backgroundColor = '';
            }
            
            // Hide/show navbar on scroll
            if (scrollTop > 100) {
                if (scrollTop > lastScrollTop) {
                    // Scrolling down
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    // Scrolling up
                    navbar.style.transform = 'translateY(0)';
                }
            }
            
            navbar.style.transition = 'transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease';
            lastScrollTop = scrollTop;
        });
    }

    // ============================================
    // 9. LAZY LOADING IMAGES WITH INTERSECTION OBSERVER
    // ============================================
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                
                // Add fade-in animation
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.5s ease';
                
                img.onload = () => {
                    img.style.opacity = '1';
                    img.classList.add('loaded');
                };
                
                observer.unobserve(img);
            }
        });
    }, { threshold: 0.1, rootMargin: '50px' });
    
    lazyImages.forEach(img => imageObserver.observe(img));

    // ============================================
    // 10. UTILITY FUNCTIONS
    // ============================================
    
    function createCartAnimation(startElement, endElement) {
        const animationEl = document.createElement('div');
        animationEl.style.cssText = `
            position: fixed;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e94c2b;
            z-index: 9999;
            pointer-events: none;
            opacity: 0.8;
        `;
        
        const startRect = startElement.getBoundingClientRect();
        const endRect = endElement.getBoundingClientRect();
        
        animationEl.style.left = startRect.left + startRect.width / 2 - 20 + 'px';
        animationEl.style.top = startRect.top + startRect.height / 2 - 20 + 'px';
        
        document.body.appendChild(animationEl);
        
        // Animate to cart
        setTimeout(() => {
            animationEl.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            animationEl.style.left = endRect.left + endRect.width / 2 - 20 + 'px';
            animationEl.style.top = endRect.top + endRect.height / 2 - 20 + 'px';
            animationEl.style.transform = 'scale(0.5)';
            animationEl.style.opacity = '0.3';
        }, 10);
        
        setTimeout(() => {
            animationEl.remove();
        }, 600);
    }
    
    function showToast(message, type = 'info') {
        // Check if toast container exists
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 350px;
            `;
            document.body.appendChild(toastContainer);
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast alert alert-${type}`;
        toast.style.cssText = `
            margin-bottom: 10px;
            animation: slideInRight 0.3s ease;
            border: none;
            border-left: 4px solid ${type === 'success' ? '#25d366' : type === 'error' ? '#dc3545' : '#e94c2b'};
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'btn-close';
        closeBtn.setAttribute('aria-label', 'Close');
        
        const toastBody = document.createElement('div');
        toastBody.className = 'toast-body';
        toastBody.textContent = message;
        
        toast.appendChild(closeBtn);
        toast.appendChild(toastBody);
        toastContainer.appendChild(toast);
        
        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Auto remove
        setTimeout(() => {
            toast.style.transition = 'all 0.3s ease';
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            
            setTimeout(() => {
                toast.remove();
                if (toastContainer.children.length === 0) {
                    toastContainer.remove();
                }
            }, 300);
        }, 3000);
        
        // Manual close
        closeBtn.addEventListener('click', () => {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            
            setTimeout(() => {
                toast.remove();
                if (toastContainer.children.length === 0) {
                    toastContainer.remove();
                }
            }, 300);
        });
    }
    
    // ============================================
    // 11. WINDOW RESIZE HANDLER
    // ============================================
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Recalculate navbar collapse height if open
            const navbarCollapse = document.querySelector('.navbar-collapse.show');
            if (navbarCollapse) {
                navbarCollapse.style.maxHeight = navbarCollapse.scrollHeight + 'px';
            }
            
            // Re-observe elements for animations
            animatedElements.forEach(el => {
                if (!el.classList.contains('animate-visible') && 
                    !el.classList.contains('in-view')) {
                    observer.observe(el);
                }
            });
        }, 150);
    });
    
    // ============================================
    // 12. INITIAL LOADING ANIMATION
    // ============================================
    window.addEventListener('load', () => {
        // Remove initial loading state
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.3s ease';
            document.body.style.opacity = '1';
            document.body.style.overflow = 'auto';
            
            // Trigger all remaining animations
            animatedElements.forEach(el => {
                if (!el.classList.contains('animate-visible') && 
                    !el.classList.contains('in-view')) {
                    el.classList.add('animate-visible');
                }
            });
        }, 100);
    });
});