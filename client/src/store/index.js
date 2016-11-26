import Vue from 'vue'
import Vuex from 'vuex'

import auth from './modules/auth';
import cohort from './modules/cohort';

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    auth,
    cohort
  },
  strict: debug
})
