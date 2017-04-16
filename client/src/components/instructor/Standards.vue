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
      <div class="row">
        <div class="col s12">
          <a v-on:click="tab = 'all'" class="waves btn">All Standards</a>
          <a v-on:click="tab = 'collections'" class="waves btn">Collections</a>
        </div>
      </div>
      <div v-if="tab == 'all'">
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
      <div v-if="tab == 'collections'">
        <form v-on:submit.prevent="createCollection()" v-on:keyup.enter="createCollection()">
      		<div class="input-field col s12">
      			<i class="material-icons prefix">create</i>
      			<input v-model="newCollectionName" type="text" id="new_collection" class="autocomplete" placeholder="Enter a new collection name...">
      		</div>
      		<button type="submit" v-bind:class="{ disabled: !newCollectionName}" class="right waves-effect waves-light btn">Create Collection</button>
        </form>
        <br>
        <br>
        <div class="collection">
          <router-link
            class="collection-item"
            v-for="collection in collections"
            :to="{
              name: 'standards-collection',
              params: {
                cohort_id: $route.params.cohort_id,
                collection_name: collection.collection_name
                }
              }">{{collection.collection_name}}</router-link>
        </div>
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
      selectedQuarter: {},
      selectedWeek: {},
      loading: true,
      tab: 'all',
      collections: [],
      cohort_id: this.$route.cohort_id,
      newCollectionName: ''
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
      .getStandardCollections(this.cohort_id)
      .then(collections => {
        this.collections = collections;
      })
  },
  methods: {
    isSubjectVisible(subject) {
      return isSubjectVisible(this.search, subject, this.cohort, this.performances, this.scoreFilter);
    },
    isStandardVisible(standard) {
      return isStandardVisible(this.search, standard, this.performances, this.scoreFilter)
    },
    createCollection() {
      this.$router.push({ name: 'standards-collection', params: { cohort_id: this.cohort_id, collection_name: this.newCollectionName }})
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
