<template>
  <div id="skill-tree">
    <blockquote>Click a node to see the associated standards.</blockquote>
    <div>
      <v-collection>
          <v-collection-item v-for="standard in selectedStandards">
            <standard-checklist
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
      var quarter1 = {
        "nodes": [{
          "id": 2,
          "title": "Command Line",
          "x": -141.78447484970093,
          "y": 9.279254615306854,
          "standards": [13992]
        }, {
          "id": 3,
          "title": "git",
          "x": 9.276540756225586,
          "y": 6.906352519989014,
          "standards": [13993]
        }, {
          "id": 4,
          "title": "Github",
          "x": 8.259550333023071,
          "y": 149.7500991821289,
          "standards": [13993]
        }, {
          "id": 6,
          "title": "Frontend Concepts",
          "x": 458.306884765625,
          "y": -0.5845885276794434,
          "standards": [13974]
        }, {
          "id": 7,
          "title": "HTML",
          "x": 545.4367065429688,
          "y": 150.0077362060547,
          "standards": [13970]
        }, {
          "id": 8,
          "title": "CSS",
          "x": 727.7045288085938,
          "y": 147.84491729736328,
          "standards": [13971]
        }, {
          "id": 9,
          "title": "JavaScript Expressions",
          "x": 462.8706359863281,
          "y": 318.3330383300781,
          "standards": [14002]
        }, {
          "id": 10,
          "title": "Responsive CSS",
          "x": 867.7266235351562,
          "y": 634.4505310058594,
          "standards": [13973]
        }, {
          "id": 11,
          "title": "CSS Frameworks",
          "x": 874.0868530273438,
          "y": 890.5599975585938,
          "standards": [13972]
        }, {
          "id": 12,
          "title": "DOM",
          "x": 581.245361328125,
          "y": 631.7131652832031,
          "standards": [13976]
        }, {
          "id": 15,
          "title": "HTTP",
          "x": 46.83651566505432,
          "y": 643.9370174407959,
          "standards": [13977]
        }, {
          "id": 16,
          "title": "AJAX",
          "x": 187.80101871490479,
          "y": 730.6787490844727,
          "standards": [13975]
        }, {
          "id": 17,
          "title": "Problem Solving",
          "x": 223.20492553710938,
          "y": 5.641327381134033,
          "standards": [13989, 13990]
        }, {
          "id": 18,
          "title": "Agile Project Management",
          "x": -110.49319362640381,
          "y": 897.7248954772949,
          "standards": [13945, 13948, 13946, 13947]
        }, {
          "id": 19,
          "title": "Deployment",
          "x": 722.073974609375,
          "y": 634.2088928222656,
          "standards": [13961]
        }, {
          "id": 20,
          "title": "DOM Tests",
          "x": 582.6812744140625,
          "y": 886.813232421875,
          "standards": [13978]
        }, {
          "id": 23,
          "title": "Higher Order Functions",
          "x": 403.7452392578125,
          "y": 631.4921569824219,
          "standards": [14005]
        }, {
          "id": 24,
          "title": "Key Parts of JavaScript",
          "x": 353.07623291015625,
          "y": 447.9570007324219,
          "standards": [14006]
        }, {
          "id": 25,
          "title": "Big O",
          "x": 222.67919158935547,
          "y": 975.0703125,
          "standards": [14007]
        }, {
          "id": 21,
          "title": "JavaScript Accumulator Pattern",
          "x": 398.4071960449219,
          "y": 881.4761047363281,
          "standards": [14004]
        }],
        "edges": [{
          "source": 2,
          "target": 3
        }, {
          "source": 3,
          "target": 4
        }, {
          "source": 6,
          "target": 7
        }, {
          "source": 6,
          "target": 9
        }, {
          "source": 6,
          "target": 8
        }, {
          "source": 7,
          "target": 8
        }, {
          "source": 8,
          "target": 10
        }, {
          "source": 10,
          "target": 11
        }, {
          "source": 9,
          "target": 12
        }, {
          "source": 7,
          "target": 12
        }, {
          "source": 6,
          "target": 15
        }, {
          "source": 15,
          "target": 16
        }, {
          "source": 7,
          "target": 19
        }, {
          "source": 8,
          "target": 19
        }, {
          "source": 12,
          "target": 20
        }, {
          "source": 9,
          "target": 23
        }, {
          "source": 9,
          "target": 24
        }, {
          "source": 24,
          "target": 25
        }, {
          "source": 23,
          "target": 25
        }, {
          "source": 23,
          "target": 21
        }, {
          "source": 21,
          "target": 25
        }, {
          "source": 23,
          "target": 16
        }, {
          "source": 23,
          "target": 12
        }]
      }

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
