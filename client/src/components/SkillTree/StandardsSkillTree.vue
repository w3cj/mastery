<template>
  <div id="skill-tree">
    <blockquote>Click a node to see the associated standards.</blockquote>
    <div>
      <v-collection>
          <v-collection-item v-for="standard in selectedStandards">
            <standard-checklist
              :user="user"
              :student="student"
              :standard="standard"
              :performance="performances[standard.id]"
              :showSuccessCriteria="showSuccessCriteria"
              :evidences="evidences"
              :student_id="student_id"
              :cohort="cohort"
              :resources="resources[standard.id] || []"
              :showScore="student_id">
            </standard-checklist>
          </v-collection-item>
        </v-collection>
    </div>
    <div id="graph">

    </div>
  </div>
</template>

<script>
import API from '../../lib/API';
import Auth from '../../lib/Auth';
import SkillTree from './SkillTree';
import StandardChecklist from '../StandardChecklist';

export default {
  name: 'standards-skill-tree',
  components: {
    'standard-checklist': StandardChecklist
  },
  data() {
    return {
      user: Auth.getCurrentUser(),
      student: {},
      cohort_id: this.$route.params.cohort_id,
      student_id: this.$route.params.student_id,
      cohort: {},
      loading: true,
      standards: [],
      evidences: {},
      resources: {},
      performances: {},
      showSuccessCriteria: true,
      removing: false,
      adding: false,
      selectedStandards: []
    };
  },
  watch: {
    '$route.params.cohort_id'(newId, oldId) {
      this.load();
    },
    '$route.params.student_id'(newId, oldId) {
      this.load();
    },
    '$route.params.collection_name'(newId, oldId) {
      this.load();
    }
  },
  mounted() {
    this.load();
  },
  methods: {
    showStandards(standards) {
      this.selectedStandards = this.standards.filter(s => standards.includes(s.id));
    },
    load() {
      fetch('./static/quarter1.json')
        .then(res => res.json())
        .then(quarter1 => {
          var element = document.querySelector('#skill-tree');

          var width = element.clientWidth,
              height =  750;

          var xLoc = width/2 - 25,
              yLoc = 100;

          var nodes = [];
          var edges = [];

          var svg = d3.select("#graph").append("svg")
                .attr("width", width)
                .attr("height", height);

          var graph = new SkillTree(svg, nodes, edges);
              graph.setIdCt(2);

          graph.updateGraph();

          graph.showStandards = this.showStandards;

          graph.loadGraph(quarter1);
        });

      this.user = Auth.getCurrentUser();
      this.cohort_id = this.$route.params.cohort_id;
      this.student_id = this.$route.params.student_id ? this.$route.params.student_id : this.user.learn_id;

      Promise.all([
        API.getEvidences(this.student_id)
          .then(evidences => {
            this.evidences = evidences;
          }).catch(() => {
            this.$router.replace('/');
          }),
        API
          .getCohort(this.cohort_id)
          .then(cohort => {
            this.cohort = cohort;
          }),
        API.getStudent(this.cohort_id, this.student_id)
          .then(student => {
            student = student ? student : this.user;
            this.student = student;
            this.student_id = student.id ? student.id : student.learn_id;
          }),
        API
          .getStudentPerformances(this.cohort_id, this.student_id)
          .then(data => {
            this.performances = data;
          }).catch(error => {
            this.$router.go('/');
          }).then(() => {
            this.loadingStandards = false;
          }),
        API
          .getAllResources(this.cohort_id)
          .then(resources => {
            this.resources = resources;
          })
      ]).then(() => {
        API
          .getStandardCollection(this.cohort_id, 'Quarter 1')
          .then(collection => {
            if(collection) {
              this.standards = collection.standards.map(id => this.cohort.standards[id]);
            }
            this.loading = false;
          });
      }).catch(() => {
        this.$router.go('/');
      });
    }
  }
}
</script>
<style>
#graph{
  margin: 0;
  padding: 0;
  overflow:hidden;
  font-family: sans-serif;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  background-color: rgb(248, 248, 248)
}

#graph p{
   text-align: center;
   overflow: overlay;
   position: relative;
}

.conceptG text{
  pointer-events: none;
}

marker{
  fill: #333;
}

g.conceptG circle{
  fill: #F6FBFF;
  stroke: #333;
  stroke-width: 2px;
}

g.conceptG:hover circle{
  fill: rgb(200, 238, 241);
}

g.selected circle{
  fill: rgb(250, 232, 255);
}
g.selected:hover circle{
  fill: rgb(250, 232, 255);
}

path.link {
  fill: none;
  stroke: #333;
  stroke-width: 6px;
  cursor: default;
}

path.link:hover{
  stroke: rgb(94, 196, 204);
}

g.connect-node circle{
  fill: #BEFFFF;
}

path.link.hidden{
  stroke-width: 0;
}

path.link.selected {
  stroke: rgb(229, 172, 247);
}

.week-title {
font-family: sans-serif;
}
</style>
