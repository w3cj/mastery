<template>
  <div class="">
    <h1>Standards</h1>
    <p>
      <v-icon>check</v-icon><strong>Assigned</strong>
    </p>
    <p>
      <v-icon>do_not_disturb</v-icon><strong>Not Assigned</strong>
    </p>
    <div v-for="subject in cohort.subjects" class="card">
      <v-collection with-header>
          <v-collection-item header>
              <h3>{{subject.name}}</h3>
          </v-collection-item>
          <v-collection-item>
            <v-collapsible v-bind:expand="true">
                <li v-for="standard in subject.standards">
                    <v-collapsible-header v-bind:class="{ 'grey-text': !standard.assigned }">
                      <v-icon>{{standard.assigned ? 'check' : 'do_not_disturb'}}</v-icon><h5>{{standard.title}}</h5>
                      <p v-if="!standard.assigned">
                        <a v-on:click="assignStandard(standard, $event)" v-if="!standard.assigning" class="waves-effect waves-light btn green">Assign Standard</a>
                        <v-btn-link v-if="standard.assigning" href="" class="green disabled" style="padding-top: 0.5em;padding-bottom: 3em;"><v-progress-circular small active green></v-progress-circular></v-btn-link>
                      </p>
                    </v-collapsible-header>
                    <v-collapsible-body>
                      <p>
                        <ul>
                          <li v-for="success_criteria in standard.success_criteria">
                            {{success_criteria.text}}
                          </li>
                        </ul>
                      </p>
                      <div class="margin-left-top">
                        <h5>Quarters</h5>
                        <div class="chip close" v-for="quarter in standard.tags.quarters">{{quarter}}<i class="close material-icons" v-on:click="removeQuarter(standard, quarter, $event)">close</i></div>
                        <div class="row" v-if="standard.tags.quarters.length != 4">
                          <div class="input-field col s4">
                            <select class="browser-default" v-model="selectedQuarter[standard.id]">
                              <option v-for="quarter in notAddedQuarters(standard.tags.quarters)">{{quarter}}</option>
                            </select>
                          </div>
                          <div class="col s8">
                            <a v-on:click="addQuarter(standard)" class="btn-floating btn-large waves-effect waves-light red"><i class="material-icons">add</i></a>
                          </div>
                        </div>
                        <h5>Weeks</h5>
                        <div class="chip close" v-for="week in standard.tags.weeks">{{week}}<i class="close material-icons" v-on:click="removeWeek(standard, week, $event)">close</i></div>
                        <div class="row" v-if="standard.tags.weeks.length != 24">
                          <div class="input-field col s4">
                            <select class="browser-default" v-model="selectedWeek[standard.id]">
                              <option v-for="week in notAddedWeeks(standard.tags.weeks)">{{week}}</option>
                            </select>
                          </div>
                          <div class="col s8">
                            <a v-on:click="addWeek(standard)" class="btn-floating btn-large waves-effect waves-light red"><i class="material-icons">add</i></a>
                          </div>
                        </div>
                      </div>
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

export default {
  name: 'dashboard',
  data() {
    return {
      selectedQuarter: {},
      selectedWeek: {},
      quarters: ['Choose your option', 'Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'],
      weeks: ['Choose your option']
    };
  },
  computed: mapGetters({
    currentUser: 'currentUser',
    cohort: 'cohort',
    defaultCohort: 'defaultCohort'
  }),
  created() {
    this.$store.dispatch(actionTypes.GET_COHORT)
    for (var i = 1; i <= 24; i++) {
      this.weeks.push(`Week ${i}`);
    }
  },
  methods: {
    assignStandard(standard, event) {
      event.stopPropagation();
      this.$store.dispatch(actionTypes.ASSIGN_STANDARD, standard);
    },
    addQuarter(standard) {
      const quarter = this.selectedQuarter[standard.id];
      if(quarter && quarter != 'Choose your option') {
        this.selectedQuarter[standard.id] = 'Choose your option';
        this.$store.dispatch(actionTypes.TAG_STANDARD_QUARTER, { id: standard.id, quarter });
      }
    },
    removeQuarter(standard, quarter, event) {
      event.stopPropagation();
      this.$store.dispatch(actionTypes.REMOVE_TAG_STANDARD_QUARTER, { id: standard.id, quarter });
    },
    addWeek(standard) {
      const week = this.selectedWeek[standard.id];
      if(week && week != 'Choose your option') {
        this.selectedWeek[standard.id] = 'Choose your option';
        this.$store.dispatch(actionTypes.TAG_STANDARD_WEEK, { id: standard.id, week });
      }
    },
    removeWeek(standard, week, event) {
      event.stopPropagation();
      this.$store.dispatch(actionTypes.REMOVE_TAG_STANDARD_WEEK, { id: standard.id, week });
    },
    notAddedQuarters(existing) {
      return this.quarters.filter(q => existing.indexOf(q) == -1);
    },
    notAddedWeeks(existing) {
      return this.weeks.filter(w => existing.indexOf(w) == -1);
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
  .margin-left-top {
    margin-left: 1em;
    margin-top: 1em;
  }
</style>
