#! /usr/bin/env node

// monitor.js

'use strict';

var moment = require('moment');

var nats = require('nats').connect();

nats.on('error', function (err) {
    console.log(err);
    setTimeout(function () {
        process.exit(1);
    }, 1000);
});

nats.subscribe('>', function (msg, reply, subject) {
    var msgType = subject.startsWith('_INBOX') ? 'res' : 'req';
    console.log(timestamp(), '[' + msgType + ']:', msg);
});

function timestamp() {
    return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
}
