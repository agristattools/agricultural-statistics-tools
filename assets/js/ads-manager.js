/**
 * Adsterra Ads Manager for Zulqar Nain Statistical Tool
 * Professional ad integration with session control
 */

class AdsManager {
    constructor() {
        this.adsLoaded = false;
        this.popunderFired = false;
        this.sessionStorageKey = 'znst_ad_session';
        this.initSession();
    }

    initSession() {
        // Check if session exists
        const session = sessionStorage.getItem(this.sessionStorageKey);
        if (!session) {
            // Start new session
            sessionStorage.setItem(this.sessionStorageKey, JSON.stringify({
                started: new Date().toISOString(),
                popunderFired: false,
                pageViews: 0
            }));
        }
        
        this.updateSession();
    }

    updateSession() {
        const session = JSON.parse(sessionStorage.getItem(this.sessionStorageKey));
        session.pageViews = (session.pageViews || 0) + 1;
        session.lastVisit = new Date().toISOString();
        sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(session));
        
        this.popunderFired = session.popunderFired || false;
    }

    canShowPopunder() {
        const session = JSON.parse(sessionStorage.getItem(this.sessionStorageKey));
        return !session.popunderFired && session.pageViews >= 2;
    }

    markPopunderFired() {
        const session = JSON.parse(sessionStorage.getItem(this.sessionStorageKey));
        session.popunderFired = true;
        sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(session));
        this.popunderFired = true;
    }

    // Load ads after page is fully loaded
    loadAds() {
        if (this.adsLoaded) return;
        
        // Load social bar globally (except contact page)
        if (!window.location.pathname.includes('contact.html')) {
            this.loadSocialBar();
        }

        // Load native ads based on page
        setTimeout(() => {
            this.loadNativeAds();
            this.loadBannerAds();
        }, 1000);

        this.adsLoaded = true;
        
        // Set up popunder trigger (only on blogs page)
        if (window.location.pathname.includes('blogs.html')) {
            this.setupPopunderTrigger();
        }
    }

    loadSocialBar() {
        if (document.getElementById('adsterra-socialbar')) return;
        
        const script = document.createElement('script');
        script.src = 'https://pl28518811.effectivegatecpm.com/62/10/1c/62101cf8c62dc98eb40bb69406f6ab83.js';
        script.async = true;
        document.body.appendChild(script);
    }

    loadNativeAds() {
        // Check if native ad container exists
        const containers = document.querySelectorAll('.native-ad-container');
        if (containers.length === 0) return;

        containers.forEach((container, index) => {
            if (!container.querySelector('script')) {
                const script = document.createElement('script');
                script.async = true;
                script.setAttribute('data-cfasync', 'false');
                script.src = 'https://pl28518810.effectivegatecpm.com/e057183590c510b499eb5de3f9c43f9d/invoke.js';
                
                container.appendChild(script);
                
                const adDiv = document.createElement('div');
                adDiv.id = 'container-e057183590c510b499eb5de3f9c43f9d';
                container.appendChild(adDiv);
            }
        });
    }

    loadBannerAds() {
        // Check if mobile banner container exists
        const bannerContainer = document.getElementById('mobile-banner-ad');
        if (!bannerContainer) return;

        if (window.innerWidth <= 768) {
            const script = document.createElement('script');
            script.textContent = `
                atOptions = {
                    'key' : '6401048f6c45f8f5c8835bb95567e611',
                    'format' : 'iframe',
                    'height' : 50,
                    'width' : 320,
                    'params' : {}
                };
            `;
            
            const invokeScript = document.createElement('script');
            invokeScript.src = 'https://www.highperformanceformat.com/6401048f6c45f8f5c8835bb95567e611/invoke.js';
            
            bannerContainer.appendChild(script);
            bannerContainer.appendChild(invokeScript);
        }
    }

    setupPopunderTrigger() {
        if (!this.canShowPopunder()) return;

        // Trigger popunder on user interaction
        const triggerEvents = ['click', 'scroll', 'mousemove'];
        
        const firePopunder = () => {
            if (this.popunderFired) return;
            
            const script = document.createElement('script');
            script.src = 'https://pl28518807.effectivegatecpm.com/72/2d/6c/722d6cd18b8a6d02d99216541d5b071d.js';
            document.body.appendChild(script);
            
            this.markPopunderFired();
            
            // Remove event listeners after firing
            triggerEvents.forEach(event => {
                document.removeEventListener(event, firePopunder);
            });
        };

        // Add event listeners with delay
        setTimeout(() => {
            triggerEvents.forEach(event => {
                document.addEventListener(event, firePopunder, { once: true });
            });
        }, 3000);
    }

    // Smartlink for exit intent (optional)
    setupSmartlink() {
        if (window.location.pathname.includes('contact.html')) return;

        const smartlinkUrl = 'https://www.effectivegatecpm.com/g8a2ww5t?key=933bc4b749a4893d94d8bb3c077e6e50';
        
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY <= 0) {
                window.open(smartlinkUrl, '_blank');
            }
        });
    }
}

// Initialize ads manager
const adsManager = new AdsManager();

// Load ads when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    adsManager.loadAds();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdsManager };
}
