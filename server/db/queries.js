const db = require('./connection');

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
  }
}
