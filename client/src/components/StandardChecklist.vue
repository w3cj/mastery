<template>
  <div>
    <h4>
      <a v-on:click="toggleEditStandard($event)" class="btn-floating btn-large waves-effect waves-light" v-bind:class="performanceColors">
        <i v-if="!isEditing" class="material-icons">playlist_add_check</i>
        <i v-if="isEditing" class="material-icons">arrow_back</i>
      </a> {{standard.description}}
      <span v-if="showScore && !user.isInstructor" style="float:right" v-bind:class="performanceTextColors">
        {{performance}}
      </span>
      <span v-if="showScore && user.isInstructor" style="float:right">
        <div class="input-field inline">
            <input
              :id="'performance' + standard.id"
              v-model="standard.setScore"
              type="number"
              class="validate performance-input"
              v-bind:class="performanceTextColors"
              v-on:keyup.enter="setPerformance(standard)">
        </div>
        <v-progress-linear v-if="standard.settingPerformance" indeterminate class="performance-progress"></v-progress-linear>
      </span>
    </h4>
    <ul v-if="showSuccessCriteria && !isEditing">
      <li v-for="success_criteria in standard.success_criteria">
        <p class="grey-text center" style="flex-direction: row;cursor: not-allowed;">
          <v-icon v-if="isChecked(success_criteria._id)"
            v-bind:class="{
              'green-text': evidences[success_criteria._id].approved,
              'yellow-text': !evidences[success_criteria._id].approved
            }">check_box</v-icon>
          <v-icon v-if="!isChecked(success_criteria._id)">check_box_outline_blank</v-icon>
          <span>{{decodeHtml(success_criteria.text)}}</span>
          <v-progress-linear indeterminate v-if="evidences[success_criteria._id] && evidences[success_criteria._id].checking"></v-progress-linear>
        </p>
      </li>
    </ul>
    <v-collapsible collapse popout v-if="isEditing">
      <li>
          <v-collapsible-header class="active" style="padding:1em;">
            <!-- <h4>Success Criteria</h4> -->
          </v-collapsible-header>
          <v-collapsible-body>
            <div class="buttons">
              <a v-on:click="tab = 'success_criteria'" class="waves-effect waves-light btn green"
                v-bind:class="{
                  disabled: tab == 'success_criteria'
                }"><i class="material-icons left">playlist_add_check</i>Success Criteria</a>
              <a v-on:click="tab = 'resources'" class="waves-effect waves-light btn orange"
                v-bind:class="{
                  disabled: tab == 'resources'
                }"><i class="material-icons left">library_books</i>Resources</a>
            </div>
            <div v-if="tab == 'success_criteria'">
              <ul>
                <li v-for="success_criteria in standard.success_criteria">
                  <div class="center success-criteria-check" style="cursor:pointer; flex-direction: row;">
                    <span class="center" v-on:mousedown="checkSuccessCriteria(success_criteria, $event)" style="flex-direction: row;">
                      <v-icon v-if="isChecked(success_criteria._id)"
                        v-bind:class="{
                          'green-text': isChecked(success_criteria._id) && evidences[success_criteria._id].approved,
                          'yellow-text': isChecked(success_criteria._id) && !evidences[success_criteria._id].approved,
                          'grey-text': !isChecked(success_criteria._id)
                        }">check_box</v-icon>
                      <v-icon v-if="!isChecked(success_criteria._id)">check_box_outline_blank</v-icon>
                      <h5 style="text-align:left;margin-left:1em;" v-bind:class="{'grey-text': !isChecked(success_criteria._id)}">{{decodeHtml(success_criteria.text)}}</h5>
                    </span>
                    <span class="white-text">w</span>
                    <a
                      v-if="user.isInstructor && isChecked(success_criteria._id)"
                      v-on:click="approve(success_criteria._id, !evidences[success_criteria._id].approved)"
                      class="btn-floating waves-effect waves-light"
                      v-bind:class="{
                        'green': !evidences[success_criteria._id].approved,
                        'yellow': evidences[success_criteria._id].approved
                      }">
                      <i class="material-icons">done</i>
                    </a>
                  </div>
                  <div class="success-criteria-notes">
                    <success-criteria-notes
                      :cohort_id="cohort_id"
                      :student_id="student_id"
                      :notes="notes[success_criteria._id] || []"
                      :standard_id="standard.id"
                      :success_criteria_id="success_criteria._id">
                    </success-criteria-notes>
                  </div>
                  <p v-if="evidences[success_criteria._id] && (evidences[success_criteria._id].checking || evidences[success_criteria._id].approving)">
                    <v-progress-linear indeterminate></v-progress-linear>
                  </p>
                </li>
              </ul>
            </div>
            <div v-if="tab == 'resources'">
              <resource-list  v-if="resources.length > 0" :resources="resources"></resource-list>
              <blockquote  v-if="!resources || resources.length == 0 ">
                No resources found.
              </blockquote>
            </div>
          </v-collapsible-body>
      </li>
    </v-collapsible>
  </div>
</template>

<script>
import API from '../lib/API';
import ResourceList from './ResourceList';
import SuccessCriteriaNotes from './SuccessCriteriaNotes';
import getEncouragement from '../lib/encouragement';
import {decodeHtml} from '../lib/utils';

export default {
  name: 'standard-checklist',
  props: ['student', 'user', 'standard', 'performance', 'showSuccessCriteria', 'evidences', 'student_id', 'cohort', 'showScore', 'resources'],
  components: {
    'resource-list': ResourceList,
    'success-criteria-notes': SuccessCriteriaNotes
  },
	data() {
		return {
      isEditing: false,
      tab: 'success_criteria',
      performanceColors: {},
      performanceTextColors: {}
		}
	},
  watch: {
    'standard.setScore'() {
      this.performanceColors = this.getPerformanceColors();
      this.performanceTextColors = this.getPerformanceTextColors();
    }
  },
  mounted() {
    this.load();
  },
	methods: {
    load() {
      this.cohort_id = this.cohort.cohort_id;

      if(this.user.isInstructor) {
        this.$set(this.standard, 'setScore', this.performance);
      }

      this.performanceColors = this.getPerformanceColors();
      this.performanceTextColors = this.getPerformanceTextColors();

      API
        .getNotes(this.cohort_id, this.student_id, this.standard.id)
        .then(notes => {
          this.notes = notes.reduce((all, note) => {
            all[note.success_criteria_id] = all[note.success_criteria_id] || [];
            all[note.success_criteria_id].push(note);
            return all;
          }, {});
        });
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
      } else {
        this.$set(this.evidences[id], 'checking', true);
      }

      API.checkSuccessCriteria(this.student_id, this.cohort.cohort_id, id, checked)
        .then((result) => {
          setTimeout(() => {
            this.evidences[id].checking = false;
            this.evidences[id].checked = result.checked;
            this.$set(this.evidences[id], 'approved', result.approved);
            if(result.checked) {
              Materialize.toast(getEncouragement(), 3000);
            }
          }, 500);
        });

    },
    approve(success_criteria_id, approved) {
      if(!this.evidences[success_criteria_id]) {
        this.$set(this.evidences, success_criteria_id, {
          approving: true
        });
      } else {
        this.$set(this.evidences[success_criteria_id], 'approving', true);
      }

      const user_id = this.student.id ? this.student.id : this.student.learn_id;

      API
        .approveSuccessCriteria(user_id, this.cohort.cohort_id, success_criteria_id, approved)
        .then(() => {
          this.evidences[success_criteria_id].approving = false;
          this.$set(this.evidences[success_criteria_id], 'approved', approved);
        });
    },
    toggleEditStandard(event) {
      event.stopPropagation();
      this.isEditing = !this.isEditing;
    },
    setPerformance(standard) {
      this.$set(standard, 'settingPerformance', true);
      API
        .setPerformance(this.cohort.cohort_id, this.student.id, standard.id, standard.setScore)
        .then(result => {
          standard.settingPerformance = false;
        });
    },
    getPerformanceColors() {
      const score = this.user.isInstructor ? this.standard.setScore : this.performance;
      return {
        'grey': score == 0,
        'red': score == 1,
        'yellow': score == 2,
        'green': score == 3,
        'accent-4': score == 2
      }
    },
    getPerformanceTextColors() {
      const performanceColors = this.getPerformanceColors();
      return {
        'grey-text': performanceColors.grey,
        'red-text': performanceColors.red,
        'yellow-text': performanceColors.yellow,
        'green-text': performanceColors.green,
        'accent-4': performanceColors.yellow
      }
    },
    decodeHtml(html) {
      return decodeHtml(html);
    }
	}
}
</script>
<style>
  .buttons {
    margin: 1em;
  }
  .approve-button {
    margin-left: 1em;
    padding-left: 2em;
  }
  .performance-input {
    font-size: 1.5em !important;
    max-width: 1.25em;
  }
  .performance-progress {
    max-width: 2em;
  }
  .success-criteria-check {
    margin: 1.5em;
  }
  .success-criteria-notes {
    margin: 1em;
  }
</style>
