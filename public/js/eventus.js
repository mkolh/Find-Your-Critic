	//TEST TEST TESTTEST TEST TEST TEST TEST TEST TEST TEST TESTT 
	document.getElementById("prev-list").addEventListener("click", function(e){
		if(e.target && e.target.nodeName == "LI") {
            console.log(e.target + " was clicked");
        };
    });	
