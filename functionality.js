/* output data */
var localmap;
var globalMarkerMap=[]; // periexei olous tous markers sto map
var globalPolyMap=[];   // periexei oles tis polylines sto map

var rawPlanInfo = {};
var tourPlanNights = [1,1,1];

var plan = [];

/* input data */
var start_date;
var end_date;
var start_time;
var end_time;
var start_location = { "lat":[], "lon":[]};
var end_location = { "lat":[], "lon":[]};;
var max_stop_overs;
var stop_overs=[];
var car_days;
var category_preferences;
var start_visiting_pois_at;
var end_visiting_pois_at;
var partial_solution_plan   = {compulsory_pois: [],excluded_pois: []};
var partial_solution_explore={compulsory_stop_overs:[],excluded_stop_overs:[]};
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

function daysInMonth (month, year) {
    return new Date(year, month, 0).getDate();
}

function setDefaultDateTime(){

	/* settings date default */
	/* --------------------- */
	var d = new Date();
  	var ms = d.getTime();	
	var ts = Math.round(ms/1000); // round to nearest second

	var month = parseInt(d.getMonth())+1;
	var monthA = month;

	var maxDays = parseInt(daysInMonth(d.getMonth(),d.getFullYear()));
	var day = parseInt(d.getDate());
	var dayA = day+3;

	if (parseInt(dayA) > parseInt(maxDays)){
		var restDays = parseInt(dayA)-parseInt(maxDays);
		dayA = restDays;
		monthA = monthA+1;
	}
	if (day < 10){
		day = "0"+day;
	}

	if (month < 10){
		month = "0"+month;
	}

	if (monthA < 10){
		monthA = "0"+monthA;
	}

	if (dayA < 10){
		dayA = "0"+dayA;
	}

	document.getElementById("timeD").value = ""+toDate(ts)+"";
	document.getElementById("dateD").value = d.getFullYear() +"-"+month+"-"+day;

	document.getElementById("timeA").value = "20:00";
	document.getElementById("dateA").value = d.getFullYear() +"-"+monthA+"-"+dayA;
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


function submitQueryPlanTrip(stop_overs){

	// query info to backend 
	var data2backend = {
								 "car_days":car_days,
								 "category_preferences":category_preferences,
								 "start_visiting_pois_at":start_visiting_pois_at,
								 "start_date":start_date,
								 "end_visiting_pois_at":end_visiting_pois_at,
								 "start_time":start_time,
								 "end_date":end_date,
								 "end_time":end_time,
								 "start_location":start_location,
								 "end_location":end_location,
								 "stop_overs":stop_overs,
								 "partial_solution":partial_solution_plan,
								 "language":language
							  };


	var jsonData = JSON.stringify(data2backend);

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
			rawPlanInfo = JSON.parse(this.responseText);
			plan = rawPlanInfo['solution'];
		}
	};
	
	xmlhttp.open("POST", "http://web.interreginvestment.eu/ttp/plan.php?data2b="+jsonData, true);
	xmlhttp.send();

	return false;



}


function submitQuery(){

	/* query info to backend */
	var data2backend = {
								 "car_days":car_days,
								 "category_preferences":category_preferences,
								 "start_visiting_pois_at":start_visiting_pois_at,
								 "end_visiting_pois_at":end_visiting_pois_at,
								 "start_date":start_date,
								 "start_time":start_time,
								 "end_date":end_date,
								 "end_time":end_time,
								 "start_location":start_location,
								 "end_location":end_location,
								 "max_stop_overs":max_stop_overs,
								 "partial_solution":partial_solution_explore,
								 "language":language
							  };


	var jsonData = JSON.stringify(data2backend);

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
			rawPlanInfo = JSON.parse(this.responseText);

			stop_overs = [];
			var solution = rawPlanInfo["solution"];
			var numRoutes = solution.length;
			for(var i=0; i<numRoutes; i++){
				var id   = solution[i].id;
				var days = solution[i].days;
				stop_overs.push({"id":id,"days": days});
			}

			submitQueryPlanTrip(stop_overs);
			updateOutputInfo(); // update route infos
		}
	};
	
	xmlhttp.open("POST", "http://web.interreginvestment.eu/ttp/query.php?data2b="+jsonData, true);
	xmlhttp.send();

	return false;
}


function updateOutputInfo(){

	updateRoutePlan();

	return false;

}

function viewPOIS(index){


	console.log("POIS");
	console.log(plan[index]);

	var pois = plan[index].pois;

	for(var i=0;i<pois.length;i++){
		poisNode = document.createElement('button');
//		poisNode.className = 'btn';

//		poisNode.style.height = '50vh';
//		poisNode.style.width  = '50vw';

		poisNode.innerHTML = '<img src='+ pois[i].photo + ' height="100vh" width="70vw" style="float:left">' +
									'<p style="font-size:15px">' + pois[i].name +
									'</br>Arrival: ' + pois[i].arrival_time +
									'</br>Departure: ' + pois[i].departure_time +
									'</br>Duration: ' + '-' +
									'</br>Entrance: ' + pois[i].price +
									'</br></p>';



		poisNode.style.position="relative";
		poisNode.style.backgroundColor="white";
		poisNode.style.float = "center";
		poisNode.style.height = "100%";
		poisNode.style.width  = "100%";

		document.getElementById("poisPlan").appendChild(poisNode);		
	}


	document.getElementById("poisPlanCol").style.display="block";
	document.getElementById("placesPlanCol").style.display="none";
	return false;
}

function insertNodeTourPlan(chosen_departure,days,time,duration,distance,end_date,hotels,id,location, locked, name, organized_activities, start_date,index){

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
		nod12_in.innerHTML = "<p>" + index + "</p>";
		nod12.appendChild(nod12_in);


		/* creating nod13 */
		var nod13_in = document.createElement('pre');
		nod13_in.innerHTML = "<p>" + name + "</p>";

		tourPlanNights[index] = 1; 
		console.log(tourPlanNights);
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
		
		var rowTopButton = document.createElement('div');
		rowTopButton.className='btn';
		rowTopButton.onclick = function(){viewPOIS(index);};
		
		rowTopButton.appendChild(rowTop);
		document.getElementById("placesPlan").appendChild(rowTopButton);

		document.getElementById("placesPlan").className = 'container-fluid';


		return false;
}

function routePlanUpdateMap(tourPlanLocations){


		var latMax=0;
		var lonMax=0;

		var latMin=Infinity;
		var lonMin=Infinity;
		var latlngb=[];
		/* update markers */
		for(var i=0;i<globalMarkerMap.length;i++){
			globalMarkerMap[i].setMap(null);
		}
		globaMarkerMap = [];

		var polylinePath=[];
		for(var i=0; i< tourPlanLocations.length; i++){

			var myLatlng = new google.maps.LatLng(tourPlanLocations[i].lat,tourPlanLocations[i].lon);
			latlngb.push(myLatlng);
			console.log(tourPlanLocations[i].lon);

			var marker = new google.maps.Marker({
					 position: myLatlng,//tourPlanLocations[i],
					 map: localmap,
					 //icon:  myIcon,
					 title: i + 1 + ""
				  });


			marker.setMap(localmap);
			globalMarkerMap.push(marker);
			polylinePath.push(myLatlng);

			latMax =  Math.max(latMax,tourPlanLocations[i].lat);
			lonMax =  Math.max(lonMax,tourPlanLocations[i].lon);
			
			latMin =  Math.min(latMin,tourPlanLocations[i].lat);
			lonMin =  Math.min(lonMin,tourPlanLocations[i].lon);

		}			


		/* update polylines */
		for(var i=0;i<globalPolyMap.length;i++){
			globalPolyMap[i].setMap(null);
		}
		globalPolyMap = [];

		polylinePath.push(myLatlng);
		polylinePath.push(new google.maps.LatLng(tourPlanLocations[0].lat,tourPlanLocations[0].lon));
		var polyMap = new google.maps.Polyline({
          path: polylinePath,
          geodesic: true,
          strokeColor:'#66bb6a',
          strokeOpacity: 1.0,
          strokeWeight: 5
        });

		polyMap.setMap(localmap);
		globalPolyMap.push(polyMap);


		/* update map center */
		var clat = Math.abs(latMax+latMin)/2;
		var clon = Math.abs(lonMax+lonMin)/2;

		
		localmap.setCenter(new google.maps.LatLng(clat, clon));


		var latlngbounds = new google.maps.LatLngBounds();

		for (var i = 0; i < latlngb.length; i++) {
			 latlngbounds.extend(latlngb[i]);
		}
		localmap.fitBounds(latlngbounds);
		
		var zoom = localmap.getZoom();
		if(zoom > 17){
			localmap.setZoom(17);
		}

}

function updateRoutePlan(){

	var routes = rawPlanInfo["solution"];

	var numRoutes = routes.length;

	document.getElementById("placesPlan").innerHTML="";
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



		insertNodeTourPlan(chosen_departure,days,time,duration,distance,end_date,hotels,id,location, locked, name, organized_activities, start_date,i);

	}

	var tourPlanLocations = [];
	for(var i=0; i<numRoutes; i++){
		var location = routes[i].location;
		tourPlanLocations.push(location);
	}
	console.log(tourPlanLocations);
	routePlanUpdateMap(tourPlanLocations);
	
	return false;
}


function initMap() {

/* OpenStreet Map */

	localmap = new google.maps.Map(document.getElementById('map'), {
          zoom: 10,
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


