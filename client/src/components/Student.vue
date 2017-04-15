<template>
	<div class="card col s12 m4 l3" v-if="studentVisible(student)">
	 <div class="card-image waves-effect waves-block waves-light">
		 <img v-if="showImage"  class="activator" v-bind:src="student.img.replace('http://', 'https://')">
	 </div>
	 <div class="card-content">
		 <span class="card-title activator grey-text text-darken-4">{{formatName(student.full_name)}}<i class="material-icons right">more_vert</i></span>
		 <h5 v-if="showScore">
			 <p class="green-text"><span v-if="getStudentScorePercent(3) > 0">3s:  {{getStudentScorePercent(3)}}%</span><span class="white-text">.</span></p>
			 <p class="orange-text"><span v-if="getStudentScorePercent(2) > 0">2s:  {{getStudentScorePercent(2)}}%</span><span class="white-text">.</span></p>
			 <p class="red-text"><span v-if="getStudentScorePercent(1) > 0">1s:  {{getStudentScorePercent(1)}}%</span><span class="white-text">.</span></p>
		 </h5>
		 <h5 v-if="showScore">
			 <strong>{{ electiveAverageScore > 0 ? 'Core:' : 'Average:'}}  </strong>{{ coreAverageScore }}
		 </h5>
		 <h5 v-if="showScore && electiveAverageScore > 0">
			 <strong>Elective:  </strong>{{ electiveAverageScore }}
		 </h5>
		 <p>
			 <router-link :to="{ name: 'student-dashboard', params: { cohort_id: cohort_id, student_id: student.id} }">View Mastery</router-link>
		 </p>
	 </div>
	 <div class="card-reveal">
		 <span class="card-title grey-text text-darken-4">{{formatName(student.full_name)}}<i class="material-icons right">close</i></span>
		 <p>Charts and metrics and other cool stuff coming soon...</p>
	 </div>
 </div>
</template>
<script>

export default {
  name: 'student',
  props: ['student', 'cohort_id', 'search', 'performances', 'showImage', 'showScore', 'scoreSubject_id'],
	data() {
		return {
			cohort_search: ''
		}
	},
	computed: {
		totalScores() {
			if(this.performances.scoreTotals) {
			  let total = 0;
				for (var i = 1; i < 5; i++) {
					total += this.performances.scoreTotals[i];
				}
				return total;
			}

			return 0;
		},
		coreAverageScore() {
			if(this.performances) {
				if(this.scoreSubject_id != -1) {
					if(this.performances[this.scoreSubject_id] && this.performances[this.scoreSubject_id].average) {
						return this.performances[this.scoreSubject_id].average.toFixed(2);
					}
				} else {
					return this.performances.average;
				}
			}

			return '...';
		},
		electiveAverageScore() {
			if(this.performances) {
				if(this.scoreSubject_id != -1) {
					if(this.performances[this.scoreSubject_id] && this.performances[this.scoreSubject_id].elective && this.performances[this.scoreSubject_id].elective.count > 0) {
						return this.performances[this.scoreSubject_id].elective.average.toFixed(2);
					}
				} else {
					return this.performances.electiveAverage;
				}
			}

			return '...';
		}
	},
	methods: {
		getStudentScorePercent(score) {
			if(this.performances && this.performances.scoreTotals && this.performances.scoreTotals[score]) {
				if(this.scoreSubject_id != -1) {
					if(this.performances[this.scoreSubject_id]) {
						return ((this.performances[this.scoreSubject_id][score] / this.performances[this.scoreSubject_id].count) * 100).toFixed(2);
					}
				} else {
					return ((this.performances.scoreTotals[score] / this.totalScores) * 100).toFixed(2);
				}
			}

			return '...';
		},
		formatName(name) {
			if(this.search.trim() != '') {
				return name;
			} else {
				return name.split(' ')[0];
			}
		},
		studentVisible(student) {
			if(this.search.trim() != '') {
				const regexp = new RegExp(this.search, 'gi');
				return student.full_name.match(regexp);
			} else {
				return true;
			}
		}
	}
}
</script>
