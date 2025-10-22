<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <div class="links">
      <router-link to="/forgot">Forgot Password?</router-link>
      <p>Don't have an account? <router-link to="/signup">Sign up here</router-link></p>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: ""
    };
  },
  methods: {
    login() {
      const storedEmail = localStorage.getItem('email');
      const storedPassword = localStorage.getItem('password');
      
      if (this.email === storedEmail && this.password === storedPassword) {
        // FIX: Use router.push
        this.$router.push("/dashboard");
      } else {
        alert("Invalid email or password");
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  /* Styles are in your CSS files */
}
</style>