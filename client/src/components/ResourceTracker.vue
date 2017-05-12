<template>
  <div>
    <cohort-badge :cohort="data.cohort"></cohort-badge>
    <div v-if="user.isInstructor">
      <student-search
        v-bind:cohort_id="cohort_id"
        v-bind:onSelectStudent="selectStudent">
      </student-search>
    </div>
    <center>
      <h1 v-if="data.student" id="student-name">{{data.student.full_name}}</h1>
      <v-progress-circular v-if="loading" active green green-flash></v-progress-circular>
    </center>
    <div class="row" v-if="checkedOutTrackers.length > 0 || doneTrackers.length > 0">
      <div class="col s6">
        <h3>Checked Out</h3>
      </div>
      <div class="col s6">
        <h3>Done</h3>
      </div>
    </div>
    <div class="row" v-if="checkedOutTrackers.length > 0 || doneTrackers.length > 0">
      <div class="col s6">
        <blockquote v-if="checkedOutTrackers.length == 0">No checked out resources.</blockquote>
        <ul class="collection">
          <li class="collection-item" v-for="tracker in checkedOutTrackers" v-show="tracker.checkedout">
            <span class="emoji">{{typeEmojis[resources[tracker.resource_id].type]}}</span>
            <a
              v-on:mousedown="checkinResource(tracker)"
              class="btn-floating waves-effect waves-light red"
              v-tooltip:bottom="'Check In'">
              <i class="material-icons">turned_in_not</i></a>
            <a
              v-show="!tracker.checked"
              v-on:mousedown="checkResource(tracker)"
              class="btn-floating waves-effect waves-light green"
              v-tooltip:bottom="'Mark Done'">
              <i class="material-icons">done</i></a>
            <a v-bind:href="resources[tracker.resource_id].url" target="_blank">{{resources[tracker.resource_id].title}}</a>
            <br>
            <small>Checked Out: {{tracker.checkout_date | moment}}</small>
          </li>
        </ul>
      </div>
      <div class="col s6">
        <blockquote v-if="doneTrackers.length == 0">No resources marked done.</blockquote>
        <ul class="collection">
          <li class="collection-item" v-for="tracker in doneTrackers" v-show="tracker.checked">
            <span style="display: flex; flex-direction: column;">
              <span>
                <span class="emoji">{{typeEmojis[resources[tracker.resource_id].type]}}</span>
                <a v-bind:href="resources[tracker.resource_id].url" target="_blank">{{resources[tracker.resource_id].title}}</a>
              </span>
              <small>Marked Done: {{tracker.done_date | moment}}</small>
            </span>
          </li>
        </ul>
      </div>
    </div>
    <div v-if="!loading && checkedOutTrackers.length == 0 && doneTrackers.length == 0">
      <blockquote>No tracked resources to show.</blockquote>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import data from '../data';
import Auth from '../lib/Auth';
import API from '../lib/API';
import StudentSearch from './StudentSearch';
import CohortBadge from './CohortBadge';

export default {
  name: 'resource-tracker',
  components: {
    'student-search': StudentSearch,
    'cohort-badge': CohortBadge
  },
  data() {
    return {
      loading: true,
      cohort_id: this.$route.params.cohort_id,
      data: data.data,
      trackers: [],
      resources: {},
      user: Auth.getCurrentUser(),
      typeEmojis: {
        assessment: '💪',
        example: '🐙',
        exercise: '📝',
        external: '🔗',
        article: '📰',
        slides: '🎁',
        video: '📺'
      }
    }
  },
  mounted() {
    this.load();
  },
  filters: {
    moment(date) {
      return moment(date).calendar();
    }
  },
  watch: {
    '$route.params.student_id'() {
      this.load();
    }
  },
  computed: {
    checkedOutTrackers() {
      return this.trackers.filter(t => t.checkedout).sort((a, b) => {
        return moment(a.checkout_date).unix() - moment(b.checkout_date).unix();
      });
    },
    doneTrackers() {
      return this.trackers.filter(t => t.checked).sort((b, a) => {
        return moment(a.done_date).unix() - moment(b.done_date).unix();
      });
    }
  },
  methods: {
    load() {
      this.loading = true;
      this.user = Auth.getCurrentUser();
      this.cohort_id = this.$route.params.cohort_id;
      this.student_id = this.$route.params.student_id ? this.$route.params.student_id : this.user.learn_id;

      data
        .methods
        .setStudent(this.cohort_id, this.student_id)
        .then(() => {
          this.trackers = Object.keys(data.data.student.resourceTrackers).map(k => data.data.student.resourceTrackers[k]);
          this.resources = Object.keys(data.data.resources).reduce((all, standard_id) => {
            data.data.resources[standard_id].forEach(resource => all[resource._id] = resource);
            return all;
          }, {});
          this.loading = false;
        });
    },
    checkResource(tracker) {
      API
        .checkResource(this.data.cohort_id, this.data.student_id, tracker.resource_id)
        .then(() => {
          this.$set(tracker, 'checked', true);
          this.$set(tracker, 'done_date', new Date());
        });
    },
    checkinResource(tracker) {
      API
        .checkinResource(this.data.cohort_id, this.data.student_id, tracker.resource_id)
        .then(() => {
          this.$set(tracker, 'checkedout', false);
        });
    },
    selectStudent(student) {
      this.$router.push({
        name: 'resource-tracker-student',
        params: {
          cohort_id: this.data.cohort_id,
          student_id: student.id
        }
      })
    },
  }
}
</script>
