<template>
  <div class="resource-add grey lighten-5">
    <h5>Add A Resource</h5>
    <v-progress-linear indeterminate v-if="adding"></v-progress-linear>
    <form v-if="!adding" class="form" v-on:submit.prevent="addResource(resourceTitle, resourceURL, selectedResourceType, resourceDescription, standard)">
      <div class="row">
        <div class="input-field col s4">
          <v-icon prefix>title</v-icon>
          <v-text-input v-model="resourceTitle" name="resourceTitle" id="resourceTitle" placeholder="Enter a Title"></v-text-input>
        </div>
        <div class="input-field col s8">
          <v-icon prefix>description</v-icon>
          <v-text-input name="resourceDescription" id="resourceDescription" v-model="resourceDescription" placeholder="Enter a description"></v-text-input>
        </div>
        <div class="input-field col s12 m8">
          <v-icon prefix>library_add</v-icon>
          <v-text-input v-model="resourceURL" name="resourceURL" id="resourceURL" placeholder="http://awesome.resource/cool" type="url"></v-text-input>
         </div>
         <div class="input-field col s12 m4">
          <select class="browser-default" v-model="selectedResourceType">
            <option :value="null">-- Select a Resource Type --</option>
            <option v-for="resource in resourceTypes" v-bind:value="resource.id">{{resource.text}}</option>
          </select>
        </div>
      </div>
      <div class="row">
        <div class="col s5 m4">
          <button
            class="waves-effect waves-light btn"
            v-bind:class="{
              disabled: !resourceTitle || !resourceURL || !selectedResourceType || !resourceDescription
            }"
            type="submit">Add</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import API from '../lib/API';

export default {
  name: 'add-resource',
  props: ['cohort_id', 'standard', 'onAddResource'],
	data() {
		return {
      adding: false,
      selectedResourceType: null,
      resourceTitle: '',
      resourceURL: '',
      resourceDescription: '',
      resourceTypes: [
        'Assessment',
        'Example',
        'Exercise',
        'External',
        'Article',
        'Slides',
        'Video'
      ].map(a => ({ id: a.toLowerCase(), text: a})),
		}
	},
  methods: {
    addResource(title, url, type, description, standard) {
      this.adding = true;
      API
        .addResource(this.cohort_id, standard.id, {
          title,
          url,
          type,
          description
        }).then(result => {
          this.adding = false;
          this.selectedResourceType = null;
          this.resourceTitle = '';
          this.resourceDescription = '',
          this.resourceURL = '';
          this.onAddResource(standard, result);
        }).catch(() => {
          this.adding = false;
        });
    },
  }
}
</script>
<style>
  .resource-add {
    border-radius: 1rem;
    margin: 2rem;
    padding: 2rem;
  }
</style>
