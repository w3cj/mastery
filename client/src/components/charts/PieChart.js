import {Pie, mixins} from 'vue-chartjs';
const { reactiveProp } = mixins;

export default Pie.extend({
  mixins: [reactiveProp],
  mounted () {
    this.renderChart(this.chartData, {
      responsive: true,
      maintainAspectRatio: false
    });
  }
})
