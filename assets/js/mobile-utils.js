/**
 * Mobile Utilities - VERSIÓN CORREGIDA CON SOPORTE MENÚ MÓVIL
 * Nodra Soluciones Digitales
 * Esta versión mejora la funcionalidad móvil y resuelve problemas de scroll
 */

class MobileUtils {
  constructor() {
    this.isMobile = window.innerWidth <= 768;
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    this.isAndroid = /Android/.test(navigator.userAgent);
    this.scrollPosition = 0;
    this.lastScrollPosition = 0;
    this.isMenuOpen = false; // Track menu state
    
    this.init();
  }

  init() {
    this.handleViewportHeight();
    this.handleScrollBehavior();
    this.handleTouchOptimizations();
    this.handlePerformanceOptimizations();
    this.handleOrientationChange();
    this.addMobileClasses();
    this.setupMobileMenuIntegration();
    
  }

  // ========== INTEGRACIÓN CON MENÚ MÓVIL ==========
  setupMobileMenuIntegration() {
    // Escuchar eventos del menú móvil
    document.addEventListener('mobileMenuOpen', () => {
      this.isMenuOpen = true;
      this.handleMenuOpen();
    });

    document.addEventListener('mobileMenuClose', () => {
      this.isMenuOpen = false;
      this.handleMenuClose();
    });

    // Verificar si el menú ya está abierto
    setTimeout(() => {
      const body = document.body;
      if (body && body.classList.contains('menu-open')) {
        this.isMenuOpen = true;
      }
    }, 100);
  }

  handleMenuOpen() {
    
    // Deshabilitar scroll del header dinámico mientras el menú está abierto
    const header = document.getElementById('header');
    if (header) {
      header.style.transform = 'translateY(0)';
      header.style.transition = 'none';
    }
    
    // Pausar otros efectos de scroll
    this.pauseScrollEffects = true;
  }

  handleMenuClose() {
    
    // Reactivar efectos de scroll
    this.pauseScrollEffects = false;
    
    // Restaurar transición del header
    const header = document.getElementById('header');
    if (header) {
      setTimeout(() => {
        header.style.transition = 'transform 0.3s ease';
      }, 100);
    }
  }

  // ========== VIEWPORT HEIGHT ==========
  handleViewportHeight() {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', () => {
      setTimeout(setVH, 100);
    });
  }

  // ========== SCROLL BEHAVIOR MEJORADO ==========
  handleScrollBehavior() {
    let ticking = false;

    const updateScrollPosition = () => {
      this.scrollPosition = window.pageYOffset;
      
      // Solo aplicar efectos si el menú no está abierto
      if (!this.isMenuOpen && !this.pauseScrollEffects) {
        this.handleDynamicHeader();
        this.handleScrollEffects();
      }
      
      ticking = false;
    };

    // CORREGIDO: usar passive: true para evitar problemas
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollPosition);
        ticking = true;
      }
    }, { passive: true });
  }

  handleDynamicHeader() {
    if (!this.isMobile) return;

    const header = document.getElementById('header');
    if (!header) return;

    if (!this.lastScrollPosition) {
      this.lastScrollPosition = 0;
    }
    
    const currentScrollPosition = this.scrollPosition;
    const scrollDelta = currentScrollPosition - this.lastScrollPosition;
    
    // Solo ocultar header si se hace scroll hacia abajo rápidamente
    if (scrollDelta > 5 && currentScrollPosition > 100) {
      header.style.transform = 'translateY(-100%)';
    } else if (scrollDelta < -5 || currentScrollPosition <= 100) {
      header.style.transform = 'translateY(0)';
    }
    
    this.lastScrollPosition = currentScrollPosition;
  }

  handleScrollEffects() {
    // Efectos de parallax para floating cards (solo si están visibles)
    const floatingCards = document.querySelectorAll('.floating-card');
    if (floatingCards.length > 0 && window.innerWidth > 480) {
      const scrolled = this.scrollPosition;
      const rate = scrolled * -0.1; // Efecto sutil
      
      floatingCards.forEach((card, index) => {
        const speed = (index + 1) * 0.05;
        card.style.transform += ` translateY(${rate * speed}px)`;
      });
    }
  }

  // ========== OPTIMIZACIONES TOUCH ==========
  handleTouchOptimizations() {
    // Prevenir zoom accidental en inputs
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (input.type !== 'range') {
        input.style.fontSize = '16px';
      }
    });

    // CORREGIDO: solo para iOS y sin preventDefault problemático
    if (this.isIOS) {
      // Mejorar responsividad de touch sin bloquear scroll
      document.addEventListener('touchstart', () => {}, { passive: true });
    }

    this.addFastClickToElements();
    this.handleVirtualKeyboard();
  }

  addFastClickToElements() {
    const clickableElements = document.querySelectorAll('button, .btn, .cta-button, .service-card');
    
    clickableElements.forEach(element => {
      // CORREGIDO: sin touch-action restrictivo, solo cursor
      element.style.cursor = 'pointer';
      
      // Añadir feedback visual en touch
      element.addEventListener('touchstart', () => {
        element.style.opacity = '0.8';
      }, { passive: true });
      
      element.addEventListener('touchend', () => {
        element.style.opacity = '1';
      }, { passive: true });
    });
  }

  // ========== VIRTUAL KEYBOARD HANDLING ==========
  handleVirtualKeyboard() {
    const initialViewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    
    const handleViewportChange = () => {
      const currentHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      if (heightDifference > 150) {
        document.documentElement.classList.add('keyboard-visible');
        
        // Ajustar header cuando aparece el teclado
        const header = document.querySelector('.header');
        if (header && !this.isMenuOpen) {
          header.style.position = 'absolute';
        }
      } else {
        document.documentElement.classList.remove('keyboard-visible');
        
        // Restaurar header
        const header = document.querySelector('.header');
        if (header && !this.isMenuOpen) {
          header.style.position = 'fixed';
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      window.addEventListener('resize', handleViewportChange);
    }
  }

  // ========== PERFORMANCE OPTIMIZATIONS ==========
  handlePerformanceOptimizations() {
    if (!this.isMobile) return;

    this.disableHeavyAnimations();
    this.implementLazyLoading();
    this.optimizeBackdropFilters();
    this.optimizeImages();
  }

  disableHeavyAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        /* Mantener floating cards pero con animación más ligera */
        .floating-card {
          animation-duration: 8s !important;
          animation-timing-function: ease-in-out !important;
        }
        
        /* Deshabilitar animaciones de fondo pesadas */
        .bg-orb {
          animation: none !important;
          display: none !important;
        }
        
        /* Transiciones más rápidas */
        * {
          transition-duration: 0.2s !important;
        }
        
        /* Excepciones para elementos importantes */
        .mobile-nav,
        .mobile-nav a,
        .mobile-menu-toggle {
          transition-duration: 0.3s !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  implementLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    }
  }

  optimizeBackdropFilters() {
    if (!this.isMobile) return;

    const glassElements = document.querySelectorAll('.glass-effect, .contact-form, .modal-content, .use-case-card, .service-card');
    
    glassElements.forEach(element => {
      // Reducir blur en móvil para mejor performance
      element.style.backdropFilter = 'blur(8px)';
    });

    // Optimizar específicamente el menú móvil
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileNav) {
      mobileNav.style.backdropFilter = 'blur(20px)';
    }
  }

  optimizeImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      if ('loading' in HTMLImageElement.prototype) {
        img.loading = 'lazy';
      }
      
      // Optimizar tamaños en móvil
      if (this.isMobile && !img.dataset.optimized) {
        const src = img.src;
        if (src && !src.includes('w=')) {
          // Si usas un CDN que soporte redimensionado, añadir parámetros
          // img.src = src + '?w=400&h=300&fit=crop';
        }
        img.dataset.optimized = 'true';
      }
    });
  }

  // ========== ORIENTATION CHANGE ==========
  handleOrientationChange() {
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.isMobile = window.innerWidth <= 768;
        this.handleViewportHeight();
        this.adjustLayoutForOrientation();
        
        // Cerrar menú móvil si está abierto en cambio de orientación
        if (this.isMenuOpen && window.mobileMenuHandler) {
          window.mobileMenuHandler.closeMenu();
        }
      }, 100);
    });
  }

  adjustLayoutForOrientation() {
    const hero = document.querySelector('.hero');
    const heroVisual = document.querySelector('.hero-visual');
    
    // En landscape móvil, ajustar hero
    if (window.innerHeight < 600 && window.innerWidth > window.innerHeight) {
      if (heroVisual) {
        heroVisual.style.height = '250px';
      }
      if (hero) {
        hero.style.minHeight = '100vh';
      }
    } else {
      if (heroVisual) {
        heroVisual.style.height = '';
      }
    }
  }

  // ========== MOBILE CLASSES ==========
  addMobileClasses() {
    const html = document.documentElement;
    
    if (this.isMobile) html.classList.add('is-mobile');
    if (this.isIOS) html.classList.add('is-ios');
    if (this.isAndroid) html.classList.add('is-android');
    
    // Detectar notch en iOS
    if (this.isIOS && window.innerHeight > 800) {
      html.classList.add('has-notch');
    }

    // Añadir clase para debugging
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
      html.classList.add('is-development');
    }
  }

  // ========== MÉTODOS PÚBLICOS ESTÁTICOS ==========
  static isMobileDevice() {
    return window.innerWidth <= 768;
  }

  static preventZoom() {
    // Prevenir zoom por doble tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  }

  static smoothScrollTo(element, offset = 0) {
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

  static fixMobileViewport() {
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
  }

  static optimizeScrollPerformance() {
    let ticking = false;
    
    const optimizedScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          ticking = false;
        });
        ticking = true;
      }
    };

    // CORREGIDO: usar passive listeners
    window.addEventListener('scroll', optimizedScroll, { passive: true });
    window.addEventListener('touchmove', optimizedScroll, { passive: true });
  }

  static preventBounceScroll() {
    // Versión más suave que no causa Intervention errors
    let isScrolling = false;
    
    document.addEventListener('touchstart', () => {
      isScrolling = false;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
      // Solo intervenir en casos muy específicos
      if (e.target.closest('.mobile-nav, .modal-content')) {
        return; // Permitir scroll en estos elementos
      }
      isScrolling = true;
    }, { passive: true }); // IMPORTANTE: passive: true para evitar problemas
  }

  static debugMobileInfo() {
      screenWidth: screen.width,
      screenHeight: screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      touchSupport: 'ontouchstart' in window,
      orientation: screen.orientation ? screen.orientation.angle : 'unknown',
      viewport: document.querySelector('meta[name="viewport"]')?.content || 'not found'
    });
  }

  // ========== DEBUGGING METHODS ==========
  debug() {
      isMobile: this.isMobile,
      isIOS: this.isIOS,
      isAndroid: this.isAndroid,
      isMenuOpen: this.isMenuOpen,
      scrollPosition: this.scrollPosition,
      pauseScrollEffects: this.pauseScrollEffects,
      windowSize: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }

  // ========== MENU INTEGRATION HELPERS ==========
  onMenuStateChange(callback) {
    document.addEventListener('mobileMenuOpen', () => callback(true));
    document.addEventListener('mobileMenuClose', () => callback(false));
  }

  isMenuCurrentlyOpen() {
    return this.isMenuOpen;
  }
}

// ========== INICIALIZACIÓN AUTOMÁTICA ==========
let mobileUtils;

function initMobileUtils() {
  // Aplicar fixes inmediatos
  MobileUtils.fixMobileViewport();
  MobileUtils.preventZoom();
  
  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      mobileUtils = new MobileUtils();
      MobileUtils.optimizeScrollPerformance();
      MobileUtils.preventBounceScroll();
      
      // Debug en desarrollo
      if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
        setTimeout(() => MobileUtils.debugMobileInfo(), 1000);
      }
    });
  } else {
    mobileUtils = new MobileUtils();
    MobileUtils.optimizeScrollPerformance();
    MobileUtils.preventBounceScroll();
  }
}

// Ejecutar inmediatamente
initMobileUtils();

// ========== EXPORTAR PARA USO GLOBAL ==========
window.MobileUtils = MobileUtils;
window.mobileUtils = mobileUtils;

