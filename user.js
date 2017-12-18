// CSGO500 Prediction Helper
// by DEADF1SH.s1mplex
// http://steamcommunity.com/profiles/76561198192995598
// Version 3.0

// Changed:
// Added decay functions
// Supporting Functions
// =========================================
// Global Vars

var debug = true
var debugged = false
var predictions = [];
//Count Occurences of an item in an array
function countOccurences(array_raw, item){
	var occurences = 0
	for(var i = 0; i < array_raw.length; i++) {
	    if(array_raw[i] == item){
				occurences += 1
			}
	}
	return occurences
}

//Get key with highest value in dictionary
function dictMax(o){
    var vals = [];
    for(var i in o){
       vals.push(o[i]);
    }
    var max = Math.max.apply(null, vals);
     for(var i in o){
        if(o[i] == max){
            return i;
        }
    }
}

function roundDict(dict){
	for (var key in dict) {
		let value = dict[key];
		dict[key] = value.toFixed(1);
	}
	return dict;
}

//===========================================

//CSGO500 Supporting Functions
//Fetch History

var color_list = ["black","red","blue","gold"]
var roll_history = []

function getHistory(){

      //Get raw node list
			roll_history = []
      var node_list = $("#past-queue-wrapper").children()

      //For each raw node
      node_list.each(function(){

    	//Convert Nodes to Color String
    	var style_text = $(this).attr("class")
    	var color_int = Number(style_text.charAt(5))

    	//Append to history list
    	roll_history.push(color_list[color_int])
      })
  //Return roll_history
  return roll_history
  }


//Get current roll
function getRoll(){
	return color_list[winner.choice]
}

//=======================================
//=======================================
//Main Prediction Functions
//Calculate Differences between Theoeretical occurences and real occurences
function calculateDifference(){

  //Theoretical Occurences of each color in 100 rolls
	var theoretical_occurences = {
		"black": (26/54.0) * 100,
		"red": (17/54.0) * 100,
		"blue": (10/54.0) * 100,
		"gold": (1/54.0) * 100
	}

  //Get roll history
	var roll_history = getHistory()
  //Actual Occurences of each color in the last 100 rolls
	var actual_occurences = {
		"black": countOccurences(roll_history, "black"),
		"red": countOccurences(roll_history, "red"),
		"blue": countOccurences(roll_history, "blue"),
		"gold": countOccurences(roll_history, "gold")
	}
  //Scale the colors depending upon their recent occurences
  //Polynomial decay functions - boring stuff
  var black_x = countOccurences(roll_history.slice(-10),"black")
  var red_x = countOccurences(roll_history.slice(-10), "red")
  var blue_x = countOccurences(roll_history.slice(-10), "blue")
  var gold_x = countOccurences(roll_history.slice(-54), "gold")

  //Polynomial decay functions for each color
	var scale = {
		"black": (-0.0357 * black_x*black_x) + 0.015*black_x +1.05,
		"red": (-0.035 * red_x * red_x) + 0.215*red_x + 0.75,
		"blue": (-0.0125*blue_x*blue_x) +0.1*blue_x + 0.9,
		"gold": 1
	}


  //Final scaled colors
	var final_differences = {
		"black": (Number((theoretical_occurences["black"] - actual_occurences["black"]).toFixed(1)))*scale["black"],
		"red":  (Number((theoretical_occurences["red"] - actual_occurences["red"]).toFixed(1)))*scale["red"],
		"blue":  (Number((theoretical_occurences["blue"] - actual_occurences["blue"]).toFixed(1)))*scale["blue"],
		"gold":  (Number((theoretical_occurences["gold"] - actual_occurences["gold"]).toFixed(1)))*scale["gold"]
	}


	return final_differences
}

//==========================================
//Use differences to calculate percentage chances

function calculatePercentages(){
	var difference = calculateDifference()

  //Offset for each number
	var smallest = Math.abs(Math.min(difference["black"],difference["red"], difference["blue"], difference["gold"]))

  var adjustment = smallest*2
  //Scalar numbers to scale different colors, adjustable
	var scalars = {
		"black": 1.25,
		"red":  1,
		"blue": 1,
		"gold": 0.5
	}
	var newDifferences = {
		"black": difference["black"]+adjustment*scalars["black"],
		"red":  difference["red"]+adjustment *scalars["red"],
		"blue": difference["blue"]+adjustment*scalars["blue"],
		"gold": difference["gold"]+adjustment *scalars["gold"]
	}

  //Total of all differences after adjustment
	var total = Number(newDifferences["black"]) + Number(newDifferences["red"]) + Number(newDifferences["blue"]) + Number(newDifferences["gold"])

  //Final Dictionary
	var newDifferences = {
		"black": newDifferences["black"]/total,
		"red": newDifferences["red"]/total,
		"blue": newDifferences["blue"]/total,
		"gold": newDifferences["gold"]/total
	}
	return newDifferences
}

//==================================================================
//GUI
//================================================
	var color_codes = ["rgb(80, 80, 80)","rgb(200, 53, 78)","rgb(69, 181, 218)","rgb(219, 192, 127)"];
	var color_codes_dict = {"black":"rgb(80, 80, 80)","red":"rgb(200, 53, 78)","blue":"rgb(69, 181, 218)","gold":"rgb(219, 192, 127)"};

	//Append Styles
	$("head").append("<style></style>")
	//Create Box
	$("#balance-wrapper").parent().prepend('<div id="assistant" style="width:300px;height:200px;background: #26262c;border-radius:5px;margin:auto; margin-bottom:20px;"><div id="spoiler" style="background: rgb(80, 80, 80); width: 10px; height: 10px; float: right; border-radius: 5px; margin: 10px;margin-left:280px;position:absolute;"></div><div id="prediction-container" style="padding-top: 20px;display: flex;"><div id="prediction-large" style="width:50%;height:50px"><h2 style="color:rgb(200, 53, 78); text-align:right; " id="prediction-large-text"><div id="prediction-large-ball" style="margin-right:-10px;margin-left:10px;margin-top: 0px;background: rgb(200, 53, 78); width: 40px; height: 40px; float: right; border-radius: 30px;"></div>0% </h2></div><div id="prediction-small" style="width:50%;height:50px"><h2 style="color:rgb(69, 181, 218); text-align:left;" id="prediction-small-text"><div id="prediction-small-ball" style="border: solid 2px #2C2C32;margin-right:10px;margin-left:-10px;margin-top: 5px;background: rgb(69, 181, 218); width: 30px; height: 30px; float: left; border-radius: 30px;"></div>0%</h2></div></div><div id="accuracy-container" style="padding-top: 20px;"><h2 id="accuracy" style="margin:auto;text-align:center;color:#666;">0%</h2><p style="text-align:center;margin:auto;color:#666;">CORRECT</p></div><div id="credits" style="position:absolute;height:25px;width:300px;margin-top:0px;"><p style="text-align:center;color:#666;">Your friendly neighborhood Prediction by<a href="http://steamcommunity.com/profiles/76561198192995598" target="_blank"> s1mpleX </a></p></div></div>')

	var correct = 1
	var rolls = 1

	var highest = {}
	var lowest = {}

	function update(){
		var winner_temp = winner.choice
		var time = Number($("#wheel-timer").text())
		//Once every round
		if(time > 18.5){
			//Print debug information


				if(color_list[winner_temp] == highest.color || color_list[winner_temp] == lowest.color){
					correct = correct + 1
				}
				rolls = rolls + 1
		}

		var pred_list = calculatePercentages()
		var pred_list_lower = calculatePercentages()
		pred_list_lower[dictMax(pred_list)] = null;
		//Get predictions
		predictions = [{"color":dictMax(pred_list),"value":pred_list[dictMax(pred_list)]},{"color":dictMax(pred_list_lower),"value":pred_list[dictMax(pred_list_lower)]}]
		var highest_total = predictions[0].value + predictions[1].value

		if(predictions[0]["value"] > predictions[1]["value"]){
			highest = predictions[0]
			lowest = predictions[1]
		}else{
			highest = predictions[1]
			lowest = predictions[0]
		}


		highest.value = highest.value/highest_total
		lowest.value = lowest.value/highest_total

		if(time > 0){
			winner = ""
			$("#spoiler").css("background",winner_temp)
			if(debug && debugged == false){
			console.log("%c Debug - Roll #" + String(rolls),"color: blue")
			console.log("%c       - Predicted " + String(correct) + "/" + String(rolls) + " correctly. (" +Number(correct/rolls * 100).toFixed(1) + "%)","color: blue")
			if(predictions[0]){
			console.log("%c       - Predicting: " + predictions[0].color + "/" + predictions[1].color,"color: blue")
		  }

			console.log("%c       - Raw Percentages: \n\t\t " + JSON.stringify(roundDict(calculatePercentages())),"color: blue")
			console.log("%c       - Raw Differences: \n\t\t " + JSON.stringify(roundDict(calculateDifference())),"color: blue")
			console.log("%c       - Raw Differences: \n\t\t " + JSON.stringify(roundDict(calculateDifference())),"color: blue")
			debugged = true;
		}


		}else{
			//Update spoiler
			winner_temp = winner.choice
			$("#spoiler").css("background",color_codes[winner_temp])
				debugged = false;
		}





		//Update Box

		//Update Ball Colors
		$("#prediction-large-ball").css("background",color_codes_dict[highest.color])
		$("#prediction-small-ball").css("background",color_codes_dict[lowest.color])

		//Update Text Values
		var inner = ""
		$("#prediction-large-text").children().each(function() {
    inner = inner + this.outerHTML;
		});
		inner = inner + (highest.value * 100).toFixed(0) + "%"
		$("#prediction-large-text").html(inner)

		var inner = ""
		$("#prediction-small-text").children().each(function() {
    inner = inner + this.outerHTML;
		});
		inner = inner + (lowest.value * 100).toFixed(0) + "%"
		$("#prediction-small-text").html(inner)

		//Update Text Colors
		$("#prediction-large-text").css("color",color_codes_dict[highest.color])
		$("#prediction-small-text").css("color",color_codes_dict[lowest.color])

		//Update Correct Percentage
		$("#accuracy").text(Number(correct/rolls * 100).toFixed(1) + "%")

	}

	//Begin
	$( "#prediction-container" ).click(function() {
if(debug == false){
	debug = true;
	console.log("%cDebug: ON","color: green;")
}else{
	debug = false;
	console.log("%cDebug: OFF","color: red;")
}
	});
setInterval(update,1000);
