<template>
  <div>
    <cohort-badge :cohort="cohort"></cohort-badge>
    <div v-if="user.isInstructor">
      <student-search
        v-bind:cohort_id="cohort_id"
        v-bind:onSelectStudent="selectStudent">
      </student-search>
    </div>
    <center>
      <h2 v-if="!loading && student" id="student-name">{{student.full_name}}</h2>
      <h3 v-if="!loading">{{$route.params.collection_name}} Standards</h3>
      <v-progress-circular v-if="loading" active green green-flash></v-progress-circular>
    </center>
    <div v-if="!loading">
      <div v-if="user.isInstructor && !$route.params.student_id">
        <standard-search v-bind:cohort="cohort" v-bind:onAddStandard="addStandard"></standard-search>
      </div>
      <br>
      <br>
      <div v-if="standards && standards.length > 0">
        <v-progress-linear indeterminate v-if="removing || adding"></v-progress-linear>
        <v-collection>
            <v-collection-item v-for="standard in standards">
              <standard-checklist
                :user="user"
                :student="student"
                :standard="standard"
                :performance="performances[standard.id]"
                :showSuccessCriteria="showSuccessCriteria"
                :evidences="evidences"
                :student_id="student_id"
                :cohort="cohort"
                :resources="resources[standard.id] || []"
                :showScore="true">
              </standard-checklist>
              <div v-if="user.isInstructor && !$route.params.student_id">
                <a v-on:click="removeStandard(standard)" class="waves btn">Remove</a>
              </div>
            </v-collection-item>
        </v-collection>
      </div>
      <div v-if="standards && standards.length == 0">
        <h5 class="text-center grey-text">There are no standards in this collection.</h5>
      </div>
    </div>
  </div>
</template>

<script>
import API from '../lib/API';
import Auth from '../lib/Auth';
import StandardSearch from './StandardSearch';
import StudentSearch from './StudentSearch';
import StandardChecklist from './StandardChecklist';
import CohortBadge from './CohortBadge';

export default {
  name: 'standards-collection',
  components: {
    'standard-search': StandardSearch,
    'student-search': StudentSearch,
    'standard-checklist': StandardChecklist,
    'cohort-badge': CohortBadge
  },
  data() {
    return {
      user: Auth.getCurrentUser(),
      student: {},
      cohort_id: this.$route.params.cohort_id,
      student_id: this.$route.params.student_id,
      cohort: {},
      loading: true,
      standards: [],
      evidences: {},
      resources: {},
      performances: {},
      showSuccessCriteria: true,
      removing: false,
      adding: false
    };
  },
  watch: {
    '$route.params.student_id'(newId, oldId) {
      this.load();
    }
  },
  mounted() {
    this.load();
  },
  methods: {
    load() {
      this.loading = true;
      this.user = Auth.getCurrentUser();
      this.cohort_id = this.$route.params.cohort_id;
      this.student_id = this.$route.params.student_id ? this.$route.params.student_id : this.user.learn_id;

      Promise.all([
        API.getEvidences(this.student_id)
          .then(evidences => {
            this.evidences = evidences;
          }).catch(() => {
            this.$router.replace('/');
          }),
        API
          .getCohort(this.cohort_id)
          .then(cohort => {
            this.cohort = cohort;
          }),
        API.getStudent(this.cohort_id, this.student_id)
          .then(student => {
            student = student ? student : this.user;
            this.student = student;
            this.student_id = student.id ? student.id : student.learn_id;
          }),
        API
          .getStudentPerformances(this.cohort_id, this.student_id)
          .then(data => {
            this.performances = data;
          }).catch(error => {
            this.$router.go('/');
          }).then(() => {
            this.loadingStandards = false;
          }),
        API
          .getAllResources(this.cohort_id)
          .then(resources => {
            this.resources = resources;
          })
      ]).then(() => {
        API
          .getStandardCollection(this.cohort_id, this.$route.params.collection_name)
          .then(collection => {
            if(collection) {
              this.standards = collection.standards.map(id => this.cohort.standards[id]);
            }
            this.loading = false;
          });
      }).catch(() => {
        this.$router.go('/');
      });
    },
    addStandard(standard) {
      if(this.standards.filter(s => s.id == standard.id).length > 0) return;
      this.adding = true;

      API
        .addStandardToCollection(this.cohort_id, this.$route.params.collection_name, standard.id)
        .then(collection => {
          this.adding = false;
          this.standards.push(standard);
        });
    },
    removeStandard(standard) {
      this.removing = true;
      API
        .removeStandardFromCollection(this.cohort_id, this.$route.params.collection_name, standard.id)
        .then(collection => {
          const index = this.standards.indexOf(standard);
          this.standards.splice(index, 1);
          this.removing = false;
        });
    },
    selectStudent(student) {
      this.$router.push({ name: 'standards-collection-student', params: { cohort_id: this.cohort_id, collection_name: this.$route.params.collection_name, student_id: student.id }})
    }
  }
}
</script>
<style>
  .card {
    margin: 0.25em;
  }
  .margin {
    margin: 3em;
  }
  .margin-bottom {
    margin: 1em;
  }
  .margin-left-top {
    margin-left: 1em;
    margin-top: 1em;
  }
</style>
