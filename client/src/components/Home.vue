<template>
  <div class="center text-center">
    <h1>Welcome to Galvanize Mastery</h1>
    <a v-if="!currentUser" v-on:click="login" class="waves btn">Login with Github</a>
    <router-link v-if="currentUser" :to="{ name: 'dashboard' }" class="waves btn">Go to your dashboard</router-link>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Auth from '../lib/Auth';

export default {
  name: 'home',
  data() {
    return {
      currentUser: null
    };
  },
  computed: mapGetters({
    currentUser: 'currentUser'
  }),
  methods: {
    login() {
      Auth.loginRedirect();
    }
  }
}
</script>
