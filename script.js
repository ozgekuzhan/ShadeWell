document.addEventListener('DOMContentLoaded', function() {
    initSmoothScrolling();
    initFAQAccordion();
    initFormHandling();
    initMobileMenu();
    initGLightbox();
    initReviewsCarousel();
    initScrollToTop();
});

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // If target is quoteName input field, focus on it after scroll
                if (href === '#quoteName' && target.tagName === 'INPUT') {
                    setTimeout(() => {
                        target.focus();
                    }, 1000);
                }
            }
        });
    });
}


function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        item.addEventListener('click', function() {
            const isActive = this.classList.contains('active');

            // Tüm FAQ'ları kapat
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });

            // Eğer tıklanan önceden kapalıysa, aç
            if (!isActive) {
                this.classList.add('active');
            }
        });
    });
}


function initFormHandling() {
    const quoteForm = document.getElementById('quoteForm');

    if (quoteForm) {
        quoteForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;

            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            try {
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: new FormData(this),
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    showNotification('Thank you! We will contact you within 24 hours.', 'success');
                    this.reset();
                } else {
                    showNotification('Something went wrong. Please try again.', 'error');
                }
            } catch (error) {
                showNotification('Connection error. Please try again.', 'error');
            } finally {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }
}

function initGLightbox() {
    const lightbox = GLightbox({
        touchNavigation: true,
        loop: true,
        autoplayVideos: false
    });
}

function initReviewsCarousel() {
    const track = document.querySelector('.reviews-track');
    const slides = document.querySelectorAll('.review-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prevReview');
    const nextBtn = document.getElementById('nextReview');
    let currentSlide = 0;

    function showSlide(index) {
        const translateX = -index * 100;
        track.style.transform = `translateX(${translateX}%)`;
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        
        currentSlide = index;
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
        showSlide(currentSlide);
    }

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    // Auto-advance every 5 seconds
    setInterval(nextSlide, 5000);
}

function showNotification(message, type = 'success') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        backgroundColor: type === 'success' ? '#38a169' : '#e53e3e',
        color: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '10000',
        transform: 'translateX(400px)',
        transition: 'transform 0.3s ease'
    });

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function initMobileMenu() {
    // Bootstrap collapse otomatik olarak çalışır
    // Ek JavaScript gerekmez
}

function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (!scrollToTopBtn) return;

    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    // Scroll to top when button is clicked
    scrollToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
