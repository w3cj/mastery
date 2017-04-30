# Galvanize Mastery

A tool for self assessed mastery tracking of a standards based curriculum.

### Features

* [x] View assigned/scored standards
* [x] Filter standards by score
* [x] Group standards by day (daily plan!), week, quarter, subject, exercise and a custom set
* [x] Add resources (articles, exercises, slides, videos etc.) to a standard
* [x] View and check success criteria
	* [x] Student can check success criteria as completed (self assessment)
	* [x] Instructor can approve/deny checked success criteria
	* [ ] All approved success criteria on a standard is automatic 3
* [x] Students and instructors can add notes to success criteria
	* [x] Write a short answer
	* [x] A link to a code sample or write up
* [ ] Students and instructors can add notes to standards

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

* Vue.js
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
