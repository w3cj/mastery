<template>
  <div class="center text-center">
    <h1>Logging out...</h1>
  </div>
</template>

<script>
import Auth from '../../lib/Auth';

export default {
  name: 'callback',
  created() {
    Auth.logout();
    this.$router.push('/');
  }
}
</script>
