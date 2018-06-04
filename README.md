# ensembl-prodinf-report
This repository contains code for a general reporting framework for Ensembl production processes.

It is intended to capture output from a wide variety of different processes and pipelines, including Perl Hive modules and Python applications. Messages attempt to capture context, including details of the current process, pipeline and resource. This allows the progress of a particular pipeline or resource to be tracked over time.

RabbitMQ is used as an intermediate message store, and workers process messages in different ways according to their importance. For instance, critical errors are sent by email to alert the team, whilst all messages are stored in an Elasticsearch store so they can be searched. Other workers can be added to the system provided the correct queues are in place.

## Installation

`npm` is assumed as a prerequisite. The following command will install the winston, amqplib and elasticsearch node required modules

To install:
```
npm install
```

## Message structure
Messages must conform to the defined [schema](message_schema.json) which specifies the following properties:
* host
* process
* resource
* report_type
* message
* report_time

## RabbitMQ Configuration
RabbitMQ should be configured with a topic-based exchange (by default `report_exchange`) with one queue per client. The routing key is of the form `report.*`. The JSON for the exchanges, queues and bindings can be found in the `rabbitmq_config` sub directory.

## Writing messages

### Writing messages directly
Any RabbitMQ/AMPQ client can be used to write messages to the RabbitMQ instance described above, with the body meeting the JSON specification described, using the specified routing keys. 

### Writing messages with Perl
A simple Log4perl appender is provided as `Bio::EnsEMBL::Production::Utils::QueueAppender`, part of the `ensembl-production` repository. Note that contextual information needed for the messages should be provided via the calls to `Log::Log4perl::MDC::put` as shown:
```
my $log = Log::Log4perl->get_logger("Foo::Bar");

# set contextual properties that will be added to the messages generated
Log::Log4perl::MDC->put('host',hostname);
Log::Log4perl::MDC->put('resource','myres');
Log::Log4perl::MDC->put('process','pid');
Log::Log4perl::MDC->put('params',{param1=>'val1'});

# create an appender with a connection to RabbitMQ
my $q_appender =  Log::Log4perl::Appender->new(
                                                    "Bio::EnsEMBL::Utils::QueueAppender",
                                                    host=>'localhost',
                                                    user=>'myuser',
                                                    password=>'mypass',
                                                    exchange=>'report_exchange');

$log->add_appender($q_appender);

# use the log
$log->info("Hello, world!");
```


### Writing messages with Python
A Python logging appender/formatter/filter set is provided in `ensembl_prodinf.reporting` from [ensembl-prodinf-core](https://github.com/Ensembl/ensembl-prodinf-core). Example usage is:
```
from ensembl_prodinf.reporting import get_logger, get_pool, set_logger_context

# queue details
report_server = "amqp://test:test@localhost:5672/%2F"
report_exchange = 'report_exchange'

pool = get_pool(report_server)
logger = get_logger(pool, report_exchange, 'my process', "my first resource", {"param1":"val1", "param2":99})
logger.info("My first message")
logger.fatal("My first bad message")

# change the context
set_logger_context(logger, "my second resource", {"param1":"val2", "param2":66})
logger.info("My second message")
logger.fatal("My second bad message")
```

## Reading messages

The example clients for reading and processing messages are writen in node.js and share common configuration, and described in `package.json`. Each client has its own queue, which means an exchange and routing key need to be set up as above.

### Configuration
Client configuration is specified in `config.js`, and is designed to allow environment variables to override default settings.

### Email client
`email_client.js` reads from the `email_report` queue and sends mail reports out using the specified SMTP server (see `config.js`).

### Elastic client
`elasticsearch_client.js` reads from the `persistent_report` queue and stores the body of the message as an Elastic document in the specified server/index (see `config.js`). The Elastic mapping can be found in `mapping.json`.

