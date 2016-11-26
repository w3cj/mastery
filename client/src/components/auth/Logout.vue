<template>
  <div class="center text-center">
    <h1>Logging out...</h1>
  </div>
</template>

<script>
import Auth from '../../lib/Auth';
import * as actionTypes from '../../store/action-types';

export default {
  name: 'callback',
  data () {
    return {}
  },
  created() {
    Auth.logout();
    this.$store.dispatch(actionTypes.GET_CURRENT_USER);
    this.$router.push('/');
  }
}
</script>
