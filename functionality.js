/* output data */
var rawPlanInfo = {};


/* input data */
var start_date;
var end_date;
var start_time;
var end_time;
var start_location = { "lat":[], "lon":[]};
var end_location = { "lat":[], "lon":[]};;
var max_stop_overs;
var car_days;
var category_preferences;
var start_visiting_pois_at;
var end_visiting_pois_at;
var partial_solution;
var partial_solution={compulsory_stop_overs:[],excluded_stop_overs:[]};
var language;

function openPOIsNav() {
	document.getElementById("POIsSideNav").style.width = "100%";
}

function closePOIsNav() {
	document.getElementById("POIsSideNav").style.width = "0%";
}

function initializeFunctions(){

	defaultVals();
	initAutocomplete('spoint');
	initAutocomplete('epoint');
	initMap();
	return false;
}

function defaultVals(){
	
	setDefaultDateTime();

	/* max stopovers */
	/* ------------- */
	max_stop_overs = 3;
	document.getElementById("maxstopovers").max = 3;
	document.getElementById("maxstopovers").min = 1;
	document.getElementById("maxstopovers").value = max_stop_overs;
	document.getElementById("headmaxstopovers").innerHTML = "Maximum number of stopovers: "+ document.getElementById("maxstopovers").value;
	/* ------------- */



	/* POIs settings */
	/* ------------- */
	document.getElementById("toolTipNature").max = 100;
	document.getElementById("toolTipNature").min = 0;
	document.getElementById("toolTipNature").value = 50;

	document.getElementById("toolTipMeseusGalleries").max = 100;
	document.getElementById("toolTipMeseusGalleries").min = 0;
	document.getElementById("toolTipMeseusGalleries").value = 50;

	document.getElementById("toolTipMonumentsLandmarks").max = 100;
	document.getElementById("toolTipMonumentsLandmarks").min = 0;
	document.getElementById("toolTipMonumentsLandmarks").value = 50;

	document.getElementById("toolTipReligiousSites").max = 100;
	document.getElementById("toolTipReligiousSites").min = 0;
	document.getElementById("toolTipReligiousSites").value = 50;

	document.getElementById("toolTipPlacesView").max = 100;
	document.getElementById("toolTipPlacesView").min = 0;
	document.getElementById("toolTipPlacesView").value = 50;

	document.getElementById("toolTipSettlementsNeighborhoods").max = 100;
	document.getElementById("toolTipSettlementsNeighborhoods").min = 0;
	document.getElementById("toolTipSettlementsNeighborhoods").value = 50;

	category_preferences={"1":50, "2":50, "3":50, "4":50, "5":50, "6":50};

	start_visiting_pois_at = "08:00";
	end_visiting_pois_at = "16:00";

	document.getElementById("timeDIS").value = start_visiting_pois_at;
	document.getElementById("timeDIE").value = end_visiting_pois_at;

	/* ------------- */


	/* public or private transport */
	/* --------------------------- */
	document.getElementById("publicTransCheckBox").checked = true;
	car_days=0;
	/* --------------------------- */


	language="English";

	return false;
}



function initAutocomplete(id) {
  // Create the autocomplete object, restricting the search predictions to
  // geographical location types.
  autocomplete = new google.maps.places.Autocomplete(
      document.getElementById(id), {types: ['geocode']});

  // Avoid paying for data that you don't need by restricting the set of
  // place fields that are returned to just the address components.
  autocomplete.setFields(['address_component']);

  // When the user selects an address from the drop-down, populate the
  // address fields in the form.
  autocomplete.addListener('place_changed', fillInAddress);
  return false;
}


function fillInAddress() {
  // Get the place details from the autocomplete object.
  var place = autocomplete.getPlace();

  for (var component in componentForm) {
    document.getElementById(component).value = '';
    document.getElementById(component).disabled = false;
  }

  // Get each component of the address from the place details,
  // and then fill-in the corresponding field on the form.
  for (var i = 0; i < place.address_components.length; i++) {
    var addressType = place.address_components[i].types[0];
    if (componentForm[addressType]) {
      var val = place.address_components[i][componentForm[addressType]];
      document.getElementById(addressType).value = val;
    }
  }

	return false;
}


function setDefaultDateTime(){

	/* settings date default */
	/* --------------------- */
	var d = new Date();
  	var ms = d.getTime();	
	var ts = Math.round(ms/1000); // round to nearest second

	var month = d.getMonth()+1;
	if (month < 10){
		month = "0"+month;
	}

	var day = d.getDate();
	var dayA = day+3;
	if (day < 10){
		day = "0"+day;
	}

	if (dayA < 10){
		dayA = "0"+dayA;
	}

	document.getElementById("timeD").value = ""+toDate(ts)+"";
	document.getElementById("dateD").value = d.getFullYear() +"-"+month+"-"+day;

	document.getElementById("timeA").value = "20:00";
	document.getElementById("dateA").value = d.getFullYear() +"-"+month+"-"+dayA;;
	/* --------------------- */


	start_date = document.getElementById("dateD").value;
	end_date = document.getElementById("dateA").value;

	start_time = document.getElementById("timeD").value;
	end_time = document.getElementById("timeA").value;

	return false;

}

function toDate(unix_timestamp){

	if(unix_timestamp==0){
		return '-';
	}

	// Create a new JavaScript Date object based on the timestamp
	// multiplied by 1000 so that the argument is in milliseconds, not seconds.
	var date = new Date(unix_timestamp * 1000);
	// Hours part from the timestamp
	var hours = date.getHours();
	// Minutes part from the timestamp
	var minutes = "0" + date.getMinutes();
	// Seconds part from the timestamp
	var seconds = "0" + date.getSeconds();

	// Will display time in 10:30:23 format
	var formattedTime = hours + ':' + minutes.substr(-2);// + ':' + seconds.substr(-2);

	return formattedTime;
}



function spointUpdate(){

	if (spoint.value == ''){
		return;
	}


	var googleURL = 'https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyDxth0qsM28RlcY8gF8IaPDfBxPRL_GM1I'

	var spointVal = document.getElementById("spoint").value;

	var googleURL1 = googleURL + '&address=' + spointVal;


	var HttpreqGoogleS = new XMLHttpRequest(); // a new request
	HttpreqGoogleS.open("GET",googleURL1,false);
	HttpreqGoogleS.send();

	var jsonSpoint = JSON.parse(HttpreqGoogleS.responseText);
	
	var slat = jsonSpoint.results[0].geometry.location.lat;
	var slon = jsonSpoint.results[0].geometry.location.lng;


	start_location = { "lat": slat, "lon": slon };

	return false;
}


function epointUpdate(){

	if (epoint.value == ''){
		return;
	}


	var googleURL = 'https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyDxth0qsM28RlcY8gF8IaPDfBxPRL_GM1I'

	var epointVal = document.getElementById("epoint").value;
	var googleURL1 = googleURL + '&address=' + epointVal;


	var HttpreqGoogleS = new XMLHttpRequest(); // a new request
	HttpreqGoogleS.open("GET",googleURL1,false);
	HttpreqGoogleS.send();

	var jsonSpoint = JSON.parse(HttpreqGoogleS.responseText);
	
	var slat = jsonSpoint.results[0].geometry.location.lat;
	var slon = jsonSpoint.results[0].geometry.location.lng;


	end_location = { "lat": slat, "lon": slon };
	
	return false;
}


function submitQuery(){

	/* query info to backend */
	var data2backend = {"start_date":start_date,
						 "end_date":end_date,
						 "start_time":start_time,
						 "end_time":end_time,
						 "start_location":start_location,
						 "end_location":end_location,
						 "max_stop_overs":max_stop_overs,
						 "car_days":car_days,
						 "category_preferences":category_preferences,
						 "start_visiting_pois_at":start_visiting_pois_at,
						 "end_visiting_pois_at":end_visiting_pois_at,
						 "partial_solution":partial_solution,
						 "language":language};


	var jsonData = JSON.stringify(data2backend);

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {

			rawPlanInfo = JSON.parse(this.responseText);
			updateOutputInfo(); // update route infos
			console.log(rawPlanInfo);
		}
	};
	xmlhttp.open("POST", "http://web.interreginvestment.eu/ttpapp/query.php?data2b="+jsonData, true);
	xmlhttp.send();

	return false;
}


function updateOutputInfo(){

//	console.log(rawPlanInfo["solution"]);
	
	updateRoutePlan();

	return false;

}


function updateRoutePlan(){

	var routes = rawPlanInfo["solution"];

	var numRoutes = routes.length;

	for(var i=0; i<numRoutes; i++){

		var chosen_departure   	 = routes[i].chosen_departure;
		var days 				  	 = routes[i].days;
		//var departures_options 	 = routes[i].departures_options;
		var time 					 = routes[i].departures_options[0].time;
		var duration 				 = routes[i].departures_options[0].duration;
		var distance				 = routes[i].departures_options[0].distance;
		
		var end_date    		  	 = routes[i].end_date;
		var hotels 				  	 = routes[i].hotels;
		var id 					  	 = routes[i].id;
		var location			  	 = routes[i].location;
		var locked				    = routes[i].locked;
		var name					    = routes[i].name;
		var organized_activities = routes[i].organized_activities;
		var start_date    		 = routes[i].start_date;






		var nod11 = document.createElement('div');
		var nod12 = document.createElement('div');
		var nod13 = document.createElement('div');
		var nod14 = document.createElement('div');

		nod11.className = 'col-sm-2';
		nod12.className = 'col-sm-2';
		nod13.className = 'col-sm-6';
		nod14.className = 'col-sm-2';



		
		/* creating nod11 */
		var button11 = document.createElement('button');
		button11.innerHTML = "<p style='width:100%'>" + "^v " + "</p>";
		button11.type = "button";
		button11.className = "btn" ;
		button11.style.width = "100%";
		nod11.appendChild(button11);


		/* creating nod12 */
		var nod12_in = document.createElement('pre');
		nod12_in.innerHTML = "<p>" + i + "</p>";
		nod12.appendChild(nod12_in);


		/* creating nod13 */
		var nod13_in = document.createElement('pre');
		nod13_in.innerHTML = "<p>" + name + "</p>";
		nod13_in.innerHTML = nod13_in.innerHTML + "<pre>" + "<p>" + days + "Night | " + start_date + "-" + end_date + "</p>" +"</pre>";
		nod13_in.innerHTML = nod13_in.innerHTML + "<pre>" + "<p>" + time + "-" + distance + "," + duration+ "</p>" + "</pre>";
		nod13_in.style.maxWidth= '100%';
		nod13.appendChild(nod13_in);
		

		/* creating nod14 */
		nod14.innerHTML = "<p>" + " o- <br> [] " + "</p>";
		nod14.style.textAlign = "left";


		var rowTop = document.createElement('div');
		rowTop.className = 'row';
		rowTop.appendChild(nod11);
		rowTop.appendChild(nod12);
		rowTop.appendChild(nod13);
		rowTop.appendChild(nod14);

		var buttonTop = document.createElement('button');
		buttonTop.appendChild(rowTop);
		document.getElementById("placesPlan").appendChild(buttonTop);


//		document.getElementById("placesPlan").appendChild(rowTop);
		document.getElementById("placesPlan").className = 'container-fluid';

	}
	



	return false;
}


function initMap() {

/* OpenStreet Map */

	localmap = new google.maps.Map(document.getElementById('map'), {
          zoom: 12,
          center: {lat: 38.246639, lng: 21.734573},
          mapTypeId: "OSM"
        });

	localmap.mapTypes.set("OSM", new google.maps.ImageMapType({
                getTileUrl: function(coord, zoom) {
                    // See above example if you need smooth wrapping at 180th meridian
                    return "http://mmrp.interreginvestment.eu/pegasus/map/tiles/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
                },
                tileSize: new google.maps.Size(256, 256),
                name: "OpenStreetMap",
                maxZoom: 17
            }));

	//map = localmap;


	localmap.addListener('rightclick', function(e) {


		contextLatLng = e.latLng;
	
		var menuBox = document.getElementById("contextGoogleMapsMenu");
		var localmap = document.getElementById("map");		
		//menuBox.style.left = left + "px";
		//menuBox.style.top  = top + "px";
		var leftS = localmap.getBoundingClientRect().left + e.pixel.x;
		var topS  = localmap.getBoundingClientRect().top  + e.pixel.y;
		
		menuBox.style.left = leftS + "px";
		menuBox.style.top  = topS  + "px";

	
		menuBox.style.display = "block";
		contextMenuDisplayed = true;
 
	});

}


