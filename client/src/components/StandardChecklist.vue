<template>
  <div>
    <h4>
      <a
        v-on:click="toggleEditStandard($event)"
        class="btn-floating btn-large waves-effect waves-light"
        v-tooltip:bottom="'Edit Success Criteria'"
        v-bind:class="performanceColors">
        <i v-if="!isEditing" class="material-icons">playlist_add_check</i>
        <i v-if="isEditing" class="material-icons">arrow_back</i>
      </a>
      <a
        v-on:click="showResources = !showResources"
        class="btn-floating btn-large waves-effect waves-light"
        v-tooltip:bottom="'Toggle Resources'"
        v-bind:class="{indigo: showResources, orange: !showResources}">
        <i class="material-icons">library_books</i>
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
              <br>
              <a
                v-if="performance != standard.setScore"
                v-on:click="setPerformance(standard)"
                class="btn-floating btn waves-effect waves indigo">
                <i class="material-icons">save</i>
              </a>
        </div>
        <v-progress-linear v-if="standard.settingPerformance" indeterminate class="performance-progress"></v-progress-linear>
      </span>
    </h4>
    <div v-if="showResources">
      <resource-list v-if="resources.length > 0" :resources="resources"></resource-list>
      <add-resource
        v-if="user.isInstructor"
        :cohort_id="cohort_id"
        :standard="standard"
        :onAddResource="onAddResource"
        ></add-resource>
      <blockquote v-if="!resources || resources.length == 0 ">
        No resources found.
      </blockquote>
    </div>
    <ul v-if="showSuccessCriteria && !isEditing">
      <li v-for="success_criteria in standard.success_criteria">
        <p style="flex-direction: row;cursor: not-allowed;">
          <v-icon v-if="isChecked(success_criteria._id)"
            v-bind:class="{
              'green-text': evidences[success_criteria._id].approved,
              'yellow-text': !evidences[success_criteria._id].approved
            }">check_box</v-icon>
          <v-icon v-if="!isChecked(success_criteria._id)" class="grey-text">check_box_outline_blank</v-icon>
          <span v-bind:class="{'grey-text': !isChecked(success_criteria._id) || disabledSuccessCriteria[success_criteria._id] || !evidences[success_criteria._id].approved, 'disabled-sc': disabledSuccessCriteria[success_criteria._id]}">{{decodeHtml(success_criteria.text)}}</span>
          <v-progress-linear indeterminate v-if="evidences[success_criteria._id] && evidences[success_criteria._id].checking"></v-progress-linear>
        </p>
      </li>
    </ul>
    <div v-if="isEditing">
      <div class="buttons">
        <a
          v-if="user.isInstructor"
          v-on:click="disableSuccessCriteria = !disableSuccessCriteria"
          class="waves-effect waves-light btn red lighten-3">
          <i class="material-icons left">remove_red_eye</i>Enable/Disable Success Criteria
        </a>
        <a
          v-on:click="canAddNotes = !canAddNotes"
          class="waves-effect waves-light btn">
          <i class="material-icons left">note_add</i>{{canAddNotes ? 'Done Adding' : 'Add Notes'}}
        </a>
      </div>
      <div>
        <ul>
          <li v-for="success_criteria in standard.success_criteria" :id="success_criteria._id">
            <div class="center success-criteria-check" style="cursor:pointer; flex-direction: row;">
              <a
                v-if="user.isInstructor && isChecked(success_criteria._id)"
                v-tooltip:bottom="'Approve/Unapprove'"
                v-on:click="approve(success_criteria._id, !evidences[success_criteria._id].approved)"
                class="btn-floating waves-effect waves-light"
                v-bind:class="{
                  'green': !evidences[success_criteria._id].approved,
                  'yellow': evidences[success_criteria._id].approved
                }">
                <i class="material-icons">done</i>
              </a>
              <a
                v-if="user.isInstructor && disableSuccessCriteria"
                v-on:click="toggleSuccessCriteria(success_criteria._id)"
                class="btn-floating waves-effect waves-light"
                v-bind:class="{
                  'red': !disabledSuccessCriteria[success_criteria._id],
                  'indigo': disabledSuccessCriteria[success_criteria._id]
                }">
                <i class="material-icons">remove_red_eye</i>
              </a>
              <span class="white-text">.</span>
              <span class="center" v-on:mousedown="checkSuccessCriteria(success_criteria, $event)" style="flex-direction: row;">
                <v-icon v-if="isChecked(success_criteria._id)"
                  v-bind:class="{
                    'green-text': isChecked(success_criteria._id) && evidences[success_criteria._id].approved,
                    'yellow-text': isChecked(success_criteria._id) && !evidences[success_criteria._id].approved,
                    'grey-text': !isChecked(success_criteria._id)
                  }">check_box</v-icon>
                <v-icon v-if="!isChecked(success_criteria._id)">check_box_outline_blank</v-icon>
                <h5 style="text-align:left;margin-left:1em;" v-bind:class="{'grey-text': !isChecked(success_criteria._id), 'disabled-sc': disabledSuccessCriteria[success_criteria._id]}">{{decodeHtml(success_criteria.text)}}</h5>
              </span>
            </div>
            <div class="success-criteria-notes">
              <success-criteria-notes
                :cohort_id="cohort_id"
                :student_id="student_id"
                :canAdd="canAddNotes"
                :notes="notes[success_criteria._id]"
                :onNoteAdd="addNote"
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
    </div>
  </div>
</template>

<script>
import data from '../data';
import API from '../lib/API';
import ResourceList from './ResourceList';
import AddResource from './AddResource';
import SuccessCriteriaNotes from './SuccessCriteriaNotes';
import getEncouragement from '../lib/encouragement';
import {decodeHtml} from '../lib/utils';

export default {
  name: 'standard-checklist',
  props: ['student', 'user', 'standard', 'performance', 'showSuccessCriteria', 'evidences', 'student_id', 'cohort', 'showScore', 'resources', 'onSetPerformance', 'singleView'],
  components: {
    'resource-list': ResourceList,
    'add-resource': AddResource,
    'success-criteria-notes': SuccessCriteriaNotes
  },
	data() {
		return {
      isEditing: false,
      showResources: false,
      canAddNotes: false,
      performanceColors: {},
      performanceTextColors: {},
      loading: false,
      disabledSuccessCriteria: {},
      disableSuccessCriteria: false,
      data: data.data
		}
	},
  watch: {
    'standard.setScore'() {
      this.performanceColors = this.getPerformanceColors();
      this.performanceTextColors = this.getPerformanceTextColors();
    },
    performance() {
      this.load();
    },
    standard(newVal, oldVal) {
      if(newVal.id != oldVal.id) {
        this.load();
      }
    }
  },
  mounted() {
    this.load();
  },
	methods: {
    load() {
      if(this.loading) return;

      this.loading = true;
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

          this.standard.success_criteria.forEach(({_id}) => {
            if(!this.notes[_id]) {
              this.$set(this.notes, _id, []);
            }
          });

          this.loading = false;
          this.isEditing = this.singleView || this.isEditing;

          if(this.$route.query.success_criteria_id) {
            const success_criteria_id = this.$route.query.success_criteria_id;
            const scrollToSuccessCriteria = () => {
              const element = $(`#${success_criteria_id}`)[0];
              if(!element) return setTimeout(scrollToSuccessCriteria, 200);
              element.scrollIntoView({
                behavior: "smooth"
              });
            }
            setTimeout(scrollToSuccessCriteria, 200);
          }
        });

      API
        .getDisabledSuccessCriteria(this.cohort_id)
        .then(disabledSuccessCriteria => {
          this.disabledSuccessCriteria = disabledSuccessCriteria.reduce((all, sc) => {
            if(sc.standard_id == this.standard.id) {
              all[sc.success_criteria_id] = sc;
            }
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
      if(this.evidences[id] && this.evidences[id].approved && this.evidences[id].checked) return;

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
        .then(() => {
          this.data.performances[standard.id] = standard.setScore;
          standard.settingPerformance = false;
          if (this.onSetPerformance) this.onSetPerformance(standard.id, standard.setScore);
        });
    },
    getPerformanceColors() {
      const score = this.user.isInstructor ? this.standard.setScore : this.performance;
      return {
        'grey': score == 0 || score > 4,
        'red': score == 1,
        'yellow': score == 2,
        'green': score == 3 || score == 4,
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
    toggleSuccessCriteria(success_criteria_id) {
      if(!this.disabledSuccessCriteria[success_criteria_id]) {
        API
          .disableSuccessCriteria(this.cohort_id, this.standard.id, success_criteria_id)
          .then(() => {
            this.$set(this.disabledSuccessCriteria, success_criteria_id, true);
          });
      } else {
        API
          .enableSuccessCriteria(this.cohort_id, this.standard.id, success_criteria_id)
          .then(() => {
            this.$set(this.disabledSuccessCriteria, success_criteria_id, false);
          });
      }
    },
    addNote(success_criteria_id, note) {
      this.notes[success_criteria_id].push(note);
    },
    onAddResource(standard, resource) {
      this.resources.push(resource);
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
  .disabled-sc {
    text-decoration: line-through;
  }
</style>
