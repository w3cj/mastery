<template>
  <div>
    <center>
      <h1>Activity Feed</h1>
      <v-progress-circular v-if="loading" active green green-flash></v-progress-circular>
    </center>
    <div v-if="!loading">
      <v-collection v-if="visibleNotes.length > 0">
        <v-collection-avatar v-for="note in visibleNotes" v-bind:src="users[note.creator_id].image">
            <span class="title">
              <strong>{{cohort.standards[note.standard_id].description}}</strong>
              <br>
              <i>{{successCriteria(cohort.standards[note.standard_id].success_criteria, note.success_criteria_id)}}</i>
            </span>
            <p>{{note.title}}</p>
            <pre class="note-content" v-if="note.type != 'link'">{{note.content}}</pre>
            <p v-if="note.type == 'link'"><a v-bind:href="note.content" target="_blank">{{note.title}}</a></p>
            <blockquote>
              Added by {{users[note.creator_id].full_name}} {{moment(note.created)}}
            </blockquote>
            <a
              v-bind:href="note.type == 'link' ? note.content : '#' + $route.fullPath"
              v-bind:target="note.type == 'link' ? '_blank' : ''"
              slot="secondary">
              <v-icon>{{note.type}}</v-icon>
            </a>
        </v-collection-avatar>
      </v-collection>
      <div v-if="visibleNotes.length == 0">
        <h5 class="text-center grey-text">No activity to show.</h5>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import Auth from '../lib/Auth';
import API from '../lib/API';

export default {
  name: 'activity-feed',
  data() {
    return {
      users: {},
      notes: [],
      user: Auth.getCurrentUser(),
      cohort_id: this.$route.params.cohort_id,
      cohort: null,
      loading: false
    }
  },
  mounted() {
    this.load();
  },
  computed: {
    visibleNotes() {
      return this.notes.filter(note => {
        return note.created && note.creator_id != this.user.learn_id;
      });
    }
  },
  methods: {
    load() {
      this.loading = true;

      const loadCohort = API.getCohort(this.cohort_id)
        .then(cohort => {
          this.cohort = cohort;
        });

      let getNotes = null;

      if(this.user.isInstructor) {
        getNotes = API.getCohortNotes(this.cohort_id);
      } else {
        getNotes = API.getStudentNotes(this.cohort_id, this.user.learn_id);
      }

      getNotes.then(notes => {
        this.notes = notes.sort((a, b) => {
          return moment(b.created).unix() - moment(a.created).unix();
        });

        const users = this.notes.reduce((users, note) => {
          users[note.creator_id] = users[note.creator_id] || {
            image: `https://api.adorable.io/avatars/100/${note.creator_id}.png`,
            full_name: 'Loading...'
          };
          this.loadUser(note.creator_id);

          return users;
        }, {});

        this.users = users;
      });

      Promise.all([loadCohort, getNotes]).then(() => {
        this.loading = false;
      })
    },
    loadUser(user_id) {
      API
        .getUser(user_id)
        .then(user => {
          this.$set(this.users, user_id, user);
        });
    },
    moment(date) {
      return moment(date).fromNow();
    },
    successCriteria(success_criteria, id) {
      return success_criteria.filter(s => s._id == id)[0].text;
    }
  }
}
</script>
