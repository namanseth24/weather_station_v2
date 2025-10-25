<template>
  <div v-if="showInstallPrompt" class="pwa-install-banner">
    <div class="pwa-content">
      <span class="pwa-icon">📱</span>
      <div class="pwa-text">
        <strong>Install IoT Dashboard</strong>
        <p>Add to your home screen for quick access</p>
      </div>
      <div class="pwa-buttons">
        <button @click="installPWA" class="install-btn">Install</button>
        <button @click="dismissPrompt" class="dismiss-btn">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const showInstallPrompt = ref(false);
let deferredPrompt = null;

onMounted(() => {
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Check if user has dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = localStorage.getItem('pwa-install-dismissed-time');
    
    // Show again after 7 days
    if (!dismissed || (dismissedTime && Date.now() - dismissedTime > 7 * 24 * 60 * 60 * 1000)) {
      setTimeout(() => {
        showInstallPrompt.value = true;
      }, 3000); // Show after 3 seconds
    }
  });

  // Listen for successful installation
  window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    showInstallPrompt.value = false;
    localStorage.removeItem('pwa-install-dismissed');
    localStorage.removeItem('pwa-install-dismissed-time');
  });
});

async function installPWA() {
  if (!deferredPrompt) {
    console.log('Install prompt not available');
    return;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === 'accepted') {
    console.log('User accepted the install prompt');
  } else {
    console.log('User dismissed the install prompt');
  }

  deferredPrompt = null;
  showInstallPrompt.value = false;
}

function dismissPrompt() {
  showInstallPrompt.value = false;
  localStorage.setItem('pwa-install-dismissed', 'true');
  localStorage.setItem('pwa-install-dismissed-time', Date.now().toString());
}
</script>

<style scoped>
.pwa-install-banner {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  padding: 15px 20px;
  z-index: 10000;
  max-width: 90%;
  width: 400px;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(100px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.pwa-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.pwa-icon {
  font-size: 2.5em;
  flex-shrink: 0;
}

.pwa-text {
  flex: 1;
}

.pwa-text strong {
  display: block;
  font-size: 1.1em;
  margin-bottom: 4px;
  color: #333;
}

.pwa-text p {
  margin: 0;
  font-size: 0.9em;
  color: #666;
}

.pwa-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.install-btn {
  background: #05623b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
  white-space: nowrap;
}

.install-btn:hover {
  background: #044a2d;
  transform: scale(1.05);
}

.dismiss-btn {
  background: #f0f0f0;
  color: #666;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.3s;
  font-size: 1.2em;
}

.dismiss-btn:hover {
  background: #e0e0e0;
}

@media (max-width: 600px) {
  .pwa-install-banner {
    bottom: 10px;
    width: 95%;
    padding: 12px 15px;
  }

  .pwa-content {
    flex-wrap: wrap;
    justify-content: center;
    text-align: center;
  }

  .pwa-icon {
    width: 100%;
    font-size: 2em;
  }

  .pwa-text {
    width: 100%;
  }

  .pwa-buttons {
    width: 100%;
    flex-direction: row;
    justify-content: center;
  }

  .install-btn,
  .dismiss-btn {
    flex: 1;
  }
}
</style>