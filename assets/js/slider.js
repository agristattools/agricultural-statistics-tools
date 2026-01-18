/**
 * Hero Image Slider Controller
 * Pure CSS-based slider with JavaScript enhancements
 */

document.addEventListener('DOMContentLoaded', function() {
    const heroSlider = document.querySelector('.hero-slider');
    const sliderContainer = document.querySelector('.slider-container');
    
    if (!heroSlider || !sliderContainer) return;
    
    // Pause animation when tab is not visible
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            sliderContainer.style.animationPlayState = 'paused';
        } else {
            sliderContainer.style.animationPlayState = 'running';
        }
    });
    
    // Preload slider images for better performance
    function preloadSliderImages() {
        const images = [
            'assets/img/slider/statistical-analysis.jpg',
            'assets/img/slider/data-science.jpg',
            'assets/img/slider/agricultural-research.jpg',
            'assets/img/slider/scientific-visualization.jpg',
            'assets/img/slider/research-collaboration.jpg'
        ];
        
        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
    
    // Initialize
    preloadSliderImages();
    
    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            // Can be extended for manual navigation if needed
        }
    });
    
    // Add touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    heroSlider.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    heroSlider.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            // Can be extended for manual swipe navigation
            console.log('Swipe detected:', diff > 0 ? 'left' : 'right');
        }
    }
});
