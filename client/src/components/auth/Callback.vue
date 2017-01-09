<template>
  <div>
    <div class="center text-center" v-if="errorMessage">
      <h1>Login Error</h1>
      <p style="color:red">{{errorMessage}}</p>
      <router-link to="/auth/login" class="waves btn">Try again</router-link>
    </div>
    <div class="center text-center" v-if="!errorMessage">
      <h1>Logging in...</h1>
      <center>
        <v-progress-circular active yellow yellow-flash></v-progress-circular>
      </center>
    </div>
  </div>
</template>

<script>
import Auth from '../../lib/Auth';

export default {
  name: 'callback',
  data () {
    return {
      errorMessage: ''
    }
  },
  created() {
    if(this.$route.params.error) {
      this.errorMessage = this.$route.params.error;
    } else {
      Auth
        .callbackLogin(this.$cookie)
        .then(() => {
          this.$router.push('/dashboard');
        });
    }
  }
}
</script>
