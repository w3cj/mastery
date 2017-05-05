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
  getAllUnread(cohort_id, student_id) {
    const query = {
      cohort_id,
      read_date: undefined
    };

    if(student_id) {
      query.student_id = student_id;
    }

    return this.notes.find(query);
  }
  read(cohort_id, student_id, note_id) {
    return this.notes.findOneAndUpdate({
      cohort_id,
      student_id,
      _id: monk.id(note_id)
    }, {
      $set: {
        read: new Date()
      }
    })
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
