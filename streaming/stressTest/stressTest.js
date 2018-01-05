// // 'use strict';
//
//
//
// const faker = require('faker');
//
// //generateRandomId for all available inventory Items
// let generateRandomId = () => {
//   return Math.floor(Math.random() * (10626948 - 1 + 1)) + 1;
// }
//
// //creates RandomId for artillery
// function getProductId(userContext, events, done) {
//   let productId = generateRandomId();
//
//   userContext.vars.productId = productId;
//
//   return done();
// }
//
// //generateFakeData for artillery load testing to create bundles
// function generateFakeData(userContext, events, done) {
//   let bundleName = faker.commerce.product();
//   let itemIds = [];
//   let productAmount = Math.floor(Math.random() * (11 - 3 + 1)) + 3;
//
//   for (var i = 0; i < productAmount; i++) {
//     itemIds.push(generateRandomId());
//   }
//
//   userContext.vars.bundleName = bundleName;
//   userContext.vars.itemIds = itemIds;
//
//   return done();
// }

const songNum = function (userContext, events, done) {
  userContext.vars.songId = Math.random() > 0.25 ?
    Math.floor(Math.random() * 100) :
    Math.floor(Math.random() * (10000000 - 100)) + 100;
  userContext.vars.songUrl = `/${userContext.vars.songId}/0`;
  // userContext.vars.songId = songId
  // console.log(userContext)

  return done();
};

const isSongComplete = function (context, next) {
  console.log('THIS DOES SOMETINHG', !(context.vars.fileSize === context.vars.nextFragment))
  return next(!(context.vars.fileSize === context.vars.nextFragment));
}
// const logThis = function (context, events, done) {
//   console.log(context.vars)
//
//   return next()
// }

function setNextFragment(requestParams, response, context, ee, next) {
  // console.log(response.headers);
  // context.vars.fileSize = Number(response.headers['content-range'].split('/')[1]);
  let x = response.headers['content-range'].split('-')[1];
  context.vars.nextFragment = Number(x.split('/')[0]);


  // context.vars.nextFragment = Number(response.headers['content-length']);
  console.log(context.vars)
  return next(); // MUST be called for the scenario to continue
}


function logThis(requestParams, response, context, ee, next) {
  // console.log(response.headers);
  context.vars.fileSize = Number(response.headers['content-range'].split('/')[1]);
  context.vars.nextFragment = Number(response.headers['content-length']);
  console.log(context.vars)
  return next(); // MUST be called for the scenario to continue
}


module.exports = {
  songNum,
  isSongComplete,
  logThis,
  setNextFragment
};
