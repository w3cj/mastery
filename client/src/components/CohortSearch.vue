<template>
  <form v-on:submit.prevent="changeCohort()" v-on:keyup.enter="changeCohort()">
		<div class="input-field col s12" id="search-container">
			<i class="material-icons prefix">search</i>
			<input v-model="cohort_search" type="text" id="cohort_search" class="autocomplete" placeholder="Search for a cohort...">
		</div>
		<button type="submit" v-bind:class="{ disabled: !cohort_search}" class="right waves-effect waves-light btn">Change Cohort</button>
  </form>
</template>

<script>
export default {
  name: 'cohort-search',
  props: ['cohorts', 'onCohortChange'],
	data() {
		return {
			cohort_search: ''
		}
	},
	mounted() {
		this.loadAutocomplete();
	},
	watch: {
		cohorts() {
			this.loadAutocomplete();
		}
	},
	methods: {
		loadAutocomplete() {
			const loaded = document.querySelector('#search-container ul') ? true : false;

			if(!loaded) {
				const input = $('input.autocomplete');
				if(input.autocomplete) {
					const data = this.cohorts.reduce((data, cohort) => {
						data[cohort.name] = null;
						return data;
					}, {});
					$('input.autocomplete').autocomplete({
						data
					});
				}
			}
    },
    changeCohort() {
      const cohort_search = document.querySelector('#cohort_search').value.trim();

      if(cohort_search) {
        const findCohort = this.cohorts.filter(c => c.name.startsWith(cohort_search));

        if(findCohort.length > 0) {
          const {cohort_id} = findCohort[0];
          if(cohort_id) {
						this.onCohortChange(cohort_id);
          }
        }
      }
    }
	}
}
</script>
