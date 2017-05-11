import Auth from '../lib/Auth';
import API from '../lib/API';
import {setCohortBadge} from '../lib/utils';
import router from '../router';

const data = {
  cohort_id: -1,
  student_id: -1,
  currentUser: null,
  cohort: {},
  cohorts: {},
  cohortInfo: {},
  cohort_array: [],
  students: [],
  student: {},
  evidences: {},
  performances: {},
  resources: {}
};

const methods = {
  setCurrentUser() {
    data.currentUser = Auth.getCurrentUser();
  },
  setCohort(cohort_id) {
    if(data.cohort_id == cohort_id) return Promise.resolve();

    data.cohort_id = cohort_id;
    return Promise.all([
      API.getCohort(cohort_id),
      API.getStudentImages(cohort_id),
      API.getAllResources(cohort_id)
    ]).then(results => {
      const cohort = results[0];
      const students = results[1];
      const resources = results[2];

      data.cohort = cohort;
      data.cohortInfo = cohort;
      data.students = students;

      cohort.subjects.forEach(subject => {
        subject.standards.forEach(standard => {
          if(!resources[standard.id]) {
            resources[standard.id] = [];
          }
        });
      })

      data.resources = resources;
    });
  },
  setCohorts(student_id) {
    let getCohorts = null;

    if(data.currentUser.isInstructor && !student_id) {
      getCohorts = API.getAllCohorts();
    } else {
      getCohorts = API.getCohorts(student_id);
    }

    return getCohorts
      .then(cohorts => {
        data.cohort_array = cohorts;
        data.cohorts = cohorts.reduce((byId, cohort) => {
          setCohortBadge(cohort);

          byId[cohort.cohort_id] = cohort;
          return byId;
        }, {});
      });
  },
  setStudent(cohort_id, student_id) {
    data.student_id = student_id;

    return Promise.all([
      methods.setCohort(cohort_id),
      methods.setCohorts(student_id),
      API.getEvidences(data.student_id)
        .then(evidences => {
          data.evidences = evidences;
        }),
      API.getStudent(cohort_id, data.student_id)
        .then(student => {
          student = student ? student : data.currentUser;
          data.student = student;
          data.student_id = student.id ? student.id : student.learn_id;
        }),
      API
        .getStudentPerformances(cohort_id, data.student_id)
        .then(performances => {
          data.performances = performances;
        })
    ]).catch((error) => {
      console.log(error);
      router.go('/');
    });
  }
}

export default {
  data,
  methods
}
