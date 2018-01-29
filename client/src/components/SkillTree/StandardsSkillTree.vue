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
      <h3>{{ currentQuarter().name }} Skill Tree</h3>
      <v-progress-circular v-if="loading" active green green-flash></v-progress-circular>
    </center>
    <div v-if="!loading">
      <v-btn v-for="section in skillOpts.sections" @click.native="load(section.file)" class="skillButton indigo">
        {{ section.name }}
      </v-btn>
      <blockquote>Click a node to see the associated standards.</blockquote>
    </div>
    <div>
      <div id="graph" v-show="!loading"></div>
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
              :resources="data.resources[standard.id]"
              :onSetPerformance="onSetPerformance"
              :showScore="true">
            </standard-checklist>
          </v-collection-item>
        </v-collection>
    </div>
  </div>
</template>

<script>
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
    var cohortId = this.$route.params.cohort_id
    var skillOpts = data.methods.getSkillTreeOpts(cohortId);
    return {
      user: Auth.getCurrentUser(),
      data: data.data,
      cohort_id: this.$route.params.cohort_id,
      student_id: this.$route.params.student_id,
      loading: true,
      standards: [],
      showSuccessCriteria: true,
      selectedStandardIds: [],
      skillOpts: skillOpts,
      quarter: skillOpts.sections[0].file
    };
  },
  watch: {
    '$route.params.student_id'() {
      this.load(this.quarter);
    }
  },
  computed: {
    selectedStandards() {
      return this.standards.filter(s => this.selectedStandardIds.includes(s.id));
    }
  },
  mounted() {
    var savedSection = localStorage.skillTree
    if (savedSection && this.skillOpts.sections.find(section => section.file === savedSection)) {
      this.load(savedSection);
    } else {
      this.load(this.quarter);
    }
  },
  methods: {
    currentQuarter() {
      return this.skillOpts.sections.find(section => section.file === this.quarter)
    },
    showStandards(standards) {
      this.selectedStandardIds = standards;
    },
    load(quarter) {
      this.quarter = quarter;

      document.querySelector('#graph').innerHTML = '';
      localStorage.skillTree = quarter;

      this.loading = true;
      var skillsTreeBranch = this.skillOpts.skillsTreeBranch
      fetch(`./static/${skillsTreeBranch}/${quarter}.json`)
        .then(res => res.json())
        .then(quarter1 => {
          var element = document.querySelector('#skill-tree');

          var width = element.clientWidth,
              height =  400;

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
          this.standards = Object.keys(this.data.cohort.standards).map(id => this.data.cohort.standards[id]);
          this.loading = false;
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
      this.load(this.quarter);
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
  background-color: rgb(52, 54, 51);
}

#graph p{
   text-align: center;
   overflow: overlay;
   position: relative;
}

.conceptG text{
  font-size: 1.2rem;
  pointer-events: none;
  fill: white;
}

marker{
  fill: rgb(219, 219, 219);
}

circle {
  fill: rgb(219, 219, 219);
}

g.conceptG circle{
  stroke: rgb(70, 70, 70);
  stroke-width: 5px;
}

.conceptG-0 {
  fill: rgb(107, 107, 107);
}

g.conceptG circle.conceptG-1 {
  fill: rgb(202, 60, 37);
  stroke: rgb(166, 50, 31);
  stroke-width: 5px;
}

g.conceptG circle.conceptG-2 {
  fill: rgb(240, 207, 101);
  stroke: rgb(197, 170, 83);
}

g.conceptG circle.conceptG-3 {
  fill: rgb(63, 163, 77);
  stroke: rgb(52, 134, 64);
  stroke-width: 5px;
}

g.conceptG:hover circle.conceptG-0{
  fill: rgb(70, 70, 70);
  stroke: rgb(107, 107, 107);
}

g.conceptG:hover circle.conceptG-1{
  fill: rgb(166, 50, 31);
  stroke: rgb(202, 60, 37);
}

g.conceptG:hover circle.conceptG-2{
  fill: rgb(197, 170, 83);
  stroke: rgb(240, 207, 101);
}

g.conceptG:hover circle.conceptG-3{
  fill: rgb(52, 134, 64);
  stroke: rgb(63, 163, 77);
}

g.conceptG circle.conceptEntry {
  stroke: rgb(219, 219, 219);
  transform: translateY(15px) scale(1.3);
}

g.conceptG circle.conceptExit {
  fill: rgb(219, 219, 219);
  transform: translateY(15px) scale(1.3);
}

g.selected circle{
  fill: rgb(250, 232, 255);
}
g.selected:hover circle{
  fill: rgb(250, 232, 255);
}

path.link {
  fill: none;
  stroke: rgba(219, 219, 219, 0.2);
  stroke-width: 3px;
  cursor: default;
  animation: radiate 4s infinite;
}

@keyframes radiate {
  0% {
    opacity: 0.2;
  }

  50% {
    opacity: 0.8;
  }

  100% {
    opacity: 0.2;
  }
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

.skillButton {
  margin-right: 10px;
}
</style>
