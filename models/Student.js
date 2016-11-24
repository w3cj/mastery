class Student {
  constructor(db) {
    this.students = db.get('students');
    this.students.index('id');
    this.students.index('github_id');
  }
  findByIds(ids) {
    return this.students.find({
        github_id: {
          $in: ids
        }
      });
  }
  upsert(array) {
    return Promise.all(array.map(student => {
      return this.students
        .findOneAndUpdate({ id: student.id }, student)
        .then(found => {
          if(!found.full_name) {
            return this.students.insert(student);
          } else {
            return found;
          }
        });
    }));
  }
}

module.exports = Student;
