class Repo {
  constructor(db) {
    this.repos = db.get('repos');
    this.repos.index('cohort_id');
  }
  getAll(cohort_id) {
    return this.repos.find({
      cohort_id
    });
  }
  insert(cohort_id, name) {
    const repo = {
      cohort_id,
      name
    };

    return this.repos.update(repo, repo, {
      upsert: true
    });
  }
}

module.exports = Repo;
