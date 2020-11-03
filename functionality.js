/* output data */
var localmap;
var globalMarkerMap=[]; // periexei olous tous markers sto map
var globalPolyMap=[];   // periexei oles tis polylines sto map
var poiMarker;

var zoomMapPois;
var routeMarkerMap=[]; // periexei olous tous markers sto map
var routelPolyMap=[];   // periexei oles tis polylines sto map
var queryLeg;

var routeMarkerMapPoi2Poi=[]; // periexei olous tous markers sto map
var routelPolyMapPoi2Poi=[];   // periexei oles tis polylines sto map

var clat;
var clon;
var latlngbounds;


var rawPlanInfo = {};
var tourPlanNights = [1,1,1];

var plan = [];
var contextMenuDisplayed = false;
var contextMenuSpoint = undefined;
var contextMenuDpoint = undefined;

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

var addDestRegionPlaces=[];
var nameDestRegionPlaces=[];


function initDestRegionAutoComplete(){


  	  var inp = document.getElementById("destRegion");
	  var arr = nameDestRegionPlaces;

  	  /*the autocomplete function takes two arguments,
	  the text field element and an array of possible autocompleted values:*/
	  var currentFocus;
	  /*execute a function when someone writes in the text field:*/
	  inp.addEventListener("input", function(e) {
		   var a, b, i, val = this.value;
		   /*close any already open lists of autocompleted values*/
		   closeAllLists();
		   if (!val) { return false;}
		   currentFocus = -1;
		   /*create a DIV element that will contain the items (values):*/
		   a = document.createElement("DIV");
		   a.setAttribute("id", this.id + "autocomplete-list");
		   a.setAttribute("class", "autocomplete-items");
		   /*append the DIV element as a child of the autocomplete container:*/
		   this.parentNode.appendChild(a);
		   /*for each item in the array...*/
		   for (i = 0; i < arr.length; i++) {
		     /*check if the item starts with the same letters as the text field value:*/
		     if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
		       /*create a DIV element for each matching element:*/
		       b = document.createElement("DIV");
				 b.style.backgroundColor = 'white';
		       /*make the matching letters bold:*/
		       b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
		       b.innerHTML += arr[i].substr(val.length);
		       /*insert a input field that will hold the current array item's value:*/
		       b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
		       /*execute a function when someone clicks on the item value (DIV element):*/
		           b.addEventListener("click", function(e) {
		           /*insert the value for the autocomplete text field:*/
		           inp.value = this.getElementsByTagName("input")[0].value;
		           /*close the list of autocompleted values,
		           (or any other open lists of autocompleted values:*/
		           closeAllLists();

						/*---*/

						document.getElementById('searchFormButton').click();
		       });
		       a.appendChild(b);
		     }
		   }
	  });
	  /*execute a function presses a key on the keyboard:*/
	  inp.addEventListener("keydown", function(e) {
		   var x = document.getElementById(this.id + "autocomplete-list");
		   if (x) x = x.getElementsByTagName("div");
		   if (e.keyCode == 40) {
		     /*If the arrow DOWN key is pressed,
		     increase the currentFocus variable:*/
		     currentFocus++;
		     /*and and make the current item more visible:*/
		     addActive(x);
		   } else if (e.keyCode == 38) { //up
		     /*If the arrow UP key is pressed,
		     decrease the currentFocus variable:*/
		     currentFocus--;
		     /*and and make the current item more visible:*/
		     addActive(x);
		   } else if (e.keyCode == 13) {
		     /*If the ENTER key is pressed, prevent the form from being submitted,*/
		     e.preventDefault();
		     if (currentFocus > -1) {
		       /*and simulate a click on the "active" item:*/
		       if (x) x[currentFocus].click();
		     }
		   }
	  });
	  function addActive(x) {
		 /*a function to classify an item as "active":*/
		 if (!x) return false;
		 /*start by removing the "active" class on all items:*/
		 removeActive(x);
		 if (currentFocus >= x.length) currentFocus = 0;
		 if (currentFocus < 0) currentFocus = (x.length - 1);
		 /*add class "autocomplete-active":*/
		 x[currentFocus].classList.add("autocomplete-active");
	  }
	  function removeActive(x) {
		 /*a function to remove the "active" class from all autocomplete items:*/
		 for (var i = 0; i < x.length; i++) {
		   x[i].classList.remove("autocomplete-active");
		 }
	  }
	  function closeAllLists(elmnt) {
		 /*close all autocomplete lists in the document,
		 except the one passed as an argument:*/
		 var x = document.getElementsByClassName("autocomplete-items");
		 for (var i = 0; i < x.length; i++) {
		   if (elmnt != x[i] && elmnt != inp) {
		   x[i].parentNode.removeChild(x[i]);
		 }
	  }
	}
	/*execute a function when someone clicks in the document:*/
	document.addEventListener("click", function (e) {
		 closeAllLists(e.target);
	});

}

function getDestRegionPlaces(){

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
			addDestRegionPlaces = JSON.parse(this.responseText);

			for(var i=0; i<addDestRegionPlaces.length; i++){

				nameDestRegionPlaces.push(addDestRegionPlaces[i].name);
			}

			initDestRegionAutoComplete();
		}
	};
	
	xmlhttp.open("POST", "http://web.interreginvestment.eu/ttp/addDestRegion.php", true);
	xmlhttp.send();


}

function savePois(){

	category_preferences={"1":parseInt(document.getElementById("toolTipNature").value),
								 "2":parseInt(document.getElementById("toolTipMeseusGalleries").value),
								 "3":parseInt(document.getElementById("toolTipMonumentsLandmarks").value),
								 "4":parseInt(document.getElementById("toolTipReligiousSites").value),
								 "5":parseInt(document.getElementById("toolTipPlacesView").value),
								 "6":parseInt(document.getElementById("toolTipSettlementsNeighborhoods").value)};

	start_visiting_pois_at = document.getElementById("timeDIS").value;
	end_visiting_pois_at = document.getElementById("timeDIE").value;


	closePOIsNav();

	return false;
}


function openPOIsNav() {
	document.getElementById("POIsSideNav").style.width = "100%";
}

function closePOIsNav() {
	document.getElementById("POIsSideNav").style.width = "0%";
}

function initializeFunctions(){

	var swidth = $( window ).width();
	var sheight = $( window ).height();
	cssDeviceChange(swidth,sheight);

	defaultVals();
	initAutocomplete('spoint');
	initAutocomplete('epoint');
	initMap();

	getDestRegionPlaces();
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

	var maxDays = parseInt(daysInMonth(month,d.getFullYear()));
	var day = parseInt(d.getDate() + " " + d.getFullYear());
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

function clearMap(){

	for(var i=0; i<globalMarkerMap.length; i++){
		globalMarkerMap[i].setMap(null);
	}
	globalMarkerMap = [];

	for(var i=0; i<globalPolyMap.length; i++){
		globalPolyMap[i].setMap(null);
	}
	globalPolyMap = [];


	for(var i=0; i<routeMarkerMap.length; i++){
		routeMarkerMap[i].setMap(null);
	}
	routeMarkerMap = [];

	for(var i=0; i<routelPolyMap.length; i++){
		routelPolyMap[i].setMap(null);
	}
	routelPolyMap = [];


	for(var i=0; i<routeMarkerMapPoi2Poi.length; i++){
		routeMarkerMapPoi2Poi[i].setMap(null);
	}
	routeMarkerMapPoi2Poi = [];

	for(var i=0; i<routelPolyMapPoi2Poi.length; i++){
		routelPolyMapPoi2Poi[i].setMap(null);
	}
	routelPolyMapPoi2Poi = [];


	if(poiMarker != undefined){
		poiMarker.setMap(null);
	}
	return false;
}
function submitQuery(){

	var destReg = document.getElementById("destRegion").value;
	var destRegID = null;

	for(var i=0; i<addDestRegionPlaces.length; i++){
		if(destReg == addDestRegionPlaces[i].name){
			destRegID = addDestRegionPlaces[i].id;
			break;
		} 
	}

	if(destRegID!=null){
		var found = false;
		for(var i=0;i<partial_solution_explore.compulsory_stop_overs.length; i++){
			if(partial_solution_explore.compulsory_stop_overs[i].id==destRegID){
				found = true;
			}
		}
		if(found == false){
			partial_solution_explore.compulsory_stop_overs.push(JSON.parse('{"id":'+destRegID+',"days":1}'));
		}
	}

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
/*******/
			clearMap();
			submitQueryPlanTrip(stop_overs);
			updateOutputInfo(); // update route infos
			closeInfos();
/*******/
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

function closeInfos(){




	if(document.getElementById('routePois').style.display == 'block'){

		document.getElementById("poisPlan").style.display="block";
		document.getElementById("routePois").style.display="none";
		document.getElementById("routePois").innerHTML = '';

	
		for(var i=0;i<routeMarkerMapPoi2Poi.length;i++){
			routeMarkerMapPoi2Poi[i].setMap(null);
		}
		routeMarkerMapPoi2Poi=[];
		for(var i=0;i<routelPolyMapPoi2Poi.length;i++){
			routelPolyMapPoi2Poi[i].setMap(null);
		}
		routelPolyMapPoi2Poi=[];

		document.getElementById("placesInfo").innerHTML = '';
	}else{
		/* close pois list */
		document.getElementById("poisPlanCol").style.display="none";
		document.getElementById("placesPlanCol").style.display="block";
		document.getElementById("poisPlan").innerHTML="";

		/* close poi info */
		document.getElementById('placesInfo').innerHTML = "";
		document.getElementById('placesInfo').height = "0vh";

		
		document.getElementById('routePlan').innerHTML = "";
		document.getElementById('routePlan').height = "0vh";

	}
	/* reset map to its original dimensions */
	document.getElementById('map').style.height= '73vh';


	if(poiMarker != undefined){
		poiMarker.setMap(null);
	}
	
	for(var i=0;i<globalMarkerMap.length; i++){
		globalMarkerMap[i].setMap(localmap);
	
	}
	
	for(var i=0;i<globalPolyMap.length; i++){
		globalPolyMap[i].setMap(localmap);
	
	}


	for(var i=0;i<routeMarkerMap.length; i++){
		routeMarkerMap[i].setMap(null);
	
	}
	
	for(var i=0;i<routelPolyMap.length; i++){
		routelPolyMap[i].setMap(null);
	
	}




	localmap.setCenter(new google.maps.LatLng(clat, clon));


	localmap.fitBounds(latlngbounds);
	
	var zoom = localmap.getZoom();
	if(zoom > 17){
		localmap.setZoom(17);
	}



	return false;
}

function addInfoToPoi(info){

	var placeInfo = document.getElementById('placesInfo');

	placeInfo.innerHTML = '<h2>' + info.name +'</h2>';

	
	var price = info.price;

	if(price == 0){
		price = 'Free';
	}

	placeInfo.innerHTML = placeInfo.innerHTML + '<p><img src='+ info.photo + ' height="120vh" width="120vw" onError="this.src = \'./img/imgNotFound.png\'" style="float:left; padding-top:1vh; padding-right:2vw;">' +
									'</br>' + info.address + '</br>' + 
									'</br>Duration: ' + info.visit_time + ' minutes' + 
									'</br>Entrance: ' + price +
									'</br></p>';


	placeInfo.innerHTML =  placeInfo.innerHTML + '<p style="padding-top:1vh;"> ' + info.description +'</p>';

//	placeInfo.style.borderStyle = 'solid';
	placeInfo.style.maxHeight = '70vh';
	placeInfo.style.width = '47vw';
	placeInfo.style.overflowY = 'scroll';

	var swidth = $( window ).width();
	var sheight = $( window ).height();
	cssDeviceChange(swidth,sheight);

	var mmap = document.getElementById('map');

	mmap.style.height= '30vh';


	for(var i=0;i<globalMarkerMap.length; i++){
		globalMarkerMap[i].setMap(null);
	
	}
	
	for(var i=0;i<globalPolyMap.length; i++){
		globalPolyMap[i].setMap(null);
	
	}

	for(var i=0;i<routeMarkerMap.length;i++){
		routeMarkerMap[i].setMap(null);
	}

	for(var i=0;i<routelPolyMap.length;i++){
		routelPolyMap[i].setMap(null);
	}



	for(var i=0;i<routeMarkerMapPoi2Poi.length;i++){
		routeMarkerMapPoi2Poi[i].setMap(null);
	}

	for(var i=0;i<routelPolyMapPoi2Poi.length;i++){
		routelPolyMapPoi2Poi[i].setMap(null);
	}

	routeMarkerMapPoi2Poi=[];
	routelPolyMapPoi2Poi=[];

	if(poiMarker != undefined){
		poiMarker.setMap(null);
	}
	var myLatlng = new google.maps.LatLng(info.latlon.lat,info.latlon.lon);
	poiMarker = new google.maps.Marker({
			 position: myLatlng,
			 map: localmap
		  });


	poiMarker.setMap(localmap);
	localmap.setCenter(new google.maps.LatLng(info.latlon.lat, info.latlon.lon));
	



	
}

function viewInfosPOIS(id){

	
	/* query info to backend */
	var data2backend = {
								 "activityId":""+id,
								 "language":language
							  };


	var jsonData = JSON.stringify(data2backend);
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
			var info = JSON.parse(this.responseText);
			addInfoToPoi(info);
		}
	};
	
	xmlhttp.open("POST", "http://web.interreginvestment.eu/ttp/info.php?data2b="+jsonData, true);
	xmlhttp.send();



	return false;
}


function queryRoutePoi2Poi_(jsonRoutes){


	document.getElementById('routePlan').innerHTML = "";
	document.getElementById('routePlan').height = "0vh";
	/* reset map to its original dimensions */
	document.getElementById('map').style.height= '73vh';
	document.getElementById("placesInfo").innerHTML = '';





	// Draw polylines on google map 
	var numRoutes = jsonRoutes.routes.length; 

	var mainRoute = 0;
	if(mainRoute>=numRoutes){
		mainRoute = numRoutes-1;
	}

	/* Draw lines with colors */
	var j=mainRoute;

	document.getElementById('routePois').innerHTML = '';

	numIter = jsonRoutes.routes[j].legs.length;
	var totalTimeTravel = jsonRoutes.routes[j].travel_time;
	var totalDistanceTravel = jsonRoutes.routes[j].distance;
	//alert(totalTimeTravel);


	/* find total walking time of the route */
	total_walk_travel_time=0;

	/* Need to clear map here from polyMap and Markers */

	for(var i=0;i<globalMarkerMap.length; i++){
		globalMarkerMap[i].setMap(null);
	
	}
	
	for(var i=0;i<globalPolyMap.length; i++){
		globalPolyMap[i].setMap(null);
	
	}

	if(poiMarker!=undefined){
		poiMarker.setMap(null);
	}

	for(var i=0;i<routeMarkerMapPoi2Poi.length;i++){
		routeMarkerMapPoi2Poi[i].setMap(null);
	}
	routeMarkerMapPoi2Poi=[];

	for(var i=0;i<routeMarkerMapPoi2Poi.length;i++){
		routeMarkerMapPoi2Poi[i].setMap(null);
	}
	routeMarkerMapPoi2Poi=[];


//	return false;


	for(var i=0; i<numIter; i++){
		var type  = jsonRoutes.routes[j].legs[i].type;
		var travel_time = jsonRoutes.routes[j].legs[i].travel_time;
	
		if(type == "walk"){
			total_walk_travel_time += travel_time;
			
		}		


	}
	total_walk_travel_time=total_walk_travel_time/60;
	addDirectionsPoi2Poi("total","","","","","","","", totalDistanceTravel, totalTimeTravel, "",-1,total_walk_travel_time);

	for(var i=0; i<numIter; i++){
		var route = jsonRoutes.routes[j].legs[i].coordinates;
		var type  = jsonRoutes.routes[j].legs[i].type;
		

		arrivalTime = jsonRoutes.routes[j].legs[i].extra_data[0][1];
		
		var waitTime    = jsonRoutes.routes[j].legs[i].extra_data[0][2];//leaveTime-arrivalTime;
		var leaveTime   = arrivalTime + waitTime;//jsonRoutes.routes[j].legs[i].extra_data[0][1];
		var street = jsonRoutes.routes[j].legs[i].extra_data[0][0];


		var desc = jsonRoutes.routes[j].legs[i].desc;
		var distance = jsonRoutes.routes[j].legs[i].distance;
		var travel_time = jsonRoutes.routes[j].legs[i].travel_time;
		var walk_time = jsonRoutes.routes[j].legs[i].travel_time;
		var StartEnd = '';
		if(i==0){
			arrivalTime=0;
			StartEnd = 'start';
		}

		if(i==numIter-1){
			StartEnd = 'end';
		}

		if(numIter == 1){
			StartEnd = 'startend';
		}

		var streetE = jsonRoutes
							.routes[j]
							.legs[i]
							.extra_data[jsonRoutes.routes[j].legs[i].extra_data.length-1][0];

		var arrivalTimeE = jsonRoutes
							.routes[j]
							.legs[i]
							.extra_data[jsonRoutes.routes[j].legs[i].extra_data.length-1][1];

		/* WILL DRAW LINES HERE */
		drawLineMapPoi2Poi(route,type,true,street,arrivalTime,leaveTime,waitTime,streetE,arrivalTimeE,type,StartEnd);
		addDirectionsPoi2Poi(type,street,arrivalTime,leaveTime,waitTime,streetE,arrivalTimeE, desc, distance, travel_time, walk_time,i,-1);
		/* add desc, distance, travel_time, walk_time */
	}


	queryLeg = jsonRoutes.routes[j].legs;

	return false;	
}





function queryRoutePoi2Poi(pois,index,poiDate){



	if(pois.length == index+1){
		return false;
	}


	pplan = pois[index];
	pplane = pois[(index+1)];

	var Url = 'http://mmrp.interreginvestment.eu:8000/getRoute/';
	
	var lg = 'en';

	var slat = pplan.location.lat;
	var slon = pplan.location.lon;
	var dlat = pplane.location.lat;
	var dlon = pplane.location.lon;




	var date = poiDate.split("-");
	var timeS = pplan.arrival_time.split(":");
	var ts   = Date.parse(new Date(date[0], date[1], date[2], timeS[0], timeS[1], 0))/1000;

	var timeE = pplan.departure_time.split(":");
	var te   = Date.parse(new Date(date[0], date[1], date[2], timeE[0], timeE[1], 0))/1000;

	var mod  = 'pub';

	var ldmod =  document.getElementById("privateTransCheckBox");
	if(ldmod.checked == true){
		mod  = 'car'; 
	}


	var obj  = 'minTran';
	var skip = [];

	var inputHttp =      "lg="+lg
						+"&"+"slat="+slat
						+"&"+"slon="+slon
						+"&"+"dlat="+dlat
						+"&"+"dlon="+dlon
						+"&"+"ts="+ts
						+"&"+"te="+te
						+"&"+"mod="+mod
						+"&"+"obj="+obj
						+"&"+"skip="+skip;

	
	var mmrappReq = Url + '?' + inputHttp;
	

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
				var jsonRoutes = JSON.parse(this.responseText);
				var success = jsonRoutes.header.success;

				if (success==0){
					alert('No route');
					return false;
				}


//				document.getElementById('routePois').innerHTML = '';
				queryRoutePoi2Poi_(jsonRoutes);
//				document.getElementById('poisPlan').style.display='none';
//				document.getElementById('routePois').style.display='block';

			return false;
		}
	};


	xmlhttp.open("POST", mmrappReq, true);
	xmlhttp.send();

	return false;

}


function updatePoisButton(pois,index, plansIndex){

		var poi = pois[index];
		var price = poi.price;

		if(price == 0){
			price = 'Free';
		}

		var PoiDate = plan[plansIndex].date;
	

		var arrTime = poi.arrival_time.split(':');
		var depTime = poi.departure_time.split(':');
		var durationMin = parseInt(depTime[1])-parseInt(arrTime[1]);
		var durationHour = parseInt(depTime[0])-parseInt(arrTime[0]);;
		var dur = durationHour*60 + durationMin;
		
		var poisNode = document.createElement('button');
		var photo = poi.photo.split(",");
		poisNode.innerHTML = '<img src='+ photo[0] + ' height="100vh" width="70vw" onError="this.src = \'./img/imgNotFound.png\'" style="float:left; padding-top:2vh;">' +
		//poisNode.innerHTML =	'<p style="font-size:15px">' + poi.name +
									'</br><pre style="font-size:12px;border-style:none;background-color:white;"><b>' + poi.name + '</b>'+
									'</br>Arrival: ' + poi.arrival_time +
									'</br>Departure: ' + poi.departure_time +
									'</br>Duration: ' + dur + ' minutes' + 
									'</br>Entrance: ' + price +
									'</br></pre>';


		poisNode.style.position="relative";
		poisNode.style.backgroundColor="white";
		poisNode.style.float = "center";
		poisNode.style.height = "100%";
		poisNode.style.width  = "87%";


		var poisId = parseInt(poi["id"]);
		poisNode.onclick = function(){
										viewInfosPOIS(poisId);
										return false;
								 };

		document.getElementById("poisPlan").appendChild(poisNode);		



		poiDirBtn = document.createElement('BUTTON');
		

		poiDirBtn.style.display= "inline-block";
		poiDirBtn.style.position="relative";
		poiDirBtn.style.backgroundColor="inherit";
		poiDirBtn.style.float = "right";
		poiDirBtn.style.height = "inherit";
		poiDirBtn.style.width  = "12%";
		poiDirBtn.style.border = 'none';
		poiDirBtn.innerHTML = '<img src="./img/rail.png" style="float:left;backgroundSize:100%;">';
		poiDirBtn.onclick = function(){queryRoutePoi2Poi(pois,index,PoiDate); return false;}
		poiDirBtn.style.transform = "scale(0.3,0.4)";
		poiDirBtn.style.float = 'right';
		if(pois.length-1 != index){
			document.getElementById("poisPlan").appendChild(poiDirBtn);		
		}	

}

function viewPOIS(index){


	
	var pois = plan[index].pois;


	for(var i=0;i<pois.length; i++){
		updatePoisButton(pois,i,index);
	}

	document.getElementById("poisPlanCol").style.display="block";
	document.getElementById("placesPlanCol").style.display="none";
	
	return false;
}

function nightsUpdate(id,numDay){

	for(var i=0;i<partial_solution_explore.compulsory_stop_overs.length; i++){
			if(partial_solution_explore.compulsory_stop_overs[i].id == id){
				partial_solution_explore.compulsory_stop_overs.splice(i,1);
			}
		}


	partial_solution_explore.compulsory_stop_overs = [];
	partial_solution_explore.compulsory_stop_overs.push({"id":id,"days":parseInt(numDay)});

	document.getElementById("searchFormButton").click();
	return false;
}


function movePoi(id,place){

	var id0 = parseInt(id);
	var id1 = parseInt(place) + id0;

	if(id0 > stop_overs.length-1 || id1 > stop_overs.length-1 || id0 < 0 || id1 < 0){
		return false;
	}


	var tmpDays = stop_overs[id0].days;
	var tmpId = stop_overs[id0].id;


	stop_overs[id0].days = stop_overs[id1].days;
	stop_overs[id0].id   = stop_overs[id1].id;


	stop_overs[id1].days = tmpDays;
	stop_overs[id1].id   =  tmpId;


	partial_solution_explore.compulsory_stop_overs = stop_overs;

	submitQuery();

	return false;
}

function deletePoi(index){

	partial_solution_explore.excluded_stop_overs.push({"id":stop_overs[index].id});
	
	
	submitQuery();
	return false;
}


function focusLeg(legNum){

	var legslat;
	var legslon;

	var legdlat;
	var legdlon;

	if(legNum==-1){
		legslat = queryLeg[0].coordinates[0][0];
		legslon = queryLeg[0].coordinates[0][1];

		if(queryLeg.length > 1){
			legdlat = queryLeg[queryLeg.length-1].coordinates[0][0];
			legdlon = queryLeg[queryLeg.length-1].coordinates[0][1];
		}else{
			legdlat = queryLeg[0].coordinates[queryLeg[0].coordinates.length-1][0];
			legdlon = queryLeg[0].coordinates[queryLeg[0].coordinates.length-1][1];

		}

	}else{
		legslat = queryLeg[legNum].coordinates[0][0];
		legslon = queryLeg[legNum].coordinates[0][1];

		legdlat = queryLeg[legNum].coordinates[queryLeg[legNum].coordinates.length-1][0];
		legdlon = queryLeg[legNum].coordinates[queryLeg[legNum].coordinates.length-1][1];
	}
	
	var clat = Math.abs(legslat+legdlat)/2;
	var clon = Math.abs(legslon+legdlon)/2;

	localmap.setCenter(new google.maps.LatLng(clat, clon));
	//localmap.setMapTypeId(google.maps.MapTypeId.ROADMAP);

	var latlngb = [
		 new google.maps.LatLng(legslat, legslon),
		 new google.maps.LatLng(legdlat, legdlon),
	]; 

	var latlngbounds = new google.maps.LatLngBounds();

	for (var i = 0; i < latlngb.length; i++) {
		 latlngbounds.extend(latlngb[i]);
	}
	localmap.fitBounds(latlngbounds);
	
	var zoom = localmap.getZoom();
	if(zoom > 17){
		localmap.setZoom(17);
	}

	return false;
}

function addDirections(type,street,arrivalTime,leaveTime,waitTime,streetE,arrivalTimeE, desc, distance, travel_time, walk_time,legNum,total_walk_travel_time){

		var imgSrc = "";

		/* */
		
	   leaveTime = toDate(leaveTime);
		arrivalTime = toDate(arrivalTime);
		arrivalTimeE = toDate(arrivalTimeE);


		walk_time = Number(walk_time);
		var h = Math.floor(walk_time / 3600);
		var m = Math.floor(walk_time % 3600 / 60);
		var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours") : "";
		var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes") : "";
		var outputwalk_time =  hDisplay + mDisplay; 

		
		travel_time = Number(travel_time);
		h = Math.floor(travel_time / 3600);
		m = Math.floor(travel_time % 3600 / 60);
		hDisplay = h > 0 ? h + (h == 1 ? " hour " : " hours ") : "";
		mDisplay = m > 0 ? m + (m == 1 ? " minute " : " minutes ") : "";
		var outputtravel_time =  hDisplay + mDisplay; 

		distance = distance/ 1000;
		distance = distance.toFixed(1) + "km";
		//alert( desc + distance+ travel_time+ walk_time);
		var testing = false;
		var imageNode = document.createElement('img');
		if (!testing && type === "walk"){
			outputMessage = "Walk to "+streetE +
										 "\nDept. Time: "+leaveTime+ 
										 "\nTravel Time: "+ outputwalk_time + 
										 "\nDistance: "+distance;

			
			imgSrc = './img/walk3ar.png';
		}else if ( !testing &&  type === "bus" ){
			//var desc = "Dromologio Tade";
			outputMessage = desc + " \nBus to " + streetE +
								 "\nDept. Time: "+leaveTime + " "+
								 "\nTravel Time: "+ outputtravel_time + 
								 "\nDistance: "+distance;
			imgSrc = './img/busar.png';
		}else if ( !testing &&  type === "car" ){
			outputMessage = "Drive to " + streetE +
								 "\nDept. Time: "+leaveTime + " "+
								 "\nTravel Time: "+ outputtravel_time + 
								 "\nDistance: "+distance;
			imgSrc = './img/car2m.png';
		}else if ( !testing &&  type === "rail" ){
			//var desc = "Dromologio Tade";
			outputMessage = desc + " \nRail to " + streetE +
								 "\nDept. Time: "+leaveTime + " "+
								 "\nTravel Time: "+ outputtravel_time;
			imgSrc = './img/trainar.png';
		}else if ( !testing &&  type === "subway" ){
			//var desc = "Dromologio Tade";
			outputMessage = desc + " \nSubway to " + streetE +
								 "\nDept. Time: "+leaveTime + " "+
								 "\nTravel Time: "+ outputtravel_time + 
								 "\nDistance: "+distance;
			imgSrc = './img/subwayar.png';
		}else if ( !testing &&  type === "tram" ){
			//var desc = "Dromologio Tade";
			outputMessage = desc + " \nTram to " + streetE +
								 "\nDept. Time: "+leaveTime + " "+
								 "\nTravel Time: "+ outputtravel_time + 
								 "\nDistance: "+distance;

			imgSrc = './img/tramar.png';
		}else if ( !testing &&  type === "ferry" ){
			//var desc = "Dromologio Tade";
			outputMessage = desc + " \nFerry to " + streetE +
								 "\nDept. Time: "+leaveTime + " "+
								 "\nTravel Time: "+ outputtravel_time + 
								 "\nDistance: "+distance;
			imgSrc = './img/ferryar.png';
		}else if ( !testing &&  type === "trolleybus" ){
			//var desc = "Dromologio Tade";
			outputMessage = desc + " \nTorlleybus to " + streetE +
								 "\nDept. Time: "+leaveTime + " "+
								 "\nTravel Time: "+ outputtravel_time + 
								 "\nDistance: "+distance;
			imgSrc = './img/trolleybusar.png';
	   }else{
			outputMessage = "Total Time: " + outputtravel_time + "\nTotal Distance:" + distance + "    ";
			imgSrc = './img/icons8_route.png';
		}


	


	imageNode.src  = imgSrc;
	imageNode.style.height = '50%';//"9vh";
	imageNode.style.width  = '20%';//"4vw";
	imageNode.style.float = "left";

	var textnode = document.createTextNode(outputMessage);

	var spanNode = document.createElement('span');
	spanNode.className = "inner-pre";

	var swidth = $( window ).width();
	if ( swidth >= 800 ){
		spanNode.style.fontSize = "12px";
	}else{
		spanNode.style.fontSize = "9px";

	}

	spanNode.id = 'directionsID' + legNum;
	spanNode.appendChild(textnode);

	if(legNum == -1){
				var maxWlkTm = 0;
				var img =  document.createElement('img');
				if(total_walk_travel_time > maxWlkTm){
					img.src = "./img/walkintTimeNotOk.png";
				}else{
					img.src = "./img/walkingTimeOk.png";

				}

				spanNode.appendChild(img);

	}


	var nodeInfo = document.createElement("pre");

	nodeInfo.appendChild(spanNode);      

	nodeInfo.style.float = "center";
	nodeInfo.style.backgroundColor = "white";
	nodeInfo.style.borderColor = "white";



	var node;
	if(imgSrc == './img/icons8_route.png'){
		node  = document.createElement('button');

		node.onclick = function(){
										 focusLeg(-1); return false;
									  };

	}else{
		node  = document.createElement('button');

		node.onclick = function(){
										 focusLeg(legNum); return false;
									  };
	}

	node.style.height = "100%";
	node.style.width  = "100%";
	node.style.backgroundColor = "white";
	if(imgSrc != undefined){
		node.appendChild(imageNode);
	}
	node.appendChild(nodeInfo);

	document.getElementById("routePlan").appendChild(node);


	document.getElementById('poisPlanCol').style.display = 'block' ;
	document.getElementById('placesPlanCol').style.display = 'none' ;
	return false;
}

function drawLineMap(coordinates,colorMod,putMarkers,street,arrivalTime,leaveTime,waitTime,streetEnd,arrivalTimeEnd,type,StartEnd){


	var color;

	switch(colorMod) {
	  case 'car':
		color='#66bb6a';
		break;
	  case 'rail':
		color='#607D8B';
		break;
	  case 'walk':
		color='#607D8B';
		break;
	  case 'pubcar':
		color='#607D8B';
		break;
	  case '':
		color='#202020';
		break;
	  default:
		color='#66bb6a';
	} 



		var testing = false;
		var imgSrcS = '';
		var imgSrcE = '';
		if (!testing && type === "walk"){
			imgSrcS = './img/walk3.png';
			imgSrcE = '';
		}else if ( !testing &&  type === "bus" ){
			imgSrcS = './img/bus.png';
			imgSrcE = '';
		}else if ( !testing &&  type === "car" ){
			imgSrcS = './img/car2m.png';
			imgSrcE = '';
		}else if ( !testing &&  type === "rail" ){
			imgSrcS = './img/train.png';
			imgSrcE = '';
		}else if ( !testing &&  type === "subway" ){
			imgSrcS = './img/subway.png';
			imgSrcE = '';
		}else if ( !testing &&  type === "tram" ){
			imgSrcS = './img/tram.png';
			imgSrcE = '';
		}else if ( !testing &&  type === "ferry" ){
			imgSrcS = './img/ferry.png';
			imgSrcE = '';
		}else if ( !testing &&  type === "trolleybus" ){
			imgSrcS = './img/trolleybus.png';
			imgSrcE = '';
	   }else{
			outputMessage = "Total Time to Destination: " + outputtravel_time + "\nTotal Distance to Destination:" + distance;
//			outputMessage = "From: " + street + " To:" + streetE + " by " + type;
			imgSrc = undefined;
		}


		if ( !testing &&  StartEnd === "start" ){
			imgSrcS = './img/start.png';
		}else if ( !testing &&  StartEnd === "end" ){
			imgSrcE = './img/end.png'
		}else if ( !testing &&  StartEnd === "startend" ){
			imgSrcS = './img/start.png';
			imgSrcE = './img/end.png'
		}



	var route=[];
	var routeIter = coordinates.length;
	for (var i=0; i<routeIter; i++){
		route.push({lat: coordinates[i][0], lng: coordinates[i][1]});

	}


	var polyMap = new google.maps.Polyline({
          path: route,
          geodesic: true,
          strokeColor:color,
          strokeOpacity: 1.0,
          strokeWeight: 5
        });


 	
	if(putMarkers){
/*
		if(arrivalTime == 0){
			arrivalTime = "-";
			waitTime = "-";
		}
*/
		var messageS = 'Street: ' + street + 
							'\nArrival Time: '+ toDate(arrivalTime)+
							'\nLeave Time: '+ toDate(leaveTime)+
							'\nWait Time: '+ waitTime +
							'\nTransport: '+ colorMod;

		var myIcon = new google.maps.MarkerImage(imgSrcS);
		var markerS = new google.maps.Marker({
			 position: route[0],
			 map: localmap,
			 icon:  myIcon,
			 title: messageS
		  });

		markerS.icon.scale=20;

		var messageE = 'Street: ' + streetEnd + 
							'\nArrival Time: '+ toDate(arrivalTimeEnd);

		myIcon = new google.maps.MarkerImage(imgSrcE);
		var markerE = new google.maps.Marker({
			 position: route[route.length-1],
			 map: localmap,
			 icon: myIcon,
			 title: messageE
			
		  });

		markerE.icon.scale=20;

		markerS.setMap(localmap);
		markerE.setMap(localmap);

		routeMarkerMap.push(markerS);
		routeMarkerMap.push(markerE);
	}

	polyMap.setMap(localmap);

	routelPolyMap.push(polyMap);

	lineExists=1;
	return false;

}



function drawLineMapPoi2Poi(coordinates,colorMod,putMarkers,street,arrivalTime,leaveTime,waitTime,streetEnd,arrivalTimeEnd,type,StartEnd){


	var color;

	switch(colorMod) {
	  case 'car':
		color='#66bb6a';
		break;
	  case 'rail':
		color='#607D8B';
		break;
	  case 'walk':
		color='#607D8B';
		break;
	  case 'pubcar':
		color='#607D8B';
		break;
	  case '':
		color='#202020';
		break;
	  default:
		color='#66bb6a';
	} 



		var testing = false;
		var imgSrcS = '';
		var imgSrcE = '';
		if (!testing && type === "walk"){
			imgSrcS = './img/walk3.png';
			imgSrcE = '';
		}else if ( !testing &&  type === "bus" ){
			imgSrcS = './img/bus.png';
			imgSrcE = '';
		}else if ( !testing &&  type === "car" ){
			imgSrcS = './img/car2m.png';
			imgSrcE = '';
		}else if ( !testing &&  type === "rail" ){
			imgSrcS = './img/train.png';
			imgSrcE = '';
		}else if ( !testing &&  type === "subway" ){
			imgSrcS = './img/subway.png';
			imgSrcE = '';
		}else if ( !testing &&  type === "tram" ){
			imgSrcS = './img/tram.png';
			imgSrcE = '';
		}else if ( !testing &&  type === "ferry" ){
			imgSrcS = './img/ferry.png';
			imgSrcE = '';
		}else if ( !testing &&  type === "trolleybus" ){
			imgSrcS = './img/trolleybus.png';
			imgSrcE = '';
	   }else{
			outputMessage = "Total Time to Destination: " + outputtravel_time + "\nTotal Distance to Destination:" + distance;
//			outputMessage = "From: " + street + " To:" + streetE + " by " + type;
			imgSrc = undefined;
		}


		if ( !testing &&  StartEnd === "start" ){
			imgSrcS = './img/start.png';
		}else if ( !testing &&  StartEnd === "end" ){
			imgSrcE = './img/end.png'
		}else if ( !testing &&  StartEnd === "startend" ){
			imgSrcS = './img/start.png';
			imgSrcE = './img/end.png'
		}



	var route=[];
	var routeIter = coordinates.length;
	for (var i=0; i<routeIter; i++){
		route.push({lat: coordinates[i][0], lng: coordinates[i][1]});

	}


	var polyMap = new google.maps.Polyline({
          path: route,
          geodesic: true,
          strokeColor:color,
          strokeOpacity: 1.0,
          strokeWeight: 5
        });


 	
	if(putMarkers){
/*
		if(arrivalTime == 0){
			arrivalTime = "-";
			waitTime = "-";
		}
*/
		var messageS = 'Street: ' + street + 
							'\nArrival Time: '+ toDate(arrivalTime)+
							'\nLeave Time: '+ toDate(leaveTime)+
							'\nWait Time: '+ waitTime +
							'\nTransport: '+ colorMod;

		var myIcon = new google.maps.MarkerImage(imgSrcS);
		var markerS = new google.maps.Marker({
			 position: route[0],
			 map: localmap,
			 icon:  myIcon,
			 title: messageS
		  });

		markerS.icon.scale=20;

		var messageE = 'Street: ' + streetEnd + 
							'\nArrival Time: '+ toDate(arrivalTimeEnd);

		myIcon = new google.maps.MarkerImage(imgSrcE);
		var markerE = new google.maps.Marker({
			 position: route[route.length-1],
			 map: localmap,
			 icon: myIcon,
			 title: messageE
			
		  });

		markerE.icon.scale=20;

		markerS.setMap(localmap);
		markerE.setMap(localmap);

		routeMarkerMapPoi2Poi.push(markerS);
		routeMarkerMapPoi2Poi.push(markerE);
	}

	polyMap.setMap(localmap);

	routelPolyMapPoi2Poi.push(polyMap);

	lineExists=1;
	return false;

}



function addDirectionsPoi2Poi(type,street,arrivalTime,leaveTime,waitTime,streetE,arrivalTimeE, desc, distance, travel_time, walk_time,legNum,total_walk_travel_time){

		var imgSrc = "";

		/* */
		
	   leaveTime = toDate(leaveTime);
		arrivalTime = toDate(arrivalTime);
		arrivalTimeE = toDate(arrivalTimeE);


		walk_time = Number(walk_time);
		var h = Math.floor(walk_time / 3600);
		var m = Math.floor(walk_time % 3600 / 60);
		var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours") : "";
		var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes") : "";
		var outputwalk_time =  hDisplay + mDisplay; 

		
		travel_time = Number(travel_time);
		h = Math.floor(travel_time / 3600);
		m = Math.floor(travel_time % 3600 / 60);
		hDisplay = h > 0 ? h + (h == 1 ? " hour " : " hours ") : "";
		mDisplay = m > 0 ? m + (m == 1 ? " minute " : " minutes ") : "";
		var outputtravel_time =  hDisplay + mDisplay; 

		distance = distance/ 1000;
		distance = distance.toFixed(1) + "km";
		//alert( desc + distance+ travel_time+ walk_time);
		var testing = false;
		var imageNode = document.createElement('img');
		if (!testing && type === "walk"){
			outputMessage = "Walk to "+streetE +
										 "\nDept. Time: "+leaveTime+ 
										 "\nTravel Time: "+ outputwalk_time + 
										 "\nDistance: "+distance;

			
			imgSrc = './img/walk3ar.png';
		}else if ( !testing &&  type === "bus" ){
			//var desc = "Dromologio Tade";
			outputMessage = desc + " \nBus to " + streetE +
								 "\nDept. Time: "+leaveTime + " "+
								 "\nTravel Time: "+ outputtravel_time + 
								 "\nDistance: "+distance;
			imgSrc = './img/busar.png';
		}else if ( !testing &&  type === "car" ){
			outputMessage = "Drive to " + streetE +
								 "\nDept. Time: "+leaveTime + " "+
								 "\nTravel Time: "+ outputtravel_time + 
								 "\nDistance: "+distance;
			imgSrc = './img/car2m.png';
		}else if ( !testing &&  type === "rail" ){
			//var desc = "Dromologio Tade";
			outputMessage = desc + " \nRail to " + streetE +
								 "\nDept. Time: "+leaveTime + " "+
								 "\nTravel Time: "+ outputtravel_time;
			imgSrc = './img/trainar.png';
		}else if ( !testing &&  type === "subway" ){
			//var desc = "Dromologio Tade";
			outputMessage = desc + " \nSubway to " + streetE +
								 "\nDept. Time: "+leaveTime + " "+
								 "\nTravel Time: "+ outputtravel_time + 
								 "\nDistance: "+distance;
			imgSrc = './img/subwayar.png';
		}else if ( !testing &&  type === "tram" ){
			//var desc = "Dromologio Tade";
			outputMessage = desc + " \nTram to " + streetE +
								 "\nDept. Time: "+leaveTime + " "+
								 "\nTravel Time: "+ outputtravel_time + 
								 "\nDistance: "+distance;

			imgSrc = './img/tramar.png';
		}else if ( !testing &&  type === "ferry" ){
			//var desc = "Dromologio Tade";
			outputMessage = desc + " \nFerry to " + streetE +
								 "\nDept. Time: "+leaveTime + " "+
								 "\nTravel Time: "+ outputtravel_time + 
								 "\nDistance: "+distance;
			imgSrc = './img/ferryar.png';
		}else if ( !testing &&  type === "trolleybus" ){
			//var desc = "Dromologio Tade";
			outputMessage = desc + " \nTorlleybus to " + streetE +
								 "\nDept. Time: "+leaveTime + " "+
								 "\nTravel Time: "+ outputtravel_time + 
								 "\nDistance: "+distance;
			imgSrc = './img/trolleybusar.png';
	   }else{
			outputMessage = "Total Time: " + outputtravel_time + "\nTotal Distance:" + distance + "    ";
			imgSrc = './img/icons8_route.png';
		}


	


	imageNode.src  = imgSrc;
	imageNode.style.height = '50%';//"9vh";
	imageNode.style.width  = '20%';//"4vw";
	imageNode.style.float = "left";

	var textnode = document.createTextNode(outputMessage);

	var spanNode = document.createElement('span');
	spanNode.className = "inner-pre";

	var swidth = $( window ).width();
	if ( swidth >= 800 ){
		spanNode.style.fontSize = "12px";
	}else{
		spanNode.style.fontSize = "9px";

	}

	spanNode.id = 'directionsID' + legNum;
	spanNode.appendChild(textnode);

	if(legNum == -1){
				var maxWlkTm = 0;
				var img =  document.createElement('img');
				if(total_walk_travel_time > maxWlkTm){
					img.src = "./img/walkintTimeNotOk.png";
				}else{
					img.src = "./img/walkingTimeOk.png";

				}

				spanNode.appendChild(img);

	}


	var nodeInfo = document.createElement("pre");

	nodeInfo.appendChild(spanNode);      

	nodeInfo.style.float = "center";
	nodeInfo.style.backgroundColor = "white";
	nodeInfo.style.borderColor = "white";



	var node;
	if(imgSrc == './img/icons8_route.png'){
		node  = document.createElement('button');

		node.onclick = function(){
										 focusLeg(-1); return false;
									  };

	}else{
		node  = document.createElement('button');

		node.onclick = function(){
										 focusLeg(legNum); return false;
									  };
	}

	node.style.height = "100%";
	node.style.width  = "100%";
	node.style.backgroundColor = "white";
	if(imgSrc != undefined){
		node.appendChild(imageNode);
	}
	node.appendChild(nodeInfo);

	document.getElementById("routePois").appendChild(node);


	document.getElementById('routePois').style.display = 'block' ;
	document.getElementById('poisPlan').style.display = 'none' ;
	return false;
}


function queryRoute_(jsonRoutes){

	// Draw polylines on google map 
	var numRoutes = jsonRoutes.routes.length; 

	var mainRoute = 0;
	if(mainRoute>=numRoutes){
		mainRoute = numRoutes-1;
	}

	/* Draw lines with colors */
	var j=mainRoute;

	document.getElementById('routePlan').innerHTML = '';

	numIter = jsonRoutes.routes[j].legs.length;
	var totalTimeTravel = jsonRoutes.routes[j].travel_time;
	var totalDistanceTravel = jsonRoutes.routes[j].distance;
	//alert(totalTimeTravel);


	/* find total walking time of the route */
	total_walk_travel_time=0;

	/* Need to clear map here from polyMap and Markers */

	for(var i=0;i<globalMarkerMap.length; i++){
		globalMarkerMap[i].setMap(null);
	
	}
	
	for(var i=0;i<globalPolyMap.length; i++){
		globalPolyMap[i].setMap(null);
	
	}

	
	for(var i=0;i<routeMarkerMapPoi2Poi.length;i++){
		routeMarkerMap[i].setMap(null);
	}
	routeMarkerMapPoi2Poi=[];
	for(var i=0;i<routelPolyMapPoi2Poi.length;i++){
		routelPolyMap[i].setMap(null);
	}
	routelPolyMapPoi2Poi=[];

	for(var i=0; i<numIter; i++){
		var type  = jsonRoutes.routes[j].legs[i].type;
		var travel_time = jsonRoutes.routes[j].legs[i].travel_time;
	
		if(type == "walk"){
			total_walk_travel_time += travel_time;
			
		}		


	}
	total_walk_travel_time=total_walk_travel_time/60;
	addDirections("total","","","","","","","", totalDistanceTravel, totalTimeTravel, "",-1,total_walk_travel_time);

	for(var i=0; i<numIter; i++){
		var route = jsonRoutes.routes[j].legs[i].coordinates;
		var type  = jsonRoutes.routes[j].legs[i].type;
		

		arrivalTime = jsonRoutes.routes[j].legs[i].extra_data[0][1];
		
		var waitTime    = jsonRoutes.routes[j].legs[i].extra_data[0][2];//leaveTime-arrivalTime;
		var leaveTime   = arrivalTime + waitTime;//jsonRoutes.routes[j].legs[i].extra_data[0][1];
		var street = jsonRoutes.routes[j].legs[i].extra_data[0][0];


		var desc = jsonRoutes.routes[j].legs[i].desc;
		var distance = jsonRoutes.routes[j].legs[i].distance;
		var travel_time = jsonRoutes.routes[j].legs[i].travel_time;
		var walk_time = jsonRoutes.routes[j].legs[i].travel_time;
		var StartEnd = '';
		if(i==0){
			arrivalTime=0;
			StartEnd = 'start';
		}

		if(i==numIter-1){
			StartEnd = 'end';
		}

		if(numIter == 1){
			StartEnd = 'startend';
		}

		var streetE = jsonRoutes
							.routes[j]
							.legs[i]
							.extra_data[jsonRoutes.routes[j].legs[i].extra_data.length-1][0];

		var arrivalTimeE = jsonRoutes
							.routes[j]
							.legs[i]
							.extra_data[jsonRoutes.routes[j].legs[i].extra_data.length-1][1];

/* WILL DRAW LINES HERE */
		drawLineMap(route,type,true,street,arrivalTime,leaveTime,waitTime,streetE,arrivalTimeE,type,StartEnd);
		addDirections(type,street,arrivalTime,leaveTime,waitTime,streetE,arrivalTimeE, desc, distance, travel_time, walk_time,i,-1);
		/* add desc, distance, travel_time, walk_time */
	}


	queryLeg = jsonRoutes.routes[j].legs;

	return false;	
}


function queryRoutePois(){
	
	return false;
}

function queryRoute(index){

	pplan = plan[index];
	pplane = plan[(index+1) % (stop_overs.length)];

	var Url = 'http://mmrp.interreginvestment.eu:8000/getRoute/';
	
	var lg = 'en';

	var slat = pplan.start_location.lat;
	var slon = pplan.start_location.lon;
	var dlat = pplane.start_location.lat;
	var dlon = pplane.start_location.lon;

	var date = pplan.date.split("-");
	var timeS = pplan.start.split(":");
	var ts   = Date.parse(new Date(date[0], date[1], date[2], timeS[0], timeS[1], 0))/1000;

	var timeE = pplan.end.split(":");
	var te   = Date.parse(new Date(date[0], date[1], date[2], timeE[0], timeE[1], 0))/1000;

	var mod  = 'pub';

	var ldmod =  document.getElementById("privateTransCheckBox");
	if(ldmod.checked == true){
		mod  = 'car'; 
	}


	var obj  = 'minTran';
	var skip = [];

	var inputHttp =      "lg="+lg
						+"&"+"slat="+slat
						+"&"+"slon="+slon
						+"&"+"dlat="+dlat
						+"&"+"dlon="+dlon
						+"&"+"ts="+ts
						+"&"+"te="+te
						+"&"+"mod="+mod
						+"&"+"obj="+obj
						+"&"+"skip="+skip;

	
	var mmrappReq = Url + '?' + inputHttp;
	

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
				var jsonRoutes = JSON.parse(this.responseText);
				var success = jsonRoutes.header.success;
				
				if (success==0){

					alert('No route');
					return false;
				}

				queryRoute_(jsonRoutes);

			return false;
		}
	};


	xmlhttp.open("POST", mmrappReq, true);
	xmlhttp.send();

	return false;

}

function viewRoute(index){
	
	queryRoute(index);
	return false;
}

function insertNodeTourPlan(chosen_departure,days,time,duration,distance,end_date,hotels,id,location, locked, name, organized_activities, start_date,index){

		var button = document.createElement('button');

		var nights    = 1;
		var maxnights = 1;
		
		if(index == 0){
			maxnights = 3;
		}else{
			maxnights = 2;
		}

		button.innerHTML =  "<pre style='background-color:inherit;border-style:none;'>" + 
									//" | " + index + " | " +
									"\n" +  index + " " + name  +
									"\nFrom:" + start_date  + "\nUntil:" + end_date +"\n" +
									"Departure: " + time + " \nDistance: "  + distance   + " \nDuration: " + duration + "</pre>" + 
									"</pre>";


		button.style.height = "inherit";
		button.style.width  = "100%";
		button.style.backgroundColor  = "inherit";
		button.onclick = function(){viewPOIS(index);};
		button.paddingTop = "3vh";
		button.style.borderStyle  = "none";



		var nightsBtn = document.createElement('SELECT');

		nightsBtn.style.height = "2%";
		nightsBtn.style.width  = "100%";
		nightsBtn.style.backgroundColor  = "inherit";
		nightsBtn.style.borderStyle  = "none";

		nightsBtn.id = "nightsBtn" + id;

		for(var i=1; i<maxnights+1; i++){
			var z = document.createElement("option");
			z.setAttribute("value", i  );
			var t = document.createTextNode("for " + i +" night(s)");
			z.appendChild(t);
			if(i == days){
				z.selected="selected";
			}			
			nightsBtn.appendChild(z);
		}



		nightsBtn.style.textAlignLast = 'center';			


		nightsBtn.onchange = function(){nightsUpdate(id,document.getElementById("nightsBtn" + id).value);};	


		var btnsGr = document.createElement('div');
		
		btnsGr.appendChild(button);
		btnsGr.appendChild(nightsBtn);
		//btnsGr.style.borderStyle  = "solid";
		btnsGr.style.float = 'right';
		btnsGr.style.width = '80%';
		btnsGr.style.height = '100%';
		

		var buttonsLeft = document.createElement('div');
		var routeImg = "./img/rail.png";

		buttonsLeft.innerHTML = "<div class='wrapper' style='text-align:center;'><button type='button' style='border-style:solid;' onclick=\"viewRoute("+index+");\"><img style='width:inherit;height:4vh;background-color:black;'src='"+routeImg+"'></button></div>"
		buttonsLeft.innerHTML = buttonsLeft.innerHTML +"<pre style='background-color:white;border-style:none;'><button type='button' style='border-style:solid;' onclick=\"movePoi("+index+",-1);\"><img src='./img/up_button.png'></button>\n  " + "\n<button type='button' style='border-style:solid;' onclick=\"movePoi("+index+",1);\"><img src='./img/down_button.png'></button>"; 

		buttonsLeft.innerHTML = buttonsLeft.innerHTML + "<div class='wrapper' style='text-align:center;'><button type='button' style='border-style:solid;' onclick=\"deletePoi("+index+");\"><img src='./img/delete.png'></button></div>"	+"</pre>";
		buttonsLeft.style.width = '20%';
		buttonsLeft.style.height = '100%';
		buttonsLeft.style.float = 'left';
		buttonsLeft.backgroundColor = 'inherit';

		var wrapperDiv = document.createElement('div');
		wrapperDiv.style.borderStyle = 'solid';

		wrapperDiv.appendChild(btnsGr);
		wrapperDiv.appendChild(buttonsLeft);
		wrapperDiv.overflow = 'hidden';	
		wrapperDiv.className = 'btn-group';
		wrapperDiv.style.paddingTop ='0vh';
		wrapperDiv.style.width = '100%';


		document.getElementById("placesPlan").appendChild(wrapperDiv);
		document.getElementById("placesPlan").style.paddingTop ='0.5vh';



		document.getElementById("placesPlan").style.paddingBottom='0.5vh';
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
		clat = Math.abs(latMax+latMin)/2;
		clon = Math.abs(lonMax+lonMin)/2;

		
		localmap.setCenter(new google.maps.LatLng(clat, clon));


		latlngbounds = new google.maps.LatLngBounds();

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

	if(routes[0].id == null || routes[0].undefined){
		submitQuery();
		return false;
	}

	var numRoutes = routes.length;

//	alert(routes[0].id + "\n" + routes[1].id + "\n" +routes[2].id + "\n" );

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

/*
	localmap.addListener('rightclick', function(e) {


		contextLatLng = e.latLng;
	
		var menuBox = document.getElementById("contextGoogleMapsMenu");
		var localmap = document.getElementById("map");		

		var menuBoxWidth = menuBox.style.width;
		menuBoxWidth = parseInt(String(menuBoxWidth).replace('px',''));


		var menuBoxHeight = menuBox.style.height;
		menuBoxHeight = parseInt(String(menuBoxHeight).replace('px',''));
		


		var Xpos = parseInt(localmap.getBoundingClientRect().left + e.pixel.x);
		var Ypos  = parseInt(localmap.getBoundingClientRect().top  + e.pixel.y);

		var Xpos2 = Xpos;
		var Ypos2 = Ypos;

		if(Xpos  > localmap.getBoundingClientRect().right/2){
			Xpos2 = (Xpos - menuBoxWidth);
		}

		if(Ypos  > localmap.getBoundingClientRect().bottom/2){
			Ypos2 = Ypos2 - menuBoxHeight;
		}

		menuBox.style.left = Xpos2  + "px";
		menuBox.style.top  = Ypos2  + "px";
	
		menuBox.style.display = "block";
		contextMenuDisplayed = true;
 

	});


	localmap.addListener("click", function (e)
	{
			var timeOutSuccess = false;
			if(contextMenuDisplayed == false){
				setTimeout(function(){
					  
								contextLatLng = e.latLng;
							
								var menuBox = document.getElementById("contextGoogleMapsMenu");
								var localmap = document.getElementById("map");		

								var menuBoxWidth = menuBox.style.width;
								menuBoxWidth = parseInt(String(menuBoxWidth).replace('px',''));


								var menuBoxHeight = menuBox.style.height;
								menuBoxHeight = parseInt(String(menuBoxHeight).replace('px',''));
								


								var Xpos = parseInt(localmap.getBoundingClientRect().left + e.pixel.x);
								var Ypos  = parseInt(localmap.getBoundingClientRect().top  + e.pixel.y);

								var Xpos2 = Xpos;
								var Ypos2 = Ypos;

								if(Xpos  > localmap.getBoundingClientRect().right/2){
									Xpos2 = (Xpos - menuBoxWidth);
								}

								if(Ypos  > localmap.getBoundingClientRect().bottom/2){
									Ypos2 = Ypos2 - menuBoxHeight;
								}

								menuBox.style.left = Xpos2  + "px";
								menuBox.style.top  = Ypos2  + "px";
							
								menuBox.style.display = "block";
								contextMenuDisplayed = true;
								timeOutSuccess = true;
					
				 }, 1000);
			}

		if (contextMenuDisplayed == true)
	 	{
  			 contextMenuDisplayed = false;
	  		 var menuBox = document.getElementById("contextGoogleMapsMenu");
			 menuBox.style.display = "none";
		}

	});
*/

}

/*
function sPointSetMenu(){


	var menuBox = document.getElementById("contextGoogleMapsMenu");
	menuBox.style.display = "none";


	var latLng = contextLatLng.toString(); 
	latLng = latLng.replace('(','');
	latLng = latLng.replace(')','');
	
	var dest = latLng;

	latLng = latLng.split(",");
	console.log("sending to google: " + latLng);



	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
			var jsonSpoint = JSON.parse(this.responseText);

			if(contextMenuSpoint!=undefined){
				contextMenuSpoint.setMap(null);
			}

			var messageS = jsonSpoint.results[3].formatted_address ; //'You are here';
			messageS = messageS.replace(",", "");

			var markerS = new google.maps.Marker({
					 position: contextLatLng,
					 map: localmap,
					 icon:'./img/start.png',
					title: messageS
				 });

			globalMarkerMap.push(markerS);

			contextMenuSpoint=markerS;
		
			document.getElementById("spoint").value=messageS;
			document.getElementById("spoint").placeholder=messageS;

			console.log("Before spoint: "+latLng);

			console.log("spoint: " +  document.getElementById("spoint").value);
			latLng[0].replace(" ","");
			latLng[1].replace(" ","");

			slat = Number(latLng[0]);
			slon = Number(latLng[1]);
				
			return false;
		}
	};


	xmlhttp.open("POST", 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+ latLng +'&key=AIzaSyDxth0qsM28RlcY8gF8IaPDfBxPRL_GM1I', true);
	xmlhttp.send();


	return false;
}

function dPointSetMenu(){

	var menuBox = document.getElementById("contextGoogleMapsMenu");
	menuBox.style.display = "none";

	var latLng = contextLatLng.toString(); 
	latLng = latLng.replace('(','');
	latLng = latLng.replace(')','');
	
	var dest = latLng;

	latLng = latLng.split(",");
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
			var jsonSpoint = JSON.parse(this.responseText);

			if(contextMenuDpoint!=undefined){
				contextMenuDpoint.setMap(null);
			}



			console.log(jsonSpoint.results);
			var messageS = jsonSpoint.results[3].formatted_address ; //'You are here';
			messageS = messageS.replace(",", "");
			var markerS = new google.maps.Marker({
					 position: contextLatLng,
					 map: localmap,
					 icon:'./img/end.png',
					title: messageS
				 });

			globalMarkerMap.push(markerS);
			contextMenuDpoint=markerS;

			//messageS = messageS.substring(messageS.indexOf(",") + 2);
			document.getElementById("epoint").value=messageS;
			document.getElementById("epoint").placeholder=messageS;

			latLng[0].replace(" ","");
			latLng[1].replace(" ","");
			dlat = Number(latLng[0]);
			dlon = Number(latLng[1]);
			return false;
		}
	};


	xmlhttp.open("POST",'https://maps.googleapis.com/maps/api/geocode/json?latlng='+ latLng +'&key=AIzaSyDxth0qsM28RlcY8gF8IaPDfBxPRL_GM1I&sensor=true', true);
	xmlhttp.send();



	return false;
}

*/
function cssDeviceChange( swidth,sheight){

//style="width:100px; max-width:400px;"




	if(swidth <= 800){
		/* mobile or tablet */

		$("#map").before($("#placesInfo"));
		document.getElementById('map').style.width  = '100vw';
		document.getElementById('map').style.height = '30vh';
		document.getElementById('placesInfo').style.width  = '100vw';

		document.getElementById('placesInfo').style.maxHeight = '100vh';

		document.getElementById('superPlacesPlanCol').style.maxWidth = '50vw';

		document.getElementById('sdatetime').style.zoom='0.85';
		document.getElementById('edatetime').style.zoom='0.85';



	}else{
		$("#placesInfo").before($("#map"));

		document.getElementById('map').style.width  = '47vw';
		document.getElementById('map').style.height = '73vh';

		if(document.getElementById('placesInfo').innerHTML != ""){
			document.getElementById('map').style.height = '30vh';

		}
		document.getElementById('placesInfo').style.maxHeight = '70vh';
		document.getElementById('placesInfo').style.width = '47vw';

		document.getElementById('placesPlanCol').style.zoom  = '1';
		document.getElementById('sdatetime').style.zoom='1';
		document.getElementById('edatetime').style.zoom='1';

	}
	

	document.getElementById('superPlacesPlanCol').style.maxWidth = '100vw';

	return false;
}


