var fs = require('fs'); //unused
var express = require('express');
var exphbs = require('express-handlebars');
var request = require('request');
var cheerio = require('cheerio');
var http = require('http'); //unused
var path = require('path');
var bodyParser = require('body-parser');
var Q = require('q'); //unused
var async = require('async');
var Xray = require('x-ray');

var app = express();

//set middleware
app.use(bodyParser());

//set template engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


/*~~~~Get the data~~~~~~*/
//test URL
var urlTwo = "http://www.rottentomatoes.com/m/the_dark_knight/reviews/";

//data dump
var data = {critics: []};
//constructor function for objects stored in data dump
function Critic(name, publication, image, fresh){
	this.name = name,
	this.publication = publication,
	this.image = image,
	this.fresh = fresh
}

//wrapper for the request function, initial thought was to use this to pass different
//urls into the request function
function findMovie(url){
	request(url, function(error, response, body){
		if(!error){
			//load the html
			var $ = cheerio.load(body);

			//clear critics
			data = {critics:[]};

			//movie poster and name
			var name = $('.col-left .center a img').attr('title');
			var imageURL = $('.col-left .center a img').attr('src');

			//each loop to collect review info and push to data dump
			$('.review_table_row').each(function(i, elem){

				var reviewerName = $(".critic_name a", this).text();
				var reviewerPublication = $(".critic_name em", this).text();
				var reviewerImage = $("img", this).attr("src");
				var fresh;

				//set the fresh value
				var freshTest = $(".fresh", this).length;
				if(freshTest > 0){
					fresh = true;
				}else{
					fresh = false;
				};

				//construct and push object to dump
				var newCritic = new Critic(reviewerName, reviewerPublication, reviewerImage, fresh);
				data.critics.push(newCritic);
			});

		}else{
			console.log("Error: " + error);
		}
	});
}

//clear critics utililty !!!!DOES NOT WORK!!!!
function clearCritics(data){
	data = {critics:[]};
}


var x = new Xray();
x('http://google.com', 'title')(function(err, title){
	console.log(title); // Google
});


/* ~~~~~~~~~~~~~~~~~~ */


//set initial data on load
findMovie(urlTwo);

//initial render GET
app.get('/', function(req, res){
	//render using index template and the data dump
	res.render('index', data);
});

///BROKEN !!!!
//Attempting to use input data to reload find movie function
app.post('/', function(req, res){
	//use body-parser to set name;
	var movie = req.body.userName;

	//create new url
	var newURL = 'http://www.rottentomatoes.com/m/' + movie + '/reviews/'
	
	async.series([
		//first function
		function(callback){
			findMovie(newURL);
			callback();
		},

		//final function
		function(err){
			res.send('index', data);
		}
	]);


});

//set port and listen
var port = 3000;
app.listen(port, function() {
    console.log('Express server listening on port ' + port);
});
