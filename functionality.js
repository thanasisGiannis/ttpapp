backednIP = "http://150.140.143.218:8000/getRoute?" 

var slat;
var slon;
var dlat;
var dlon;
var mod;
var obj;
var maxstopovers;



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
	return false;
}

function defaultVals(){
	

	slat = '';
	slon = '';
	dlat = '';
	dlon = '';

	mod = 'multi';
	obj = 'ea';


	setDefaultDateTime();

	/* max stopovers */
	/* ------------- */
	maxstopovers = 3;
	document.getElementById("maxstopovers").max = 3;
	document.getElementById("maxstopovers").min = 1;
	document.getElementById("maxstopovers").value = maxstopovers;
	document.getElementById("headmaxstopovers").innerHTML = "Maximum number of stopovers: "+ document.getElementById("maxstopovers").value;
	/* ------------- */



	/* POIs settings */
	/* ------------- */
	document.getElementById("toolTipNature").max = 10;
	document.getElementById("toolTipNature").min = 0;
	document.getElementById("toolTipNature").value = 5;

	document.getElementById("toolTipMeseusGalleries").max = 10;
	document.getElementById("toolTipMeseusGalleries").min = 0;
	document.getElementById("toolTipMeseusGalleries").value = 5;

	document.getElementById("toolTipMonumentsLandmarks").max = 10;
	document.getElementById("toolTipMonumentsLandmarks").min = 0;
	document.getElementById("toolTipMonumentsLandmarks").value = 5;

	document.getElementById("toolTipReligiousSites").max = 10;
	document.getElementById("toolTipReligiousSites").min = 0;
	document.getElementById("toolTipReligiousSites").value = 5;

	document.getElementById("toolTipPlacesView").max = 10;
	document.getElementById("toolTipPlacesView").min = 0;
	document.getElementById("toolTipPlacesView").value = 5;

	document.getElementById("toolTipSettlementsNeighborhoods").max = 10;
	document.getElementById("toolTipSettlementsNeighborhoods").min = 0;
	document.getElementById("toolTipSettlementsNeighborhoods").value = 5;


	document.getElementById("timeDIS").value = "08:00";
	document.getElementById("timeDIE").value = "16:00";
	/* ------------- */


	/* public or private transport */
	/* --------------------------- */
	document.getElementById("publicTransCheckBox").checked = true;
	/* --------------------------- */




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
	ts = Math.round(ms/1000); // round to nearest second

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

