<template>
  <div class="resource-list">
    <div class="resource-types">
      <button class="waves btn resource-btn" v-bind:class="colors[type]" v-for="type in types" v-on:click="selectedType = type" v-bind:disabled="selectedType == type">
        <span class="emoji">{{typeEmojis[type]}}</span>
        <span>{{type}}</span>
        <span class="resource-count">{{byType[type].length}}</span>
      </button>
    </div>

    <div class="circle-list" v-for="type in types" v-if="selectedType == type">
      <h5 class="type-title"><span class="emoji">{{typeEmojis[type]}}</span>{{type}}</h5>
      <ul>
        <li v-for="resource in byType[type]">
          <span>
            <v-icon
              @mousedown.native="checkResource(resource._id)"
              v-if="isChecked(resource._id) && trackers[resource._id] && trackers[resource._id].checkout_date"
              v-bind:class="{
                'green-text': isChecked(resource._id),
                'grey-text': !isChecked(resource._id)
              }">check_box</v-icon>
            <v-icon
              v-show="!isChecked(resource._id) && trackers[resource._id] && trackers[resource._id].checkout_date"
              v-tooltip:bottom="'Done With Resource'"
              @mousedown.native="checkResource(resource._id)">
              check_box_outline_blank</v-icon>
            <a class="resource-title" v-bind:href="resource.url" target="_blank">{{resource.title}}</a>
            <i v-show="!isChecked(resource._id) && !isCheckedOut(resource._id)"
            v-on:mousedown="checkoutResource(resource._id)"
            v-tooltip:bottom="'Check Out'" class="checkout-button pink-text material-icons">turned_in</i>
          </span>
          <span v-if="trackers[resource._id]" style="display:flex;flex-direction:column">
            <small v-if="trackers[resource._id].checkout_date">Checked out: {{trackers[resource._id].checkout_date | moment}}</small>
            <small v-if="trackers[resource._id].done_date">Marked done: {{trackers[resource._id].done_date | moment}}</small>
          </span>
          <pre class="resource-description">{{resource.description}}</pre>
        </li>
      </ul>
    </div>
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
    padding-top: 2rem;
    text-align: center;
    text-transform: capitalize;
  }
  .emoji {
    margin-right: 0.25em;
    font-size: 1.5em;
  }
  .resource-types {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
  }
  .resource-types button {
    align-items: center;
    box-sizing: border-box;
    display: flex;
    flex: 1;
    max-width: 32%;
    min-width: 32%;
    padding: 0;
  }
  .resource-types button span {
    flex: 1;
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
    color: black;
    font-weight: bold;
  }
  .circle-list ul {
    justify-content: center;
    display: flex;
    flex-wrap: wrap;
  }
  .circle-list li {
    border: 1px solid #e91e63;
    display: inline-block;
    flex: 1;
    min-width: 30%;
    max-width: 30%;
    padding: 0.5rem;
    text-align: center;
  }
  .circle-list .resource-title {
    font-size: 1.2rem;
  }
  .circle-list .checkout-button {
    cursor: pointer;
    font-size: 1.2rem;
  }
</style>
