<template>
  <div class="">
    <br />
    <br />
    <center>
      <h1 v-if="!loading">
        <span v-if="!cohort.badgeNumber || cohort.badgeNumber == -1">{{cohort.badge}}</span>
        <img v-if="cohort.badgeNumber && cohort.badgeNumber != -1" v-bind:src="'https://badge.galvanize.network/' + cohort.badgeNumber + '.png'" alt="" style="height:175px;">
      </h1>
      <v-progress-circular v-if="loading" active green green-flash></v-progress-circular>
    </center>
    <div v-if="!loading">
      <div class="input-field">
           <v-icon prefix>search</v-icon>
           <v-text-input v-model="search" name="search" id="search" placeholder="Filter standards"></v-text-input>
       </div>
      <div v-for="subject in cohort.subjects" class="card" v-if="isSubjectVisible(subject.name)">
        <v-collection with-header>
            <v-collection-item header>
                <h3>{{subject.name}}</h3>
            </v-collection-item>
            <v-collection-item>
              <v-collapsible v-bind:expand="true">
                  <li v-for="standard in subject.standards" v-if="isStandardVisible(standard)">
                      <v-collapsible-header>
                        <h5>{{standard.description}}</h5>
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
import API from '../../lib/API';
import {isSubjectVisible, isStandardVisible} from '../../lib/utils';

export default {
  name: 'standards',
  data() {
    return {
      search: '',
      cohort: {},
      loading: true,
      cohort_id: this.$route.cohort_id,
    };
  },
  created() {
    this.cohort_id = this.$route.params.cohort_id;

    API
      .getCohort(this.cohort_id)
      .then(cohort => {
        this.cohort = cohort;
        this.loading = false;
      });
  },
  methods: {
    isSubjectVisible(subject) {
      return isSubjectVisible(this.search, subject, this.cohort, this.performances, this.scoreFilter);
    },
    isStandardVisible(standard) {
      return isStandardVisible(this.search, standard, this.performances, this.scoreFilter)
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
