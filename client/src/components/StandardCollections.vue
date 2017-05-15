<template>
  <div>
    <cohort-badge :cohort="data.cohort"></cohort-badge>
    <center>
      <v-progress-circular v-if="loading" active green green-flash></v-progress-circular>
    </center>
    <div v-if="!loading">
      <div v-if="user.isInstructor">
        <form v-on:submit.prevent="createCollection()" v-on:keyup.enter="createCollection()">
          <div class="input-field col s12">
            <i class="material-icons prefix">create</i>
            <input v-model="newCollectionName" type="text" id="new_collection" class="autocomplete" placeholder="Enter a new collection name...">
          </div>
          <button type="submit" v-bind:class="{ disabled: !newCollectionName}" class="right waves-effect waves-light btn">Create Collection</button>
        </form>
      </div>
      <br>
      <br>
      <div v-if="collections.length > 0">
        <div class="input-field col s12">
          <i class="material-icons prefix">search</i>
          <input v-model="search" type="text" id="search" placeholder="Search for a collection...">
        </div>
        <div class="collection">
          <router-link
            class="collection-item"
            v-for="collection in collections"
            v-if="collectionFiltered(collection)"
            :to="{
              name: 'standards-collection',
              params: {
                cohort_id: $route.params.cohort_id,
                collection_name: collection.collection_name
                }
              }">{{collection.collection_name}}</router-link>
        </div>
      </div>
      <div v-if="collections.length == 0">
        <h5 class="text-center grey-text">There are no collections.</h5>
      </div>
    </div>
  </div>
</template>

<script>
import Auth from '../lib/Auth';
import data from '../data';
import CohortBadge from './CohortBadge';

export default {
  name: 'standard-collections',
  components: {
    'cohort-badge': CohortBadge
  },
  data() {
    return {
      user: Auth.getCurrentUser(),
      search: '',
      data: data.data,
      loading: true,
      collections: [],
      cohort_id: this.$route.cohort_id,
      newCollectionName: ''
    };
  },
  created() {
    this.cohort_id = this.$route.params.cohort_id;

    data
      .methods
      .setCohort(this.cohort_id)
      .then(() => {
        this.collections = data.data.collections;
        this.loading = false;
      });
  },
  methods: {
    collectionFiltered(collection) {
      if(!this.search.trim()) return true;

      return collection.collection_name.match(new RegExp(this.search, 'gi'));
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
