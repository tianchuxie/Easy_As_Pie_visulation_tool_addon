function handleResponse(message) {
}

function handleError(error) {
	console.log(`Error: ${error}`);
}

function sendRequest(data){
	var sending = browser.runtime.sendMessage({
		url: data
	});
	sending.then(handleResponse, handleError);  
}

var elem = document.getElementById("easy-as-pie-database");
if (elem != null){
if (typeof elem.getAttribute("value") != "undefined"){
	sendRequest(elem.getAttribute("value"));
} else{
	sendRequest(null);
}
}  else {
	sendRequest(null);
}