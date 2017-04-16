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
                  <li v-for="standard in subject.standards" v-if="isStandardVisible(standard)" class="standard">
                      <v-collapsible-header>
                        <h4>{{standard.description}}</h4>
                      </v-collapsible-header>
                      <v-collapsible-body>
                        <h5>Success Criteria</h5>
                        <p class="circle-list">
                          <ul>
                            <li v-for="success_criteria in standard.success_criteria">
                              {{decodeHtml(success_criteria.text)}}
                            </li>
                          </ul>
                        </p>
                        <div v-if="resources[standard.id]">
                          <resource-list
                            :resources="resources[standard.id]">
                          </resource-list>
                        </div>
                        <add-resource
                          :cohort_id="cohort_id"
                          :standard="standard"
                          :onAddResource="onAddResource"
                          ></add-resource>
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
import {decodeHtml, isSubjectVisible, isStandardVisible} from '../../lib/utils';
import AddResource from '../AddResource';
import ResourceList from '../ResourceList';

export default {
  name: 'standards',
  components: {
    'add-resource': AddResource,
    'resource-list': ResourceList
  },
  data() {
    return {
      search: '',
      cohort: {},
      loading: true,
      cohort_id: this.$route.cohort_id,
      resources: {}
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

    API
      .getAllResources(this.cohort_id)
      .then(resources => {
        this.resources = resources;
      });
  },
  methods: {
    onAddResource(standard, resource) {
      if(!this.resources[standard.id]) {
        this.$set(this.resources, standard.id, []);
      }
      this.resources[standard.id].push(resource);
    },
    isSubjectVisible(subject) {
      return isSubjectVisible(this.search, subject, this.cohort, this.performances, this.scoreFilter);
    },
    isStandardVisible(standard) {
      return isStandardVisible(this.search, standard, this.performances, this.scoreFilter)
    },
    decodeHtml(html) {
      return decodeHtml(html);
    }
  }
}
</script>
<style>
  .card {
    margin: 0.25em;
  }
  .circle-list ul li {
    list-style-type: circle !important;
    margin: 1em;
  }
  .collection {
    overflow: visible !important;
  }
  .standard h5 {
    margin-left: 1em;
  }
</style>
