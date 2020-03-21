'use strict';

const express = require('express');
const service = express();
const ServiceRegistry = require('./serviceRegistry');
const registry = new ServiceRegistry();

service.set('serviceRegistry', registry);

service.put('/service/:intent/:port', (req, res, next) => {
  const serviceIntent = req.params.intent;
  const servicePort = req.params.port;

  const serviceIp = req.connection.remoteAddress.includes('::')
  ?  `[${req.connection.remoteAddress}]` : req.connection.remoteAddress;

  registry.add(serviceIntent, serviceIp, servicePort);

  res.json({result: `${serviceIntent} at ${serviceIp}:${servicePort}`});
});

module.exports = service;
