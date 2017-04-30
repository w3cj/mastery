import Vue from 'vue';
import Materials from 'vue-materials';

import 'material-design-icons-iconfont/dist/material-design-icons.css';

import 'materialize-themes/dist/css/materialize-indigo-pink.css'

/* eslint-disable */
window.$ = window.jQuery = require('materialize-css/node_modules/jquery/dist/jquery');
require('materialize-css/dist/js/materialize');
/* eslint-enable */

Vue.use(Materials);
