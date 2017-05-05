<template>
  <div>
    <h1 class="center">Repos</h1>
    <v-progress-linear indeterminate v-if="adding"></v-progress-linear>
    <form v-if="!adding" class="form" v-on:submit.prevent="addRepo(repoName)">
      <div class="row">
        <div class="input-field col s12">
             <v-icon prefix>assignment</v-icon>
             <v-text-input v-model="repoName" name="repoName" id="repoName" placeholder="Enter a github repo name"></v-text-input>
         </div>
        <div class="col s12">
          <button
            class="waves-effect waves-light btn right"
            v-bind:class="{
              disabled: !repoName
            }"
            type="submit">Add</button>
        </div>
      </div>
    </form>
    <div class="row">
      <div class="col s12">
        <v-icon>error</v-icon> No Pull
        <br>
        <v-icon>timeline</v-icon> Forked
        <br>
        <v-icon>drafts</v-icon> Open
        <br>
        <v-icon>done</v-icon> Closed
      </div>
      <div class="col s12">
        <v-collapsible expand>
            <li v-for="repo in repos">
                <v-collapsible-header v-on:click="loadRepo(repo)">
                    <v-icon>assignment</v-icon> {{repo.name}}
                </v-collapsible-header>
                <v-collapsible-body>
                    <p><a :href="'https://github.com/gSchool/' + repo.name" target="_blank">https://github.com/gSchool/{{repo.name}}</a></p>
                    <center v-if="repo.loading"><v-progress-circular small active></v-progress-circular></center>
                    <div v-if="repo.loaded" class="repo-pulls">
                      <div class="chip" v-for="pull in repo.pulls" v-on:click="openPull(pull)" v-bind:class="{ 'student-pull': pull.state, 'no-pull': !pull.state }">
                        <img :src="users[pull.user_id].image" :alt="users[pull.user_id].full_name">
                        {{users[pull.user_id].full_name}}
                        <v-icon v-if="pull.forked" class="right">timeline</v-icon>
                        <v-icon v-if="pull.state == 'closed'" class="right">done</v-icon>
                        <v-icon v-if="pull.state == 'open'" class="right">drafts</v-icon>
                        <v-icon v-if="!pull.state" class="right">error</v-icon>
                      </div>
                </v-collapsible-body>
            </li>
        </v-collapsible>
      </div>
    </div>
  </div>
</template>

<script>
import API from '../../lib/API';

export default {
  name: 'repos',
  data() {
    return {
      cohort_id: this.$route.params.cohort_id,
      adding: false,
      repoName: '',
      repos: [],
      users: {}
    }
  },
  mounted() {
    this.load();
  },
  methods: {
    load() {
      API
        .getRepos(this.cohort_id)
        .then(repos => {
          this.repos = repos.map(repo => {
            repo.loaded = false;
            repo.loading = false;
            repo.pulls = {};
            return repo;
          })
        });
    },
    addRepo(name) {
      this.adding = true;
      this.repoName = '';
      API
        .addRepo(this.cohort_id, name)
        .then(() => {
          this.adding = false;
          this.repos.push({
            name,
            loaded: false,
            loading: false,
            pulls: {}
          });
        });
    },
    loadRepo(repo) {
      if(!repo.loading && !repo.loaded) {
        repo.loading = true;
        API
          .getRepo(this.cohort_id, repo.name)
          .then(pulls => {
            const users = {};
            const ids = Object.keys(pulls);
            const allPulls = [];
            ids.map(id => {
              users[id] = users[id] || {
                image: `https://api.adorable.io/avatars/100/${id}.png`,
                full_name: 'Loading...'
              };
              this.loadUser(id);
              if(!pulls[id]) pulls[id] = {};
              pulls[id].user_id = id;
              allPulls.push(pulls[id]);
            });
            repo.pulls = allPulls.sort((a, b) => {
              if(!a.state) return -1;
              if(!b.state) return 1;
              if(a.state == b.state) {
                return 0;
              } else if(a.state == 'open') {
                return -1
              } else {
                return 1;
              }
            });
            repo.loaded = true;
            repo.loading = false;
            this.users = users;
          });
      }
    },
    loadUser(user_id) {
      API
        .getUser(user_id)
        .then(user => {
          this.$set(this.users, user_id, user);
        });
    },
    openPull(pull) {
      if(pull.pull_url) {
        window.open(pull.pull_url, '_blank');
      }
    }
  }
}
</script>
<style>
  .repo-pulls {
    padding: 1em;
  }
  .student-pull {
    cursor: pointer;
  }
  .no-pull {
    cursor: no-drop;
  }

  @media (max-width: 600px) {
    .no-pull, .student-pull {
      display: block !important;
    }
  }
</style>
