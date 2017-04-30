<template>
    <div>
      <h1 class="text-center" id="student-name">{{data.student.full_name}}</h1>
      <center>
        <v-progress-circular v-if="loadingAverage" active red red-flash></v-progress-circular>
      </center>
      <div v-if="!loading && !loadingAverage">
        <div class="row">
          <div class="text-center">
            <h4>
              <p class="green-text" v-if="mastery['3']">3s:  {{mastery['3']}}%</p>
              <p class="orange-text" v-if="mastery['2']">2s:  {{mastery['2']}}%</p>
              <p class="red-text" v-if="mastery['1']">1s:  {{mastery['1']}}%</p>
            </h4>
            <h5>
              <strong>Average: </strong>{{ average }}
            </h5>
          </div>
          <br>
          <br>
          <div class="input-field">
            <v-icon prefix>search</v-icon>
            <v-text-input v-model="search" name="search" id="search" placeholder="Filter standards"></v-text-input>
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
          <div class="left">
            <v-switch
              checked
              on="Show Success Criteria"
              off="Hide Success Criteria"
              v-model="showSuccessCriteria"></v-switch>
          </div>
          <br />
          <br />
          <div v-for="subject in cohort.subjects" class="card" v-if="isSubjectVisible(subject.name)">
            <v-collection>
                <v-collection-item v-for="standard in subject.standards" v-if="isStandardVisible(standard)"
                  v-bind:class="{
                    yellow: standard && standard.standard_type == 'elective',
                    'lighten-4': standard && standard.standard_type == 'elective'
                  }">
                  <standard-checklist
                    :user="user"
                    :student="data.student"
                    :standard="standard"
                    :performance="data.performances[standard.id] || 0"
                    :showSuccessCriteria="showSuccessCriteria"
                    :evidences="data.evidences"
                    :student_id="student_id"
                    :cohort="cohort"
                    :resources="data.resources[standard.id] || []"
                    :showScore="true">
                  </standard-checklist>
                </v-collection-item>
            </v-collection>
          </div>
      </div>
      </div>
    </div>
</template>

<script>
import API from '../../lib/API';
import data from '../../data';
import {requireType, isSubjectVisible, isStandardVisible} from '../../lib/utils';
import StandardChecklist from '../StandardChecklist';

export default {
  name: 'student-dashboard',
  components: {
    'standard-checklist': StandardChecklist
  },
  data() {
    return {
      search: '',
      editMode: true,
      loadingAverage: true,
      data: data.data,
      student_id: this.$route.params.student_id,
      showSuccessCriteria: true,
      scoreFilter: {
        0: false,
        1: true,
        2: true,
        3: true
      },
      average: 0,
      mastery: {}
    };
  },
  props: {
    user: requireType(Object),
    cohort_id: requireType([String, Number]),
    cohort: requireType(Object),
    loading: requireType(Boolean)
  },
  watch: {
    '$route.params.cohort_id'() {
      this.load();
    },
    '$route.params.student_id'() {
      this.load();
    }
  },
  mounted() {
    this.load();
  },
  methods: {
    load() {
      this.loadingAverage = true;
      this.cohort_id = this.$route.params.cohort_id;
      this.student_id = this.$route.params.student_id ? this.$route.params.student_id : this.user.learn_id;

      data
        .methods
        .setStudent(this.cohort_id, this.student_id)
        .then(() => {
          return API.getAverageStudentPerformances(this.cohort_id, this.student_id);
        }).then(data => {
          this.average = data.average;
          this.mastery = data.mastery;
          this.loadingAverage = false;
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
      return isSubjectVisible(this.search, subject, this.data.cohort, this.data.performances, this.scoreFilter);
    },
    isStandardVisible(standard) {
      return isStandardVisible(this.search, standard, this.data.performances, this.scoreFilter)
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
