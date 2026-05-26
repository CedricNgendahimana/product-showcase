// ======================================================
// COMPUTER AID MW — MAIN JS
// ======================================================

// NAVBAR SCROLL EFFECT
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {

    if(window.scrollY > 40){

        navbar.classList.add('navbar-scrolled');

    }else{

        navbar.classList.remove('navbar-scrolled');

    }

});

// ======================================================
// SCROLL REVEAL ANIMATION
// ======================================================

const revealElements = document.querySelectorAll(
    '.product-card, .category-card, .dashboard-card, .about-feature, .cta-card'
);

const revealObserver = new IntersectionObserver((entries) => {

    entries.forEach((entry) => {

        if(entry.isIntersecting){

            entry.target.classList.add('show');

        }

    });

}, {
    threshold: 0.1
});

revealElements.forEach((element) => {

    revealObserver.observe(element);

});

// ======================================================
// ACTIVE NAV LINK
// ======================================================

const currentLocation = location.pathname;

const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

navLinks.forEach((link) => {

    if(link.getAttribute('href') === currentLocation){

        link.classList.add('active');

    }

});

// ======================================================
// PRODUCT IMAGE HOVER EFFECT
// ======================================================

const productCards = document.querySelectorAll('.product-card');

productCards.forEach((card) => {

    card.addEventListener('mousemove', (e) => {

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / 25) * -1;
        const rotateY = (x - centerX) / 25;

        card.style.transform = `
            perspective(1000px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            translateY(-8px)
        `;

    });

    card.addEventListener('mouseleave', () => {

        card.style.transform = '';

    });

});

// ======================================================
// BUTTON RIPPLE EFFECT
// ======================================================

const buttons = document.querySelectorAll(
    '.btn-primary-custom, .btn-outline-custom, .btn-product'
);

buttons.forEach((button) => {

    button.addEventListener('click', function(e){

        const ripple = document.createElement('span');

        ripple.classList.add('ripple-effect');

        const rect = this.getBoundingClientRect();

        ripple.style.left = `${e.clientX - rect.left}px`;
        ripple.style.top = `${e.clientY - rect.top}px`;

        this.appendChild(ripple);

        setTimeout(() => {

            ripple.remove();

        }, 600);

    });

});

// ======================================================
// COUNTER ANIMATION
// ======================================================

const counters = document.querySelectorAll('.counter');

const counterObserver = new IntersectionObserver((entries) => {

    entries.forEach((entry) => {

        if(entry.isIntersecting){

            const counter = entry.target;

            const target = +counter.dataset.target;

            let current = 0;

            const increment = target / 60;

            const updateCounter = () => {

                if(current < target){

                    current += increment;

                    counter.innerText = Math.ceil(current);

                    requestAnimationFrame(updateCounter);

                }else{

                    counter.innerText = target;

                }

            };

            updateCounter();

        }

    });

}, {
    threshold: 0.5
});

counters.forEach((counter) => {

    counterObserver.observe(counter);

});

// ======================================================
// SEARCH INPUT GLOW EFFECT
// ======================================================

const searchInputs = document.querySelectorAll(
    '.search-results-input, .search-box input'
);

searchInputs.forEach((input) => {

    input.addEventListener('focus', () => {

        input.parentElement.classList.add('focused');

    });

    input.addEventListener('blur', () => {

        input.parentElement.classList.remove('focused');

    });

});

// ======================================================
// MOBILE MENU ANIMATION
// ======================================================

const navbarToggler = document.querySelector('.navbar-toggler');

if(navbarToggler){

    navbarToggler.addEventListener('click', () => {

        navbarToggler.classList.toggle('open');

    });

}

// ======================================================
// LAZY IMAGE FADE-IN
// ======================================================

const images = document.querySelectorAll('img');

images.forEach((img) => {

    img.addEventListener('load', () => {

        img.classList.add('loaded');

    });

});

// ======================================================
// FLOATING ANIMATION RANDOMIZER
// ======================================================

const floatingCards = document.querySelectorAll('.floating-card');

floatingCards.forEach((card, index) => {

    card.style.animationDelay = `${index * 0.5}s`;

});

// ======================================================
// PARALLAX HERO EFFECT
// ======================================================

const heroBlur1 = document.querySelector('.hero-blur-1');
const heroBlur2 = document.querySelector('.hero-blur-2');

window.addEventListener('mousemove', (e) => {

    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    if(heroBlur1){

        heroBlur1.style.transform = `
            translate(${x * 30}px, ${y * 30}px)
        `;

    }

    if(heroBlur2){

        heroBlur2.style.transform = `
            translate(${-x * 30}px, ${-y * 30}px)
        `;

    }

});

// ======================================================
// RIPPLE STYLE INJECTION
// ======================================================

const rippleStyle = document.createElement('style');

rippleStyle.innerHTML = `

.btn-primary-custom,
.btn-outline-custom,
.btn-product{
    position:relative;
    overflow:hidden;
}

.ripple-effect{
    position:absolute;

    width:12px;
    height:12px;

    background:rgba(255,255,255,.45);

    border-radius:50%;

    transform:translate(-50%, -50%);
    animation:ripple .6s linear;
}

@keyframes ripple{

    from{
        opacity:1;
        transform:translate(-50%, -50%) scale(1);
    }

    to{
        opacity:0;
        transform:translate(-50%, -50%) scale(20);
    }

}

.navbar-scrolled{
    background:rgba(7,11,20,.92)!important;
    backdrop-filter:blur(18px);
    box-shadow:0 10px 30px rgba(0,0,0,.25);
}

img{
    opacity:0;
    transition:opacity .5s ease;
}

img.loaded{
    opacity:1;
}

.focused{
    border-color:#3b82f6!important;
    box-shadow:0 0 0 3px rgba(59,130,246,.15);
}

`;

document.head.appendChild(rippleStyle);

// ======================================================
// CONSOLE BRANDING
// ======================================================

console.log(
    '%cComputer Aid MW UI Loaded',
    `
    color:#60a5fa;
    font-size:16px;
    font-weight:bold;
    `
);