import Vue from 'vue';
import VueCookie from 'vue-cookie';

/* eslint-disable */
window.d3 = require('d3/d3.js');
/* eslint-enable */

if(localStorage.version != '2.8.0') {
  localStorage.version = '2.8.0';
  window.location.reload(true);
}

import router from './router';

import App from './App';
import './style';

Vue.use(VueCookie);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
