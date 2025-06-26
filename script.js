document.addEventListener('DOMContentLoaded', function() {

    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    mobileMenuToggle?.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('nav') && navLinks?.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuToggle?.classList.remove('active');
        }
    });

    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
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
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPos = target.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPos,
                    behavior: 'smooth'
                });

                navLinks?.classList.remove('active');
                mobileMenuToggle?.classList.remove('active');
            }
        });
    });

    const forms = document.querySelectorAll('.contact-form');

    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const button = this.querySelector('.cta-button');
            const originalText = button.textContent;

            const name = formData.get('name');
            const phone = formData.get('phone');

            if (!name || !phone) {
                showMessage('Please fill in all required fields', 'error');
                return;
            }

            button.textContent = 'Sending...';
            button.disabled = true;

            try {
                await new Promise(resolve => setTimeout(resolve, 1500));
                showMessage('Thank you! We\'ll contact you within 12 hours.', 'success');
                form.reset();

            } catch (error) {
                showMessage('Something went wrong. Please try again.', 'error');
            } finally {
                button.textContent = originalText;
                button.disabled = false;
            }
        });
    });

    function showMessage(text, type) {
        const existingMsg = document.querySelector('.message');
        if (existingMsg) existingMsg.remove();

        const message = document.createElement('div');
        message.className = `message ${type}`;
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
        `;
        message.textContent = text;

        document.body.appendChild(message);

        setTimeout(() => {
            message.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => message.remove(), 300);
        }, 4000);
    }

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes slideOut {
            from { opacity: 1; transform: translateX(-50%) translateY(0); }
            to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
    `;
    document.head.appendChild(style);

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

    document.querySelectorAll('.section, .product-card, .service-card').forEach(el => {
        observer.observe(el);
    });

});
