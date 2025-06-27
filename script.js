document.addEventListener('DOMContentLoaded', function() {
    // Performance: Use passive event listeners where appropriate
    const passiveSupported = checkPassiveSupport();

    // Header scroll effect
    const header = document.querySelector('header');
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateHeader() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick, passiveSupported ? { passive: true } : false);

    // Mobile menu functionality
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    mobileMenuToggle?.addEventListener('click', function() {
        const isOpen = this.classList.contains('active');
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
        this.setAttribute('aria-expanded', !isOpen);

        // Trap focus when menu is open
        if (!isOpen) {
            navLinks.querySelector('a').focus();
        }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('nav') && navLinks?.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuToggle?.classList.remove('active');
            mobileMenuToggle?.setAttribute('aria-expanded', 'false');
        }
    });

    // Escape key closes mobile menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navLinks?.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuToggle?.classList.remove('active');
            mobileMenuToggle?.setAttribute('aria-expanded', 'false');
            mobileMenuToggle?.focus();
        }
    });

    // Active navigation highlighting
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a');

    function highlightNavigation() {
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${id}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNavigation, passiveSupported ? { passive: true } : false);

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);

            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPos = target.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPos,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                navLinks?.classList.remove('active');
                mobileMenuToggle?.classList.remove('active');
                mobileMenuToggle?.setAttribute('aria-expanded', 'false');

                // Update URL without jumping
                history.pushState(null, null, targetId);

                // Focus management for accessibility
                target.setAttribute('tabindex', '-1');
                target.focus();
            }
        });
    });

    // Form handling with better UX
    const forms = document.querySelectorAll('.contact-form');

    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const button = this.querySelector('.cta-button');
            const originalText = button.textContent;

            // Validation
            const name = formData.get('name');
            const phone = formData.get('phone');

            if (!name || !phone) {
                showMessage('Please fill in all required fields', 'error');
                return;
            }

            // Phone validation for Canadian numbers
            const phoneNumber = phone.replace(/\D/g, '');
            const countryCode = formData.get('country_code');

            if (countryCode === '+1' && phoneNumber.length !== 10) {
                showMessage('Please enter a valid 10-digit phone number', 'error');
                return;
            }

            button.textContent = 'Sending...';
            button.disabled = true;

            try {
                // Track form submission for analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        'event_category': 'Contact',
                        'event_label': form.id || 'contact-form'
                    });
                }

                // Simulate form submission (replace with actual endpoint)
                await new Promise(resolve => setTimeout(resolve, 1500));

                showMessage('Thank you! We\'ll contact you within 4 hours during business hours.', 'success');
                form.reset();

                // Focus on success message for screen readers
                const message = document.querySelector('.message');
                message?.setAttribute('role', 'alert');
                message?.focus();

            } catch (error) {
                showMessage('Something went wrong. Please call us at (647) 405-7213.', 'error');
                console.error('Form submission error:', error);
            } finally {
                button.textContent = originalText;
                button.disabled = false;
            }
        });
    });

    // Show message function with accessibility
    function showMessage(text, type) {
        const existingMsg = document.querySelector('.message');
        if (existingMsg) existingMsg.remove();

        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.setAttribute('role', 'alert');
        message.setAttribute('aria-live', 'polite');
        message.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 30px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#059669' : '#dc2626'};
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        message.textContent = text;

        document.body.appendChild(message);

        setTimeout(() => {
            message.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => message.remove(), 300);
        }, 5000);
    }

    // Canadian phone number formatting
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            const countryCode = this.closest('.phone-group')?.querySelector('.country-select')?.value;

            if (countryCode === '+1' && value.length <= 10) {
                if (value.length >= 6) {
                    value = value.replace(/(\d{3})(\d{3})(\d+)/, '($1) $2-$3');
                } else if (value.length >= 3) {
                    value = value.replace(/(\d{3})(\d+)/, '($1) $2');
                }
            }

            e.target.value = value;
        });
    });

    // Intersection Observer for lazy animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(20px)';

                setTimeout(() => {
                    entry.target.style.transition = 'all 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.section, .product-card, .service-card, .stat');
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // Lazy load images
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
    }

    // Check for passive event listener support
    function checkPassiveSupport() {
        let passiveSupported = false;
        try {
            const options = {
                get passive() {
                    passiveSupported = true;
                    return false;
                }
            };
            window.addEventListener('test', null, options);
            window.removeEventListener('test', null, options);
        } catch (err) {
            passiveSupported = false;
        }
        return passiveSupported;
    }

    // Print tracking for analytics
    window.addEventListener('beforeprint', function() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'print', {
                'event_category': 'Engagement',
                'event_label': 'Page Print'
            });
        }
    });

    // Track outbound links
    document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]').forEach(link => {
        link.addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                const linkType = this.href.startsWith('tel:') ? 'phone' : 'email';
                gtag('event', 'click', {
                    'event_category': 'Contact',
                    'event_label': linkType
                });
            }
        });
    });

    // Performance: Clean up animations after completion
    document.addEventListener('animationend', function(e) {
        if (e.target.classList.contains('message')) {
            e.target.remove();
        }
    });

    // Postal code validation for Canadian format
    const postalCodeInputs = document.querySelectorAll('input[name="postal_code"]');
    postalCodeInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.toUpperCase();
            // Auto-format Canadian postal code
            if (value.length === 3 && !value.includes(' ')) {
                value += ' ';
            }
            e.target.value = value;
        });
    });

});
