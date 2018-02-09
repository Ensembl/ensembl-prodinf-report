'use strict';
const winston = require('winston');

const elasticsearch = require('elasticsearch');
const cfg = require('./config.js');

const client = new elasticsearch.Client( {  
  hosts: [cfg.elastic_host]
});

winston.info("Writing to " + cfg.elastic_host);

const queueName = cfg.persistent_log_queue;
const index = cfg.elastic_index;
const doc_type = cfg.elastic_type;

winston.info("Listening to ". queueName);

const amqp = require('amqplib');

amqp.connect(cfg.message_uri).then(function(conn) {
    process.once('SIGINT', function() { conn.close(); });
    return conn.createChannel().then(function(ch) {
      
        var ok = ch.assertQueue(queueName, {durable: true});
        
        ok = ok.then(function(_qok) {
            return ch.consume(queueName, function(msg) {

                msgObj = JSON.parse(msg.content);
                winston.debug(msgObj.level + " : " + msgObj.message);
                client.index({  
                    index: index,
                    type: doc_type,
                    body: msgObj
                },function(error, response, status) {
                    console.log("Status: "+status);
                    if(error) {
                        winston.error("Error: "+error);
                     } else {
                         ch.ack(msg);
                         winston.debug(response);
                     }
                });

            }, {noAck: false});


        });
        
        return ok.then(function(_consumeOk) {
            winston.info('Waiting for messages....');
        });
    });
}).catch(winston.error);

