class Student {
  constructor(db) {
    this.students = db.get('students');
    this.students.index('id');
    this.students.index('github_id');
  }
  find(github_id) {
    return this.students.findOne({
        github_id
      });
  }
  findByIds(ids) {
    return this.students.find({
        github_id: {
          $in: ids
        }
      });
  }
  findById(id) {
    return this.students.findOne({
        id: Number(id)
      });
  }
  upsert(array) {
    return Promise.all(array.map(student => {
      return this.students
        .findOneAndUpdate({ id: student.id }, student, {upsert: true});
    }));
  }
}

module.exports = Student;
