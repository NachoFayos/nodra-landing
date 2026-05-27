/**
 * Scroll Intervention Fix - VERSIÓN ACTUALIZADA CON SOPORTE MENÚ MÓVIL
 * Este script elimina los event listeners que causan el error de Intervention
 * y los reemplaza con versiones compatibles, manteniendo el menú móvil funcional
 */

(function() {
  'use strict';
  
  
  // ========== 1. INTERCEPTAR EVENT LISTENERS PROBLEMÁTICOS ==========
  function interceptProblematicEventListeners() {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      // Detectar eventos touchmove/touchstart que podrían ser problemáticos
      if (type === 'touchmove' || type === 'touchstart') {
        // Excepción: permitir non-passive para elementos del menú móvil
        const isMenuElement = this.closest && (
          this.closest('.mobile-nav') ||
          this.closest('.mobile-menu-toggle') ||
          this.closest('.mobile-nav-overlay') ||
          this.classList?.contains('mobile-nav') ||
          this.classList?.contains('mobile-menu-toggle')
        );
        
        if (!isMenuElement) {
          // Forzar passive: true para elementos que NO son del menú móvil
          if (typeof options === 'boolean') {
            options = { capture: options, passive: true };
          } else if (typeof options === 'object' && options !== null) {
            options = { ...options, passive: true };
          } else {
            options = { passive: true };
          }
          
        } else {
        }
      }
      
      return originalAddEventListener.call(this, type, listener, options);
    };
  }
  
  // ========== 2. APLICAR FIXES ESPECÍFICOS PARA SCROLL ==========
  function applyScrollFixes() {
    // Asegurar que el body permite scroll natural
    document.body.style.touchAction = 'auto';
    document.documentElement.style.touchAction = 'auto';
    
    // Asegurar que elementos clave no bloquean scroll
    const heroElements = document.querySelectorAll('.hero, .hero-content, .hero-visual');
    heroElements.forEach(el => {
      if (el) {
        el.style.touchAction = 'auto';
        el.style.pointerEvents = 'auto';
      }
    });
    
    // Floating cards no deben interferir con scroll
    const floatingCards = document.querySelectorAll('.floating-card');
    floatingCards.forEach(card => {
      card.style.pointerEvents = 'none';
      card.style.touchAction = 'auto';
    });
    
    // EXCEPCIÓN: Elementos del menú móvil pueden usar touch-action específico
    const mobileMenuElements = document.querySelectorAll('.mobile-nav, .mobile-menu-toggle, .mobile-nav-overlay');
    mobileMenuElements.forEach(el => {
      // Permitir que el menú móvil maneje sus propios touch events
      el.style.touchAction = 'manipulation';
    });
    
  }
  
  // ========== 3. REEMPLAZAR TOUCH GESTURES PROBLEMÁTICOS ==========
  function replaceProblematicTouchGestures() {
    // Variables para tracking de touch
    let touchStartX = null;
    let touchStartY = null;
    let isTouchingMenu = false;
    
    // Touch start - detectar si está tocando el menú
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      
      // Verificar si el touch está en elementos del menú
      const target = e.target;
      isTouchingMenu = target.closest('.mobile-nav') || 
                      target.closest('.mobile-menu-toggle') || 
                      target.closest('.mobile-nav-overlay') ||
                      target.classList.contains('mobile-nav') ||
                      target.classList.contains('mobile-menu-toggle');
      
    }, { passive: true });
    
    // Touch end - manejar gestos
    document.addEventListener('touchend', (e) => {
      if (!touchStartX || !touchStartY) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const deltaX = touchStartX - touchEndX;
      const deltaY = touchStartY - touchEndY;
      
      // Solo manejar swipes horizontales y no en elementos del menú
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && !isTouchingMenu) {
        if (deltaX < 0) {
          // Swipe hacia la derecha - cerrar menú si está abierto
          const mobileNav = document.querySelector('.mobile-nav.active');
          if (mobileNav && window.mobileMenuHandler) {
            window.mobileMenuHandler.closeMenu();
          }
        }
      }
      
      touchStartX = null;
      touchStartY = null;
      isTouchingMenu = false;
    }, { passive: true });
    
  }
  
  // ========== 4. OVERRIDE DE PREVENTDEFAULT SELECTIVO ==========
  function overrideProblematicFunctions() {
    // Override selectivo de preventDefault
    const originalPreventDefault = Event.prototype.preventDefault;
    Event.prototype.preventDefault = function() {
      // Solo permitir preventDefault en casos muy específicos
      if (this.type === 'touchmove' || this.type === 'touchstart') {
        const target = this.target;
        
        // PERMITIR preventDefault para elementos del menú móvil
        const isMenuElement = target.closest('.mobile-nav') || 
                             target.closest('.mobile-menu-toggle') || 
                             target.closest('.mobile-nav-overlay') ||
                             target.closest('input, textarea, select, .modal-content');
        
        if (isMenuElement) {
          return originalPreventDefault.call(this);
        }
        
        // BLOQUEAR preventDefault para otros elementos que causan problemas
        return; // No ejecutar preventDefault
      }
      
      // Para otros tipos de eventos, permitir preventDefault normal
      return originalPreventDefault.call(this);
    };
  }
  
  // ========== 5. FIX ESPECÍFICO PARA ELEMENTOS DE SCROLL ==========
  function fixScrollElements() {
    // Hero section debe permitir scroll completo
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.style.overflow = 'visible';
      hero.style.touchAction = 'auto';
      hero.style.pointerEvents = 'auto';
    }
    
    // Botones deben ser clickeables pero no bloquear scroll
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .cta-button');
    buttons.forEach(btn => {
      btn.style.touchAction = 'auto';
      btn.style.pointerEvents = 'auto';
    });
    
    // Asegurar que el contenido del hero es interactivo
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      heroContent.style.pointerEvents = 'auto';
      heroContent.style.touchAction = 'auto';
      
      // Hacer que el texto sea seleccionable
      const textElements = heroContent.querySelectorAll('h1, p');
      textElements.forEach(el => {
        el.style.userSelect = 'text';
        el.style.webkitUserSelect = 'text';
        el.style.cursor = 'text';
        el.style.touchAction = 'auto';
      });
    }
    
    // IMPORTANTE: Configurar elementos del menú móvil para que funcionen correctamente
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileNav) {
      mobileNav.style.touchAction = 'manipulation';
      mobileNav.style.pointerEvents = 'auto';
      
      // Enlaces del menú
      const mobileLinks = mobileNav.querySelectorAll('a');
      mobileLinks.forEach(link => {
        link.style.touchAction = 'manipulation';
        link.style.pointerEvents = 'auto';
      });
    }
    
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileToggle) {
      mobileToggle.style.touchAction = 'manipulation';
      mobileToggle.style.pointerEvents = 'auto';
    }
    
  }
  
  // ========== 6. MONITOREAR CREACIÓN DE ELEMENTOS DEL MENÚ ==========
  function setupMobileMenuMonitor() {
    // Observer para detectar cuando se crean elementos del menú móvil
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Si se añade el menú móvil, configurarlo
            if (node.classList?.contains('mobile-nav') || 
                node.querySelector?.('.mobile-nav')) {
              setTimeout(() => fixScrollElements(), 100);
            }
            
            // Si se añade la hamburguesa, configurarla
            if (node.classList?.contains('mobile-menu-toggle') || 
                node.querySelector?.('.mobile-menu-toggle')) {
              setTimeout(() => fixScrollElements(), 100);
            }
          }
        });
      });
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
  }
  
  // ========== 7. APLICAR TODOS LOS FIXES ==========
  function applyAllFixes() {
    try {
      interceptProblematicEventListeners();
      applyScrollFixes();
      replaceProblematicTouchGestures();
      overrideProblematicFunctions();
      fixScrollElements();
      setupMobileMenuMonitor();
      
      
      // Verificar después de un momento
      setTimeout(() => {
        verifyFixes();
      }, 1000);
      
    } catch (error) {
      console.error('Error aplicando fixes:', error);
    }
  }
  
  // ========== 8. VERIFICAR QUE LOS FIXES FUNCIONAN ==========
  function verifyFixes() {
    const body = document.body;
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    const checks = {
      bodyTouchAction: getComputedStyle(body).touchAction,
      heroTouchAction: hero ? getComputedStyle(hero).touchAction : 'N/A',
      heroContentPointerEvents: heroContent ? getComputedStyle(heroContent).pointerEvents : 'N/A',
      mobileNavExists: !!mobileNav,
      mobileNavTouchAction: mobileNav ? getComputedStyle(mobileNav).touchAction : 'N/A',
      mobileToggleExists: !!mobileToggle,
      mobileToggleTouchAction: mobileToggle ? getComputedStyle(mobileToggle).touchAction : 'N/A',
      floatingCardsCount: document.querySelectorAll('.floating-card').length
    };
    
    
    // Verificar que el menú móvil puede manejar touch events
    if (mobileNav && getComputedStyle(mobileNav).touchAction === 'auto') {
      console.warn('Menú móvil tiene touch-action: auto, podría necesitar manipulation');
    }
  }
  
  // ========== 9. INTEGRACIÓN CON MOBILE MENU HANDLER ==========
  function setupMobileMenuIntegration() {
    // Escuchar cuando se abra/cierre el menú móvil
    document.addEventListener('mobileMenuOpen', () => {
      
      // Cuando el menú esté abierto, permitir touch events en el menú
      const mobileNav = document.querySelector('.mobile-nav');
      if (mobileNav) {
        mobileNav.style.touchAction = 'manipulation';
      }
    });
    
    document.addEventListener('mobileMenuClose', () => {
      
      // Restaurar configuración general cuando se cierre
      setTimeout(() => applyScrollFixes(), 100);
    });
  }
  
  // ========== 10. INICIALIZACIÓN ==========
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        applyAllFixes();
        setupMobileMenuIntegration();
      });
    } else {
      applyAllFixes();
      setupMobileMenuIntegration();
    }
    
    // Aplicar fixes adicionales cuando se carguen otros scripts
    setTimeout(applyAllFixes, 500);
    setTimeout(() => {
      applyAllFixes();
      setupMobileMenuIntegration();
    }, 2000);
  }
  
  window.ScrollInterventionFix = {
    applyFixes: applyAllFixes,
    verifyFixes,
    fixScrollElements,
    setupMobileMenuIntegration,
  
    forceMobileMenuFix() {
      const mobileNav = document.querySelector('.mobile-nav');
      const mobileToggle = document.querySelector('.mobile-menu-toggle');
      const mobileOverlay = document.querySelector('.mobile-nav-overlay');
  
      if (mobileNav) {
        mobileNav.style.touchAction = 'manipulation';
        mobileNav.style.pointerEvents = 'auto';
      }
  
      if (mobileToggle) {
        mobileToggle.style.touchAction = 'manipulation';
        mobileToggle.style.pointerEvents = 'auto';
      }
  
      if (mobileOverlay) {
        mobileOverlay.style.touchAction = 'auto';
        mobileOverlay.style.pointerEvents = 'auto';
      }
    }
  };
  
  // Ejecutar inmediatamente
  init();
  
})();

// ========== FIX ESPECÍFICO PARA MOBILE-MENU.JS ==========
document.addEventListener('DOMContentLoaded', () => {
  // Aplicar fixes específicos después de que se cargue el mobile menu handler
  setTimeout(() => {
    // Si existe el mobile menu handler, asegurar configuración correcta
    if (window.mobileMenuHandler) {
      
      // Reconfigurar elementos si es necesario
      const mobileNav = document.querySelector('.mobile-nav');
      const mobileToggle = document.querySelector('.mobile-menu-toggle');
      
      if (mobileNav) {
        mobileNav.style.touchAction = 'manipulation';
        mobileNav.style.pointerEvents = 'auto';
      }
      
      if (mobileToggle) {
        mobileToggle.style.touchAction = 'manipulation';
        mobileToggle.style.pointerEvents = 'auto';
      }
    }
    
    // Forzar reconfiguración de elementos después de que se carguen
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    
    if (hero) {
      hero.style.touchAction = 'auto';
      hero.style.overflow = 'visible';
    }
    
    if (heroContent) {
      heroContent.style.touchAction = 'auto';
      heroContent.style.pointerEvents = 'auto';
    }
    
  }, 3000);
});

// === Footer UI Guard: oculta UI flotante (cookies, reCAPTCHA, etc.) cuando el footer entra en vista
(function () {
  const footer = document.querySelector('footer.footer') || document.querySelector('footer');
  if (!footer) return;

  // Selectores conocidos de widgets de cookies usados por muchas librerías
  const KNOWN_COOKIE_SELECTORS = [
    '.cookie-bubble', '.cookie-floating-btn', '.cookie-btn', '#cookie-btn',
    '.cc-revoke', '.cc-floating', '.cc-window', '.cc-revoke-custom',
    '.cmplz-revoke-cookies', '#cmplz-manage-consent',
    '.cky-revisit-bottom', '.cky-btn-revisit', '.cli_settings_button',
    '#cookieConsent', '.cookie-consent', '.cookie-consent-badge',
    '.cookies-btn', '.cookies-badge'
  ];

  const hideables = new Set();

  function markHideable(el) {
    if (!el || hideables.has(el)) return;
    el.classList.add('footer-hideable');
    el.setAttribute('data-footer-hideable', '');
    hideables.add(el);
  }

  function scanForCookieBubble() {
    // 1) Selectores conocidos
    KNOWN_COOKIE_SELECTORS.forEach(sel => {
      document.querySelectorAll(sel).forEach(markHideable);
    });

    // 2) Heurística: elementos con texto "Cookies" y posición fija
    const candidates = Array.from(document.querySelectorAll('button, a, div, span'))
      .filter(el => /cookies?/i.test(el.textContent || el.getAttribute('aria-label') || ''));

    for (const el of candidates) {
      const cs = getComputedStyle(el);
      const fixed = cs.position === 'fixed' || cs.position === 'sticky';
      if (!fixed) continue;

      const rect = el.getBoundingClientRect();
      const nearBottom = (window.innerHeight - rect.bottom) < 200;   // cerca del borde inferior
      const nearSide   = rect.left < 200 || (window.innerWidth - rect.right) < 200; // esquina izq/der
      if (nearBottom && nearSide) {
        markHideable(el.closest('[class], [id]') || el); // marcar contenedor más significativo
      }
    }
  }

  // 3) reCAPTCHA (Google) — lo marcamos también por si queremos reglas comunes
  document.querySelectorAll('.grecaptcha-badge').forEach(markHideable);

  // Escaneo inicial + observar DOM por si el script de cookies inyecta tarde
  scanForCookieBubble();
  const mo = new MutationObserver(scanForCookieBubble);
  mo.observe(document.body, { childList: true, subtree: true });

  // Estado "footer visible" con IntersectionObserver
  const setFooterState = (atFooter) => {
    document.body.classList.toggle('at-footer', atFooter);
  };

  const io = new IntersectionObserver((entries) => {
    const visible = entries.some(e => e.isIntersecting);
    setFooterState(visible);
  }, { root: null, threshold: 0.15 }); // ~15% del footer visible
  io.observe(footer);

  // Fallback por si no hay soporte o el footer es muy pequeño
  window.addEventListener('scroll', () => {
    const scrollBottom = window.innerHeight + window.scrollY;
    const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const nearBottom = (docHeight - scrollBottom) < 60; // px
    if (nearBottom) setFooterState(true);
  }, { passive: true });
})();


