require('log-timestamp');

var es_client = require('./elasticsearch_client.js');

var express    = require('express');        
var app        = express();                 
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;        

var router = express.Router();              

function store_report(report) {
	var token = 'placeholder';
	es_client.index({  
		  index: 'reports',
		  type: 'report',
		  body: report
		},function(err,resp,status) {
		    console.log(resp);
		});
	return token;
}

router.post('/reports', function (req, res) {
	var report = req.body; 
	console.log(report);
	// for some reports, raise an email alert
	
	// store all messages in the back end
	var token = store_report(report);
	res.json({ message: 'message received and stored', token:token });
    return;
})

app.use('/', router);
app.listen(port);
console.log('Listening on ' + port);