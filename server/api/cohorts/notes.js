const express = require('express');

const { processRequest, authorize, isInstructor } = require('../../lib/routeHelpers');
const { Note } = require('../../models');

const routes = {
  '/students/:student_id/notes': (req, res, next) => {
    const {cohort_id, student_id} = req.params;
    processRequest(Note.getAll(cohort_id, student_id), res, next);
  },
};

const router = express.Router({mergeParams: true});

Object.keys(routes).forEach(endpoint => router.get(endpoint, authorize, routes[endpoint]));

router.get('/notes', isInstructor, (req, res, next) => {
  const {cohort_id} = req.params;

  processRequest(Note.getAll(cohort_id), res, next);
});

router.get('/notes/unread', isInstructor, (req, res, next) => {
  const {cohort_id} = req.params;

  processRequest(Note.getAllUnread(cohort_id), res, next);
});

router.get('/students/:student_id/notes/unread', authorize, (req, res, next) => {
  const {cohort_id, student_id} = req.params;
  processRequest(Note.getAllUnread(cohort_id, student_id), res, next);
});

router.post('/students/:student_id/notes', authorize, (req, res, next) => {
  const {cohort_id, student_id} = req.params;
  const note = req.body;
  note.cohort_id = cohort_id;
  note.student_id = student_id;
  note.creator_id = req.user.learn_id;
  note.created = new Date();

  processRequest(Note.insert(note), res, next);
});

router.post('/students/:student_id/notes/:note_id/read', authorize, (req, res, next) => {
  const {cohort_id, student_id, note_id} = req.params;
  processRequest(Note.read(cohort_id, student_id, note_id), res, next);
});

router.delete('/students/:student_id/notes/:note_id', authorize, (req, res, next) => {
  const {cohort_id, student_id, note_id} = req.params;
  processRequest(Note.delete(cohort_id, student_id, note_id), res, next);
});

module.exports = router;
