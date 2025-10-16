# Portfolio Website - Enhanced with Smooth Animations

A modern portfolio website built with Framer, enhanced with custom smooth animations and improved user experience.

## 🚀 Features

### ✨ Smooth Animations
- **Scroll-triggered animations** using Intersection Observer API
- **Multiple animation types**: slide-up, scale-in, slide-left, slide-right
- **Staggered animations** with configurable delays
- **Smooth hover effects** for interactive elements
- **Accessibility support** with `prefers-reduced-motion` media query

### 🎯 User Experience
- **Scroll-to-top on refresh** - Always starts at the top of the page
- **Smooth scroll behavior** throughout the site
- **Performance optimized** with throttled scroll events
- **Cross-browser compatible** with fallbacks for older browsers

## 📁 Project Structure

```
PortfolioFramer/
├── page.html                 # Main HTML file
├── styles/
│   └── animations.css        # Animation styles and effects
├── scripts/
│   └── animations.js         # Animation logic and scroll handling
├── works/                    # Portfolio work pages
├── articles/                 # Blog/article pages
├── about/                    # About page
├── contact/                  # Contact page
└── README.md                 # This file
```

## 🎨 Animation Classes

### Base Classes
- `.smooth-animate` - Base animation class
- `.fade-in` - Triggers the animation

### Animation Types
- `.slide-up` - Slides up from bottom
- `.scale-in` - Scales in with slight upward movement
- `.slide-left` - Slides in from right
- `.slide-right` - Slides in from left

### Delay Classes
- `.delay-1` through `.delay-6` - Staggered animation delays

### Interactive Effects
- `.smooth-hover` - Smooth hover transform effect

## 🔧 Usage

### Adding Animations to Elements

```html
<!-- Basic slide-up animation -->
<section class="smooth-animate slide-up">
    Content here
</section>

<!-- Staggered animations -->
<div class="smooth-animate slide-up">First item</div>
<div class="smooth-animate slide-up delay-1">Second item</div>
<div class="smooth-animate slide-up delay-2">Third item</div>

<!-- Scale-in animation -->
<div class="smooth-animate scale-in">
    Scaled content
</div>
```

### JavaScript API

The animation system provides a public API:

```javascript
// Access the animation system
const animations = window.SmoothAnimations;

// Get the intersection observer
const observer = animations.observer();

// Access configuration
const config = animations.config;
```

## ⚙️ Configuration

Animation behavior can be configured in `scripts/animations.js`:

```javascript
const CONFIG = {
    observer: {
        threshold: 0.1,           // Trigger when 10% visible
        rootMargin: '0px 0px -50px 0px'  // Trigger 50px before entering viewport
    },
    scroll: {
        smooth: true,             // Enable smooth scrolling
        forceTopOnLoad: true      // Force scroll to top on page load
    },
    performance: {
        throttleDelay: 16         // ~60fps throttling
    }
};
```

## 🎯 Performance Features

- **Intersection Observer** for efficient scroll detection
- **RequestAnimationFrame** for smooth scroll animations
- **Throttled scroll events** to maintain 60fps
- **Will-change optimization** for GPU acceleration
- **Unobserve after animation** to reduce memory usage

## ♿ Accessibility

- **Respects `prefers-reduced-motion`** - Disables animations for users who prefer reduced motion
- **Semantic HTML** structure maintained
- **Keyboard navigation** support
- **Screen reader** friendly

## 🌐 Browser Support

- **Modern browsers** with full feature support
- **Fallbacks** for older browsers without Intersection Observer
- **Progressive enhancement** approach

## 📱 Responsive Design

- **Mobile-first** approach
- **Touch-friendly** interactions
- **Optimized animations** for mobile devices

## 🚀 Deployment

The website is ready for deployment to any static hosting service:

- **Netlify** - Drag and drop the entire folder
- **Vercel** - Connect your repository
- **GitHub Pages** - Push to a repository
- **Any static host** - Upload all files

## 🔧 Customization

### Adding New Animation Types

1. Add CSS classes in `styles/animations.css`:

```css
.smooth-animate.new-animation {
    transform: translateX(100px) rotate(10deg);
}

.smooth-animate.new-animation.fade-in {
    transform: translateX(0) rotate(0deg);
}
```

2. Use the new class in your HTML:

```html
<div class="smooth-animate new-animation">
    Content with custom animation
</div>
```

### Modifying Animation Timing

Update the CSS transition properties:

```css
.smooth-animate {
    transition: all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support or questions, please open an issue in the repository or contact the developer.
