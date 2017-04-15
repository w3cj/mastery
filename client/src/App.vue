<template>
  <div id="app">
    <v-nav>
        <a href="#!" class="brand-logo margin-left" slot="logo">Galvanize Mastery</a>
        <ul class="right">
          <li>
              <a href="#!" class="hide-on-large-only" v-dropdown:v-icon-drop><v-icon>menu</v-icon></a>
          </li>
        </ul>
        <ul class="right hide-on-med-and-down">
          <nav-links v-bind:currentUser="currentUser"></nav-links>
        </ul>
        <v-side-nav id="side2" slot="side-nav"></v-side-nav>
    </v-nav>
    <v-dropdown id="v-icon-drop">
      <nav-links v-bind:currentUser="currentUser"></nav-links>
    </v-dropdown>
    <main class="container">
      <router-view class="view"></router-view>
    </main>
    <v-footer>
        <div class="container" slot="content">
            <div class="row">
                <div class="col l6 s12">
                    <h5 class="white-text">Galvanize Mastery</h5>
                    <p class="grey-text text-lighten-4">A tool for self assessed mastery tracking of a standards based curriculum.</p>
                </div>
                <div class="col l4 offset-l2 s12">
                    <h5 class="white-text">Links</h5>
                    <ul>
                        <li><a class="grey-text text-lighten-3" href="https://github.com/gSchool/mastery" target="_blank">Github</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="container" slot="copyright">Made with ❤️ by CJ</div>
    </v-footer>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as actionTypes from './store/action-types';
import NavLinks from './components/NavLinks';

export default {
  name: 'app',
  components: {
    'nav-links': NavLinks
  },
  data() {
    return {
      currentUser: null
    };
  },
  watch: {
    $route() {
      this.GET_CURRENT_USER();
    }
  },
  computed: mapGetters({
    currentUser: 'currentUser'
  }),
  methods: mapActions([
    actionTypes.GET_CURRENT_USER
  ]),
  created () {
    this.GET_CURRENT_USER();
  }
}
</script>
<style>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main {
  flex: 1;
}
.container {
  margin-top: 2%;
  margin-left: 10%;
  margin-right: 10%;
  margin-bottom: 2%;
}
.center {
  display: flex;
  align-items: center;
  flex-direction: column;
}

@media (min-width: 993px) {
  .margin-left {
    margin-left: 10%;
  }
}

</style>
