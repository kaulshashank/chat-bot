'use strict';
const witToken = 'MM5U3RJ2NZ7EB3Q6WLZTIKTNFSNWAQ55';
const slackToken = 'xoxb-300848273377-rh83wyvM7makGiPDHw06QWmN';
const slackLogLevel = 'debug';

const service = require('../server/service');
const http = require('http');
const slackClient = require('../server/slackClient');
const witClient = require('../server/witClient')(witToken);

const server = http.createServer(service);

const registry = service.get('serviceRegistry');
const rtm = slackClient.init(slackToken, slackLogLevel, witClient, registry);

// Start the connecting process
rtm.start();

server.listen(3000);

server.on('listening', function() {
  console.log(`Slackbot is listening on ${server.address().port} in ${service.get('env')} mode.`)
});
