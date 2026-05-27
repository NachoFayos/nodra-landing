// assets/js/cookie-manager.js
// Nodra Soluciones Digitales - Cookie Management (GDPR/AEPD ready)

const NodraCookies = {
  // =======================
  // CONFIG
  // =======================
  config: {
    CONSENT_COOKIE: 'nodra_cookies_consent',
    ANALYTICS_COOKIE: 'nodra_analytics_consent',
    SECURITY_COOKIE: 'nodra_security_consent',
    TIMESTAMP_COOKIE: 'nodra_consent_timestamp',
    BANNER_DELAY: 1000,
    FLOATING_DELAY: 2000,
    NOTIFICATION_DURATION: 4000,
    COOKIE_DAYS: 365,
    GA_ID: 'G-S0KNKFTKBR',        // <- REEMPLAZA con tu ID GA4
    RECAPTCHA_KEY: '6LfDspwrAAAAAHfKWZk-KMfPCzcP7BAUq8s1_Vm2', // <- REEMPLAZA con tu reCAPTCHA v3 site key
  },

  // =======================
  // HELPERS COOKIES
  // =======================
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  },

  hasConsent() {
    return this.getCookie(this.config.CONSENT_COOKIE) !== null;
  },

  _domainPart() {
    // Si usas subdominios de *.nodra.es, unifica dominio
    return location.hostname.endsWith('nodra.es') ? ';Domain=.nodra.es' : '';
  },

  setCookie(name, value, days = this.config.COOKIE_DAYS) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const secure = location.protocol === 'https:' ? ';Secure' : '';
    document.cookie = `${name}=${value};expires=${expires};path=/${this._domainPart()};SameSite=Lax${secure}`;
  },

  deleteCookie(name) {
    // Borra en dominio actual y en .nodra.es por si acaso
    const past = 'Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = `${name}=;expires=${past};path=/`;
    document.cookie = `${name}=;expires=${past};path=/;Domain=.nodra.es`;
  },

  // =======================
  // GOOGLE ANALYTICS (GA4) + CONSENT MODE V2
  // =======================
  _injectGtagScript() {
    if (document.getElementById('gtag-js')) return;
    const s = document.createElement('script');
    s.id = 'gtag-js';
    s.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.GA_ID}`;
    s.async = true;
    document.head.appendChild(s);
  },

  _prepareGtag() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };

    // Establece el Consent Mode "denied" por defecto (recomendado por Google)
    gtag('consent', 'default', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied'
    });

    gtag('js', new Date());
  },

  loadAnalytics() {
    if (this.getCookie(this.config.ANALYTICS_COOKIE) === 'true' && this.config.GA_ID && this.config.GA_ID.startsWith('G-')) {
      this._injectGtagScript();
      this._prepareGtag();

      // El usuario ha dado consentimiento: actualizamos a 'granted'
      gtag('consent', 'update', { 'analytics_storage': 'granted' });

      gtag('config', this.config.GA_ID, {
        // GA4 anonimiza IP por defecto; cookie_flags por seguridad adicional
        cookie_flags: 'SameSite=Lax;Secure'
      });

    } else {
    }
  },

  // Denegar Analytics y limpiar cookies de GA en tu dominio (si existen)
  denyAnalytics() {
    if (window.gtag) {
      gtag('consent', 'update', { 'analytics_storage': 'denied' });
    }
    ['_ga', '_gid', '_gat'].forEach(c => this.deleteCookie(c));
  },

  // =======================
  // reCAPTCHA (carga condicional)
  // =======================
  loadSecurity() {
    if (this.getCookie(this.config.SECURITY_COOKIE) === 'true' && this.config.RECAPTCHA_KEY) {
      if (!document.getElementById('recaptcha-script')) {
        const r = document.createElement('script');
        r.id = 'recaptcha-script';
        r.src = `https://www.google.com/recaptcha/api.js?render=${this.config.RECAPTCHA_KEY}`;
        r.async = true;
        document.head.appendChild(r);
      }
      window.enableRecaptcha = true;
    } else {
    }
  },

  // =======================
  // LOG A SERVIDOR
  // =======================
  async sendConsentToServer(consentData) {
    try {
      const endpoint = './backend/api/log-consent.php';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consentData)
      });


      if (response.ok) {
        const result = await response.json();
        return true;
      } else {
        const errorText = await response.text();
        console.error('Failed to log consent:', response.status, response.statusText, errorText);
        return false;
      }
    } catch (error) {
      console.error('Error sending consent to server:', error);
      return false;
    }
  },

  // =======================
  // GUARDAR PREFERENCIAS
  // =======================
  async savePreferences(analytics = false, security = false, method = 'banner') {
    const timestamp = new Date().toISOString();

    // Guarda/actualiza cookies de preferencia
    this.setCookie(this.config.CONSENT_COOKIE, 'true');
    this.setCookie(this.config.ANALYTICS_COOKIE, analytics.toString());
    this.setCookie(this.config.SECURITY_COOKIE, security.toString());
    this.setCookie(this.config.TIMESTAMP_COOKIE, timestamp);

    // Registro para auditoría
    const consentLog = {
      timestamp,
      analytics,
      security,
      userAgent: navigator.userAgent,
      url: window.location.href,
      method
    };
    await this.sendConsentToServer(consentLog);

    // Aplicar decisiones
    if (analytics) {
      this.loadAnalytics();
    } else {
      this.denyAnalytics();
    }

    if (security) {
      this.loadSecurity();
    } else {
      window.enableRecaptcha = false;
    }

    this.hideBanner();
    this.showFloatingButton();
  },

  acceptAll() {
    this.savePreferences(true, true, 'accept_all');
    this.showNotification('✅ Se han aceptado todas las cookies');
  },

  rejectOptional() {
    this.savePreferences(false, false, 'reject_optional');
    this.showNotification('ℹ️ Solo se utilizarán cookies necesarias');
  },

  async saveCustom() {
    const analyticsCheckbox = document.getElementById('nodraAnalyticsCookies');
    const securityCheckbox = document.getElementById('nodraSecurityCookies');

    const analytics = analyticsCheckbox ? analyticsCheckbox.checked : false;
    const security  = securityCheckbox ? securityCheckbox.checked  : false;

    await this.savePreferences(analytics, security, 'custom');
    this.closeSettings();

    let message = '✅ Preferencias guardadas';
    const enabled = [];
    if (analytics) enabled.push('Análisis');
    if (security)  enabled.push('Seguridad');
    message += enabled.length ? `: ${enabled.join(' y ')}` : ': Solo necesarias';
    this.showNotification(message);
  },

  // Permitir retirar consentimiento de forma visible
  withdrawConsent() {
    if (window.gtag) {
      gtag('consent', 'update', { 'analytics_storage': 'denied' });
    }
    [
      this.config.CONSENT_COOKIE,
      this.config.ANALYTICS_COOKIE,
      this.config.SECURITY_COOKIE,
      this.config.TIMESTAMP_COOKIE,
      '_ga', '_gid', '_gat'
    ].forEach(c => this.deleteCookie(c));

    this.closeSettings();
    this.showBanner();
    this.showNotification('ℹ️ Has retirado tu consentimiento. Solo usaremos cookies necesarias.');
  },

  // =======================
  // UI (banner, modal, botón flotante)
  // =======================
  createBanner() {
    if (document.getElementById('nodraCookieBanner')) return;

    const bannerHTML = `
      <div id="nodraCookieBanner" class="nodra-cookie-banner">
        <div class="nodra-cookie-content">
          <div class="nodra-cookie-text">
            <h4>🍪 Utilizamos cookies</h4>
            <p>Usamos cookies propias y de terceros para fines técnicos, de análisis y seguridad. Puedes aceptarlas, rechazarlas o personalizarlas.</p>
          </div>
          <div class="nodra-cookie-actions">
            <button class="nodra-cookie-btn nodra-cookie-accept" onclick="NodraCookies.acceptAll()">✓ Aceptar todas</button>
            <button class="nodra-cookie-btn nodra-cookie-reject" onclick="NodraCookies.rejectOptional()">✗ Solo necesarias</button>
            <button class="nodra-cookie-btn nodra-cookie-settings" onclick="NodraCookies.openSettings()">⚙️ Personalizar</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', bannerHTML);
  },

  createModal() {
    if (document.getElementById('nodraCookieModal')) return;

    const modalHTML = `
      <div id="nodraCookieModal" class="nodra-cookie-modal">
        <div class="nodra-cookie-modal-content">
          <div class="nodra-cookie-modal-header">
            <h3>Configuración de Cookies</h3>
            <button class="nodra-cookie-close" onclick="NodraCookies.closeSettings()">×</button>
          </div>

          <div class="nodra-cookie-category">
            <div class="nodra-cookie-category-header">
              <h5>🔧 Cookies necesarias</h5>
              <label class="nodra-toggle-switch">
                <input type="checkbox" id="nodraNecessaryCookies" checked disabled>
                <span class="nodra-toggle-slider"></span>
              </label>
            </div>
            <p>Estas cookies son esenciales para el funcionamiento del sitio web y no se pueden desactivar.</p>
          </div>

          <div class="nodra-cookie-category">
            <div class="nodra-cookie-category-header">
              <h5>📊 Cookies de análisis (Google Analytics)</h5>
              <label class="nodra-toggle-switch">
                <input type="checkbox" id="nodraAnalyticsCookies">
                <span class="nodra-toggle-slider"></span>
              </label>
            </div>
            <p>Nos ayudan a entender cómo interactúas con nuestro sitio para mejorar contenidos y navegación.</p>
          </div>

          <div class="nodra-cookie-category">
            <div class="nodra-cookie-category-header">
              <h5>🛡️ Cookies de seguridad (reCAPTCHA)</h5>
              <label class="nodra-toggle-switch">
                <input type="checkbox" id="nodraSecurityCookies">
                <span class="nodra-toggle-slider"></span>
              </label>
            </div>
            <p>Protegen los formularios contra spam y abuso automatizado.</p>
          </div>

          <div class="nodra-cookie-modal-actions">
            <button class="nodra-cookie-btn nodra-cookie-accept" onclick="NodraCookies.saveCustom()">Guardar preferencias</button>
            <button class="nodra-cookie-btn nodra-cookie-reject" onclick="NodraCookies.closeSettings()">Cancelar</button>
          </div>

          <div style="display:flex; justify-content:center; margin-top:1rem;">
            <button class="nodra-cookie-btn nodra-cookie-reject" onclick="NodraCookies.withdrawConsent()">Retirar consentimiento</button>
          </div>

          <p style="color:#9CA3AF; font-size:0.8rem; margin-top:1rem; text-align:center;">
            <a href="politicacookies.html" style="color:#00B3A4; text-decoration:none;">Ver Política de Cookies</a>
          </p>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  createFloatingButton() {
    if (document.getElementById('nodraCookieFloat')) return;

    const floatingHTML = `
      <div id="nodraCookieFloat" class="nodra-cookie-floating" onclick="NodraCookies.openSettings()">
        <span>🍪 Cookies</span>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', floatingHTML);
  },

  showBanner() {
    const banner = document.getElementById('nodraCookieBanner');
    if (banner) {
      setTimeout(() => banner.classList.add('show'), this.config.BANNER_DELAY);
    }
  },

  hideBanner() {
    const banner = document.getElementById('nodraCookieBanner');
    if (banner) banner.classList.remove('show');
  },

  showFloatingButton() {
    const floatingBtn = document.getElementById('nodraCookieFloat');
    if (floatingBtn) {
      setTimeout(() => floatingBtn.classList.add('show'), this.config.FLOATING_DELAY);
    }
  },

  openSettings() {
    const modal = document.getElementById('nodraCookieModal');
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => this.setupSwitches());
  },

  closeSettings() {
    const modal = document.getElementById('nodraCookieModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  },

  setupSwitches() {
    const analytics = this.getCookie(this.config.ANALYTICS_COOKIE) === 'true';
    const security  = this.getCookie(this.config.SECURITY_COOKIE) === 'true';

    const analyticsCheckbox = document.getElementById('nodraAnalyticsCookies');
    const securityCheckbox  = document.getElementById('nodraSecurityCookies');

    if (analyticsCheckbox) {
      analyticsCheckbox.checked = analytics;
      analyticsCheckbox.removeEventListener('change', this.handleToggleBounce);
      analyticsCheckbox.addEventListener('change', this.handleToggleBounce.bind(this));
    }
    if (securityCheckbox) {
      securityCheckbox.checked = security;
      securityCheckbox.removeEventListener('change', this.handleToggleBounce);
      securityCheckbox.addEventListener('change', this.handleToggleBounce.bind(this));
    }
  },

  handleToggleBounce(event) {
    const toggle = event.target.parentNode;
    toggle.style.transform = 'scale(1.1)';
    setTimeout(() => { toggle.style.transform = 'scale(1)'; }, 150);
  },

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'nodra-cookie-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, this.config.NOTIFICATION_DURATION);
  },

  setupEventListeners() {
    document.addEventListener('click', (event) => {
      const modal = document.getElementById('nodraCookieModal');
      if (event.target === modal) this.closeSettings();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.closeSettings();
    });
  },

  injectCSS() {
    if (document.getElementById('nodraCookieStyles')) return;
    const css = `
      <style id="nodraCookieStyles">
        .nodra-cookie-banner{position:fixed;bottom:0;left:0;right:0;background:rgba(17,24,39,.95);backdrop-filter:blur(20px);border-top:1px solid rgba(0,179,164,.2);padding:1.5rem;z-index:10001;transform:translateY(100%);transition:transform .4s ease;box-shadow:0 -10px 30px rgba(0,0,0,.3)}
        .nodra-cookie-banner.show{transform:translateY(0)}
        .nodra-cookie-content{max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:2rem;flex-wrap:wrap}
        .nodra-cookie-text{flex:1;min-width:300px}
        .nodra-cookie-text h4{color:#00B3A4;font-size:1.1rem;font-weight:700;margin:0 0 .5rem 0}
        .nodra-cookie-text p{color:#D1D5DB;font-size:.95rem;line-height:1.5;margin:0}
        .nodra-cookie-actions{display:flex;gap:1rem;flex-wrap:wrap}
        .nodra-cookie-btn{padding:.75rem 1.5rem;border-radius:8px;font-size:.9rem;font-weight:600;cursor:pointer;transition:all .3s ease;border:none;white-space:nowrap}
        .nodra-cookie-accept{background:linear-gradient(135deg,#00B3A4 0%,#009688 100%);color:#fff}
        .nodra-cookie-accept:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,179,164,.3)}
        .nodra-cookie-reject{background:transparent;color:#9CA3AF;border:1px solid #4B5563}
        .nodra-cookie-reject:hover{background:rgba(75,85,99,.2);color:#D1D5DB}
        .nodra-cookie-settings{background:transparent;color:#00B3A4;border:1px solid #00B3A4}
        .nodra-cookie-settings:hover{background:rgba(0,179,164,.1)}
        .nodra-cookie-modal{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.8);backdrop-filter:blur(10px);z-index:10002;display:flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;transition:all .3s ease}
        .nodra-cookie-modal.active{opacity:1;visibility:visible}
        .nodra-cookie-modal-content{background:#1F2937;border:1px solid #374151;border-radius:20px;padding:2rem;max-width:500px;width:90%;max-height:80vh;overflow-y:auto}
        .nodra-cookie-modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid #374151}
        .nodra-cookie-modal-header h3{color:#fff;font-size:1.3rem;font-weight:700;margin:0}
        .nodra-cookie-close{background:none;border:none;color:#9CA3AF;font-size:1.5rem;cursor:pointer;padding:.5rem;border-radius:8px;transition:all .3s ease}
        .nodra-cookie-close:hover{color:#00B3A4;background:rgba(0,179,164,.1)}
        .nodra-cookie-category{margin-bottom:1.5rem;padding:1rem;background:rgba(55,65,81,.5);border-radius:12px;border:1px solid #4B5563}
        .nodra-cookie-category-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem}
        .nodra-cookie-category h5{color:#00B3A4;font-size:1rem;font-weight:600;margin:0}
        .nodra-cookie-category p{color:#D1D5DB;font-size:.9rem;line-height:1.4;margin:0}
        .nodra-toggle-switch{position:relative;width:50px;height:24px;display:inline-block;transition:transform .2s ease}
        .nodra-toggle-switch input{opacity:0;width:0;height:0;position:absolute;z-index:-1}
        .nodra-toggle-slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#4B5563;transition:all .3s cubic-bezier(.4,0,.2,1);border-radius:24px;user-select:none;display:block}
        .nodra-toggle-slider:before{position:absolute;content:"";height:18px;width:18px;left:3px;bottom:3px;background-color:#fff;transition:all .3s cubic-bezier(.4,0,.2,1);border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,.2);display:block}
        .nodra-toggle-slider:hover{background-color:#6B7280}
        .nodra-toggle-switch input:checked + .nodra-toggle-slider{background-color:#00B3A4}
        .nodra-toggle-switch input:checked + .nodra-toggle-slider:hover{background-color:#009688}
        .nodra-toggle-switch input:checked + .nodra-toggle-slider:before{transform:translateX(26px)}
        .nodra-toggle-switch input:focus + .nodra-toggle-slider{box-shadow:0 0 0 2px rgba(0,179,164,.3)}
        .nodra-toggle-switch input:disabled + .nodra-toggle-slider{cursor:not-allowed;opacity:.6;background-color:#6B7280}
        .nodra-toggle-switch input:disabled + .nodra-toggle-slider:hover{background-color:#6B7280}
        .nodra-toggle-switch input:disabled + .nodra-toggle-slider:before{background-color:#E5E7EB}
        .nodra-cookie-modal-actions{display:flex;gap:1rem;margin-top:2rem;padding-top:1rem;border-top:1px solid #374151}
        .nodra-cookie-floating{position:fixed;bottom:20px;left:20px;background:rgba(0,179,164,.9);backdrop-filter:blur(10px);border:1px solid rgba(0,179,164,.3);border-radius:12px;padding:.75rem;cursor:pointer;transition:all .3s ease;z-index:1000;opacity:0;visibility:hidden;transform:translateY(20px)}
        .nodra-cookie-floating.show{opacity:1;visibility:visible;transform:translateY(0)}
        .nodra-cookie-floating:hover{background:rgba(0,179,164,1);transform:translateY(-3px);box-shadow:0 8px 25px rgba(0,179,164,.3)}
        .nodra-cookie-floating span{color:#fff;font-size:.85rem;font-weight:600}
        .nodra-cookie-notification{position:fixed;top:20px;right:20px;background:rgba(0,179,164,.95);color:#fff;padding:1rem 1.5rem;border-radius:12px;font-weight:600;z-index:10003;transform:translateX(400px);transition:transform .3s ease;box-shadow:0 8px 25px rgba(0,179,164,.3);max-width:350px}
        .nodra-cookie-notification.show{transform:translateX(0)}
        @media (max-width:768px){
          .nodra-cookie-content{flex-direction:column;gap:1rem;text-align:center}
          .nodra-cookie-actions{justify-content:center;width:100%}
          .nodra-cookie-btn{flex:1;min-width:auto;justify-content:center}
          .nodra-cookie-modal-content{margin:1rem;padding:1.5rem}
          .nodra-cookie-floating{bottom:10px;left:10px}
        }
        @media (max-width:480px){
          .nodra-cookie-actions{flex-direction:column;width:100%}
          .nodra-cookie-btn{width:100%}
        }
      </style>
    `;
    document.head.insertAdjacentHTML('beforeend', css);
  },

  // =======================
  // INIT
  // =======================
  init() {
    this.injectCSS();
    this.createBanner();
    this.createModal();
    this.createFloatingButton();
    this.setupEventListeners();

    // Respeta Do Not Track (opcional PRO): si activo, fuerza "solo necesarias"
    const dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1';
    if (dnt) {
      this.savePreferences(false, false, 'dnt_auto');
      return;
    }

    if (this.hasConsent()) {
      this.loadAnalytics();
      this.loadSecurity();
      this.showFloatingButton();
    } else {
      this.showBanner();
    }

  }
};

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => NodraCookies.init());
} else {
  NodraCookies.init();
}

// Export global
window.NodraCookies = NodraCookies;
