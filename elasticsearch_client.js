var elasticsearch = require('elasticsearch');
var cfg = require('./config.js');

var client = new elasticsearch.Client( {  
  hosts: [cfg.elastic_host]
});

module.exports = client;  