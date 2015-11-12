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
var x = new Xray();

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
var data = {};
//constructor function for objects stored in data dump
function Critic(name, publication, image, fresh){
	this.name = name,
	this.publication = publication,
	this.image = image,
	this.fresh = fresh
}

//wrapper for the request function, initial thought was to use this to pass different
//urls into the request function
function findMovie(url, callback){
	console.log("Searching for movies...");
	var targetURL;

	if(url){
		targetURL = url;
	}else{
		targetURL = 'http://www.rottentomatoes.com/m/the_dark_knight/reviews/';
	}
	x(targetURL, '.review_table_row', [{
		name: '.critic_name a',
		publication: '.critic_name em',
		image: 'img@src',
		review: '.review_container .review_icon @class'
	}])
	(function(err, obj){
		data.reviews = obj;
		
		callback();
	});

}

//renaming utilitiy to conform to rottenT's naming convention
function rottenRename(movie){
	if(movie.split(" ").length > 1){
		movie = movie.split(" ");
		var renamed = movie.map(function(e, i){
			console.log(i);
			console.log(e);
			e = e.toLowerCase();
			return e;
		});
		return renamed.join("_");
	}else{
		return movie.toLowerCase();
	}
}

/* ~~~~~~~~~~~~~~~~~~ */


//set initial data on load


//initial render GET
app.get('/', function(req, res){
	console.log("Got a Get Request!");
	//render using index template and the data dump
	async.series([
		function first(callback){
			findMovie(urlTwo, callback);
		},
		function(err){
			console.log("rendering...");
			res.render('index', data);
		}
	]);	
});

///BROKEN !!!!
//Attempting to use input data to reload find movie function
app.post('/', function(req, res){
	//use body-parser to set name;
	var movie = rottenRename(req.body.userName);

	console.log("Got a different Get request! Searching for " + movie);

	//create new url
	var newURL = 'http://www.rottentomatoes.com/m/' + movie + '/reviews/'
	
	async.series([
		//first function
		function(callback){
			findMovie(newURL, callback);
		},

		//final function
		function(err){
			console.log("rendering...");
			res.render('index', data);
		}
	]);


});

//set port and listen
var port = 3000;
app.listen(port, function() {
    console.log('Express server listening on port ' + port);
});
