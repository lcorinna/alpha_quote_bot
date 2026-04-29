const PQueue = require('p-queue').default;
const gifQueue = new PQueue({ concurrency: 1 });

module.exports = gifQueue;
