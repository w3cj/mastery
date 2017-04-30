<template>
  <div id="skill-tree">
    <cohort-badge :cohort="data.cohort"></cohort-badge>
    <div v-if="user.isInstructor">
      <student-search
        v-bind:cohort_id="cohort_id"
        v-bind:onSelectStudent="selectStudent">
      </student-search>
    </div>
    <center>
      <h1 v-if="data.student" id="student-name">{{data.student.full_name}}</h1>
      <v-progress-circular v-if="loading" active green green-flash></v-progress-circular>
    </center>
    <blockquote>Click a node to see the associated standards.</blockquote>
    <div>
      <v-collection v-if="!loading">
          <v-collection-item v-for="standard in selectedStandards">
            <standard-checklist
              :user="user"
              :student="data.student"
              :standard="standard"
              :performance="data.performances[standard.id] || 0"
              :showSuccessCriteria="showSuccessCriteria"
              :evidences="data.evidences"
              :student_id="student_id"
              :cohort="data.cohort"
              :resources="data.resources[standard.id] || []"
              :onSetPerformance="onSetPerformance"
              :showScore="true">
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
import data from '../../data';
import SkillTree from './SkillTree';
import StudentSearch from '../StudentSearch';
import StandardChecklist from '../StandardChecklist';
import CohortBadge from '../CohortBadge';

export default {
  name: 'standards-skill-tree',
  components: {
    'student-search': StudentSearch,
    'standard-checklist': StandardChecklist,
    'cohort-badge': CohortBadge
  },
  data() {
    return {
      user: Auth.getCurrentUser(),
      data: data.data,
      cohort_id: this.$route.params.cohort_id,
      student_id: this.$route.params.student_id,
      loading: true,
      standards: [],
      showSuccessCriteria: true,
      selectedStandardIds: []
    };
  },
  watch: {
    '$route.params.student_id'() {
      this.load();
    }
  },
  computed: {
    selectedStandards() {
      return this.standards.filter(s => this.selectedStandardIds.includes(s.id));
    }
  },
  mounted() {
    this.load();
  },
  methods: {
    showStandards(standards) {
      this.selectedStandardIds = standards;
    },
    load() {
      this.loading = true;
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

          this.getData(graph);
        });
    },
    getData(graph) {
      this.loading = true;
      this.user = Auth.getCurrentUser();
      this.cohort_id = this.$route.params.cohort_id;
      this.student_id = this.$route.params.student_id ? this.$route.params.student_id : this.user.learn_id;

      data
        .methods
        .setStudent(this.cohort_id, this.student_id)
        .then(() => {
          graph.setColors(this.data.performances);
          API
            .getStandardCollection(this.cohort_id, 'Quarter 1')
            .then(collection => {
              if(collection) {
                this.standards = collection.standards.map(id => this.data.cohort.standards[id]);
              }
              this.loading = false;
            });
        }).catch(() => {
          this.$router.go('/');
        });
    },
    selectStudent(student) {
      document.querySelector('#graph').innerHTML = '';
      this.$router.push({
        name: 'standards-skill-tree-student',
        params: {
          cohort_id: this.cohort_id,
          student_id: student.id
        },
        query: {
          t: + new Date()
        }
      })
    },
    onSetPerformance() {
      document.querySelector('#graph').innerHTML = '';
      this.load();
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
  fill: white;
}

marker{
  fill: #333;
}

circle {
  fill: rgb(158, 158, 158);
}

g.conceptG circle{
  stroke: #333;
  stroke-width: 2px;
}

.conceptG-0 {
  fill: rgb(158, 158, 158);
}

.conceptG-1 {
  fill: rgb(244, 67, 54);
}

.conceptG-2 {
  fill: rgb(255, 214, 0);
}

.conceptG-3 {
  fill: rgb(76, 175, 80);
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
