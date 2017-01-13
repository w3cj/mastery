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
        <router-link v-if="user.isInstructor" :to="{ name: 'dashboard' }" class="waves btn indigo lighten-1">Dashboard</router-link>
        <router-link v-if="user.isInstructor" :to="{ name: 'cohort', params: { id: defaultCohort }}" class="waves btn green">Assign Standards</router-link>
      </div>
      <center>
        <h1>{{cohorts[defaultCohort] ? getCohortBadge(cohorts[defaultCohort].name) : 'Loading standards...'}}</h1>
        <h1>{{student.full_name}}</h1>
        <v-progress-circular v-if="loadingStandards" active green green-flash></v-progress-circular>
      </center>
      <div v-if="!loadingStandards">
        <div class="input-field">
             <v-icon prefix>search</v-icon>
             <v-text-input v-model="search" name="search" id="search"></v-text-input>
         </div>
      </div>
      <div class="left">
        <h4 class="white-text">wat</h4>
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
      <div v-for="subject in cohort.subjects" class="card" v-if="!loadingStandards && isSubjectVisible(subject.name)">
        <v-collection with-header>
            <v-collection-item header>
                <h3>{{subject.name}}</h3>
            </v-collection-item>
            <v-collection-item v-for="standard in subject.standards" v-if="isStandardVisible(standard)">
              <h4>
                <a v-on:click="toggleEditStandard(standard, $event)" class="btn-floating btn-large waves-effect waves-light" v-bind:class="performanceColors(standard.id)">
                  <i v-if="!isEditing(standard.id)" class="material-icons">playlist_add_check</i>
                  <i v-if="isEditing(standard.id)" class="material-icons">arrow_back</i>
                </a> {{standard.title}}
                <span style="float:right" v-bind:class="performanceTextColors(standard.id)">
                  {{performances[standard.id]}}
                </span>
              </h4>
              <ul v-if="showSuccessCriteria && !isEditing(standard.id)">
                <li v-for="success_criteria in standard.success_criteria">
                  <p class="grey-text center" style="flex-direction: row;cursor: not-allowed;">
                    <v-icon v-if="isChecked(success_criteria._id)" class="green-text">check_box</v-icon>
                    <v-icon v-if="!isChecked(success_criteria._id)">check_box_outline_blank</v-icon>
                    <span>{{decodeHtml(success_criteria.text)}}</span>
                    <v-progress-linear indeterminate v-if="evidences[success_criteria._id] && evidences[success_criteria._id].checking"></v-progress-linear>
                  </p>
                </li>
              </ul>
              <v-collapsible collapse popout v-if="isEditing(standard.id)">
                <li>
                    <v-collapsible-header class="active" style="padding:1em;">
                      <h4>Success Criteria</h4>
                    </v-collapsible-header>
                    <v-collapsible-body>
                      <ul>
                        <li v-for="success_criteria in standard.success_criteria">
                            <p class="center success_criteria" style="cursor:pointer; flex-direction: row;">
                              <span class="center" v-on:mousedown="checkSuccessCriteria(success_criteria, $event)" style="flex-direction: row;">
                                <v-icon v-if="isChecked(success_criteria._id)"  v-bind:class="{'green-text': isChecked(success_criteria._id), 'grey-text': !isChecked(success_criteria._id)}">check_box</v-icon>
                                <v-icon v-if="!isChecked(success_criteria._id)">check_box_outline_blank</v-icon>
                                <h5 style="text-align:left;margin-left:1em;" v-bind:class="{'grey-text': !isChecked(success_criteria._id)}">{{decodeHtml(success_criteria.text)}}</h5>
                              </span>
                            </p>
                            <p v-if="evidences[success_criteria._id] && evidences[success_criteria._id].checking">
                              <v-progress-linear indeterminate></v-progress-linear>
                            </p>
                        </li>
                      </ul>
                    </v-collapsible-body>
                </li>
            </v-collapsible>
            </v-collection-item>
        </v-collection-item>
      </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Auth from '../../lib/Auth';
import API from '../../lib/API';
import getEncouragement from '../../lib/encouragement';
import EvidenceButtons from '../EvidenceButtons';
import * as actionTypes from '../../store/action-types';
import * as mutationTypes from '../../store/mutation-types';

export default {
  name: 'student-dashboard',
  components: {
    'evidence-buttons': EvidenceButtons
  },
  data() {
    return {
      user: Auth.getCurrentUser(),
      search: '',
      defaultCohort: localStorage.defaultCohort,
      editMode: true,
      loadingStandards: true,
      performances: {},
      evidences: {},
      cohort: {},
      cohorts: {},
      student: {},
      showSuccessCriteria: true,
      scoreFilter: {
        0: true,
        1: true,
        2: true,
        3: true
      }
    };
  },
  computed: {
    ...mapGetters({
      currentUser: 'currentUser',
      editing: 'editing',
    })
  },
  mounted() {
    const student_id = this.$route.params.student_id || this.user.learn_id;
    this.student_id = student_id;

    API.getEvidences(student_id)
      .then(evidences => {
        this.evidences = evidences;
      });

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
          API.getStudentImages(defaultCohort),
          API.getCohort(defaultCohort)
        ]).then(results => {
          this.student = results[0].filter(s => s.id == student_id)[0];
          this.studentImage = results[1][student_id];
          this.loadCohort(results[2]);
        });
      });
  },
  methods: {
    loadCohort(cohort) {
      this.cohort = cohort;
      API
        .getPerformances(this.defaultCohort, this.$route.params.student_id || this.user.learn_id)
        .then(data => {
          this.performances = data;
        }).catch(error => {
          console.error(error);
        }).then(() => {
          this.loadingStandards = false;
        });
    },
    changeCohort(cohort_id) {
      this.defaultCohort = cohort_id;
      localStorage.defaultCohort = cohort_id;
      this.loadingStandards = true;

      API
        .getCohort(this.defaultCohort)
        .then(this.loadCohort);
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
    isSubjectVisible(subject) {
      subject = this.cohort.subjects.filter(s => s.name == subject)[0];
      const isVisible = subject.standards.reduce((isAssigned, standard) => {
        return (isAssigned || this.isStandardVisible(standard));
      }, false);

      if(isVisible && this.search.trim() != '') {
        const regexp = new RegExp(this.search, 'gi');
        return isVisible || subject.name.match(regexp);
      } else {
        return isVisible;
      }
    },
    isStandardVisible(standard) {
      const performance = this.performances[standard.id];
      const isVisible = (standard.assigned || this.performances[standard.id]) && this.scoreFilter[performance];

      if(isVisible && this.search.trim() != '') {
        const regexp = new RegExp(this.search, 'gi');
        return isVisible && JSON.stringify(standard).match(regexp);
      } else {
        return isVisible;
      }
    },
    hideShowSuccessCriteria() {
      this.showSuccessCriteria = !this.showSuccessCriteria;
    },
    isEditing(id) {
      return this.editing[id];
    },
    isChecked(id) {
      return this.evidences[id] && this.evidences[id].checked;
    },
    checkSuccessCriteria(success_criteria, event) {
      event.stopPropagation();
      const id = success_criteria._id;
      let checked = this.evidences[id] ? !this.evidences[id].checked : true;

      if(!this.evidences[id]) {
        this.$set(this.evidences, id, {
          checking: true
        });
      }

      API.checkSuccessCriteria(this.student_id, this.cohort.cohort_id, id, checked)
        .then((result) => {
          setTimeout(() => {
            this.evidences[id] = result;
            if(result.checked) {
              Materialize.toast(getEncouragement(), 3000);
            }
          }, 500);
        });

    },
    toggleEditStandard(standard, event) {
      event.stopPropagation();
      this.$store.dispatch(actionTypes.TOGGLE_EDIT_STANDARD, standard.id);
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