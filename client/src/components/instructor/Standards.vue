<template>
  <div class="">
    <cohort-badge :cohort="data.cohort"></cohort-badge>
    <center>
      <v-progress-circular v-if="loading" active green green-flash></v-progress-circular>
    </center>
    <div v-if="!loading">
      <div class="input-field">
           <v-icon prefix>search</v-icon>
           <v-text-input v-model="search" name="search" id="search" placeholder="Filter standards"></v-text-input>
       </div>
       <div v-for="subject in visibleSubjects" class="card">
         <v-collection with-header>
           <v-collection-item header>
               <h3>{{subject.name}}</h3>
           </v-collection-item>
             <v-collection-item v-for="standard in subject.standards" v-if="standard.visible"
               v-bind:class="{
                 yellow: standard && standard.standard_type == 'elective',
                 'lighten-4': standard && standard.standard_type == 'elective'
               }">
               <standard-checklist
                 :user="user"
                 :student="data.student"
                 :standard="standard"
                 :performance="0"
                 :showSuccessCriteria="true"
                 :evidences="data.evidences"
                 :student_id="student_id"
                 :cohort="data.cohort"
                 :resources="data.resources[standard.id]"
                 :singleView="false"
                 :showScore="false">
               </standard-checklist>
             </v-collection-item>
         </v-collection>
       </div>
    </div>
  </div>
</template>

<script>
import data from '../../data';
import Auth from '../../lib/Auth';
import {decodeHtml, isSubjectVisible} from '../../lib/utils';
import StandardChecklist from '../StandardChecklist';
import AddResource from '../AddResource';
import ResourceList from '../ResourceList';
import CohortBadge from '../CohortBadge';

export default {
  name: 'standards',
  components: {
    'add-resource': AddResource,
    'resource-list': ResourceList,
    'cohort-badge': CohortBadge,
    'standard-checklist': StandardChecklist
  },
  data() {
    return {
      user: Auth.getCurrentUser(),
      search: '',
      loading: true,
      cohort_id: this.$route.cohort_id,
      data: data.data,
      scoreFilter: {
        undefined: true,
        0: true
      }
    };
  },
  computed: {
    visibleSubjects() {
      return this.data.cohort.subjects.filter(subject => isSubjectVisible(this.search, subject.name, this.data.cohort, this.data.performances, this.scoreFilter, this.$route.query.standard_id));
    }
  },
  created() {
    this.cohort_id = this.$route.params.cohort_id;
    this.student_id = this.$route.params.student_id ? this.$route.params.student_id : this.user.learn_id;

    data
      .methods
      .setCohort(this.cohort_id)
      .then(() => {
        this.loading = false;
      })
  },
  methods: {
    onAddResource(standard, resource) {
      if(!this.resources[standard.id]) {
        this.$set(this.resources, standard.id, []);
      }
      this.resources[standard.id].push(resource);
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
