<template>
  <div>
    <center>
      <h1>Activity Feed</h1>
      <v-progress-circular v-if="loading" active green green-flash></v-progress-circular>
    </center>
    <div v-if="!loading">
      <div v-if="user.isInstructor">
        <student-search
          v-bind:cohort_id="cohort_id"
          v-bind:onSelectStudent="selectStudent">
        </student-search>
      </div>
      <center v-if="numPages > 1">
        <v-pagination
        color="blue"
        waves
        :length="numPages"
        v-model="page"
        ></v-pagination>
      </center>
      <v-collection v-if="visibleNotes.length > 0">
        <v-collection-avatar class="student-note" v-for="note in visibleNotes" v-bind:src="users[note.creator_id].image">
            <span class="title">
              <v-icon v-if="data.evidences[note.success_criteria_id] && isChecked(note.success_criteria_id)"
                v-bind:class="{
                  'green-text': data.evidences[note.success_criteria_id].approved,
                  'yellow-text': !data.evidences[note.success_criteria_id].approved
                }">check_box</v-icon>
              <v-icon v-if="data.evidences[note.success_criteria_id] && !isChecked(note.success_criteria_id)" class="grey-text">check_box_outline_blank</v-icon>
              <strong :class="getPerformanceTextColors(data.performances[note.standard_id] || 0)">{{cohort.standards[note.standard_id].description}}</strong>
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
import data from '../data';
import Auth from '../lib/Auth';
import API from '../lib/API';
import StudentSearch from './StudentSearch';

export default {
  name: 'activity-feed',
  components: {
    'student-search': StudentSearch,
  },
  data() {
    return {
      users: {},
      notes: [],
      user: Auth.getCurrentUser(),
      cohort_id: this.$route.params.cohort_id,
      student_id: this.$route.query.student_id,
      cohort: null,
      loading: false,
      count: 10,
      page: 1,
      data: data.data,
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
  watch: {
    '$route.params.cohort_id'() {
      this.load();
    },
    '$route.query.student_id'() {
      this.load();
    }
  },
  methods: {
    load() {
      this.loading = true;
      this.cohort_id = this.$route.params.cohort_id;
      this.student_id = this.$route.query.student_id;

      const loadCohort = API.getCohort(this.cohort_id)
        .then(cohort => {
          this.cohort = cohort;
        });

      let getNotes = null;

      if(this.user.isInstructor && !this.student_id) {
        getNotes = API.getUnreadCohortNotes(this.cohort_id);
      } else {
        getNotes = API.getUnreadStudentNotes(this.cohort_id, this.student_id || this.user.learn_id);
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

          if(note.student_id !== note.creator_id) {
            users[note.student_id] = users[note.student_id] || {
              image: `https://api.adorable.io/avatars/100/${note.student_id}.png`,
              full_name: 'Loading...'
            };
          }

          return users;
        }, {});

        this.users = users;
      });

      const promises = [loadCohort, getNotes];

      if(this.student_id) {
        promises.push(data.methods.setStudent(this.cohort_id, this.student_id));
      }

      Promise.all(promises).then(() => {
        this.loading = false;
        console.log(this.data.performances);
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
    },
    getPerformanceColors(score) {
      return {
        'grey': score == 0 || score > 4,
        'red': score == 1,
        'yellow': score == 2,
        'green': score == 3 || score == 4,
        'accent-4': score == 2
      }
    },
    getPerformanceTextColors(score) {
      const performanceColors = this.getPerformanceColors(score);
      return {
        'grey-text': performanceColors.grey,
        'red-text': performanceColors.red,
        'yellow-text': performanceColors.yellow,
        'green-text': performanceColors.green,
        'accent-4': performanceColors.yellow
      }
    },
    isChecked(id) {
      return this.data.evidences[id] && this.data.evidences[id].checked;
    },
    selectStudent(student) {
      this.$router.push({
        name: 'activity-feed',
        params: {
          cohort_id: this.cohort_id,
        },
        query: {
          student_id: student.id,
        }
      });
    },
  }
}
</script>
<style>
  .button-area {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  .student-note {
    background-color: #50AD55;
  }
</style>
