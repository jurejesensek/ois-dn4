
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

var menuOptions = ["vnosBolnika", "vnosMeritev", "pregled"];

var ehrIds = [];
var day = 10;

function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

function insertCurrentTimeDate() {
	var date = new Date();
	$("#vitalDateHr").val(date.toJSON());
}

function addRandMeasure(type) {
	
	var randTemp;
	
	if (type == "hypothermia") {
		randTemp = 35;
	} else if (type == "normal") {
		randTemp = 37;
	} else if (type == "hyperthermia") {
		randTemp = 40;
	} else {
		console.log("temperature error");
	}
	
	createMeasure({
		date: new Date().toJSON(),
		heigth: 196,
		weight: 90,
		temp: randTemp,
		systolic: 118,
		diastolic: 92,
		oxygen: 98,
	});
}

function addManualMeasure() {
	var readDateHr = $("#vitalDateHr").val();
	var readHeight = $("#vitalHeight").val();
	var readWeight = $("#vitalWeight").val();
	var readTemp = $("#vitalTemperature").val();
	var readSystolic = $("#vitalSystolic").val();
	var readDiastolic = $("#vitalDiastolic").val();
	var readOxygen = $("#vitalOxyenBlood").val();
	
	// console.log(readDateHr + " " + readHeight + " " + readWeight + " " + readTemp + " " + readSystolic + " " + readDiastolic + " " + readOxygen);
	
	if (!readDateHr || !readHeight || !readWeight || !readTemp || !readSystolic || !readDiastolic || !readOxygen) {
		$("#addUserVitalMsg").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	
	} else {
		createMeasure({
			date: readDateHr,
			heigth: readHeight,
			weight: readWeight,
			temp: readTemp,
			systolic: readSystolic,
			diastolic: readDiastolic,
			oxygen: readOxygen,
		});
	}
}

function createMeasure(receivedData) {
	sessionId = getSessionId();
	
	console.log("Vitalni podatki:");
	for (var x in receivedData) {
		console.log(receivedData[x]);
	}
	
	var selEhrId = $("#ehrIdDropDown").val();
	
	sessionId = getSessionId();
	
	$.ajaxSetup({
		headers: {"Ehr-Session": sessionId}
	});
	
	var data = {
		"ctx/language": "en",
		"ctx/territory": "SI",
		"ctx/time": receivedData.date,
		"vital_signs/height_length/any_event/body_height_length": receivedData.height,
		"vital_signs/body_weight/any_event/body_weight": receivedData.weight,
		"vital_signs/body_temperature/any_event/temperature|magnitude": null, //receivedData.temp,
		"vital_signs/body_temperature/any_event/temperature|unit": "�C",
		"vital_signs/blood_pressure/any_event/systolic": receivedData.systolic,
		"vital_signs/blood_pressure/any_event/diastolic": receivedData.diastolic,
		"vital_signs/indirect_oximetry:0/spo2|numerator": receivedData.oxygen
	};
	
	var myParams = {
		"ehrId": selEhrId,
		templateId: 'Vital Signs',
		format: 'FLAT',
		committer: "anon"
	};
	
	$.ajax({
		url: baseUrl + "/composition?" + $.param(myParams),
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(data),
		success: function (res) {
			console.log(res.meta.href);
			$("#addUserVitalMsg").html("<span class='obvestilo label label-success fade-in'>" + res.meta.href + ".</span>");
			$("#allUsersDropDown").append("<option>" + selEhrId + "</option>");
		},
		error: function(err) {
			$("#addUserVitalMsg").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
			console.log(JSON.parse(err.responseText).userMessage);
		}
	});
	
}

function readMeasure() {
	
	sessionId = getSessionId();
	
	var ehrId = $("#allUsersDropDown").val();
	
	if (ehrId.trim().length == 0) {
		$("#showUserVitalMsg").html("<span class='obvestilo label label-warning fade-in'>Izberite EHR ID</span>");
	
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				//$("#rezultatMeritveVitalnihZnakov").html("<br/><span>Pridobivanje podatkov za <b>'" + tip + "'</b> bolnika <b>'" + party.firstNames + " " + party.lastNames + "'</b>.</span><br/><br/>");
				
					$.ajax({
					    url: baseUrl + "/view/" + ehrId + "/" + "weight",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
						    	var results = "<table class='table table-striped table-hover'><tr><th>Datum in ura</th><th class='text-right'>Telesna te�a</th></tr>";
						        for (var i in res) {
						            results += "<tr><td>" + res[i].time + "</td><td class='text-right'>" + res[i].weight + " " 	+ res[i].unit + "</td>";
						        }
						        results += "</table>";
						        $("#results").append(results);
					    	} else {
					    		$("#showUserVitalMsg").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    	}
					    },
					    error: function() {
					    	$("#showUserVitalMsg").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
					    }
					});	
				
	    	},
	    	error: function(err) {
	    		$("#showUserVitalMsg").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
	    	}
		});
	}
	
}

function menuSelect(selOption) {
	// console.log(selOption);
	for (var i = 0; i < menuOptions.length; i++) {
		var tempMenuOption = document.getElementById(menuOptions[i]);
		if (selOption == menuOptions[i]) {
			tempMenuOption.style.display = "block";
		} else {
			tempMenuOption.style.display = "none";
		}
	}
	// console.log(document.getElementById("ehrIdDropDown").length);
}

function addNewRandUser() {
	createUser({
		//name: "user" + (ehrIds.length + 1),
		name: "user" + (document.getElementById("ehrIdDropDown").length + 1),
		lastName: "rand",
		gender: ((document.getElementById("ehrIdDropDown").length % 2 == 0) ? "MALE" : "FEMALE"),
		dateOfBirth: "1970-01-" + (day++)
	});
}

function addNewUser() {
	console.log("New manual user");
	
	var nameInput = $("#vnosIme").val();
	var lastNameInput = $("#vnosPriimek").val();
	var genderInput = $("#vnosSpol").val();
	var dateOfBirthInput = $("#vnosDatumRojstva").val();
	
	if (!nameInput || !lastNameInput || !dateOfBirthInput || nameInput.trim().length == 0 || 
				lastNameInput.trim().length == 0 || dateOfBirthInput.trim().length == 0) {
		$("#msgNewUser").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
		
	} else {
		createUser({
			name: nameInput,
			lastName: lastNameInput,
			gender: genderInput,
			dateOfBirth: dateOfBirthInput
		});
	}
}

function createUser(userData) {
	console.log("New user");
	
	sessionId = getSessionId();
	
	console.log("Session ID: " + sessionId + ", data: " + userData.name + userData.lastName + userData.gender + userData.dateOfBirth);
	
	$.ajaxSetup({
		headers: {"Ehr-Session": sessionId}
	});
	$.ajax({
		url: baseUrl + "/ehr",
		type: 'POST',
		success: function (data) {
			var ehrId = data.ehrId;
			var partyData = {
				firstNames: userData.name,
				lastNames: userData.lastName,
				dateOfBirth: userData.dateOfBirth + "T12:00",
				gender: userData.gender,
				partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
			};
			console.log("party data: " + partyData.firstNames + " " + partyData.lastNames + " " + partyData.dateOfBirth + " " + partyData.gender);
			$.ajax({
				url: baseUrl + "/demographics/party",
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify(partyData),
				success: function (party) {
					if (party.action == 'CREATE') {
						$("#ehrIdDropDown").append("<option>" + ehrId + "</option>");
						//document.getElementById("ehrIdDropDown").appendChild(ehrId);
						//ehrIds[ehrIds.length] = ehrId;
						$("#newEHRId").html("<span class='obvestilo label label-success fade-in'>Va&#353; EHR-ID je: " + ehrId + "</span>");
						console.log("Uspesno kreiran EHR '" + ehrId + "'.");
					}
				},
				error: function(err) {
				
					$("#newEHRId").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
					console.log(JSON.parse(err.responseText).userMessage);
				}
			});
		}
	});
	
}

$(document).ready(function() {
	console.log("ready!");
	
	// generator testnih podatkov
	for (var i = 0; i < 3; i++) {
		addNewRandUser();
	}
	setTimeout(function() {		// izjemno kmecka resitev...
		$("#newEHRId").html("")
		}, 500);
});