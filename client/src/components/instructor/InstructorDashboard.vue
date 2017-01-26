<template>
  <div>
    <div v-if="!loading">
      <div class="row">
        <div class="input-field col s12">
          <v-icon prefix>search</v-icon>
          <v-text-input v-model="search" name="search" id="search" placeholder="Search students..."></v-text-input>
        </div>
        <div class="col s12">
          <a v-on:click="showImage = !showImage" class="waves btn indigo lighten-1">{{showImage ? 'Hide' : 'Show'}} Images</a>
          <a v-on:click="showScore = !showScore" class="waves btn">{{showScore ? 'Hide' : 'Show'}} Scores</a>
        </div>
        <div class="col s12" v-if="showScore && !loadingPerformances">
          <h3 v-if="scoreSubject_id > -1">Average {{cohort.subjectsById[scoreSubject_id].name}} Score</h3>
          <h3 v-if="scoreSubject_id == -1">Overall Average Score</h3>
          <div class="input-field">
            <v-select name="select"
              id="select"
              select-text="Overall Average"
              v-model="scoreSubject_id"
              :items="cohort.subjects">
            </v-select>
            <label for="select">Select Subject</label>
          </div>
          <!-- <v-btn v-dropdown:dropdown belowOrigin alignment="left">Change Average Score Subject</v-btn>
          <v-dropdown id="dropdown" belowOrigin>
              <li>
                  <a v-on:click.stop="setFilteredSubject(-1)">Overall Average</a>
              </li>
              <li v-for="subject in cohort.subjects">
                  <a v-on:click.stop="setFilteredSubject(subject.id)">{{subject.name}}</a>
              </li>
          </v-dropdown> -->
          <a v-on:click="sortAccending = !sortAccending" class="waves btn indigo lighten-1">Sort {{sortAccending ? 'Accending' : 'Decending'}}</a>
        </div>
      </div>
       <div class="row">
         <student
          v-for="student in orderedStudents"
          :student="student"
          :cohort_id="cohort_id"
          :performances="averagePerformances[student.id] ? averagePerformances[student.id] : {}"
          :showImage="showImage"
          :showScore="showScore"
          :scoreSubject_id="scoreSubject_id"
          :search="search">
         </student>
       </div>
    </div>
  </div>
</template>

<script>
import API from '../../lib/API';
import Student from '../Student';
import {requireType} from '../../lib/utils';

export default {
  name: 'instructor-dashboard',
  components: {
    'student': Student,
  },
  data() {
    return {
      search: '',
      loadingPerformances: true,
      performances: {},
      averagePerformances: {},
      showImage: true,
      showScore: false,
      scoreSubject_id: -1,
      sortAccending: true
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
  watch: {
    '$route.params.cohort_id'() {
      this.load();
    },
    'scoreSubject_id'(newValue) {
      console.log(newValue);
      if(typeof newValue == 'number') {
        this.scoreSubject_id = newValue;
      } else {
        const subject = this.cohort.subjects.filter(s => s.text == newValue)[0];
        if(subject) {
          this.scoreSubject_id = subject.id;
        } else {
          this.scoreSubject_id = -1;
        }
      }
    }
  },
  mounted() {
    this.load();
  },
  computed: {
    orderedStudents() {
      if(this.showScore && !this.loadingPerformances) {
        const sort = (a, b) => {

          if(this.scoreSubject_id != -1) {
            if(this.averagePerformances[a.id][this.scoreSubject_id] == undefined || this.averagePerformances[b.id][this.scoreSubject_id] == undefined) {
              return 0;
            }

            return this.averagePerformances[a.id][this.scoreSubject_id].average - this.averagePerformances[b.id][this.scoreSubject_id].average;
          } else {
            return this.averagePerformances[a.id].average - this.averagePerformances[b.id].average;
          }
        }

        return this.students.slice().sort((a, b) => {
          if(!this.sortAccending) {
            return sort(a, b);
          } else {
            return sort(b, a);
          }
        });
      }

      return this.students;
    }
  },
  methods: {
    load() {
      this.loadingPerformances = true;
      Promise.all([
        API
          .getPerformances(this.cohort_id),
        API
          .getAveragePerformances(this.cohort_id)
      ]).then(results => {
        this.performances = results[0];
        this.averagePerformances = results[1];
        this.loadingPerformances = false;
        if(!this.cohort.subjectsById[this.scoreSubject_id]) {
          this.scoreSubject_id = -1;
        }
      });
    },
    setFilteredSubject(id) {
      console.log(id);
      this.scoreSubject_id = id;
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
