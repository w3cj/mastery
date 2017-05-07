const listEndpoints = require('express-list-endpoints');
const fs = require('fs');
const router = require('../router');

const endpoints = listEndpoints(router);
fs.writeFileSync(`${__dirname}/../public/docs/endpoints.json`, JSON.stringify(endpoints), 'utf-8');

process.exit();
