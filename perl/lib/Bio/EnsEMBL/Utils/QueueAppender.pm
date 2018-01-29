package Bio::EnsEMBL::Utils::QueueAppender;

use warnings;
use strict;

use base qw/Log::Log4perl::Appender/;

use Data::Dumper;
use Carp;
use JSON qw/encode_json/;
use Net::AMQP::RabbitMQ;

my $binding_keys = {
                    FATAL=>'log.fatal',
                    ERROR=>'log.error',
                    INFO=>'log.info',
                    DEBUG=>'log.debug',
                    WARN=>'log.warn'
                   };

my @keys = qw/host process resource params/;

sub new {
    my($class, @options) = @_;
    my $self = {
        @options,
    };
    $self->{channel} ||= 1;
    $self->{exchange} ||= 'log_exchange';
    $self->{mq} = Net::AMQP::RabbitMQ->new();
    $self->{mq}->connect($self->{host}, { user => $self->{user}, password => $self->{password} });
    $self->{mq}->channel_open($self->{channel});
    bless $self, $class;
    return $self;
}

sub log {
  my($self, %params) = @_;
  my $key = $binding_keys->{$params{log4p_level}};
  croak "Could not find binding key for ".$params{log4p_level} unless defined $key;
  my $msg = {message=>$params{message}};
  for my $key (@keys) {
    my $value = Log::Log4perl::MDC->get($key);
    $msg->{$key} = $value if defined $value;
  }
  $msg->{level} = $params{log4p_level};
  $msg->{message} =~ s/^[A-Z]+ - (.*)\n?$/$1/;
  $self->{mq}->publish($self->{channel}, $key, encode_json($msg), { exchange => $self->{exchange} });
  return;
}

1;
