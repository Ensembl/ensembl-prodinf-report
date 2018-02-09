#!/usr/bin/env node

var nodemailer = require("nodemailer");
var cfg = require('./config.js');

var smtpTransport = nodemailer.createTransport({
    host: cfg.smtp_server,
    port: cfg.smtp_port,
    secure: cfg.smtp_secure
});

var queueName = cfg.email_log_queue;

console.log("Listening to %s", queueName);

var amqp = require('amqplib');

amqp.connect(cfg.message_uri).then(function(conn) {
    process.once('SIGINT', function() { conn.close(); });
    return conn.createChannel().then(function(ch) {
      
        var ok = ch.assertQueue(queueName, {durable: true});
        
        ok = ok.then(function(_qok) {
            return ch.consume(queueName, function(msg) {
                msgObj = JSON.parse(msg.content);
                console.log("%s : %s",msgObj.level, msgObj.message);
                smtpTransport.sendMail({
                    from: cfg.from_mail,
                    to: cfg.to_mail,
                    subject: msgObj.level + " message from " + msgObj.process + " on " + msgObj.host,
                    text: msgObj.message
                });
            }, {noAck: true});
        });
        
        return ok.then(function(_consumeOk) {
            console.log('Waiting for messages....');
        });
    });
}).catch(console.warn);

