class User {
  constructor(db) {
    this.users = db.get('users');
    this.users.index('github_id');
  }
  find(github_id) {
    return this.users
      .findOne({
        github_id
      });
  }
  insert(user) {
    return this.users
      .insert(user);
  }
}

module.exports = User;
