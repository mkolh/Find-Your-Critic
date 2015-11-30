//Utilities
var Util = function(){};

//extracts and sets fresh property on all objects
//pushes to holding array
Util.prototype.addData = function(arr,data, choice) {

	for(var i = 0; i < arr.length; i++){
		arr[i].fresh = arr[i].fresh.split(" ").pop();
	}

	data.push(arr);

	console.log("New Data Added to Array");
};

//reduces two arrays: @data and @tempData
//by finding a critic name match between the two
//and matching it up against the user review of the @tempData
Util.prototype.marryResults = function(arr, arrTwo, userChoice){

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
Util.prototype.rottenRename = function(movie){
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
Util.prototype.strip = function(string, counter){
	var temp = string.split("?page=");
	
	temp.splice(1, 1);

	temp.push(counter);

	return temp.join("?page=");
}

//filters for only matching reviews (user/critic)
Util.prototype.filterMatches = function(arr, choice){
	var result = arr.filter(function(e, i){
		return e.fresh === choice;
	});

	return result;
}

Util.prototype.clearData = function(obj){
	for (var prop in obj){
		obj[prop] = [];
	}
};



Util.prototype.reload = function(arr, title){
	
	var fixedTitle = rottenRename(title);

	for(var i = 0; i < arr.length; i++){
		if(arr[i].title === fixedTitle){
			console.log("FOUND IT!!!! WOOOWOWOWOOWOW");
		}
	}
};



/* ~~~~~~~~~~~~~~~~~~ */
module.exports = new Util();