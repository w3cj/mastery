class Instructor {
  constructor(db) {
    this.instructors = db.get('instructors');
    this.instructors.index('id');
    this.instructors.index('github_id');
  }
  find(github_id, properties) {
    return this.instructors.findOne({
        github_id
      }, properties);
  }
  findByIds(ids) {
    return this.instructors.find({
        github_id: {
          $in: ids
        }
      });
  }
  findById(id) {
    return this.instructors.findOne({
        id: Number(id)
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
