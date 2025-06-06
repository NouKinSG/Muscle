import { defineStore } from 'pinia';
import { login as loginApi } from '@/api/auth'; // Assuming you have an API call for login
import { useRouter } from 'vue-router';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    userInfo: null, // Or load from localStorage if you store it there
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    async login(credentials) {
      try {
        const response = await loginApi(credentials);
        // Assuming the API returns a token in response.data or response.token
        const token = response.token || (response.data && response.data.token);
        if (token) {
          this.token = token;
          localStorage.setItem('token', token);
          // You might want to fetch user info here as well
          // await this.fetchUserInfo();
          return true;
        } else {
          throw new Error('Login failed: No token received');
        }
      } catch (error) {
        console.error('Login Action Error:', error);
        this.token = null;
        localStorage.removeItem('token');
        throw error; // Re-throw to be caught by the component
      }
    },
    logout() {
      this.token = null;
      this.userInfo = null;
      localStorage.removeItem('token');
      // Optionally, redirect to login page using router if needed, 
      // but usually done in the component or navigation guard.
      // const router = useRouter(); // This won't work here directly, router needs to be injected or passed
      // router.push('/login');
    },
    // Example action to fetch user info - implement based on your API
    // async fetchUserInfo() {
    //   if (!this.token) return;
    //   try {
    //     // const data = await yourApiToGetUserInfo();
    //     // this.userInfo = data;
    //   } catch (error) {
    //     console.error('Failed to fetch user info:', error);
    //   }
    // },
    setToken(token) {
      this.token = token;
      localStorage.setItem('token', token);
    }
  },
});