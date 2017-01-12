# Galvanize Mastery

A tool for self assessed mastery tracking of a standards based curriculum.

### Features

* [x] View assigned/scored standards
* [x] Filter standards by score
* [ ] Sort and filter standards by day (daily plan!), week, quarter, subject, exercise and a custom set
* [x] View and check success criteria
	* [x] Student can check success criteria as completed (self assessment)
	* [ ] Instructor can approve/deny checked success criteria
	* [ ] All approved success criteria on a standard is automatic 3
* [ ] Students can add "Evidence of Success" to standards and success criteria
	* [ ] Write a short answer
	* [ ] A link to a code sample or write up
	* [ ] An audio recording
	* [ ] A screen recording/video
* [ ] Students and instructors can comment on attached evidences

### Getting Started

#### Server

* Node.js/Express
* Mongo

```sh
cd server && yarn # Install dependencies with yarn
cp .env.sample .env # Update with learn auth token and github client id/secret
npm run dev # Start nodemon
```

#### Client

* Vue.js/Vuex
* Webpack
* [Vue Materials](http://johnleider.com/vue-materials-docs/)

```sh
cd client && yarn # Install dependencies with yarn
npm run dev # Start the webpack dev server
```

#### EZ

After both the client and server are setup, from the root folder run:

`npm start`

 to start both the client and server.
