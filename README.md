# Secret Santa - Front-End
Front-end code for [secret-santa.io](https://secret-santa.io).

[![Build Status](https://travis-ci.org/Franky47/secret-santa-app.svg?branch=master)](https://travis-ci.org/Franky47/secret-santa-app)
[![dependencies Status](https://david-dm.org/franky47/secret-santa-app/status.svg)](https://david-dm.org/franky47/secret-santa-app)
[![devDependencies Status](https://david-dm.org/franky47/secret-santa-app/dev-status.svg)](https://david-dm.org/franky47/secret-santa-app?type=dev)
[![License](https://img.shields.io/github/license/Franky47/secret-santa-app.svg?maxAge=2592000)](LICENSE)

## Santa as a Service

This web application aims to bring a modern touch to the random process of assinging gifts for
a "Secret Santa" party, where a group of friends choose to exchange gifts to one
another without knowing from whom they are receiving, and then guessing.

It presents itself as a SPA, where participants can sign in using either their Facebook account,
or a more traditional email/password system, and say if they are participating or not.
The date of the final assignation is indicated by the form of a giant countdown.
When the time comes, the engine runs and assigns givers with receivers.
Upon next visit of the page, each player will see who they have been assigned to give a gift to,
and will be able to secretly chat with them to get hints at what good gifts might be.
The secret chat will be anonymous so that the receiver does not know the identity of the giver.

## Install

1. Install requirements
```
$ npm install
```

2. Run with Chrome Remote Debugging
```
$ npm start
```

## Tech Stack

This project uses [Firebase](https://firebase.google.com) as a back-end for authentication (through email/password or Facebook)
and real-time database (for storing user & game infos). Firebase is the single source of truth that
the front-end state and the back-end engine consume and update.

The front-end code runs on [Vue.js](https://vuejs.org/) and its pals (vue-router & vuex).
The look and feel is handled by [Semantic UI](http://semantic-ui.com).
Everything is bundled by webpack and deployed with [Surge](https://surge.sh) for staging and Firebase Hosting for releases.

Testing is done with local Mocha unit tests and BrowserStack cross-device/browser rendering tests
automated by Travis.
