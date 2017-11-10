const db = require('./connection');
const moment = require('moment');

module.exports = {
  getUserByEmail(email) {
    return db('users')
      .select('id', 'first_name', 'last_name', 'avatar as image', 'role as admin', 'auth_token', 'github_username', 'github_id')
      .where('email', email)
      .first()
      .then(({id, first_name, last_name, image, admin, auth_token, github_username, github_id}) => {
        return {
          id,
          full_name: `${first_name} ${last_name}`,
          image,
          admin: admin === 1,
          auth_token,
          github_username,
          github_id
        }
      })
  },
  getUser(id) {
    return db('users')
      .select('first_name', 'last_name', 'avatar as image', 'role as admin', 'auth_token', 'github_username', 'github_id')
      .where('id', id)
      .first()
      .then(({first_name, last_name, image, admin, auth_token, github_username, github_id}) => {
        return {
          id,
          full_name: `${first_name} ${last_name}`,
          image,
          admin: admin === 1,
          auth_token,
          github_username,
          github_id
        }
      })
  },
  getUserWithCohorts(id) {
    return Promise.all([
      this.getCohorts(id),
      this.getUser(id)
    ]).then(({0: cohorts, 1: user}) => {
      user.cohorts = cohorts;
      return user;
    })
  },
  getCohorts(id) {
    return Promise.all([
      db('enrollments')
      .where('user_id', id)
      .pluck('cohort_id'),
      db('staffings')
        .where('user_id', id)
        .pluck('cohort_id')
    ]).then(results => {
      return results[0].concat(results[1]);
    });
  },
  getStudents(cohort_id) {
    return db('enrollments')
      .where('cohort_id', cohort_id)
      .pluck('user_id')
      .then(student_ids => {
        return Promise.all(student_ids.map(student_id => this.getUser(student_id)));
      });
  },
  getInstructors(cohort_id) {
    return db('staffings')
      .where('cohort_id', cohort_id)
      .pluck('user_id')
      .then(instructor_ids => {
        return Promise.all(instructor_ids.map(instructor_id => this.getUser(instructor_id)));
      });
  },
  getCohort(cohort_id) {
    return db('cohorts')
      .where('id', cohort_id)
      .first();
  },
  getAllCohorts() {
    return db('cohorts')
      .then(cohorts => {
        return cohorts.map(({id, name, label, start_date, end_date, created_at, updated_at}) => {
          return {
            cohort_id: id,
            name,
            label,
            start_date,
            end_date,
            created_at,
            updated_at
          }
        });
      });
  },
  getUserPerformances(cohort_id, user_id) {
    return db('cohorts')
      .where('id', cohort_id)
      .first()
      .then(cohort => {
        return db('performances')
          .select('curriculum_standards.standard_type', 'performances.standard_id', 'performances.score', 'performances.updated_at')
          .where('performances.user_id', user_id)
          .andWhere('performances.cohort_id', cohort_id)
          .andWhere('curriculum_standards.curriculum_id', cohort.curriculum_id)
          .join('curriculum_standards', 'curriculum_standards.standard_id', 'performances.standard_id')
          .then(performances => {
            return performances.reduce((all, performance) => {
              if(all[performance.standard_id] && +moment(all[performance.standard_id].updated_at) < +moment(performance.updated_at)) {
                all[performance.standard_id] = performance;
              } else if (!all[performance.standard_id]) {
                all[performance.standard_id] = performance;
              }

              if(performance.standard_type === 0) {
                performance.standard_type = 'core';
              } else {
                performance.standard_type = 'elective';
              }

              return all;
            }, {});
          });
      });
  }
}
