<template>
  <div class="">
    <br />
    <br />
    <center>
      <h1 v-if="!loading">
        <span v-if="!cohort.badgeNumber || cohort.badgeNumber == -1">{{cohort.badge}}</span>
        <img v-if="cohort.badgeNumber && cohort.badgeNumber != -1" v-bind:src="'https://badge.galvanize.network/' + cohort.badgeNumber + '.png'" alt="" style="height:175px;">
      </h1>
      <h1 v-if="!loading">Standards</h1>
      <v-progress-circular v-if="loading" active green green-flash></v-progress-circular>
    </center>
    <div v-if="!loading">
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
                        <v-icon>{{standard.assigned ? 'check' : 'do_not_disturb'}}</v-icon><h5>{{standard.description}}</h5>
                        <p v-if="!standard.assigned">
                          <a v-on:click="assignStandard(standard, $event, true)" v-if="!standard.assigning" class="waves-effect waves-light btn green">Assign Standard</a>
                          <v-btn-link v-if="standard.assigning" href="" class="green disabled" style="padding-top: 0.5em;padding-bottom: 3em;"><v-progress-circular small active green></v-progress-circular></v-btn-link>
                        </p>
                        <p v-if="standard.assigned">
                          <a v-on:click="assignStandard(standard, $event, false)" v-if="!standard.assigning" class="waves-effect waves-light btn red">Un-Assign Standard</a>
                          <v-btn-link v-if="standard.assigning" href="" class="red disabled" style="padding-top: 0.5em;padding-bottom: 3em;"><v-progress-circular small active green></v-progress-circular></v-btn-link>
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
                      </v-collapsible-body>
                  </li>
              </v-collapsible>
            </v-collection-item>
        </v-collection>
      </div>
    </div>
  </div>
</template>

<script>
import API from '../lib/API';

export default {
  name: 'standards',
  data() {
    return {
      cohort: {},
      selectedQuarter: {},
      selectedWeek: {},
      loading: true
    };
  },
  created() {
    const {cohort_id} = this.$route.params;

    API
      .getCohort(cohort_id)
      .then(cohort => {
        this.cohort = cohort;
        this.loading = false;
      });
  },
  methods: {
    assignStandard(standard, event, assign) {
      event.stopPropagation();
      const {cohort_id} = this.$route.params;

      standard.assigning = true;

      API
        .assignStandard(cohort_id, standard.id, assign)
        .then(() => {
          standard.assigned = assign;
          standard.assigning = false;
        });
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
