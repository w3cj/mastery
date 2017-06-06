<template>
  <div>
    <li v-if="!currentUser"><router-link :to="{ name: 'login' }">Login</router-link></li>
    <li v-if="currentUser"><router-link :to="{ name: 'dashboard' }"><i class="material-icons left">dashboard</i>Dashboard</router-link></li>
    <span v-if="currentUser && currentUser.isInstructor">
      <li v-if="$route.params.cohort_id"><router-link :to="{ name: 'standards', params: { id: $route.params.cohort_id } }"><i class="material-icons left">list</i>Standards</router-link></li>
      <li v-if="$route.params.cohort_id"><router-link :to="{ name: 'repos', params: { cohort_id: $route.params.cohort_id } }"><i class="material-icons left">assignment</i>Repos</router-link></li>
    </span>
    <li v-if="currentUser && $route.params.cohort_id"><router-link :to="{ name: 'resource-tracker', params: { cohort_id: $route.params.cohort_id} }"><i class="material-icons left">done</i>Resource Tracker</router-link></li>
    <li v-if="currentUser && $route.params.cohort_id"><router-link :to="{ name: 'standard-collections', params: { cohort_id: $route.params.cohort_id} }"><i class="material-icons left">group_work</i>Collections</router-link></li>
    <li v-if="currentUser && enableSkillTree($route.params.cohort_id)"><router-link :to="{ name: 'standards-skill-tree', params: { cohort_id: $route.params.cohort_id} }"><i class="material-icons left">nature</i>Skill Tree</router-link></li>
    <li v-if="currentUser && $route.params.cohort_id"><router-link :to="{ name: 'activity-feed', params: { cohort_id: $route.params.cohort_id} }"><i class="material-icons left">feedback</i>Activity</router-link></li>
    <li v-if="currentUser"><router-link :to="{ name: 'logout' }">Logout</router-link></li>
  </div>
</template>

<script>
export default {
  name: 'nav-links',
  props: ['currentUser'],
  data() {
    return {
      skillTreeCohorts: [149, 184]
    };
  },
  methods: {
    enableSkillTree(cohort_id) {
      return this.skillTreeCohorts.find(id => id == cohort_id);
    },
  }
}
</script>
