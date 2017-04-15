<template>
  <div>
    <li v-if="!currentUser"><router-link :to="{ name: 'login' }">Login</router-link></li>
    <span v-if="currentUser && currentUser.isInstructor">
      <li><router-link :to="{ name: 'dashboard' }"><i class="material-icons left">dashboard</i>Dashboard</router-link></li>
      <li v-if="$route.params.cohort_id"><router-link :to="{ name: 'standards', params: { id: $route.params.cohort_id } }"><i class="material-icons left">playlist_add_check</i>Manage Standards</router-link></li>
    </span>
    <li v-if="currentUser"><router-link :to="{ name: 'logout' }">Logout</router-link></li>
  </div>
</template>

<script>
export default {
  name: 'nav-links',
  props: ['currentUser']
}
</script>
