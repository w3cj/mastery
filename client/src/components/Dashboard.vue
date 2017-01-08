<template>
  <div>
    <h1>Standards</h1>
    <center>
      <v-progress-circular v-if="loadingStandards" active green green-flash></v-progress-circular>
    </center>
    <div v-for="subject in cohort.subjects" class="card" v-if="!loadingStandards && hasAssignedStandards(subject.name)">
      <v-collection with-header>
          <v-collection-item header>
              <h3>{{subject.name}}</h3>
          </v-collection-item>
          <v-collection-item v-for="standard in subject.standards" v-if="standard.assigned || performances[standard.id]">
            <h4>
              <a v-on:click="toggleEditStandard(standard, $event)" class="btn-floating btn-large waves-effect waves-light" v-bind:class="performanceColors(standard.id)">
                <i v-if="!isEditing(standard.id)" class="material-icons">playlist_add_check</i>
                <i v-if="isEditing(standard.id)" class="material-icons">arrow_back</i>
              </a> {{standard.title}}
              <span style="float:right" v-bind:class="performanceTextColors(standard.id)">
                {{performances[standard.id]}}
              </span>
            </h4>
            <ul v-if="!isEditing(standard.id)">
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
import Auth from '../lib/Auth';
import API from '../lib/API';
import EvidenceButtons from './EvidenceButtons';
import * as actionTypes from '../store/action-types';
import * as mutationTypes from '../store/mutation-types';

export default {
  name: 'dashboard',
  components: {
    'evidence-buttons': EvidenceButtons
  },
  data() {
    return {
      defaultCohort: localStorage.defaultCohort,
      editMode: true,
      loadingStandards: true,
      performances: {},
      cohort: {}
    };
  },
  computed: {
    ...mapGetters({
      currentUser: 'currentUser',
      defaultCohort: 'defaultCohort',
      evidences: 'evidences',
      editing: 'editing',
    })
  },
  created() {
    this.$store.dispatch(actionTypes.GET_EVIDENCES);

    const user = Auth.getCurrentUser();
    API
      .getDefaultCohort()
      .then(defaultCohort => {
        this.defaultCohort = defaultCohort;
        return API.getCohort(defaultCohort);
      }).then(cohort => {
        this.cohort = cohort;
      }).then(() => {
        return API
                .getPerformances(this.defaultCohort, 1677)
      }).then(data => {
        this.performances = data;
      }).catch(error => {
        console.error(error);
      }).then(() => {
        this.loadingStandards = false;
      });
  },
  methods: {
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
    hasAssignedStandards(subject) {
      subject = this.cohort.subjects.filter(s => s.name == subject)[0];
      return subject.standards.reduce((isAssigned, standard) => {
        return isAssigned || standard.assigned || this.performances[standard.id] != 0;
      }, false);
    },
    isEditing(id) {
      return this.editing[id];
    },
    isChecked(id) {
      return this.evidences[id] && this.evidences[id].checked;
    },
    checkSuccessCriteria(success_criteria, event) {
      event.stopPropagation();
      this.$store.dispatch(actionTypes.CHECK_SUCCESS_CRITERIA, success_criteria._id);
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
</style>
