require('log-timestamp');

var esClient = require('./elasticsearch_client.js');
var mailClient = require('./email_client.js');
var cfg = require('./config.js');

var express    = require('express');        
var app        = express();                 
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || cfg.port;        

var router = express.Router();              

function storeReport(report) {
	var token = 'placeholder';
	esClient.index({  
		  index: 'reports',
		  type: 'report',
		  body: report
		},function(err,resp,status) {
		    console.log(resp);
		});
	return token;
}

function isSevere(type) {
	console.log(type)
	return type === 'severe';
}

router.post('/reports', function (req, res) {
	var report = req.body; 
	console.log(report);
	// store all messages in the back end
	var token = storeReport(report);
	// for some reports, raise an email alert
	if(isSevere(report.report_type)) {
		console.log("Sending mail")
		mailClient.sendMail({
		    from: cfg.fromMail,
		    to: cfg.toMail,
		    subject: "Failure",
		    text: 
		    	`Time:    ${report.report_time}
		    Resource: ${report.resource}
		    Process:  ${report.process} on ${report.host}
		    Details:  ${report.message}
		    Token:    ${token}`
		}, function(error, response){
		    if(error){
		        console.log(error);
		    }
		});
	}
	res.json({ message: 'message received and stored', token:token });
    return;
})

app.use('/', router);
app.listen(port);
console.log('Listening on ' + port);