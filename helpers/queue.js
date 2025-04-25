const PQueue = require('p-queue').default;
const gifQueue = new PQueue({ concurrency: 2 }); // или больше, если уверенно работает

module.exports = gifQueue;
