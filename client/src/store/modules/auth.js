
import Auth from '../../lib/Auth';

import * as actionTypes from '../action-types';
import * as mutationTypes from '../mutation-types';

// initial state
const state = {
  currentUser: null
}

// getters
const getters = {
  currentUser: state => state.currentUser
}

// actions
const actions = {
  [actionTypes.GET_CURRENT_USER] ({ commit }) {
    const currentUser = Auth.getCurrentUser();
    commit(mutationTypes.SET_CURRENT_USER, { currentUser });
  }
}

// mutations
const mutations = {
  [mutationTypes.SET_CURRENT_USER] (state, { currentUser }) {
    state.currentUser = currentUser;
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
