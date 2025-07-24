let isTransitioning = false;
let isMainContentVisible = false;
let currentLang = 'en';
let currentTheme = 'dark';

const heroSection = document.getElementById('heroSection');
const mainContent = document.getElementById('mainContent');
const mainControls = document.getElementById('mainControls');

const themeToggle = document.getElementById('themeToggle');
const themeToggleMain = document.getElementById('themeToggleMain');

const langButtons = {
    hero: {
        en: document.getElementById('langEn'),
        es: document.getElementById('langEs'),
        pl: document.getElementById('langPl'),
        ua: document.getElementById('langUa'),
        ru: document.getElementById('langRu')
    },
    main: {
        en: document.getElementById('langEnMain'),
        es: document.getElementById('langEsMain'),
        pl: document.getElementById('langPlMain'),
        ua: document.getElementById('langUaMain'),
        ru: document.getElementById('langRuMain')
    }
};

function switchLanguage(lang) {
    currentLang = lang;
    
    Object.keys(langButtons.hero).forEach(key => {
        langButtons.hero[key].classList.toggle('active', key === lang);
    });
    
    Object.keys(langButtons.main).forEach(key => {
        langButtons.main[key].classList.toggle('active', key === lang);
    });
    
    const elementsWithLang = document.querySelectorAll('[data-en]');
    elementsWithLang.forEach(element => {
        if (element.hasAttribute(`data-${lang}`)) {
            element.textContent = element.getAttribute(`data-${lang}`);
        }
    });

    document.documentElement.lang = lang;
}

function showMainContent() {
    if (isTransitioning || isMainContentVisible) return;
    
    isTransitioning = true;
    isMainContentVisible = true;
    
    heroSection.classList.add('hidden');
    
    setTimeout(() => {
        mainContent.classList.add('visible');
        mainControls.classList.add('visible');
        document.body.style.overflowY = 'auto';
        
        setTimeout(() => {
            isTransitioning = false;
        }, 600);
    }, 300);
}

function showHeroSection() {
    if (isTransitioning || !isMainContentVisible) return;
    
    isTransitioning = true;
    isMainContentVisible = false;
    
    mainContent.classList.remove('visible');
    mainControls.classList.remove('visible');
    document.body.style.overflowY = 'hidden';
    
    setTimeout(() => {
        heroSection.classList.remove('hidden');
        
        setTimeout(() => {
            isTransitioning = false;
        }, 800);
    }, 300);
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.className = `theme-${currentTheme}`;
    const themeIcon = currentTheme === 'dark' ? '🌙' : '☀️';
    themeToggle.textContent = themeIcon;
    themeToggleMain.textContent = themeIcon;
}

window.addEventListener('wheel', (e) => {
    if (isTransitioning) {
        e.preventDefault();
        return;
    }

    if (!isMainContentVisible && e.deltaY > 0) {
        e.preventDefault();
        showMainContent();
    } else if (isMainContentVisible && e.deltaY < 0 && window.scrollY === 0) {
        e.preventDefault();
        showHeroSection();
    }
}, { passive: false });

let touchStartY = 0;
let touchEndY = 0;

window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

window.addEventListener('touchmove', (e) => {
    if (isTransitioning) {
        e.preventDefault();
        return;
    }

    touchEndY = e.touches[0].clientY;
    const deltaY = touchStartY - touchEndY;

    if (!isMainContentVisible && deltaY > 50) {
        e.preventDefault();
        showMainContent();
    } else if (isMainContentVisible && deltaY < -50 && window.scrollY === 0) {
        e.preventDefault();
        showHeroSection();
    }
}, { passive: false });

themeToggle.addEventListener('click', toggleTheme);
themeToggleMain.addEventListener('click', toggleTheme);

Object.keys(langButtons.hero).forEach(lang => {
    langButtons.hero[lang].addEventListener('click', () => switchLanguage(lang));
    langButtons.main[lang].addEventListener('click', () => switchLanguage(lang));
});

document.body.style.overflowY = 'hidden';
switchLanguage('en');

const heroFaceBounce = document.querySelector('.hero-face-bounce');
if (heroFaceBounce) {
    heroFaceBounce.style.cursor = 'pointer';
    heroFaceBounce.addEventListener('click', () => {
        showMainContent();
    });
}

const wrapper = document.getElementById('floating-image-wrapper');
const image   = document.getElementById('floating-image');

let lastTarget = null;
let flipSide   = false;
let isAnimating = false;

function getCenterY(elem) {
    const r = elem.getBoundingClientRect();
    return r.top + r.height / 2;
}

function animateToPosition(targetTop, targetLeft, shouldFlip, callback) {
    if (isAnimating) return;
    
    isAnimating = true;
    const startTime = performance.now();
    const duration = 800;
    
    const startTop = parseFloat(wrapper.style.top) || 0;
    const startLeft = parseFloat(wrapper.style.left) || 0;
    
    const deltaTop = targetTop - startTop;
    const deltaLeft = targetLeft - startLeft;
    
    image.classList.add('flying');
    
    if (shouldFlip) {
        image.style.transform = flipSide ? 'scaleX(-1)' : 'scaleX(1)';
    }

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentTop = startTop + deltaTop * easeProgress;
        const currentLeft = startLeft + deltaLeft * easeProgress;
        
        wrapper.style.top = currentTop + 'px';
        wrapper.style.left = currentLeft + 'px';
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isAnimating = false;
            image.classList.remove('flying');
            if (callback) callback();
        }
    }
    
    requestAnimationFrame(animate);
}

function moveToNearestBlock() {
    if (isAnimating) return;
    
    const blocks = document.querySelectorAll('.content-section');
    const cy     = window.innerHeight / 2;
    let minD     = Infinity;
    let closest  = null;

    blocks.forEach(b => {
        const d = Math.abs(cy - getCenterY(b));
        if (d < minD) {
            minD    = d;
            closest = b;
        }
    });

    if (closest && closest !== lastTarget) {
        flipSide = !flipSide;
        const r   = closest.getBoundingClientRect();
        const targetTop = r.top + window.scrollY + r.height / 2 - wrapper.offsetHeight / 2;
        const targetLeft = flipSide
            ? r.left + r.width + 10
            : r.left - wrapper.offsetWidth - 10;

        animateToPosition(targetTop, targetLeft, true);

        lastTarget = closest;
    }
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

window.addEventListener('scroll', throttle(moveToNearestBlock, 50));
window.addEventListener('resize', moveToNearestBlock);

setInterval(moveToNearestBlock, 1000);

moveToNearestBlock();