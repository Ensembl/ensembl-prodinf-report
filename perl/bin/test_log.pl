#!/bin/env perl
use warnings;
use strict;

use Log::Log4perl;
use Log::Log4perl::Level;
use Log::Log4perl::Layout::PatternLayout;
use Sys::Hostname;

# Define a category logger
my $log = Log::Log4perl->get_logger("Foo::Bar");

# set some basic properties used to store messages
Log::Log4perl::MDC->put('host',hostname);
Log::Log4perl::MDC->put('resource','myres');
Log::Log4perl::MDC->put('process','pid');
Log::Log4perl::MDC->put('params',{param1=>'val1'});

# Define a queue appender
my $q_appender =  Log::Log4perl::Appender->new(
                                                    "Bio::EnsEMBL::Utils::QueueAppender",
                                                    host=>'localhost',
                                                    user=>'ensprod',
                                                    password=>'ensprod');

# Define a stdout appender
my $stdout_appender =  Log::Log4perl::Appender->new(
                                                    "Log::Log4perl::Appender::Screen",
                                                    name      => "screenlog",
                                                    stderr    => 0);
$stdout_appender->layout(Log::Log4perl::Layout::PatternLayout->new("[%r] %F %L %m%n"));

$log->add_appender($q_appender);
$log->add_appender($stdout_appender);
$log->level($INFO);
$log->info("testing");
$log->debug("testing info");
$log->warn("testing warn");
$log->error("testing error");
$log->fatal("testing fatal");

