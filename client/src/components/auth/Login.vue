<template>
  <div class="center text-center">
    <h1>Galvanize Mastery</h1>
    <v-btn v-on:click="login">Login with Github</v-btn>
  </div>
</template>

<script>
import Auth from '../../lib/Auth';

export default {
  name: 'login',
  data () {
    return {}
  },
  methods: {
    login() {
      Auth.loginRedirect();
    }
  }
}
</script>
<style>
  .text-center {
    text-align: center;
  }
</style>
