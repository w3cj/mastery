<template>
    <div>
      <div class="row"
        v-if="!loading"
        v-bind:class="{
            show: (!loading && data.cohort_array.length > 1),
            hide: (loading || data.cohort_array.length <= 1)
          }">
          <v-btn class="indigo" v-dropdown:dropdown>Change Cohort</v-btn>
          <v-dropdown id="dropdown">
            <li v-for="cohort in data.cohort_array">
              <span @click="changeCohort(cohort)">{{cohort.name}}</span>
            </li>
          </v-dropdown>
      </div>
      <h1 class="text-center" id="student-name">{{data.student.full_name}}</h1>
      <center>
        <v-progress-circular v-if="loadingAverage" active red red-flash></v-progress-circular>
      </center>
      <div v-if="!loading && !loadingAverage">
        <div class="row">
          <div class="text-center row" v-if="!singleView">
            <h5 class="col s12">
              <strong>Average: </strong>{{ average }}
            </h5>
            <div class="col s12 m6">
              <h4>
                <p class="green-text" v-if="mastery['3']">3s:  {{mastery['3']}}%</p>
                <p class="orange-text" v-if="mastery['2']">2s:  {{mastery['2']}}%</p>
                <p class="red-text" v-if="mastery['1']">1s:  {{mastery['1']}}%</p>
              </h4>
            </div>
            <div class="col s12 m6">
              <pie-chart :chart-data="chartData"></pie-chart>
            </div>
          </div>
          <div class="input-field" v-if="!singleView">
            <v-icon prefix>search</v-icon>
            <v-text-input v-model="search" name="search" id="search" placeholder="Filter standards"></v-text-input>
          </div>
          <br>
          <div class="row" v-if="!singleView">
            <div class="col s12 m6">
              <v-switch
              checked
              on="Show Success Criteria"
              off="Hide Success Criteria"
              v-model="showSuccessCriteria"></v-switch>
            </div>
            <div class="col s12 m6">
              <h4>Filter Score</h4>
              <a v-on:click="filterScore()" class="waves-effect waves-light btn">All</a>
              <a v-on:click="filterScore(0)" class="waves-effect waves-light btn grey" v-bind:class="{'lighten-5': !scoreFilter[0]}">0</a>
              <a v-on:click="filterScore(1)" class="waves-effect waves-light btn red" v-bind:class="{'lighten-5': !scoreFilter[1]}">1</a>
              <a v-on:click="filterScore(2)" class="waves-effect waves-light btn yellow" v-bind:class="{'lighten-5': !scoreFilter[2], 'accent-4': scoreFilter[2]}">2</a>
              <a v-on:click="filterScore(3)" class="waves-effect waves-light btn green" v-bind:class="{'lighten-5': !scoreFilter[3]}">3</a>
            </div>
          </div>
          <div v-for="subject in visibleSubjects" class="card">
            <v-collection with-header>
              <v-collection-item header>
                  <h3>{{subject.name}}</h3>
              </v-collection-item>
                <v-collection-item v-for="standard in subject.standards" v-if="standard.visible"
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
                    :resources="data.resources[standard.id]"
                    :singleView="singleView"
                    :showScore="true">
                  </standard-checklist>
                </v-collection-item>
            </v-collection>
          </div>
          <div v-if="visibleSubjects.length == 0">
            <blockquote>No standards to show. Try <a @click="search = ''" :href="'#' + $route.path">removing the filter</a> or <a @click="filterScore" :href="'#' + $route.path">show all scores.</a></blockquote>
          </div>
      </div>
      </div>
    </div>
</template>

<script>
import API from '../../lib/API';
import data from '../../data';
import {isSubjectVisible} from '../../lib/utils';
import StandardChecklist from '../StandardChecklist';
import PieChart from '../charts/PieChart';
import CohortSearch from '../CohortSearch';

export default {
  name: 'student-dashboard',
  components: {
    'standard-checklist': StandardChecklist,
    PieChart,
    'cohort-search': CohortSearch
  },
  props: ['user', 'cohort_id', 'cohort', 'loading', 'singleView'],
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
        3: false,
        4: false
      },
      average: 0,
      mastery: {},
      chartData: {}
    };
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
    visibleSubjects() {
      return this.data.cohort.subjects.filter(subject => isSubjectVisible(this.search, subject.name, this.data.cohort, this.data.performances, this.scoreFilter, this.$route.query.standard_id));
    }
  },
  mounted() {
    this.load();
  },
  methods: {
    load() {
      if(this.cohort_id == 'default') return;

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
          this.chartData = {
            labels: ['1s', '2s', '3s'],
            datasets: [
              {
                backgroundColor: ['#F44336', '#ff9800', '#4CAF50'],
                data: [this.mastery[1], this.mastery[2], this.mastery[3]]
              }
            ]
          };

          this.loadingAverage = false;
        });
    },
    filterScore(score) {
      if (typeof score == 'number') {
        this.scoreFilter[score] = !this.scoreFilter[score];
        if(score == 3) {
          this.scoreFilter[4] = this.scoreFilter[3];
        }
      } else {
        this.scoreFilter = {
          0: true,
          1: true,
          2: true,
          3: true,
          4: true
        };
      }
    },
    changeCohort({cohort_id}) {
      const student_id = this.$route.params.student_id;
      const params = {
        cohort_id
      }

      if(student_id) {
        params.student_id = student_id;
      }

      this.$router.push({
        name: student_id ? 'student-dashboard' : 'dashboard',
        params
      });
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
  .clear {
    float: clear;
  }
</style>
