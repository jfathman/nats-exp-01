#! /usr/bin/env node

// app.js

'use strict';

var async = require('async');
var levelup = require('levelup');
var moment = require('moment');
var nats = require('nats');

var db = null;
var dbname = './mydb';

var msgId = 0;

async.series([
    function (done) {
        nats = nats.connect();
        nats.on('error', function (err) {
            console.log(timestamp(), err);
            setTimeout(function () {
                process.exit(1);
            }, 100);
        });
        done (null);
    },
    function (done) {
        db = levelup(dbname, {}, function (err) {
            if (err) return done(err);
            console.log(timestamp(), 'db.open:', dbname);
            done(null);
        });
    },
    function (done) {
        nats.subscribe('db', function (msg, reply) {
            var req = JSON.parse(msg);
            switch (req.cmd) {
                case 'put':
                    db.put(req.key, req.val, function (err) {
                        var res = {
                            'subject': req.subject,
                            'id':      req.id,
                            'err':     err ? err.toString() : null
                        };
                        nats.publish(reply, JSON.stringify(res));
                    });
                    break;
                case 'get':
                    db.get(req.key, function (err, val) {
                        var res = {
                            'subject': req.subject,
                            'id':      req.id,
                            'val':     val ? val : null,
                            'err':     err ? err.toString() : null
                        };
                        nats.publish(reply, JSON.stringify(res));
                    });
                    break;
                case 'del':
                    db.del(req.key, function (err) {
                        var res = {
                            'subject': req.subject,
                            'id':      req.id,
                            'err':     err ? err.toString() : null
                        };
                        nats.publish(reply, JSON.stringify(res));
                    });
                    break;
                default:
                    var res = {'err': 'invalid request'};
                    nats.publish(reply, JSON.stringify(res));
                    break;
            }
        });
        done(null);
    },
    function (done) {
        var msgObject = {'subject': 'db', 'id': msgId++, 'cmd': 'put', 'key': 'key1', 'val': 'val1'};
        var msgString = JSON.stringify(msgObject);
        console.log(timestamp(), 'tx:', msgObject)
        nats.request(msgObject.subject, msgString, function (reply) {
            console.log(timestamp(), 'rx:', reply);
            done();
        });
    },
    function (done) {
        var msgObject = {'subject': 'db', 'id': msgId++, 'cmd': 'get', 'key': 'key1'};
        var msgString = JSON.stringify(msgObject);
        console.log(timestamp(), 'tx:', msgObject)
        nats.request(msgObject.subject, msgString, function (reply) {
            console.log(timestamp(), 'rx:', reply);
            done();
        });
    },
    function (done) {
        var msgObject = {'subject': 'db', 'id': msgId++, 'cmd': 'del', 'key': 'key1'};
        var msgString = JSON.stringify(msgObject);
        console.log(timestamp(), 'tx:', msgObject)
        nats.request(msgObject.subject, msgString, function (reply) {
            console.log(timestamp(), 'rx:', reply);
            done();
        });
    },
    function (done) {
        var msgObject = {'subject': 'db', 'id': msgId++, 'cmd': 'get', 'key': 'key1'};
        var msgString = JSON.stringify(msgObject);
        console.log(timestamp(), 'tx:', msgObject)
        nats.request(msgObject.subject, msgString, function (reply) {
            console.log(timestamp(), 'rx:', reply);
            done();
        });
    },
    function (done) {
        db.close(function (err) {
            if (err) return done(err);
            console.log(timestamp(), 'db.close:', dbname);
            done(null);
        });
    },
    function (done) {
        nats.close();
        done(null);
    }
], function(err) {
    if (err) {
        console.log(timestamp(), err);
    }
});

function timestamp() {
    return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
}
