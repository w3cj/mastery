<template>
  <div>
    <h1>Standards</h1>
    <div v-for="subject in cohort.subjects" class="card" v-if="isAssigned(subject)">
      <v-collection with-header>
          <v-collection-item header>
              <h3>{{subject.name}}</h3>
          </v-collection-item>
          <v-collection-item v-for="standard in assigned(subject.standards)">
            <h4 v-if="!isEditing(standard.id)"><a v-on:click="toggleEditStandard(standard, $event)" class="btn-floating btn-large waves-effect waves-light"><i class="material-icons">playlist_add_check</i></a> {{standard.title}}</h4>
            <h4 v-if="isEditing(standard.id)"><a v-on:click="toggleEditStandard(standard, $event)" class="btn-floating btn-large waves-effect waves-light"><i class="material-icons">close</i></a> {{standard.title}}</h4>
            <ul v-if="!isEditing(standard.id)">
              <li v-for="success_criteria in standard.success_criteria">
                <p class="grey-text center" style="flex-direction: row;cursor: not-allowed;">
                  <v-icon v-if="isChecked(success_criteria._id)">check_box</v-icon>
                  <v-icon v-if="!isChecked(success_criteria._id)">check_box_outline_blank</v-icon>
                  <span>{{success_criteria.text}}</span>
                  <v-progress-linear indeterminate v-if="evidences[success_criteria._id] && evidences[success_criteria._id].checking"></v-progress-linear>
                </p>
              </li>
            </ul>
            <v-collapsible collapse popout v-if="isEditing(standard.id)">
              <li>
                  <v-collapsible-header class="active" style="padding:2em;">
                      <h5>Evidences of Mastery</h5>
                  </v-collapsible-header>
                  <v-collapsible-body>
                    <p>Evidence of mastery can be: Pull request URL, Project URL, gist with code, short answer in gist etc.</p>
                    <div class="col s9 row" style="margin-left:2em;">
                      <div class="col s10">
                        <ul>
                          <li>
                            <a class="btn-floating yellow actionButton"><i class="material-icons">edit</i></a>
                            <a class="btn-floating red actionButton"><i class="material-icons">delete</i></a>
                            https://www.pivotaltracker.com/n/projects/1920561
                          </li>
                          <li>
                            <a class="btn-floating yellow actionButton"><i class="material-icons">edit</i></a>
                            <a class="btn-floating red actionButton"><i class="material-icons">delete</i></a>
                            https://www.pivotaltracker.com/n/projects/1920561
                          </li>
                          <li>
                            <a class="btn-floating yellow actionButton"><i class="material-icons">edit</i></a>
                            <a class="btn-floating red actionButton"><i class="material-icons">delete</i></a>
                            https://www.pivotaltracker.com/n/projects/1920561
                          </li>
                        </ul>
                      </div>
                      <div class="col s12">
                      </div>
                      <div class="input-field col s10 center" style="flex-direction:row;">
                        <a class="btn-floating green actionButton"><i class="material-icons">link</i></a>
                          <v-text-input
                            placeholder="Evidence of mastery."
                            v-bind:name="'evidence' + standard.id"
                            v-bind:id="'evidence' + standard.id">
                          </v-text-input>
                      </div>
                    </div>
                    <ul>
                      <li v-for="success_criteria in standard.success_criteria" class="row">
                          <p class="center" style="cursor:pointer; flex-direction: row;">
                            <!-- <a class="btn-floating yellow darken-1 actionButton"><i class="material-icons">edit</i></a> -->
                            <span class="center" v-on:mousedown="checkSuccessCriteria(success_criteria, $event)" style="flex-direction: row;">
                              <v-icon v-if="isChecked(success_criteria._id)">check_box</v-icon>
                              <v-icon v-if="!isChecked(success_criteria._id)">check_box_outline_blank</v-icon>
                              <span>{{success_criteria.text}}</span>
                            </span>
                          </p>
                          <p v-if="evidences[success_criteria._id] && evidences[success_criteria._id].checking">
                            <v-progress-linear indeterminate></v-progress-linear>
                          </p>
                          <div class="col s9 row" style="margin-left:2em;">
                            <div class="col s10">
                              <ul>
                                <li>
                                  <a class="btn-floating yellow actionButton"><i class="material-icons">edit</i></a>
                                  <a class="btn-floating red actionButton"><i class="material-icons">delete</i></a>
                                  https://www.pivotaltracker.com/n/projects/1920561
                                </li>
                                <li>
                                  <a class="btn-floating yellow actionButton"><i class="material-icons">edit</i></a>
                                  <a class="btn-floating red actionButton"><i class="material-icons">delete</i></a>
                                  https://www.pivotaltracker.com/n/projects/1920561
                                </li>
                                <li>
                                  <a class="btn-floating yellow actionButton"><i class="material-icons">edit</i></a>
                                  <a class="btn-floating red actionButton"><i class="material-icons">delete</i></a>
                                  https://www.pivotaltracker.com/n/projects/1920561
                                </li>
                              </ul>
                            </div>
                            <div class="col s12">
                            </div>
                            <div class="input-field col s10 center" style="flex-direction:row;">
                              <a class="btn-floating green actionButton"><i class="material-icons">link</i></a>
                                <v-text-input
                                  placeholder="Evidence of mastery."
                                  v-bind:name="'evidence' + success_criteria.id"
                                  v-bind:id="'evidence' + success_criteria.id">
                                </v-text-input>
                            </div>
                          </div>
                      </li>
                    </ul>
                  </v-collapsible-body>
              </li>
          </v-collapsible>
          </v-collection-item>
      </v-collection>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Auth from '../lib/Auth';
import * as actionTypes from '../store/action-types';
import * as mutationTypes from '../store/mutation-types';

export default {
  name: 'dashboard',
  data() {
    return {};
  },
  computed: {
    ...mapGetters({
      currentUser: 'currentUser',
      cohort: 'cohort',
      defaultCohort: 'defaultCohort',
      evidences: 'evidences',
      editing: 'editing',
    })
  },
  created() {
    this.$store.dispatch(actionTypes.GET_COHORT);
    this.$store.dispatch(actionTypes.GET_EVIDENCES);
  },
  methods: {
    isAssigned(subject) {
      return this.assigned(subject.standards).length > 0;
    },
    assigned(standards) {
      return standards.filter(standard => standard.assigned);
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
</style>
