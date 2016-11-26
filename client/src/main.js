import Vue from 'vue';
import VueCookie from 'vue-cookie';
import { sync } from 'vuex-router-sync';

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
