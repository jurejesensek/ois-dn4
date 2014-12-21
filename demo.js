var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

var menuOptions = ["vnosBolnika", "vnosMeritev", "pregled"];

function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
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
}

function generateNewRandUser() {
	console.log("New rand user");
}

function addNewUser() {
	
	console.log("New manual user");
	
}

$(document).ready(function() {
	console.log("ready!");
});