const GitHubApi = require("github");

require('dotenv').config();

const github = new GitHubApi({
  debug: false
});

github.authenticate({
  type: "oauth",
  token: process.env.GITHUB_PULL_REQUEST_TOKEN
});

async function getAllPullRequests(repo) {
  let allPulls = [];
  let page = 1;
  let morePagesAvailable = true;
  while (morePagesAvailable) {
    const pulls = await github.pullRequests.getAll({
      owner: 'gSchool',
      repo,
      per_page: 100,
      page,
      state: 'all'
    });
    allPulls = allPulls.concat(pulls);
    if (pulls[0] && pulls[0].number >= 100) {
      morePagesAvailable = true;
      page++;
    } else {
      morePagesAvailable = false;
    }
  }
  return allPulls.reduce((all, pull) => {
    const newPull = {
      id: pull.id,
      state: pull.state,
      github_username: pull.user.login,
      github_id: pull.user.id,
      created_at: pull.created_at,
      updated_at: pull.updated_at,
      html_url: pull.head.repo ? pull.head.repo.html_url : '',
      pull_url: pull.html_url
    };

    if(all[pull.user.id]) {
      if(all[pull.user.id].constructor != Array) {
        const firstPull = all[pull.user.id];
        all[pull.user.id] = [];
        all[pull.user.id].push(firstPull);
      }
      all[pull.user.id].push(newPull);
    } else {
      all[pull.user.id] = newPull;
    }

    return all;
  }, {});
}

module.exports = {
  getAllPullRequests
}
