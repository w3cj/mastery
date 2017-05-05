<template>
  <div>
    <center>
      <h1>Activity Feed</h1>
      <v-progress-circular v-if="loading" active green green-flash></v-progress-circular>
    </center>
    <div v-if="!loading">
      <center v-if="numPages > 1">
        <v-pagination
        color="blue"
        waves
        :length="numPages"
        v-model="page"
        ></v-pagination>
      </center>
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
            <div class="button-area">
              <div class="chip" v-if="user.isInstructor && note.student_id != note.creator_id">
                <router-link :to="{ name: 'student-dashboard', params: { 'cohort_id': cohort_id, 'student_id': note.student_id } }">
                <img :src="users[note.student_id].image" :alt="users[note.student_id].full_name">
                {{users[note.student_id].full_name}}
                </router-link>
              </div>
              <div class="buttons">
                <v-btn @click.native="markAsRead(note)"><v-icon class="left">markunread</v-icon>Mark as Read</v-btn>
                <router-link :to="{
                  name: 'student-dashboard',
                  params: {
                    student_id: note.student_id
                    },
                    query: {
                      standard_id: note.standard_id,
                      success_criteria_id: note.success_criteria_id,
                      singleView: true
                    }
                    }" class="waves btn indigo"><v-icon class="left">comment</v-icon>View Note</router-link>
              </div>
            </div>
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
      loading: false,
      count: 10,
      page: 1
    }
  },
  mounted() {
    this.load();
  },
  computed: {
    numPages() {
      return Math.ceil(this.notes.filter(note => !note.read).length / this.count);
    },
    visibleNotes() {
      const notes = this.notes.filter(note => !note.read);
      const start = (this.page - 1) * this.count;
      let end = start + this.count;
      if(end > notes.length) {
        end = notes.length;
      }
      return notes.slice(start, end);
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
        getNotes = API.getUnreadCohortNotes(this.cohort_id);
      } else {
        getNotes = API.getUnreadStudentNotes(this.cohort_id, this.user.learn_id);
      }

      getNotes.then(notes => {
        this.notes = notes.filter(note => {
          return note.created && note.creator_id != this.user.learn_id;
        }).sort((a, b) => {
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
    },
    markAsRead(note) {
      API
        .markNoteAsRead(note.cohort_id, note.student_id, note._id)
        .then(result => {
          this.$set(note, 'read', result.read);
        });
    }
  }
}
</script>
<style>
  .button-area {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
</style>
