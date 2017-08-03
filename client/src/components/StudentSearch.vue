<template>
  <div>
    <form v-on:submit.prevent="selectStudent()" v-on:keyup.enter="selectStudent()">
      <div class="input-field col s12" id="student-search-container">
        <i class="material-icons prefix">search</i>
        <input v-model="student_search" type="text" id="student_search" class="autocomplete" placeholder="Search for a student...">
      </div>
      <a @click="showStudents = !showStudents" class="left waves-effect waves-light btn">{{ showStudents ? 'Hide' : 'Show'}} Students</a>
      <button type="submit" v-bind:class="{ disabled: !student_search}" class="right waves-effect waves-light btn">Select Student</button>
    </form>
    <br>
    <br>
    <br>
    <br>
    <div class="row" v-show="showStudents">
      <div class="col s3 m2 tooltipped" v-for="student in filteredStudents" :data-tooltip="student.full_name" data-position="top">
        <img :src="student.img" :alt="student.full_name" class="student-image" @click="selectStudent(student)">
      </div>
    </div>
    <br>
  </div>
</template>

<script>
import API from '../lib/API';

export default {
  name: 'student-search',
  props: ['cohort_id', 'onSelectStudent'],
	data() {
		return {
      showStudents: false,
			student_search: '',
      students: {},
      studentList: []
		}
	},
  computed: {
    filteredStudents() {
      const search = this.student_search.trim();
      if(!search) return this.studentList;
      const studentMatch = new RegExp(search, 'gi');
      return this.studentList.filter(student => {
        return student.full_name.match(studentMatch);
      });
    }
  },
	mounted() {
		this.loadAutocomplete();
	},
	methods: {
		loadAutocomplete() {
      API.getStudentImages(this.cohort_id)
        .then(students => {
          this.studentList = students;
          const searchContainer = document.querySelector('#student-search-container ul');
          if(searchContainer) {
            searchContainer.remove();
          }

      const input = $('#student_search');
      if(input.autocomplete) {
        const data = students.reduce((data, student) => {
          data[student.full_name] = student.img ? student.img.replace('http://', 'https://') : 'https://api.adorable.io/avatars/285/' + student.id + '.png';
          this.students[student.full_name] = student;
          return data;
        }, {});
        $('#student_search').autocomplete({
          data
        });
      }

          const waitForTooltip = setInterval(function() {
            const tooltips = $('.tooltipped');
            if(tooltips.length == students.length) {
              clearInterval(waitForTooltip);
              $('.tooltipped').tooltip({delay: 25});
            }
          }, 500);
        });
    },
    selectStudent(student) {
      if(student) return this.triggerSelectStudent(student);

      const student_search = document.querySelector('#student_search').value.trim();

      if(student_search) {
        const student = this.students[student_search];

        if(student) {
          this.triggerSelectStudent(student);
        }
      }
    },
    triggerSelectStudent(student) {
      const studentName = $('#student-name')[0];
      if(studentName) {
        studentName.scrollIntoView({
          behavior: "smooth"
        });
      }
      this.onSelectStudent(student);
      this.student_search = '';
    }
	}
}
</script>
<style>
  .student-image {
    width: 100%;
    height: auto;
    cursor: pointer;
  }
  #student-search-container {
    margin-bottom: 0.5em;
  }
</style>
