var config = {
    'smtp_server' :  process.env.SMTP_HOST || 'localhost',
    'smtp_port' : process.env.SMTP_PORT || 25,
    'from_mail' :   process.env.FROM_EMAIL,
    'to_mail' :  process.env.TO_EMAIL,
    'elastic_host' : process.env.ELASTIC_HOST || 'http://127.0.0.1:9200/',
    'elastic_index' : process.env.ELASTIC_INDEX || 'reports',
    'elastic_type' : process.env.ELASTIC_DOC_TYPE || 'report',
    'message_uri' : process.env.MESSAGE_URI || 'amqp://localhost',
    'persistent_log_queue' : process.env.PERSISTENT_LOG_QUEUE || 'persistent_report',
    'email_log_queue' : process.env.EMAIL_LOG_QUEUE || 'email_report'
};

module.exports = config;
