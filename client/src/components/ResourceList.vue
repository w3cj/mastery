<template>
  <div class="resource-list">
    <p>
      <a class="waves btn resource-btn" v-bind:class="colors[type]" v-for="type in types" v-on:click="selectedType = type" v-bind:disabled="selectedType == type"><span class="emoji">{{typeEmojis[type]}}</span>{{type}} <span class="resource-count">{{byType[type].length}}</span></a>
      <ul class="circle-list" v-for="type in types" v-if="selectedType == type">
        <li>
          <h5 class="type-title"><span class="emoji">{{typeEmojis[type]}}</span>{{type}}</h5>
          <ul>
            <li v-for="resource in byType[type]">
              <span style="display:flex;align-items:center;">
                <v-icon
                  @mousedown.native="checkResource(resource._id)"
                  v-if="isChecked(resource._id) && trackers[resource._id] && trackers[resource._id].checkout_date"
                  v-bind:class="{
                    'green-text': isChecked(resource._id),
                    'grey-text': !isChecked(resource._id)
                  }">check_box</v-icon>
                <v-icon
                  v-if="!isChecked(resource._id) && trackers[resource._id] && trackers[resource._id].checkout_date"
                  v-tooltip:bottom="'Done With Resource'"
                  @mousedown.native="checkResource(resource._id)">
                  check_box_outline_blank</v-icon>
                <a v-bind:href="resource.url" target="_blank">{{resource.title}}</a>
                <span class="white-text">.</span>
                <a
                  v-show="!isCheckedOut(resource._id)"
                  v-on:mousedown="checkoutResource(resource._id)"
                  class="btn-floating waves-effect waves-light"
                  v-tooltip:bottom="'Check Out'">
                  <i class="material-icons">turned_in</i></a>
                <a
                  v-show="isCheckedOut(resource._id)"
                  v-on:mousedown="checkinResource(resource._id)"
                  class="btn-floating waves-effect waves-light indigo"
                  v-tooltip:bottom="'Check In'">
                  <i class="material-icons">turned_in_not</i></a>
              </span>
              <span v-if="trackers[resource._id]" style="display:flex;flex-direction:column">
                <small v-if="trackers[resource._id].checkout_date">Checked out: {{trackers[resource._id].checkout_date | moment}}</small>
                <small v-if="trackers[resource._id].checkin_date">Checked in: {{trackers[resource._id].checkin_date | moment}}</small>
                <small v-if="trackers[resource._id].done_date">Marked done: {{trackers[resource._id].done_date | moment}}</small>
              </span>
              <pre class="resource-description">{{resource.description}}</pre>
            </li>
          </ul>
        </li>
      </ul>
    </p>
  </div>
</template>

<script>
import moment from 'moment';
import data from '../data';
import API from '../lib/API';

export default {
  name: 'resource-list',
  props: ['resources'],
	data() {
		return {
      byType: {},
      data: data.data,
      types: [],
      selectedType: '',
      trackers: data.data.student.resourceTrackers,
      typeEmojis: {
        assessment: '💪',
        example: '🐙',
        exercise: '📝',
        external: '🔗',
        article: '📰',
        slides: '🎁',
        video: '📺'
      },
      colors: {
        assessment: {
          red: true
        },
        example: {
          green: true,
        },
        exercise: {
          orange: true,
        },
        external: {
          blue: true,
        },
        article: {
          pink: true,
        },
        slides: {
          indigo: true,
        },
        video: {
          purple: true,
        }
      }
		}
	},
  watch: {
    resources() {
      this.load();
    },
    'data.student.resourceTrackers'() {
      this.trackers = data.student.resourceTrackers;
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
  methods: {
    load() {
      this.byType = this.resources.reduce((byType, resource) => {
        byType[resource.type] = byType[resource.type] || [];
        byType[resource.type].push(resource);
        return byType;
      }, {});
      this.types = Object.keys(this.byType);
      this.selectedType = this.types[0];
    },
    checkResource(id) {
      const checked = this.trackers[id] ? !this.trackers[id].checked : true;

      let promise = null;

      if(checked) {
        promise = API
          .checkResource(this.data.cohort_id, this.data.student_id, id);
      } else {
        promise = API
          .uncheckResource(this.data.cohort_id, this.data.student_id, id);
      }

      promise
        .then(tracker => {
          this.$set(this.trackers, id, tracker);
        });
    },
    checkoutResource(id) {
      API
        .checkoutResource(this.data.cohort_id, this.data.student_id, id)
        .then(tracker => {
          this.$set(this.trackers, id, tracker);
        });
    },
    checkinResource(id) {
      API
        .checkinResource(this.data.cohort_id, this.data.student_id, id)
        .then(tracker => {
          this.$set(this.trackers, id, tracker);
        });
    },
    isChecked(id) {
      return this.trackers[id] && this.trackers[id].checked;
    },
    isCheckedOut(id) {
      return this.trackers[id] && this.trackers[id].checkedout;
    }
  }
}
</script>
<style>
  .type-title {
    text-transform: capitalize;
  }
  .emoji {
    margin-right: 0.25em;
    font-size: 1.5em;
  }
  .resource-list h5 {
    margin-left: 1em;
  }
  .resource-description {
    margin: 0.25em !important;
    padding: 0em !important;
    font-family: sans-serif !important;
    white-space: pre-wrap;
  }
  .resource-btn {
    margin: 0.25em;
  }
  .resource-count {
    background: white;
    border-radius: 30px;
    padding-left: 0.5em;
    padding-right: 0.5em;
    color: black;
    font-weight: bold;
  }
</style>
