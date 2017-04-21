<template>
  <div>
    <div class="row">
      <div class="col s4">

      </div>
      <div class="col s8 row">
        <div class="col s6">
          <button
            v-if="notes.filter(n => !n.deleted).length > 0"
            v-on:click="showNotes = !showNotes"
            class="waves-effect waves-light btn blue">
              <v-icon prefix class="left">comment</v-icon>
              {{showNotes ? 'Hide' : 'Show'}} Notes
          </button>
        </div>
        <div class="col s6">
          <button
          v-on:click="showForm = !showForm"
          class="waves-effect waves-light btn">
          <v-icon prefix class="left">note</v-icon>
          {{showForm ? 'Done Adding' : 'Add a Note'}}
        </button>
        </div>
      </div>
    </div>
    <v-progress-linear indeterminate v-if="adding"></v-progress-linear>
    <form v-if="showForm && !adding" class="form" v-on:submit.prevent="addNote()">
      <div class="row">
        <div class="input-field col s12">
             <v-icon prefix>title</v-icon>
             <v-text-input v-model="title" name="title" id="title"
              placeholder="Enter a title." type="text"></v-text-input>
         </div>
        <div class="input-field col s12">
             <v-icon prefix>{{selectedNoteType.id}}</v-icon>
             <v-text-area v-model="note" name="note" id="note"
              v-bind:placeholder="'Enter a ' + selectedNoteType.text +  '.'" type="text"></v-text-area>
         </div>
         <div class="input-field col s7">
           <select style="margin-left:2.5em;" class="browser-default" v-model="selectedNoteType">
             <option v-for="type in noteTypes" v-bind:value="type">{{type.text}}</option>
            </select>
        </div>
        <div class="col s5">
          <button
            style="margin-left:2.5em;"
            class="waves-effect waves-light btn"
            v-bind:class="{
              disabled: !note || !title
            }"
            type="submit">Add</button>
        </div>
      </div>
    </form>
    <v-collection v-if="showNotes && notes.length > 0">
      <v-collection-avatar v-for="note in notes" v-bind:src="users[note.creator_id].image" v-if="!note.deleted">
          <span class="title">{{note.title}}</span>
          <p v-if="note.type != 'link'">{{note.content}}</p>
          <p v-if="note.type == 'link'"><a v-bind:href="note.content" target="_blank">{{note.title}}</a></p>
          <blockquote>
            Added by {{users[note.creator_id].full_name}} {{note.created | moment}}
            <a
              v-on:click="showDeleteModal(note)"
              v-if="!note.deleting && (user.isInstructor || note.creator_id == student_id)"
              class="btn-floating btn waves-effect waves-light red">
                <i class="material-icons">delete</i>
            </a>
          </blockquote>
          <v-progress-linear v-if="note.deleting" indeterminate></v-progress-linear>
          <a
            v-bind:href="note.type == 'link' ? note.content : '#' + $route.fullPath"
            v-bind:target="note.type == 'link' ? '_blank' : ''"
            slot="secondary">
            <v-icon>{{note.type}}</v-icon>
          </a>
      </v-collection-avatar>
    </v-collection>
    <div v-bind:id="'deleteModal' + success_criteria_id" class="modal">
      <div class="modal-content">
        <h4>Delete Note</h4>
        <p v-if="selectedNote">Are you sure you want to delete the note <strong>{{selectedNote.title}}</strong>?</p>
      </div>
     <div class="modal-footer">
       <a class="modal-action modal-close waves-effect waves-green btn grey">No</a>
       <a v-on:click="confirmDelete" class="modal-action modal-close waves-effect waves-green btn red">Yes</a>
     </div>
    </div>
  </div>
</template>

<script>
import Auth from '../lib/Auth';
import API from '../lib/API';
import moment from 'moment';

export default {
  name: 'success-criteria-notes',
  props: ['student_id', 'notes', 'standard_id', 'success_criteria_id', 'cohort_id'],
  data() {
    const noteTypes = [{
      id: 'comment',
      text: 'Comment'
    }, {
      id: 'description',
      text: 'Description or Vocabulary Definition'
    }, {
      id: 'link',
      text: 'Link to Repo or Code Sample'
    }];

    return {
      user: Auth.getCurrentUser(),
      selectedNote: null,
      users: {},
      showNotes: false,
      showForm: false,
      adding: false,
      title: '',
      note: '',
      noteTypes,
      selectedNoteType: noteTypes[0]
    }
  },
  filters: {
    moment(date) {
      return moment(date).fromNow();
    }
  },
  watch: {
    'notes'() {
      this.load();
    }
  },
  mounted() {
    this.load();
  },
  methods: {
    load() {
      $('.modal').modal();
      const users = this.notes.reduce((users, note) => {
        users[note.creator_id] = users[note.creator_id] || {
          image: `https://api.adorable.io/avatars/100/${note.creator_id}.png`,
          full_name: 'Loading...'
        };
        this.loadUser(note.creator_id);

        return users;
      }, {});

      this.users = users;
    },
    addNote() {
      this.adding = true;
      const newNote = {
        title: this.title,
        standard_id: this.standard_id,
        success_criteria_id: this.success_criteria_id,
        content: this.note,
        type: this.selectedNoteType.id
      };

      API
        .addNote(this.cohort_id, this.student_id, newNote)
        .then(result => {
          this.note = '';
          this.title = '';
          this.notes.push(result);
          this.adding = false;
          this.showForm = false;

          if(!this.users[result.creator_id]) {
            this.$set(this.users, result.creator_id, {
              image: `https://api.adorable.io/avatars/100/${result.creator_id}.png`,
              full_name: 'Loading...'
            });
            this.loadUser(result.creator_id);
          }
        });
    },
    loadUser(user_id) {
      API
        .getUser(user_id)
        .then(user => {
          this.$set(this.users, user_id, user);
        });
    },
    showDeleteModal(note) {
      this.selectedNote = note;
      $('#deleteModal' + this.success_criteria_id).modal('open');
    },
    confirmDelete() {
      this.$set(this.selectedNote, 'deleting', true);
      API
        .deleteNote(this.cohort_id, this.student_id, this.selectedNote._id)
        .then((result) => {
          this.$set(this.selectedNote, 'deleted', true);
        });
    }
  }
}
</script>
