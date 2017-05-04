<template>
  <div>
    <br>
    <div class="row" v-if="!student_id">
      <div class="col s12 m6">
        <div class="left">
          <div class="row"
            v-bind:class="{
                show: (!loading && user.isInstructor && hasCohorts),
                hide: (loading || !(user.isInstructor && hasCohorts))
              }">
            <cohort-search :cohorts="data.cohort_array" :onCohortChange="changeCohort"></cohort-search>
          </div>
          <div
            v-if="!loading
                  && !user.isInstructor
                  && student_id
                  && hasCohorts">
            <v-btn v-dropdown:dropdown>Change Cohort</v-btn>
            <v-dropdown id="dropdown">
                <li v-for="cohort in data.cohorts">
                    <router-link
                      :to="{
                        name: 'student-dashboard',
                        params: {
                          cohort_id: cohort.cohort_id,
                          student_id: student_id
                        }
                      }">{{cohort.badge}}</router-link>
                </li>
            </v-dropdown>
          </div>
        </div>
      </div>
    </div>
    <div v-if="singleView">
      <v-btn class="orange" @click.native="viewAll()">View All Standards</v-btn>
    </div>
    <cohort-badge :cohort="data.cohortInfo"></cohort-badge>
    <center>
      <v-progress-circular v-if="loading" active green green-flash></v-progress-circular>
    </center>
    <div v-if="user.isInstructor && student_id && !singleView">
      <student-search
        v-bind:cohort_id="cohort_id"
        v-bind:onSelectStudent="selectStudent">
      </student-search>
    </div>
    <instructor-dashboard
      v-if="user.isInstructor && !$route.params.student_id"
      v-bind:user="user"
      v-bind:cohort="data.cohort"
      v-bind:cohort_id="cohort_id"
      v-bind:cohorts="data.cohorts"
      v-bind:loading="loading"
      v-bind:students="data.students">
    </instructor-dashboard>
    <student-dashboard
      v-if="!user.isInstructor || $route.params.student_id"
      :user="user"
      :cohort="data.cohort"
      :cohort_id="cohort_id"
      :singleView="singleView"
      :loading="loading">
    </student-dashboard>
  </div>
</template>

<script>
import API from '../lib/API';
import data from '../data';
import CohortSearch from './CohortSearch';
import CohortBadge from './CohortBadge';
import InstructorDashboard from './instructor/InstructorDashboard';
import StudentSearch from './StudentSearch';
import StudentDashboard from './student/StudentDashboard';

export default {
  name: 'dashboard',
  components: {
    'cohort-search': CohortSearch,
    'instructor-dashboard': InstructorDashboard,
    'student-dashboard': StudentDashboard,
    'student-search': StudentSearch,
    'cohort-badge': CohortBadge
  },
  data() {
    const user = data.data.currentUser;
    const student_id = this.$route.params.student_id || user.learn_id;

    return {
      user,
      cohort_id: this.$route.params.cohort_id || localStorage.defaultCohort,
      student_id,
      data: data.data,
      cohort_search: '',
      singleView: false,
      loading: false
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
    '$route.params.cohort_id'() {
      this.load();
    },
    '$route.params.student_id'() {
      this.load();
    }
  },
  computed: {
    hasCohorts() {
      return Object.keys(this.data.cohorts).length > 1;
    }
  },
  methods: {
    load() {
      this.singleView = this.$route.query.singleView == true ? true : false;
      this.loading = true;
      this.cohort_id = this.$route.params.cohort_id;
      this.student_id = this.$route.params.student_id ? this.$route.params.student_id : null;

      if(!isNaN(this.cohort_id)) {
        Promise.all([
          data.methods.setCohorts(this.student_id),
          data.methods.setCohort(this.cohort_id)
        ]).then(() => this.loading = false);
      } else {
        API
          .getDefaultCohort()
          .then(cohort_id => {
            this.cohort_id = cohort_id;
            this.$router.push({ name: 'dashboard', params: { cohort_id: this.cohort_id }});
          }).then(() => {
            this.loading = false;
          });
      }
    },
    changeCohort(cohortInfo) {
      this.data.cohortInfo = cohortInfo;
      const student_id = this.$route.params.student_id;

      this.$router.push({
        name: student_id ? 'student-dashboard' : 'dashboard',
        params: {
          cohort_id: cohortInfo.cohort_id,
          student_id
        }
      });
    },
    selectStudent(student) {
      this.$router.push({
        name: 'student-dashboard',
        params: {
          cohort_id: this.cohort_id,
          student_id: student.id
        }
      });
    },
    viewAll() {
      this.singleView = false;
      this.$router.push({
        name: 'student-dashboard',
        params: {
          cohort_id: this.cohort_id,
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
