<template>
  <div>
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
import InstructorDashboard from './instructor/InstructorDashboard';
import StudentDashboard from './student/StudentDashboard';

export default {
  name: 'dashboard',
  components: {
    'instructor-dashboard': InstructorDashboard,
    'student-dashboard': StudentDashboard,
  },
  data() {
    return {
      user: Auth.getCurrentUser(),
      cohort_id: this.$route.params.cohort_id || localStorage.defaultCohort,
      cohort: {},
      cohorts: {},
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
      this.load(newId);
    },
    '$route.params.student_id'(newId, oldId) {
      const cohort_id = this.$route.params.cohort_id;
      this.load(cohort_id);
    }
  },
  methods: {
    load(cohort_id) {
      this.loading = true;
      this.loadCohorts();

      if(!isNaN(cohort_id)) {
        this.loadCohort(cohort_id).then(() => this.loading = false);
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
      API
        .getCohorts(this.$route.params.student_id)
        .then(cohorts => {
          this.cohorts = cohorts.reduce((byId, cohort) => {
            cohort.badge = this.getCohortBadge(cohort);
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
    }
  }
}
</script>
