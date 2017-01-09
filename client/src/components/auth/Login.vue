<template>
  <div class="center text-center">
    <h1>Galvanize Mastery</h1>
    <a v-on:click="login" class="waves btn">Login with Github</a>
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
