// ====== CONFIGURATION ======
const CONFIG = {
    scrollOffset: 70,
    counterSpeed: 20,
    parallaxSpeed: 0.1,
    notificationDuration: 5000,
    throttleDelay: 16, // ~60fps
    animationThreshold: 0.1
};

// ====== DOM CACHE ======
const DOM = {
    hamburger: document.querySelector('.hamburger'),
    navMenu: document.querySelector('.nav-menu'),
    navLinks: document.querySelectorAll('.nav-link'),
    sections: document.querySelectorAll('section'),
    skillCards: document.querySelectorAll('.skill-card'),
    projectCards: document.querySelectorAll('.project-card'),
    contactForm: document.getElementById('contactForm'),
    statNumbers: document.querySelectorAll('.stat-number'),
    progressBars: document.querySelectorAll('.skill-progress'),
    skillsSection: document.querySelector('.skills'),
    heroTitle: document.querySelector('.hero-title')
};

// ====== STATE MANAGEMENT ======
const STATE = {
    isMenuOpen: false,
    scrollPosition: 0,
    countersAnimated: new Set(),
    skillsAnimated: false
};

// ====== UTILITY FUNCTIONS ======
const Utils = {
    // Throttle function for performance
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    },

    // Check if element is in viewport
    isInViewport(element, threshold = 0.1) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return (
            rect.top <= windowHeight * (1 - threshold) &&
            rect.bottom >= windowHeight * threshold
        );
    },

    // Smooth scroll to element
    smoothScrollTo(element, offset = 0) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    },

    // Validate email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Preload images
    preloadImages(selector) {
        const images = document.querySelectorAll(selector);
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    }
};

// ====== MOBILE NAVIGATION ======
class MobileNavigation {
    constructor() {
        this.init();
    }

    init() {
        DOM.hamburger?.addEventListener('click', this.toggleMenu.bind(this));
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', this.closeMenu.bind(this));
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (STATE.isMenuOpen && 
                !DOM.navMenu.contains(e.target) && 
                !DOM.hamburger.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && STATE.isMenuOpen) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        STATE.isMenuOpen = !STATE.isMenuOpen;
        DOM.hamburger.classList.toggle('active', STATE.isMenuOpen);
        DOM.navMenu.classList.toggle('active', STATE.isMenuOpen);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = STATE.isMenuOpen ? 'hidden' : '';
    }

    closeMenu() {
        STATE.isMenuOpen = false;
        DOM.hamburger.classList.remove('active');
        DOM.navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ====== SMOOTH SCROLLING ======
class SmoothScrolling {
    constructor() {
        this.init();
    }

    init() {
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleLinkClick(e, link));
        });

        // Add scroll to top functionality
        this.createScrollToTopButton();
    }

    handleLinkClick(e, link) {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        
        if (targetId.startsWith('#')) {
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                Utils.smoothScrollTo(targetSection, CONFIG.scrollOffset);
            }
        } else {
            // Handle external links
            window.location.href = targetId;
        }
    }

    createScrollToTopButton() {
        const button = document.createElement('button');
        button.innerHTML = '<i class="fas fa-arrow-up"></i>';
        button.className = 'scroll-to-top';
        button.setAttribute('aria-label', 'Scroll to top');
        
        Object.assign(button.style, {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '50px',
            height: '50px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            opacity: '0',
            visibility: 'hidden',
            transition: 'all 0.3s ease',
            zIndex: '1000',
            boxShadow: '0 5px 15px rgba(102, 126, 234, 0.4)'
        });

        button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        document.body.appendChild(button);
        this.scrollToTopBtn = button;
    }

    updateScrollToTopButton() {
        if (!this.scrollToTopBtn) return;

        const isVisible = window.scrollY > 500;
        this.scrollToTopBtn.style.opacity = isVisible ? '1' : '0';
        this.scrollToTopBtn.style.visibility = isVisible ? 'visible' : 'hidden';
    }
}

// ====== ACTIVE NAVIGATION ======
class ActiveNavigation {
    constructor() {
        this.currentSection = '';
        this.init();
    }

    init() {
        window.addEventListener('scroll', Utils.throttle(() => {
            this.updateActiveSection();
        }, CONFIG.throttleDelay));
    }

    updateActiveSection() {
        const scrollPosition = window.scrollY + CONFIG.scrollOffset;
        let newSection = '';

        DOM.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                newSection = section.getAttribute('id');
            }
        });

        if (newSection !== this.currentSection) {
            this.currentSection = newSection;
            this.updateNavLinks();
        }
    }

    updateNavLinks() {
        DOM.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${this.currentSection}`) {
                link.classList.add('active');
            }
        });
    }
}

// ====== ANIMATION MANAGER ======
class AnimationManager {
    constructor() {
        this.observers = new Map();
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: CONFIG.animationThreshold,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Trigger specific animations based on element type
                    this.triggerElementAnimation(entry.target);
                }
            });
        }, observerOptions);

        // Observe all animatable elements
        const animatableElements = [
            ...DOM.skillCards,
            ...DOM.projectCards,
            ...DOM.statNumbers
        ];
        
        animatableElements.forEach(el => this.observer.observe(el));
    }

    triggerElementAnimation(element) {
        if (element.classList.contains('stat-number')) {
            this.animateCounter(element);
        } else if (element.classList.contains('skill-progress')) {
            this.animateSkillProgress(element);
        }
    }

    animateCounter(element) {
        if (STATE.countersAnimated.has(element)) return;

        const target = parseInt(element.getAttribute('data-target'));
        STATE.countersAnimated.add(element);

        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, CONFIG.counterSpeed);
    }

    animateSkillProgress(element) {
        if (STATE.skillsAnimated) return;

        const width = element.getAttribute('data-level');
        element.style.width = `${width}%`;
        STATE.skillsAnimated = true;
    }

    setupScrollAnimations() {
        // Parallax effect for floating cards
        window.addEventListener('scroll', Utils.throttle(() => {
            this.updateParallax();
        }, CONFIG.throttleDelay));

        // Hover effects
        this.setupHoverEffects();
    }

    updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.floating-card');
        
        parallaxElements.forEach((element, index) => {
            const speed = CONFIG.parallaxSpeed + (index * 0.05);
            element.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.01}deg)`;
        });
    }

    setupHoverEffects() {
        DOM.skillCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
                card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '';
            });
        });
    }
}

// ====== FORM HANDLER ======
class FormHandler {
    constructor() {
        if (DOM.contactForm) {
            this.init();
        }
    }

    init() {
        DOM.contactForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Add real-time validation
        this.setupRealTimeValidation();
    }

    setupRealTimeValidation() {
        const inputs = DOM.contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        switch (field.type) {
            case 'email':
                if (!value) {
                    isValid = false;
                    message = 'Email is required';
                } else if (!Utils.isValidEmail(value)) {
                    isValid = false;
                    message = 'Please enter a valid email address';
                }
                break;
            case 'text':
                if (!value) {
                    isValid = false;
                    message = 'This field is required';
                }
                break;
            case 'textarea':
                if (!value) {
                    isValid = false;
                    message = 'Message is required';
                } else if (value.length < 10) {
                    isValid = false;
                    message = 'Message should be at least 10 characters';
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, message);
        }

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('error');
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #dc3545;
            font-size: 0.8rem;
            margin-top: 0.25rem;
        `;
        
        field.parentNode.appendChild(errorElement);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        const fields = DOM.contactForm.querySelectorAll('input, textarea');
        let isFormValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            NotificationManager.show('Please fix the errors above', 'error');
            return;
        }

        const submitBtn = DOM.contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await this.submitForm();
            NotificationManager.show('Message sent successfully!', 'success');
            DOM.contactForm.reset();
        } catch (error) {
            NotificationManager.show('Failed to send message. Please try again.', 'error');
            console.error('Form submission error:', error);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async submitForm() {
        // Simulate API call delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random success/failure for demo
                Math.random() > 0.2 ? resolve() : reject(new Error('Server error'));
            }, 2000);
        });
    }
}

// ====== NOTIFICATION MANAGER ======
class NotificationManager {
    static show(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });

        const notification = this.createNotificationElement(message, type);
        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Auto remove
        setTimeout(() => {
            this.removeNotification(notification);
        }, CONFIG.notificationDuration);
    }

    static createNotificationElement(message, type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${icons[type]}"></i>
                <span>${message}</span>
                <button class="notification-close" aria-label="Close notification">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            background: this.getNotificationColor(type),
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            zIndex: '10000',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px'
        });

        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.removeNotification(notification));

        return notification;
    }

    static getNotificationColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8'
        };
        return colors[type] || colors.info;
    }

    static removeNotification(notification) {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// ====== TYPING EFFECT ======
class TypingEffect {
    constructor(element, text, speed = 100) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.init();
    }

    init() {
        this.element.innerHTML = '';
        this.type();
    }

    type() {
        let i = 0;
        const typeChar = () => {
            if (i < this.text.length) {
                this.element.innerHTML += this.text.charAt(i);
                i++;
                setTimeout(typeChar, this.speed);
            }
        };
        typeChar();
    }
}

// ====== LOADING MANAGER ======
class LoadingManager {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('load', () => {
            this.showLoadingAnimation();
        });

        // Handle page before unload
        window.addEventListener('beforeunload', () => {
            this.showLoadingAnimation();
        });
    }

    showLoadingAnimation() {
        const loader = document.createElement('div');
        loader.className = 'page-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <p>Loading Portfolio...</p>
            </div>
        `;

        Object.assign(loader.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '10000',
            transition: 'opacity 0.5s ease'
        });

        document.body.appendChild(loader);

        // Remove loader after delay
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
            }, 500);
        }, 1000);
    }
}

// ====== PERFORMANCE OPTIMIZATIONS ======
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadImages();
        this.optimizeScrollEvents();
        this.preventMultipleSubmissions();
    }

    lazyLoadImages() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    optimizeScrollEvents() {
        // Use passive event listeners for better performance
        const options = { passive: true };
        window.addEventListener('scroll', () => {}, options);
    }

    preventMultipleSubmissions() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            let isSubmitting = false;
            
            form.addEventListener('submit', (e) => {
                if (isSubmitting) {
                    e.preventDefault();
                    return;
                }
                
                isSubmitting = true;
                setTimeout(() => {
                    isSubmitting = false;
                }, 2000);
            });
        });
    }
}

// ====== ACCESSIBILITY ENHANCEMENTS ======
class AccessibilityManager {
    constructor() {
        this.init();
    }

    init() {
        this.addSkipLink();
        this.enhanceFocusManagement();
        this.addAriaLabels();
        this.handleKeyboardNavigation();
    }

    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        
        Object.assign(skipLink.style, {
            position: 'absolute',
            top: '-40px',
            left: '6px',
            background: '#000',
            color: '#fff',
            padding: '8px',
            zIndex: '10000',
            textDecoration: 'none'
        });

        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });

        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    enhanceFocusManagement() {
        const focusableElements = document.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );

        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.style.outline = '2px solid #667eea';
                element.style.outlineOffset = '2px';
            });

            element.addEventListener('blur', () => {
                element.style.outline = 'none';
            });
        });
    }

    addAriaLabels() {
        // Add aria-labels to interactive elements without text
        document.querySelectorAll('.hamburger').forEach(el => {
            el.setAttribute('aria-label', 'Toggle navigation menu');
        });

        document.querySelectorAll('.scroll-to-top').forEach(el => {
            el.setAttribute('aria-label', 'Scroll to top');
        });
    }

    handleKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Trap focus in mobile menu when open
            if (STATE.isMenuOpen && e.key === 'Tab') {
                this.trapFocusInMenu(e);
            }
        });
    }

    trapFocusInMenu(e) {
        const focusableElements = DOM.navMenu.querySelectorAll(
            'a, button, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
}

// ====== ERROR HANDLER ======
class ErrorHandler {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('error', (e) => {
            console.error('JavaScript error:', e.error);
            NotificationManager.show('Something went wrong. Please refresh the page.', 'error');
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            NotificationManager.show('A network error occurred. Please check your connection.', 'error');
        });
    }
}

// ====== MAIN APPLICATION ======
class PortfolioApp {
    constructor() {
        this.modules = {};
        this.init();
    }

    init() {
        // Initialize all modules
        this.modules.mobileNav = new MobileNavigation();
        this.modules.smoothScroll = new SmoothScrolling();
        this.modules.activeNav = new ActiveNavigation();
        this.modules.animations = new AnimationManager();
        this.modules.formHandler = new FormHandler();
        this.modules.loadingManager = new LoadingManager();
        this.modules.performance = new PerformanceOptimizer();
        this.modules.accessibility = new AccessibilityManager();
        this.modules.errorHandler = new ErrorHandler();

        // Initialize scroll to top button updates
        window.addEventListener('scroll', Utils.throttle(() => {
            this.modules.smoothScroll.updateScrollToTopButton();
        }, CONFIG.throttleDelay));

        // Add typing effect to hero title
        if (DOM.heroTitle) {
            setTimeout(() => {
                new TypingEffect(DOM.heroTitle, 'Siddharth Srivastava', 100);
            }, 500);
        }

        console.log('Portfolio application initialized successfully!');
    }
}

// ====== INITIALIZE APPLICATION ======
document.addEventListener('DOMContentLoaded', () => {
    // Check if all required DOM elements exist
    if (!DOM.hamburger || !DOM.navMenu) {
        console.error('Required DOM elements not found');
        return;
    }

    // Initialize the main application
    new PortfolioApp();
});

// ====== SERVICE WORKER REGISTRATION (Optional) ======
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
