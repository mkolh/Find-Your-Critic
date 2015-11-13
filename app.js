var express = require('express');
var exphbs = require('express-handlebars');
var request = require('request');
var cheerio = require('cheerio');
var path = require('path');
var bodyParser = require('body-parser');
var async = require('async');
var Xray = require('x-ray');
var x = new Xray();

var app = express();

//set middleware
app.use(bodyParser());

//set template engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


//data dump
var data = {reviews: []};
var tempData = [];
var counter = 1;

//constructor function for objects stored in data dump
function Critic(name, publication, image, fresh){
	this.name = name,
	this.publication = publication,
	this.image = image,
	this.fresh = fresh
}


//wrapper for the request function
function findMovie(url, callback){
	console.log("Searching for movies at " + url);

	x(url, '.review_table_row', [{
		name: '.critic_name a',
		publication: '.critic_name em',
		image: 'img@src',
		fresh: '.review_container .review_icon @class'
	}])
	(function(err, obj){

		//amending tempData, which is a global object....
		addData(obj, tempData);

		counter++;

		callback();

	});

}


/*~~~~~~~~~~UTILS~~~~~~~~~~~~*/

//extracts and sets fresh property on all objects
//pushes to holding array
function addData(arr, data, choice){

	for(var i = 0; i < arr.length; i++){
		arr[i].fresh = arr[i].fresh.split(" ").pop();
	}

	data.push(arr);

	console.log("New Data Added to Array");
}

//reduces two arrays: @data and @tempData
//by finding a critic name match between the two
//and matching it up against the user review of the @tempData
function marryResults(arr, arrTwo, userChoice){

	//if no length to @data, return temp as data
	//meant for first search
	if(arr.length === 0){
		return arrTwo;
	}

	var _married = [];

	//log through all @data Critic objects
	for(var i = 0; i < arr.length; i++){

		//loop through all @tempData Critic objects
		for(var t = 0; t < arrTwo.length; t++){

			//push to temp array the matches
			if(arrTwo[t].name == arr[i].name){
				console.log("FOUND ONE!!!!");
				if(arrTwo[t].fresh === userChoice){
					_married.push(arrTwo[t]);
				}
			}
		}
	}

	return _married;
}


//renaming utilitiy to conform to rotten's naming convention
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

//pagination string generator
function strip(string, counter){
	var temp = string.split("?page=");
	
	temp.splice(1, 1);

	temp.push(counter);

	return temp.join("?page=");
}

//filters for only matching reviews (user/critic)
function filterMatches(arr, choice){
	var result = arr.filter(function(e, i){
		return e.fresh === choice;
	});

	return result;
}

/* ~~~~~~~~~~~~~~~~~~ */


//initial render GET
app.get('/', function(req, res){
	console.log("Got a Get Request!");

	//render using index template and the data dump
	res.render('index', data);

	//clear array
	tempData.length = [];	
});

//main post request
app.post('/', function(req, res){
	//use body-parser to set movie name and choice;
	var movie = rottenRename(req.body.userName);
	var choice = req.body.review;

	//if no input, render w/o scraping
	if(movie === ''){
		console.log("No movie inout");
		res.render('index', data);
		return;
	}

	console.log("Got a request! Searching for " + movie);

	//create new url
	var newURL = 'http://www.rottentomatoes.com/m/' + movie + '/reviews/?page=1'
	
	//asyncranously log through 17 pages of reviews
	async.whilst(
		//condition, will continue while true
		function(){return counter <= 17 },
		//function called each time
		function(callback){
			//prep URL by amending over the expiring one
			var nextURL = strip(newURL, counter);

			//async call
			findMovie(nextURL, callback);
		},
		//final function, called after all 17 complete
		function(err){

			//amends global objects...

			//flatten data.reviews arrays
			tempData = tempData.reduce(function(a, b) {
			  return a.concat(b);
			}, []);

			//filters results, passes filterMatches() as a function expression! Evaluates
			tempData = marryResults(data.reviews, filterMatches(tempData, choice), choice);

			//...conclusion...//
			
			//clears existing GLOBAL object
			data.reviews = [];

			//transfers all tempData elements to data.reviews
			for(var i = 0; i < tempData.length; i++){
				data.reviews.push(tempData[i]);
			}

			//sets GLOBAL counter
			counter = 1;
			console.log("reseting counter, rendering...");

			//renders
			res.render('index', data);				
		}
	);

	//clears GLOBAL array
	tempData.length = [];
});

//set port and listen
var port = 3000;
app.listen(port, function() {
    console.log('Express server listening on port ' + port);
});
