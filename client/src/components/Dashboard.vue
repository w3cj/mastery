<template>
  <div>
    <br>
    <div class="left">
      <div class="row" v-bind:class="{ show: (!loading && user.isInstructor && Object.keys(cohorts).length > 1), hide:  (loading || !(user.isInstructor && Object.keys(cohorts).length > 1)) }">
        <cohort-search :cohorts="cohort_array" :onCohortChange="changeCohort"></cohort-search>
      </div>
      <div v-if="!user.isInstructor && student_id && Object.keys(cohorts).length > 1">
        <v-btn v-dropdown:dropdown>Change Cohort</v-btn>
        <v-dropdown id="dropdown">
            <li v-for="cohort in cohorts">
                <router-link :to="{ name: 'student-dashboard', params: { cohort_id: cohort.cohort_id, student_id: student_id}}">{{cohort.badge}}</router-link>
            </li>
        </v-dropdown>
      </div>
    </div>
    <div class="right" v-if="!loading">
      <router-link v-if="user.isInstructor && $route.params.student_id" :to="{ name: 'dashboard', params: { cohort_id: cohort.cohort_id}}" class="waves btn indigo lighten-1">{{cohort.badge}} Students</router-link>
      <router-link v-if="user.isInstructor" :to="{ name: 'cohort', params: { id: cohort_id }}" class="waves btn green">Assign Standards</router-link>
    </div>
    <div>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <center>
        <h1 v-if="!loading">
          <span v-if="!cohort.badgeNumber || cohort.badgeNumber == -1">{{cohort.badge}}</span>
          <img v-if="cohort.badgeNumber && cohort.badgeNumber != -1" v-bind:src="'https://badge.galvanize.network/' + cohort.badgeNumber + '.png'" alt="" style="height:175px;">
        </h1>
        <v-progress-circular v-if="loading" active green green-flash></v-progress-circular>
      </center>
    </div>
    <instructor-dashboard
      v-if="user.isInstructor && !$route.params.student_id"
      v-bind:user="user"
      v-bind:cohort="cohort"
      v-bind:cohort_id="cohort_id"
      v-bind:cohorts="cohorts"
      v-bind:loading="loading"
      v-bind:students="students">
    </instructor-dashboard>
    <student-dashboard
      v-if="!user.isInstructor || $route.params.student_id"
      v-bind:user="user"
      v-bind:cohort="cohort"
      v-bind:cohort_id="cohort_id"
      v-bind:cohorts="cohorts"
      v-bind:loading="loading"
      v-bind:students="students">
    </student-dashboard>
  </div>
</template>

<script>
import Auth from '../lib/Auth';
import API from '../lib/API';
import CohortSearch from './CohortSearch';
import InstructorDashboard from './instructor/InstructorDashboard';
import StudentDashboard from './student/StudentDashboard';

export default {
  name: 'dashboard',
  components: {
    'cohort-search': CohortSearch,
    'instructor-dashboard': InstructorDashboard,
    'student-dashboard': StudentDashboard,
  },
  data() {
    const user = Auth.getCurrentUser();
    const student_id = this.$route.params.student_id || user.learn_id;

    return {
      user,
      cohort_id: this.$route.params.cohort_id || localStorage.defaultCohort,
      student_id,
      cohort: {},
      cohorts: {},
      cohort_array: [],
      cohort_search: '',
      loading: false,
      students: []
    };
  },
  beforeRouteEnter (to, from, next) {
    if(!to.params.cohort_id) {
      next({
        name: 'dashboard',
        params: {
          cohort_id: localStorage.defaultCohort ?  localStorage.defaultCohort : 'default',
        }
      });
    } else {
      next();
    }
  },
  mounted() {
    this.load(this.cohort_id);
  },
  watch: {
    '$route.params.cohort_id'(newId, oldId) {
      this.cohort_id = newId;
      this.student_id = this.$route.params.student_id || this.user.learn_id;
      this.load(newId);
    },
    '$route.params.student_id'(newId, oldId) {
      const cohort_id = this.$route.params.cohort_id;
      this.student_id = this.$route.params.student_id || this.user.learn_id;
      this.load(cohort_id);
    }
  },
  methods: {
    load(cohort_id) {
      this.loading = true;
      this.loadCohorts();

      if(!isNaN(cohort_id)) {
        this.loadCohort(cohort_id).then(() => {
          this.loading = false;
        });
      } else {
        API
          .getDefaultCohort()
          .then(cohort_id => {
            this.cohort_id = cohort_id;
            return this.loadCohort(cohort_id);
          }).then(() => {
            this.loading = false;
          });
      }
    },
    loadCohorts() {
      let getCohorts = null;

      if(this.user.isInstructor && !this.$route.params.student_id) {
        getCohorts = API.getAllCohorts();
      } else {
        getCohorts = API.getCohorts(this.$route.params.student_id);
      }

      getCohorts
        .then(cohorts => {
          this.cohort_array = cohorts;
          this.cohorts = cohorts.reduce((byId, cohort) => {
            cohort.badge = this.getCohortBadge(cohort);
            try {
              cohort.badgeNumber = cohort.badge.split('[')[1].split(']')[0];
            } catch (e) {
              cohort.badgeNumber = -1;
            }
            byId[cohort.cohort_id] = cohort;
            return byId;
          }, {});
        });
    },
    loadCohort(cohort_id) {
      return Promise.all([
        API.getCohort(cohort_id),
        API.getStudentImages(cohort_id)
      ]).then(results => {
        const cohort = results[0];
        const students = results[1];
        cohort.badge = this.getCohortBadge(cohort);
        try {
          cohort.badgeNumber = cohort.badge.split('[')[1].split(']')[0];
        } catch (e) {
          cohort.badgeNumber = -1;
        }
        this.cohort = cohort;
        this.students = students;
      });
    },
    getCohortBadge(cohort) {
      return !cohort.name || cohort.name.trim() == '' ? cohort.label : cohort.name.split(' ')[0];
    },
    loadStudents(cohort_id) {
      return API.getStudentImages(cohort_id)
        .then(students => {
          this.students = students;
        });
    },
    changeCohort(cohort_id) {
      this.$router.push({
        name: 'dashboard',
        params: {
          cohort_id,
          student_id: this.$route.params.student_id
        }
      });
    }
  }
}
</script>
<style media="screen">
  .hide {
    display: none;
  }
  .show {
    display: '';
  }
</style>
