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
        pl: document.getElementById('langPl'),
        ua: document.getElementById('langUa'),
        ru: document.getElementById('langRu')
    },
    main: {
        en: document.getElementById('langEnMain'),
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