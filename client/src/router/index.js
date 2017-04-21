import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

import Home from '../components/Home';
import Login from '../components/auth/Login';
import Logout from '../components/auth/Logout';
import AuthCallback from '../components/auth/Callback';
import Standards from '../components/instructor/Standards';
import StandardsSkillTree from '../components/SkillTree/StandardsSkillTree';
import StandardCollections from '../components/StandardCollections';
import StandardsCollection from '../components/StandardsCollection';
import Dashboard from '../components/Dashboard';

import Auth from '../lib/Auth';

function requireAuth (to, from, next) {
  if (!Auth.isLoggedIn()) {
    next({
      path: '/auth/login'
    })
  } else {
    next()
  }
}

const router = new VueRouter({
  mode: 'hash',
  base: __dirname,
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/dashboard/:cohort_id?', name: 'dashboard', component: Dashboard, beforeEnter: requireAuth },
    { path: '/dashboard/:cohort_id/student/:student_id', name: 'student-dashboard', component: Dashboard, beforeEnter: requireAuth },
    { path: '/cohort/:cohort_id/standards', name: 'standards', component: Standards, beforeEnter: requireAuth },
    { path: '/cohort/:cohort_id/standards/skill-tree', name: 'standards-skill-tree', component: StandardsSkillTree, beforeEnter: requireAuth },
    { path: '/cohort/:cohort_id/standards/skill-tree/student/:student_id', name: 'standards-skill-tree-student', component: StandardsSkillTree, beforeEnter: requireAuth },
    { path: '/cohort/:cohort_id/standards/collections', name: 'standard-collections', component: StandardCollections, beforeEnter: requireAuth },
    { path: '/cohort/:cohort_id/standards/collections/:collection_name', name: 'standards-collection', component: StandardsCollection, beforeEnter: requireAuth },
    { path: '/cohort/:cohort_id/standards/collections/:collection_name/student/:student_id', name: 'standards-collection-student', component: StandardsCollection, beforeEnter: requireAuth },
    { path: '/auth/login', name: 'login', component: Login },
    { path: '/auth/callback', name: 'callback', component: AuthCallback },
    { path: '/auth/callback/error/:error', name: 'callbackError', component: AuthCallback },
    { path: '/auth/logout', name: 'logout', component: Logout },
    { path: '*',
      beforeEnter (to, from, next) {
        next('/')
      },
    }
  ]
})

export default router;
