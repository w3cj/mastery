const monk = require('monk');

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
    const query = {
      cohort_id
    };

    if(student_id) {
      query.student_id = student_id;
    }
    
    return this.notes.find(query);
  }
  delete(cohort_id, student_id, note_id) {
    return this.notes.remove({
      cohort_id,
      student_id,
      _id: monk.id(note_id)
    });
  }
}

module.exports = Note;
