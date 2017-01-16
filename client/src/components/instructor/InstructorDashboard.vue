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
         <div class="card col s12 m4 l3" v-for="student in students" v-if="studentVisible(student)">
          <div class="card-image waves-effect waves-block waves-light">
            <img class="activator" v-bind:src="student.img.replace('http://', 'https://')">
          </div>
          <div class="card-content">
            <span class="card-title activator grey-text text-darken-4">{{formatName(student.full_name)}}<i class="material-icons right">more_vert</i></span>
            <p>
              <router-link :to="{ name: 'student-dashboard', params: { cohort_id: cohort_id, student_id: student.id} }">Mastery</router-link>
            </p>
          </div>
          <div class="card-reveal">
            <span class="card-title grey-text text-darken-4">{{formatName(student.full_name)}}<i class="material-icons right">close</i></span>
            <p>Charts and metrics and other cool stuff coming soon...</p>
          </div>
        </div>
       </div>
    </div>
  </div>
</template>

<script>
import API from '../../lib/API';
import {requireType} from '../../lib/utils';

export default {
  name: 'instructor-dashboard',
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
    formatName(name) {
      if(this.search.trim() != '') {
        return name;
      } else {
        return name.split(' ')[0];
      }
    },
    decodeHtml(html) {
      const txt = document.createElement("textarea");
      txt.innerHTML = html;
      return txt.value;
    },
    studentVisible(student) {
      if(this.search.trim() != '') {
        const regexp = new RegExp(this.search, 'gi');
        return student.full_name.match(regexp);
      } else {
        return true;
      }
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
