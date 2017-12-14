var nodemailer = require("nodemailer");
var cfg = require('./config.js');

// Use Smtp Protocol to send Email
var smtpTransport = nodemailer.createTransport({
    host: cfg.smtp_server,
    port: cfg.smtp_port,
    secure: cfg.smtp_secure
});

module.exports = smtpTransport;  