<template>
  <div class="center text-center">
    <h1>Welcome to Galvanize Mastery</h1>
    <a v-if="!currentUser" v-on:click="login" class="waves btn">Login with Github</a>
    <router-link v-if="currentUser" :to="{ name: 'dashboard' }" class="waves btn">Go to your dashboard</router-link>
  </div>
</template>

<script>
import data from '../data';
import Auth from '../lib/Auth';

export default {
  name: 'home',
  data() {
    return {
      ...data.data
    }
  },
  methods: {
    login() {
      Auth.loginRedirect();
    }
  }
}
</script>
