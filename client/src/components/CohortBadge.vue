<template>
  <div>
    <br>
    <br>
    <center v-if="cohort">
      <h1>
        <span v-if="!cohort.badgeNumber || cohort.badgeNumber == -1">{{cohort.badge}}</span>
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
