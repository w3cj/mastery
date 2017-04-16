<template>
    <div>
      <h1 class="text-center">{{student.full_name}}</h1>
      <center>
        <v-progress-circular v-if="loadingStandards" active red red-flash></v-progress-circular>
      </center>
      <div v-if="!loading && !loadingStandards">
        <div class="row">
          <router-link class="btn waves" :to="{ name: 'standard-collections', params: { cohort_id: $route.params.cohort_id} }"><i class="material-icons left">group_work</i>View Standard Collections</router-link>
          <br>
          <br>
          <div class="col s12" v-if="tab == 'standards'">
            <div>
              <div class="input-field">
                   <v-icon prefix>search</v-icon>
                   <v-text-input v-model="search" name="search" id="search" placeholder="Filter standards"></v-text-input>
               </div>
            </div>
            <div class="left">
              <p class="white-text">wat</p>
              <a v-on:click="hideShowSuccessCriteria()" class="waves-effect waves-light btn indigo lighten-1">{{showSuccessCriteria ? 'Hide' : 'Show'}} Success Criteria</a>
            </div>
            <div class="score-buttons">
              <h4>Filter Score</h4>
              <a v-on:click="filterScore()" class="waves-effect waves-light btn">All</a>
              <a v-on:click="filterScore(0)" class="waves-effect waves-light btn grey" v-bind:class="{'lighten-5': !scoreFilter[0]}">0</a>
              <a v-on:click="filterScore(1)" class="waves-effect waves-light btn red" v-bind:class="{'lighten-5': !scoreFilter[1]}">1</a>
              <a v-on:click="filterScore(2)" class="waves-effect waves-light btn yellow" v-bind:class="{'lighten-5': !scoreFilter[2], 'accent-4': scoreFilter[2]}">2</a>
              <a v-on:click="filterScore(3)" class="waves-effect waves-light btn green" v-bind:class="{'lighten-5': !scoreFilter[3]}">3</a>
            </div>
            <div class="clear">

            </div>
            <br />
            <br />
            <br />
            <br />
            <br />
            <div v-for="subject in cohort.subjects" class="card" v-if="isSubjectVisible(subject.name)">
              <v-collection>
                  <v-collection-item v-for="standard in subject.standards" v-if="isStandardVisible(standard)">
                    <standard-checklist
                      :standard="standard"
                      :performance="performances[standard.id]"
                      :showSuccessCriteria="showSuccessCriteria"
                      :evidences="evidences"
                      :student_id="student_id"
                      :cohort="cohort"
                      :resources="resources[standard.id] || []"
                      :showScore="true">
                    </standard-checklist>
                  </v-collection-item>
              </v-collection>
            </div>
          </div>
          <div v-if="tab == 'challenge-progress'" class="col s12">
            <h2>Challenge progress...</h2>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Auth from '../../lib/Auth';
import API from '../../lib/API';
import {requireType, isSubjectVisible, isStandardVisible} from '../../lib/utils';
import EvidenceButtons from '../EvidenceButtons';
import StandardChecklist from '../StandardChecklist';
import * as actionTypes from '../../store/action-types';
import * as mutationTypes from '../../store/mutation-types';

export default {
  name: 'student-dashboard',
  components: {
    'evidence-buttons': EvidenceButtons,
    'standard-checklist': StandardChecklist
  },
  data() {
    return {
      search: '',
      editMode: true,
      loadingStandards: true,
      performances: {},
      evidences: {},
      student: {},
      resources: {},
      student_id: this.$route.params.student_id,
      showSuccessCriteria: true,
      tab: 'standards',
      scoreFilter: {
        0: true,
        1: true,
        2: true,
        3: true
      }
    };
  },
  props: {
    user: requireType(Object),
    cohort_id: requireType([String, Number]),
    cohort: requireType(Object),
    cohorts: requireType(Object),
    loading: requireType(Boolean)
  },
  watch: {
    '$route.params.cohort_id'(newId, oldId) {
      this.cohort_id = newId;
      this.load();
    },
    '$route.params.student_id'(newId, oldId) {
      const cohort_id = this.$route.params.cohort_id;
      this.load();
    }
  },
  mounted() {
    $(document).ready(function(){
      $('ul.tabs').tabs();
    });
    this.load();
  },
  methods: {
    load() {
      this.student_id = this.$route.params.student_id ? this.$route.params.student_id : this.user.learn_id;

      API.getEvidences(this.student_id)
        .then(evidences => {
          this.evidences = evidences;
        }).catch(() => {
          this.$router.replace('/');
        });

      if(this.cohort_id == 'default') {
        API
          .getDefaultCohort()
          .then(cohort_id => {
            this.cohort_id = cohort_id;
            this.getStudentAndPerformances();
          });
      } else {
        this.getStudentAndPerformances();
      }

      API
        .getAllResources(this.cohort_id)
        .then(resources => {
          this.resources = resources;
        });
    },
    getStudentAndPerformances() {
      API.getStudent(this.cohort_id, this.student_id)
        .then(student => {
          student = student ? student : this.user;
          this.student = student;
          this.student_id = student.id ? student.id : student.learn_id;
        });

      API
        .getStudentPerformances(this.cohort_id, this.student_id)
        .then(data => {
          this.performances = data;
        }).catch(error => {
          // this.$router.go('/');
          console.log('error!');
        }).then(() => {
          this.loadingStandards = false;
        });
    },
    filterScore(score) {
      if (typeof score == 'number') {
        this.scoreFilter[score] = !this.scoreFilter[score];
      } else {
        this.scoreFilter = {
          0: true,
          1: true,
          2: true,
          3: true
        };
      }
    },
    isSubjectVisible(subject) {
      return isSubjectVisible(this.search, subject, this.cohort, this.performances, this.scoreFilter);
    },
    isStandardVisible(standard) {
      return isStandardVisible(this.search, standard, this.performances, this.scoreFilter)
    },
    hideShowSuccessCriteria() {
      this.showSuccessCriteria = !this.showSuccessCriteria;
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
