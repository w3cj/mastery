import Vue from 'vue';
import VueCookie from 'vue-cookie';
import { sync } from 'vuex-router-sync';

/* eslint-disable */
window.d3 = require('d3/d3.js');
/* eslint-enable */

if(localStorage.version != '1.20.0') {
  localStorage.version = '1.20.0';
  window.location.reload(true);
}

import router from './router';
import store from './store';

sync(store, router);

import App from './App';
import './style';

Vue.use(VueCookie);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})
