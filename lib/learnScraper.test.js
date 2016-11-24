const test = require('tape');
const {xtest, hasProperty} = require('../test/helpers');

const {getLearnUser, getStudentInfo, getInstructorInfo} = require('./learnScraper');

const cohort_id = 89;
const sampleInstructor = {
  full_name: 'CJ Reynolds',
  github_id: 14241866,
  id: 729
};

test('can get learn user with github_id', (t) => {
  getLearnUser(sampleInstructor.id)
    .then(user => {
      t.deepEqual(user, sampleInstructor, 'Invalid learn user.');
      t.end();
    });
});

test('can get instructors for cohort', (t) => {
  getInstructorInfo(cohort_id)
    .then(instructors => {
      const foundInstructors = instructors.filter(instructor => {
        return instructor.id == sampleInstructor.id;
      });
      t.equals(foundInstructors.length, 1, 'Did not find sample instructor in array.');
      t.end();
    });
});

test('can get students for a cohort', (t) => {
  getStudentInfo(cohort_id)
    .then(students => {      
      Object.keys(students).forEach(full_name => {
        hasProperty(t, students[full_name], 'full_name');
        hasProperty(t, students[full_name], 'github_username');
      });
      t.end();
    }).catch(error => {
      t.fail(error.message);
      t.end();
    });
});
