/**
 * ========================================
 * SMOOTH ANIMATIONS JAVASCRIPT
 * ========================================
 * 
 * Handles smooth scroll animations and page behavior
 * Features:
 * - Intersection Observer for scroll-triggered animations
 * - Scroll-to-top on page load/refresh
 * - Smooth hover effects
 * - Accessibility support
 * - Performance optimizations
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        observer: {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        },
        scroll: {
            smooth: true,
            forceTopOnLoad: true
        },
        performance: {
            throttleDelay: 16 // ~60fps
        }
    };

    // State management
    let observer = null;
    let ticking = false;

    /**
     * Initialize the animation system
     */
    function init() {
        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            handleReducedMotion();
            return;
        }

        // Initialize components
        initScrollToTop();
        initIntersectionObserver();
        initHoverEffects();
        initScrollAnimations();
    }

    /**
     * Handle users who prefer reduced motion
     */
    function handleReducedMotion() {
        // Show all elements immediately
        document.querySelectorAll('.smooth-animate').forEach(element => {
            element.classList.add('fade-in');
        });
    }

    /**
     * Force scroll to top on page load/refresh
     */
    function initScrollToTop() {
        if (!CONFIG.scroll.forceTopOnLoad) return;

        // Immediate scroll to top
        window.scrollTo(0, 0);
        
        // Also handle cases where browser restores scroll position
        window.addEventListener('beforeunload', () => {
            window.scrollTo(0, 0);
        });

        // Handle page load completion
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.scrollTo(0, 0);
            });
        }
    }

    /**
     * Initialize Intersection Observer for scroll animations
     */
    function initIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            document.querySelectorAll('.smooth-animate').forEach(element => {
                element.classList.add('fade-in');
            });
            return;
        }

        observer = new IntersectionObserver(handleIntersection, CONFIG.observer);

        // Observe all elements with smooth-animate class
        document.querySelectorAll('.smooth-animate').forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * Handle intersection observer callbacks
     */
    function handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                // Unobserve after animation to improve performance
                observer.unobserve(entry.target);
            }
        });
    }

    /**
     * Initialize smooth hover effects
     */
    function initHoverEffects() {
        // Add smooth hover effects to interactive elements
        const interactiveElements = document.querySelectorAll('a, button, [role="button"]');
        interactiveElements.forEach(element => {
            element.classList.add('smooth-hover');
        });
    }

    /**
     * Initialize scroll-based animations
     */
    function initScrollAnimations() {
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    /**
     * Handle scroll events with throttling
     */
    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(updateScrollAnimations);
            ticking = true;
        }
    }

    /**
     * Update scroll-based animations
     */
    function updateScrollAnimations() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('[data-parallax]');

        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.parallax) || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });

        ticking = false;
    }

    /**
     * Public API for external use
     */
    window.SmoothAnimations = {
        init: init,
        observer: () => observer,
        config: CONFIG
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
