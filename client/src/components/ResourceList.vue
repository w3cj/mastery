<template>
  <div class="resource-list">
    <p>
      <ul class="circle-list" v-for="type in types">
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
  }
</style>
