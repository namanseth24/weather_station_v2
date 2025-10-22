<template>
  <div class="flex justify-center items-center min-h-screen">
    <div class="blur-container">
      <h2 class="text-2xl mb-4 font-semibold">Forgot Password</h2>

      <form @submit.prevent="resetPassword">
        <input
          type="email"
          v-model="email"
          placeholder="Enter your registered email"
          class="w-full p-2 mb-3 rounded"
          required
        />
        <button type="submit" class="bg-orange-500 px-4 py-2 rounded mt-2 w-full font-bold text-white">
          Reset Password
        </button>
      </form>

      <p class="mt-3 text-sm">
        Remember your password?
        <router-link to="/" class="text-orange-400 hover:underline">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "ForgotPage",
  data() {
    return {
      email: "",
    };
  },
  methods: {
    resetPassword() {
      if (!this.email) {
        alert("Please enter your email.");
        return;
      }

      // Simulated reset logic
      alert(`Password reset link sent to ${this.email}`);
      
      // FIX: Use router.push
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.blur-container {
  max-width: 400px;
  background: rgba(255, 255, 255, 0.689);
  backdrop-filter: blur(10px);
  padding: 30px;
  border-radius: 12px;
  color: white;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
  text-align: center;
}

input {
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  border: none;
  border-radius: 5px;
  color: #000;
}

button {
  background: #ff8c00;
  border: none;
  padding: 10px;
  margin-top: 10px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
}

button:hover {
  background: #ffa733;
}

p {
  color: #000000;
}
</style>