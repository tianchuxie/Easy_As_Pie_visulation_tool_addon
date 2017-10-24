function saveOptions(e) {
	try{
		var pSize = parseInt(document.querySelector("#size").value);
	}
	catch(e){
		window.alert("Invalid size.");
	}
	finally{
		if (pSize <= 550 && pSize >= 200)
			browser.storage.local.set({
				size: pSize
		});
		else window.alert("Invalid size");
	}
}

function restoreOptions() {

	function setCurrentSize(result) {
		document.querySelector("#size").value = result.size || 500;
	}

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getSize = browser.storage.local.get("size");
  getSize.then(setCurrentSize, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);

document.querySelector("form").addEventListener("submit", saveOptions);