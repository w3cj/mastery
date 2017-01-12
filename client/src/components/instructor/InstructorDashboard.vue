<template>
  <div>
    <div class="left">
      <v-btn v-if="Object.keys(cohorts).length > 1" v-dropdown:dropdown>Change Cohort</v-btn>
      <v-dropdown id="dropdown">
          <li v-for="cohort in cohorts">
              <a v-on:click="changeCohort(cohort.cohort_id)">{{getCohortBadge(cohort.name)}}</a>
          </li>
      </v-dropdown>
    </div>
    <div class="right">
      <router-link v-if="user.isInstructor" :to="{ name: 'cohort', params: { id: defaultCohort }}" class="waves btn green">Assign Standards</router-link>
    </div>
    <center>
      <h1>{{cohorts[defaultCohort] ? getCohortBadge(cohorts[defaultCohort].name) : 'Loading students...'}}</h1>
      <v-progress-circular v-if="loadingStudents" active green green-flash></v-progress-circular>
    </center>
    <div v-if="!loadingStudents">
      <!-- <div class="input-field">
           <v-icon prefix>search</v-icon>
           <v-text-input v-model="search" name="search" id="search"></v-text-input>
       </div> -->
       <div class="row">
         <div class="card col s12 m4 l3" v-for="student in students">
          <div class="card-image waves-effect waves-block waves-light">
            <img class="activator" v-bind:src="studentImages[student.id]">
          </div>
          <div class="card-content">
            <span class="card-title activator grey-text text-darken-4">{{formatName(student.full_name)}}<i class="material-icons right">more_vert</i></span>
            <p>
              <router-link :to="{ name: 'student-dashboard', params: { student_id: student.id} }">Mastery</router-link>
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
import Auth from '../../lib/Auth';
import API from '../../lib/API';

export default {
  name: 'instructor-dashboard',
  data() {
    return {
      user: Auth.getCurrentUser(),
      search: '',
      defaultCohort: localStorage.defaultCohort,
      loadingStudents: true,
      performances: {},
      cohort: {},
      cohorts: {}
    };
  },
  mounted() {
    this.loadDefaultCohort();
  },
  methods: {
    changeCohort(cohort_id) {
      this.loadingStudents = true;
      localStorage.defaultCohort = cohort_id;
      this.defaultCohort = cohort_id;
      this.loadDefaultCohort();
    },
    loadDefaultCohort() {
      API
        .getCohorts()
        .then(cohorts => {
          this.cohorts = cohorts.reduce((byId, cohort) => {
            byId[cohort.cohort_id] = cohort;
            return byId;
          }, {});
        });

      API
        .getDefaultCohort()
        .then(defaultCohort => {
          this.defaultCohort = defaultCohort;
          return Promise.all([
            API.getStudents(defaultCohort),
            API.getStudentImages(defaultCohort)
          ]);
        }).then(results => {
          this.students = results[0];
          this.studentImages = results[1];
          this.loadingStudents = false;
        });
    },
    formatName(name) {
      return name.split(' ')[0];
    },
    performanceColors(standard_id) {
      const score = this.performances[standard_id];
      return {
        'grey': score == 0,
        'red': score == 1,
        'yellow': score == 2,
        'green': score == 3,
        'accent-4': score == 2
      }
    },
    getCohortBadge(name) {
      return name.split(' ')[0];
    },
    performanceTextColors(standard_id) {
      const performanceColors = this.performanceColors(standard_id);
      return {
        'grey-text': performanceColors.grey,
        'red-text': performanceColors.red,
        'yellow-text': performanceColors.yellow,
        'green-text': performanceColors.green,
        'accent-4': performanceColors.yellow
      }
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
