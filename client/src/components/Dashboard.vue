<template>
  <div>
    <h1>Standards</h1>
    <div v-for="subject in cohort.subjects" class="card" v-if="isAssigned(subject)">
      <v-collection with-header>
          <v-collection-item header>
              <h3>{{subject.name}}</h3>
          </v-collection-item>
          <v-collection-item v-for="standard in assigned(subject.standards)">
            <h4>{{standard.title}}</h4>
            <ul>
              <li v-for="success_criteria in standard.success_criteria">
                <p v-on:mouseup="checkSuccessCriteria(success_criteria, $event)">
                  <input type="checkbox" v-bind:id="success_criteria._id" v-bind:checked="evidences[success_criteria._id] && evidences[success_criteria._id].checked" />
                  <label v-bind:for="success_criteria._id">{{success_criteria.text}}</label>
                  <v-progress-linear indeterminate v-if="evidences[success_criteria._id] && evidences[success_criteria._id].checking"></v-progress-linear>
                </p>
              </li>
            </ul>
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
    return {};
  },
  computed: mapGetters({
    currentUser: 'currentUser',
    cohort: 'cohort',
    defaultCohort: 'defaultCohort',
    evidences: 'evidences'
  }),
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
    checkSuccessCriteria(success_criteria, event) {
      event.stopPropagation();
      this.$store.dispatch(actionTypes.CHECK_SUCCESS_CRITERIA, success_criteria);
    }
  }
}
</script>
<style>
  .card {
    margin: 0.25em;
  }
</style>
