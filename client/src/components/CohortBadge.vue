<template>
  <div>
    <br>
    <br>
    <center v-if="cohort">
      <v-progress-circular v-if="cohort.loading" active green green-flash></v-progress-circular>
      <h1 v-else>
        <span v-if="!cohort.badgeNumber || cohort.badgeNumber == -1">{{cohort.name}}</span>
        <img v-if="cohort.badgeNumber && cohort.badgeNumber != -1" v-bind:src="'https://badge.galvanize.network/' + cohort.badgeNumber + '.png'" alt="" style="height:175px;">
      </h1>
    </center>
  </div>
</template>

<script>
export default {
  name: 'cohort-badge',
  props: ['cohort']
}
</script>
