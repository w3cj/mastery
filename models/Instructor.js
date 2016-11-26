class Instructor {
  constructor(db) {
    this.instructors = db.get('instructors');
    this.instructors.index('id');
    this.instructors.index('github_id');
  }
  find(github_id) {
    return this.instructors.findOne({
        github_id
      });
  }
  findByIds(ids) {
    return this.instructors.find({
        github_id: {
          $in: ids
        }
      });
  }
  upsert(array) {
    return Promise.all(array.map(instructor => {
      return this.instructors
        .findOneAndUpdate({ id: instructor.id }, instructor, {upsert: true});
    }));
  }
}

module.exports = Instructor;
