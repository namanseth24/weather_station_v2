<template>
  <PWAInstallPrompt />
  <router-view />
</template>

<script>
import PWAInstallPrompt from './components/PWAInstallPrompt.vue';
export default {
  name: "App",
  components: {
    PWAInstallPrompt
  }
};
</script>

<style>
/* Remove body styles from here since they're in your CSS files */
</style>