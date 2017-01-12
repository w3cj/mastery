import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

import Home from '../components/Home';
import Login from '../components/auth/Login';
import Logout from '../components/auth/Logout';
import AuthCallback from '../components/auth/Callback';
import Cohort from '../components/Cohort';
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
    { path: '/dashboard', name: 'dashboard', component: Dashboard, beforeEnter: requireAuth },
    { path: '/dashboard/student/:student_id', name: 'student-dashboard', component: Dashboard, beforeEnter: requireAuth },
    { path: '/cohort/:id', name: 'cohort', component: Cohort, beforeEnter: requireAuth },
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
