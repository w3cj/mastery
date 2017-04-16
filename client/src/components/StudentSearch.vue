<template>
  <form v-on:submit.prevent="selectStudent()" v-on:keyup.enter="selectStudent()">
		<div class="input-field col s12" id="student-search-container">
			<i class="material-icons prefix">search</i>
			<input v-model="student_search" type="text" id="student_search" class="autocomplete" placeholder="Search for a student...">
		</div>
		<button type="submit" v-bind:class="{ disabled: !student_search}" class="right waves-effect waves-light btn">Select Student</button>
  </form>
</template>

<script>
import API from '../lib/API';

export default {
  name: 'student-search',
  props: ['cohort_id', 'onSelectStudent'],
	data() {
		return {
			student_search: '',
      students: {}
		}
	},
	mounted() {
		this.loadAutocomplete();
	},
	methods: {
		loadAutocomplete() {
      API.getStudentImages(this.cohort_id)
        .then(students => {
          const loaded = document.querySelector('#student-search-container ul') ? true : false;

    			if(!loaded) {
    				const input = $('#student_search');
    				if(input.autocomplete) {
    					const data = students.reduce((data, student) => {
                data[student.full_name] = student.img.replace('http://', 'https://');
                this.students[student.full_name] = student;
    						return data;
    					}, {});
    					$('#student_search').autocomplete({
    						data
    					});
    				}
          }
        });
    },
    selectStudent() {
      const student_search = document.querySelector('#student_search').value.trim();

      if(student_search) {
        const student = this.students[student_search];

        if(student) {
					this.onSelectStudent(student);
          this.student_search = '';
        }
      }
    }
	}
}
</script>
