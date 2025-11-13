// PWA utilities for mobile-like experience

export const isPWA = () => {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia?.('(display-mode: standalone)').matches || 
           (typeof navigator !== 'undefined' && navigator.standalone === true);
  } catch (e) {
    return false;
  }
};

export const isMobile = () => {
  if (typeof navigator === 'undefined') return false;
  try {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  } catch (e) {
    return false;
  }
};

export const getViewportHeight = () => {
  if (typeof window === 'undefined') return 0;
  try {
    return window.innerHeight || document.documentElement?.clientHeight || 0;
  } catch (e) {
    return 0;
  }
};

export const addToHomeScreen = () => {
  if (typeof window !== 'undefined' && window.deferredPrompt) {
    window.deferredPrompt.prompt();
    window.deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      }
      window.deferredPrompt = null;
    });
  }
};

// Handle PWA install prompt
export const setupPWAPrompt = () => {
  if (typeof window === 'undefined') return;
  try {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
    });
  } catch (e) {
    console.warn('PWA install prompt setup failed:', e);
  }
};

// Vibration for mobile feedback
export const vibrate = (pattern = [100]) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};