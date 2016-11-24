class Instructor {
  constructor(db) {
    this.instructors = db.get('instructors');
    this.instructors.index('id');
    this.instructors.index('github_id');
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
        .findOneAndUpdate({ id: instructor.id }, instructor)
        .then(found => {
          if(!found.full_name) {
            return this.instructors.insert(instructor);
          } else {
            return found;
          }
        });
    }));
  }
}

module.exports = Instructor;
