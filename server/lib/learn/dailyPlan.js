const fs = require('fs');
const marked = require('marked');
const cheerio = require('cheerio')

const {learnURL} = require('../constants');
const {fetchJSON, getAuthHeader} = require('../fetchHelpers');

const knex = require('knex');
// const db = knex({
//   client: 'pg',
//   connection: 'postgres://localhost/learn_dev'
// });

function DailyPlans() {
  return db('daily_plans');
}

function extractLinksFromDB(cohort_id) {
  DailyPlans().where({
    cohort_id
  }).then(getLinks);
}

// extractLinksFromDB(89);

function extractLinksFromDailyPlans(cohort_id) {
  fetchJSON(`${learnURL}api/v1/cohorts/${cohort_id}/daily_plans/`, getAuthHeader())
    .then(result => {
      const links = {};
      const renderer = new marked.Renderer();
      result.data.forEach(week => {
        if(!week) return console.log('🐴')
        const weekNum = week[0];
        console.log('weekNum', weekNum);
        const plans = week[1];
        plans.forEach(plan => {
          const html = marked(plan.description, { renderer: renderer });
          console.log(html);
          const $ = cheerio.load(`<div>${html}</div>`);
          $('a').each(function() {
            const $this = $(this);
            const href = $this.attr('href');
            const text = $this.text();
            links[href] = links[href] || {href, weeks: {}, text: {}, tags: {} };
            const link = links[href];
            link.weeks[weekNum] = true;
            text ? link.text[text] = true : '🚨';
            let tag = $($this.prev('h2')[0]).text();
            link.tags[tag] = true;
            // let tag = $this.prev('h4').text();
            // tag ? link.tags[tag] = true  : '🔖';
            // tag = $this.prev('h3').text();
            // tag ? link.tags[tag] = true  : '🔖';
            // tag = $this.prev('h2').text();
            // tag ? link.tags[tag] = true  : '🔖';
          });
        })
      });
      fs.writeFile('links.json', JSON.stringify(links, null, '\t'), function(err) {
        // console.log(links);
        process.exit();
      })
      // getLinks(result.data.reduce((plans, week) => plans.concat(week[1]), []))
    });
}

function getLinks(daily_plans) {
  return daily_plans.map(plan => {
    return plan.description.match(/\[(.*)\]\((.*)\)/gi);
  });
}

extractLinksFromDailyPlans(89);
