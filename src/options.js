function save_options() {
	var skipPercentageEle = document.getElementById("skipPercentage");
	localStorage["skipPercentage"] = parseInt(skipPercentageEle.value);
	
	// Update status to let user know options were saved.
	var status = document.getElementById("status");
	status.innerHTML = "Options Saved.";
	setTimeout(function() {
		status.innerHTML = "";
	}, 750);
}
	
// Restores select box state to saved value from localStorage.
function restore_options() {
	var skipPercentage = localStorage["skipPercentage"];
	if (!skipPercentage) {
		skipPercentage = 33;
	}
	
	var skipPercentageEle = document.getElementById("skipPercentage");
	skipPercentageEle.value = skipPercentage;
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);