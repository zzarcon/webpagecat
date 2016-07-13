'use strict';
const WebPageTest = require('webpagetest');
const Table = require('cli-table');
const request = require('superagent');
//TODO: logGifs only when cli mode
const logGifs = require('./log-gifs.js');
let wpt;

function run(url) {
  console.log('run', url);

  logGifs();
  
  return new Promise((resolve, reject) => {
    //TODO: specify location
    wpt.runTest(url, (err, data) => {
      if (err || data.statusCode !== 200) return reject(err);

      getStatus(data.data.testId).then(resolve);
    });
  });
}

function getStatus(id, resolver) {
  return new Promise((resolve, reject) => {
    resolver = resolver || resolve;

    wpt.getTestStatus(id, (err, data) => {
      if (err) return reject(err);

      if (data.statusCode !== 200) {
        console.log('status', id, data.statusCode, data.statusText);

        return setTimeout(() => getStatus(id, resolver), 5000);
      }

      getResults(id).then(resolver);
    });
  });
}

function getResults(id) {
  return new Promise((resolve, reject) => {
    wpt.getTestResults(id, (err, data) => {
      if (err) return reject(err);

      resolve(data.data);
    });
  });
}

module.exports = (url, options) => {
  wpt = new WebPageTest('www.webpagetest.org', options.key);

  return new Promise((resolve, reject) => {
    run(url).then((data) => {
      const importantValues = ['SpeedIndex', 'loadTime', 'requests', 'score_cache', 'score_compress', 'titleTime', 'userTime', 'firstPaint', 'fullyLoaded'];
      const firstView = data.average.firstView;
      let stat = {
        summary: data.summary,
        date: new Date().toGMTString()
      };

      stat = importantValues.reduce((prev, current) => {
        prev[current] = firstView[current];

        return prev;
      }, stat);

      resolve(stat);
    });
  });
};