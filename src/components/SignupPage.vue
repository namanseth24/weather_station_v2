<template>
  <div class="flex justify-center items-center min-h-screen text-white">
    <div class="blur-container w-[400px] p-8 text-center">
      <h2 class="text-2xl mb-4 font-semibold">Sign Up</h2>

      <form @submit.prevent="signup">
        <input
          type="email"
          v-model="email"
          placeholder="Enter Email"
          required
          class="w-full p-2 mb-3 rounded"
        />
        <input
          type="password"
          v-model="password"
          placeholder="Enter Password"
          required
          class="w-full p-2 mb-3 rounded"
        />
        <input
          type="password"
          v-model="confirmPassword"
          placeholder="Confirm Password"
          required
          class="w-full p-2 mb-3 rounded"
        />
        <button
          type="submit"
          class="bg-green-500 px-4 py-2 rounded mt-2 w-full font-semibold hover:bg-green-600 transition"
        >
          Create Account
        </button>
      </form>

      <p class="mt-3 text-sm">
        Already have an account?
        <router-link to="/" class="text-orange-400 hover:underline">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "SignupPage",
  data() {
    return {
      email: "",
      password: "",
      confirmPassword: "",
    };
  },
  methods: {
    signup() {
      if (this.password !== this.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      // Store credentials in localStorage
      localStorage.setItem("email", this.email);
      localStorage.setItem("password", this.password);

      alert("Account created successfully!");
      
      // FIX: Use router.push instead of direct assignment
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
input {
  background: rgba(255, 255, 255, 0.689);
  border: none;
  outline: none;
  color: rgb(0, 0, 0);
}

.blur-container {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.689);
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.386);
}

button {
  background: #ff8c00;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
}

button:hover {
  background: #e07a00;
}

p {
  color: #000;
}
</style>