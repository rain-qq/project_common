<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  username: '',
  password: ''
});
const error = ref('');

const handleSubmit = async () => {
  try {
    const { success, message } = await authStore.handleLogin(form.value);
    
    if (success) {
      const redirect = router.currentRoute.value.query.redirect || '/';
      router.push(redirect);
    } else {
      error.value = message || 'Login failed';
    }
  } catch (err) {
    error.value = err.message;
  }
};
</script>

<template>
  <div class="login-container">
    <h2>SSO Login</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username">Username</label>
        <input 
          v-model="form.username" 
          type="text" 
          id="username" 
          required
        >
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          v-model="form.password" 
          type="password" 
          id="password" 
          required
        >
      </div>
      
      <button type="submit" class="login-button">Login</button>
      
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.login-button:hover {
  background-color: #3aa876;
}

.error-message {
  color: #ff4444;
  margin-top: 1rem;
}
</style>