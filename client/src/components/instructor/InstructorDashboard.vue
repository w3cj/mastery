<template>
  <div>
    <div class="left" v-if="!loading">
      <v-btn v-if="Object.keys(cohorts).length > 1" v-dropdown:dropdown>Change Cohort</v-btn>
      <v-dropdown id="dropdown">
          <li v-for="cohort in cohorts">
              <router-link :to="{ name: 'dashboard', params: { cohort_id: cohort.cohort_id }}">{{cohort.badge}}</router-link>
          </li>
      </v-dropdown>
    </div>
    <div class="right">
      <router-link v-if="user.isInstructor" :to="{ name: 'cohort', params: { id: cohort_id }}" class="waves btn green">Assign Standards</router-link>
    </div>
    <center>
      <h1>{{cohort.badge}}</h1>
      <v-progress-circular v-if="loading" active green green-flash></v-progress-circular>
    </center>
    <div v-if="!loading">
      <!-- <div class="input-field">
           <v-icon prefix>search</v-icon>
           <v-text-input v-model="search" name="search" id="search"></v-text-input>
       </div> -->
       <div class="row">
         <div class="card col s12 m4 l3" v-for="student in students">
          <div class="card-image waves-effect waves-block waves-light">
            <img class="activator" v-bind:src="student.img">
          </div>
          <div class="card-content">
            <span class="card-title activator grey-text text-darken-4">{{formatName(student.full_name)}}<i class="material-icons right">more_vert</i></span>
            <p>
              <router-link :to="{ name: 'student-dashboard', params: { cohort_id: cohort_id, student_id: student.id} }">Mastery</router-link>
            </p>
          </div>
          <div class="card-reveal">
            <span class="card-title grey-text text-darken-4">{{formatName(student.full_name)}}<i class="material-icons right">close</i></span>
            <p>Charts and metrics and other cool stuff coming soon...</p>
          </div>
        </div>
       </div>
    </div>
  </div>
</template>

<script>
import API from '../../lib/API';
import {requireType} from '../../lib/utils';

export default {
  name: 'instructor-dashboard',
  data() {
    return {
      search: ''
    };
  },
  props: {
    user: requireType(Object),
    cohort_id: requireType([String, Number]),
    cohort: requireType(Object),
    cohorts: requireType(Object),
    loading: requireType(Boolean),
    students: requireType(Array)
  },
  methods: {
    formatName(name) {
      return name.split(' ')[0];
    },
    decodeHtml(html) {
      var txt = document.createElement("textarea");
      txt.innerHTML = html;
      return txt.value;
    }
  }
}
</script>
<style>
  .card {
    margin: 0.25em;
  }
  .actionButton {
    margin: 0.25em;
  }
  .padding-left {
    margin-left: 20em;
  }
  .score-buttons {
    float: right;
  }
  .clear {
    float: clear;
  }
</style>
