import API from '../../lib/API';

import * as actionTypes from '../action-types';
import * as mutationTypes from '../mutation-types';

// initial state
const state = {
  defaultCohort: localStorage.defaultCohort ? localStorage.defaultCohort : null,
  cohort: {
    subjects: []
  },
  evidences: {}
}

// getters
const getters = {
  cohort: state => state.cohort,
  defaultCohort: state => state.defaultCohort,
  evidences: state => state.evidences
}

// actions
const actions = {
  [actionTypes.GET_COHORT] ({ commit, state }) {
    let promise = null;
    if(!state.defaultCohort) {
      promise = API.getCohorts()
                  .then(cohorts => {
                    const defaultCohort = cohorts[0].cohort_id;
                    localStorage.defaultCohort = defaultCohort;
                    commit(mutationTypes.SET_DEFAULT_COHORT, { defaultCohort });
                    return defaultCohort;
                  });
    } else {
      promise = Promise.resolve(state.defaultCohort);
    }

    promise.then(defaultCohort => {
      return API.getCohort(defaultCohort);
    }).then(cohort => {
      commit(mutationTypes.RECEIVE_COHORT, { cohort })
    })
  },
  [actionTypes.GET_EVIDENCES] ({ commit }) {
    API.getEvidences()
      .then(evidences => {
        commit(mutationTypes.RECEIVE_EVIDENCES, evidences);
      });
  },
  [actionTypes.CHECK_SUCCESS_CRITERIA] ({ commit, state }, success_criteria) {
    commit(mutationTypes.CHECKING_SUCCESS_CRITERIA, success_criteria._id);
    const newValue = !state.evidences[success_criteria._id].checked;
    API.checkSuccessCriteria(state.cohort.cohort_id, success_criteria._id, newValue)
      .then((result) => {
        commit(mutationTypes.SUCCESS_CRITERIA_CHECKED, { newValue, id: success_criteria._id });
      });
  },
  [actionTypes.ASSIGN_STANDARD] ({ commit, state }, standard) {
    commit(mutationTypes.ASSIGNING_STANDARD, standard.id);
    API.assignStandard(state.cohort.cohort_id, standard.id)
      .then(() => {
        commit(mutationTypes.ASSIGNED_STANDARD, standard.id);
      });
  }
}

// mutations
const mutations = {
  [mutationTypes.RECEIVE_COHORT] (state, { cohort }) {
    state.cohort = cohort;
  },
  [mutationTypes.SET_DEFAULT_COHORT] (state, { defaultCohort }) {
    state.defaultCohort = defaultCohort;
  },
  [mutationTypes.RECEIVE_EVIDENCES] (state, evidences) {
    state.evidences = evidences;
  },
  [mutationTypes.CHECKING_SUCCESS_CRITERIA] (state, id) {
    state.evidences[id] = state.evidences[id] || {};
    state.evidences[id].checking = true;
  },
  [mutationTypes.SUCCESS_CRITERIA_CHECKED] (state, {newValue, id}) {
    state.evidences[id].checking = false;
    state.evidences[id].checked = newValue;
  },
  [mutationTypes.ASSIGNING_STANDARD] (state, id) {
    state.cohort.standards[id].assigning = true;
  },
  [mutationTypes.ASSIGNED_STANDARD] (state, id) {
    state.cohort.standards[id].assigned = true;
    state.cohort.standards[id].assigning = false;
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
//
// ,
// [actionTypes.TAG_STANDARD_QUARTER] ({ commit, state }, {id, quarter}) {
//   commit(mutationTypes.ADDING_STANDARD_QUARTER, id);
//   API.addStandardTag(state.cohort.cohort_id, id, 'quarters', quarter)
//     .then(() => {
//       commit(mutationTypes.ADDED_STANDARD_QUARTER, {id, quarter});
//     });
// },
// [actionTypes.REMOVE_TAG_STANDARD_QUARTER] ({ commit, state }, {id, quarter}) {
//   commit(mutationTypes.REMOVING_STANDARD_QUARTER, id);
//   API.removeStandardTag(state.cohort.cohort_id, id, 'quarters', quarter)
//     .then(() => {
//       commit(mutationTypes.REMOVED_STANDARD_QUARTER, {id, quarter});
//     });
// },
// [actionTypes.TAG_STANDARD_WEEK] ({ commit, state }, {id, week}) {
//   commit(mutationTypes.ADDING_STANDARD_WEEK, id);
//   API.addStandardTag(state.cohort.cohort_id, id, 'weeks', week)
//     .then(() => {
//       commit(mutationTypes.ADDED_STANDARD_WEEK, {id, week});
//     });
// },
// [actionTypes.REMOVE_TAG_STANDARD_WEEK] ({ commit, state }, {id, week}) {
//   commit(mutationTypes.REMOVING_STANDARD_WEEK, id);
//   API.removeStandardTag(state.cohort.cohort_id, id, 'weeks', week)
//     .then(() => {
//       commit(mutationTypes.REMOVED_STANDARD_WEEK, {id, week});
//     });
// }

// ,
// [mutationTypes.ADDING_STANDARD_QUARTER] (state, id) {
//   state.cohort.standards[id].addingQuarter = true;
// },
// [mutationTypes.ADDED_STANDARD_QUARTER] (state, {id, quarter}) {
//   state.cohort.standards[id].addingQuarter = false;
//   state.cohort.standards[id].tags.quarters.push(quarter);
// },
// [mutationTypes.REMOVING_STANDARD_QUARTER] (state, id) {
//   state.cohort.standards[id].removingQuarter = true;
// },
// [mutationTypes.REMOVED_STANDARD_QUARTER] (state, {id, quarter}) {
//   state.cohort.standards[id].removingQuarter = false;
//   const index = state.cohort.standards[id].tags.quarters.indexOf(quarter);
//   state.cohort.standards[id].tags.quarters.splice(index, 1);
// },
// [mutationTypes.ADDING_STANDARD_WEEK] (state, id) {
//   state.cohort.standards[id].addingWeek = true;
// },
// [mutationTypes.ADDED_STANDARD_WEEK] (state, {id, week}) {
//   state.cohort.standards[id].addingWeek = false;
//   state.cohort.standards[id].tags.weeks.push(week);
// },
// [mutationTypes.REMOVING_STANDARD_WEEK] (state, id) {
//   state.cohort.standards[id].removingWeek = true;
// },
// [mutationTypes.REMOVED_STANDARD_WEEK] (state, {id, week}) {
//   state.cohort.standards[id].removingWeek = false;
//   const index = state.cohort.standards[id].tags.weeks.indexOf(week);
//   state.cohort.standards[id].tags.weeks.splice(index, 1);
// }
