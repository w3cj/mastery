<template>
  <div class="center text-center">
    <h1>Logging in...</h1>
    <center>
      <v-progress-circular active yellow yellow-flash></v-progress-circular>
    </center>
  </div>
</template>

<script>
import Auth from '../../lib/Auth';

export default {
  name: 'callback',
  data () {
    return {}
  },
  created() {
    Auth
      .callbackLogin(this.$cookie)
      .then(() => {
        this.$router.push('/dashboard');
      });
  }
}
</script>
