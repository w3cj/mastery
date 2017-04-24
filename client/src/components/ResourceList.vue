<template>
  <div class="resource-list">
    <p>
      <a class="waves btn resource-btn" v-bind:class="colors[type]" v-for="type in types" v-on:click="selectedType = type"><span class="emoji">{{typeEmojis[type]}}</span>{{type}} <span class="resource-count">{{byType[type].length}}</span></a>
      <ul class="circle-list" v-for="type in types" v-if="selectedType == type">
        <li>
          <h5 class="type-title"><span class="emoji">{{typeEmojis[type]}}</span>{{type}}</h5>
          <ul>
            <li v-for="resource in byType[type]">
              <a v-bind:href="resource.url" target="_blank">{{resource.title}}</a>
              <pre class="resource-description">{{resource.description}}</pre>
            </li>
          </ul>
        </li>
      </ul>
    </p>
  </div>
</template>

<script>
export default {
  name: 'resource-list',
  props: ['resources'],
	data() {
		return {
      byType: {},
      types: [],
      selectedType: '',
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
    }
  },
  mounted() {
    this.load();
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
