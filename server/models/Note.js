class Note {
  constructor(db) {
    this.notes = db.get('notes');
    this.notes.index('cohort_id');
    this.notes.index('student_id');
  }
  insert(note) {
    return this.notes.insert(note);
  }
  getAll(cohort_id, student_id) {
    return this.notes.find({
      cohort_id,
      student_id
    });
  }
}

module.exports = Note;
