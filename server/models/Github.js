class Github {
  constructor(db) {
    this.users = db.get('githubs');
    this.users.index('id');
  }
  insert(user) {
    return this.users.insert(user);
  }
  find(login) {
    return this.users.findOne({
      login
    });
  }
}

module.exports = Github;
