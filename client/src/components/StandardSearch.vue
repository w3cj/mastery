<template>
  <form v-on:submit.prevent="addStandard()" v-on:keyup.enter="addStandard()">
		<div class="input-field col s12" id="standard-search-container">
			<i class="material-icons prefix">search</i>
			<input v-model="standard_search" type="text" id="standard_search" class="autocomplete" placeholder="Search for a standard...">
		</div>
		<button type="submit" v-bind:class="{ disabled: !standard_search}" class="right waves-effect waves-light btn">Add Standard</button>
  </form>
</template>

<script>
export default {
  name: 'standard-search',
  props: ['cohort', 'onAddStandard'],
	data() {
		return {
			standard_search: '',
      standards: {}
		}
	},
	mounted() {
		this.loadAutocomplete();
	},
	watch: {
		cohort() {
			this.loadAutocomplete();
		}
	},
	methods: {
		loadAutocomplete() {
			const loaded = document.querySelector('#standard-search-container ul') ? true : false;

			if(!loaded) {
				const input = $('#standard_search');
				if(input.autocomplete) {
					const data = this.cohort.subjects.reduce((data, subject) => {
            subject.standards.map(standard => {
              const name = `${subject.name}: ${standard.description}`;
              data[name] = null;
              this.standards[name] = standard;
            });
						return data;
					}, {});
					$('#standard_search').autocomplete({
						data
					});
				}
			}
    },
    addStandard() {
      const standard_search = document.querySelector('#standard_search').value.trim();

      if(standard_search) {
        const standard = this.standards[standard_search];

        if(standard) {
					this.onAddStandard(standard);
          this.standard_search = '';
        }
      }
    }
	}
}
</script>
