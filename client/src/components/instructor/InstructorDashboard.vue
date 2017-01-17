<template>
  <div>
    <div v-if="!loading">
      <div class="row">
        <div class="input-field col s12">
          <v-icon prefix>search</v-icon>
          <v-text-input v-model="search" name="search" id="search" placeholder="Search students..."></v-text-input>
        </div>
      </div>
       <div class="row">
         <student
          v-for="student in students"
          :student="student"
          :cohort_id="cohort_id"
          :search="search">
         </student>
       </div>
    </div>
  </div>
</template>

<script>
import API from '../../lib/API';
import Student from '../Student';
import {requireType} from '../../lib/utils';

export default {
  name: 'instructor-dashboard',
  components: {
    'student': Student,
  },
  data() {
    return {
      search: ''
    };
  },
  props: {
    user: requireType(Object),
    cohort_id: requireType([String, Number]),
    cohort: requireType(Object),
    cohorts: requireType(Object),
    loading: requireType(Boolean),
    students: requireType(Array)
  },
  methods: {
    decodeHtml(html) {
      const txt = document.createElement("textarea");
      txt.innerHTML = html;
      return txt.value;
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
  .padding-left {
    margin-left: 20em;
  }
  .score-buttons {
    float: right;
  }
  .clear {
    float: clear;
  }
</style>
