#!/usr/bin/env node

'use strict';

var http = require('follow-redirects').http;
var through = require('through');
var argv = require('minimist')(
  process.argv.slice(2),
  {
    alias: {
      'host': 'h',
      'port': 'p',
      'target-host': 's',
      'target-port': 'r'
    }
  }
);
var log = require('npmlog');

log.info(
  'init',
  'Starting server proxying %s:%s, listening on %s:%s',
  argv['target-host'],
  argv['target-port'],
  argv.host,
  argv.port
);

http.createServer(function proxySite(clientRequest, clientResponse) {
  var departureProcessor = through(function write(requestData) {
    this.queue(requestData);
  });

  var proxy = http.request({
      hostname: argv['target-host'],
      port: argv['target-port'],
      path: clientRequest.url,
      method: 'GET'
    },
    function modifyResponse(serverResponse) {
      var headers = serverResponse.headers;
      var load = serverResponse.client._httpMessage;

      log.http(load.method, load.path);

      var arrivalProcessor = through(function write(responseData) {
        if (type && type.indexOf('image') < 0) {
          this.queue(
            new Buffer(responseData.toString()
              .replace(
                new RegExp(argv['target-host'], 'g'),
                argv.host + ':' + argv.port
              )
              .replace(
                new RegExp(argv['target-host'] + ':' + argv['target-port'], 'g'),
                argv.host + ':' + argv.port
              )
            )
          );
        } else {
          this.queue(responseData);
        }
      });

      for (var key in headers) {
        if (key) {
          clientResponse.setHeader(key, headers[key]);
        }
      }

      serverResponse.pipe(arrivalProcessor);
      arrivalProcessor.pipe(clientResponse);
    });

  clientRequest.pipe(departureProcessor, {end: true});
  departureProcessor.pipe(proxy, {end: true});
}).listen(argv.port);
