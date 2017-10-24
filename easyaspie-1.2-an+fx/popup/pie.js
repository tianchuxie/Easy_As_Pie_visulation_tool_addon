//search for JSON file that contains information for building the pie on current web page
browser.tabs.executeScript(null, {
      file: "/content_scripts/getDatabase.js"
});

var json;

//after locating the JSON file, send AJAX request to corresponding URL
function handleMessage(request, sender, sendResponse) {
  sendResponse({response: "received"});
  if (request.url == null){
	  document.getElementById("myText").innerHTML = "No database found";
  } else {
	  document.getElementById("myText").remove();
	 // console.log(request.url);
	 var xhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
	 xhttp.open("GET", request.url, true);
	 xhttp.onreadystatechange = function(){
		 if (this.readyState == 4){    
			if(this.status == 200){
				json = JSON.parse(xhttp.responseText);
				initPie();
			}
			 else document.body.innerHTML = "Error reading data";
		}
	}
		xhttp.send();	
	//	main(request.url);
  }
}
browser.runtime.onMessage.addListener(handleMessage);

//default size
var size = 500;

//functions that get setting		
function onError(error){
	console.log('Error: ${error}');
}
function onGotSize(item){
	if (item.size){
		console.log("using customized size");
		size = item.size;
		main();
	} else {
		console.log("using default size");
		main();
	}
}

function initPie(){
	var getSize = browser.storage.local.get("size");
	getSize.then(onGotSize, onError);
	console.log("initializing..");
}

/*main function for pie visualization
the code for building the pie menu was based on: Sunburst with Distortion http://bl.ocks.org/mbostock/1306365
A sunburst (radial partition layout) built with D3, featuring interactive distortion based on InterRing: 
when you click on a node, it expands to fill 80% of the parent arc. Clicking on the root node resets all distortions.
*/
function main()
{
	var radius = size * 0.4;
	var color = d3.scale.category20c();


	var partition = d3.layout.partition()
		.size([2 * Math.PI, radius])
		.value(function(d) {return d.size == 0 ? 1 : d.size});
	
	var arc = d3.svg.arc()
		.startAngle(function(d) { return d.x; })
		.endAngle(function(d) { return d.x + d.dx; })
		.innerRadius(function(d) { return d.y; })
		.outerRadius(function(d) { return d.y + d.dy; });

	var svg = d3.select("body").append("svg")
		.attr("width", size)
		.attr("height", size)
		.append("g")
		.attr("transform", "translate(" + size / 2 + "," + size / 2 + ")");

	var div = d3.select("body").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);
		
		path = svg.data([json]).selectAll("path")
			.data(partition.nodes)
			.enter().append("path")
			.attr("d", arc)
			.style("fill", function(d) { return color((d.children ? d : d.parent).name); })
			.on("click", handleClick)
			.on("mouseover", handleMouseOver)
			.on("mouseout", handleMouseOut)
			.style("visibility", "hidden")
			.each(stash);
			path.filter(function(d){ return d.depth == 0}).style("visibility", "visible");
	
//Show its name when mouse over a pie slice
	function handleMouseOver(node){
		magnify(node);
		div.transition()
			.duration(200)
			.style("opacity", .9);
		div.html(node.name).style("left", (d3.event.pageX - 45) + "px")
			.style("top", (d3.event.pageY - 45) + "px");
	}
	function handleMouseOut(d, i){
		div.transition()
			.duration(500)
			.style("opacity", 0);
	}
	
	function handleClick(node){
		console.log(node);
		path.filter(function(d){return d.depth > node.depth}).style("visibility", "hidden");
		expandNode(node);
	}

// Distort the specified node to 50% of its parent if its not the only child of its parent
	function magnify(node) {
	if (parent = node.parent) {
		var parent,
			x = parent.x,
			k = .5;

		if (parent.children.length > 1){	
			parent.children.forEach(function(sibling) {
			x += reposition(sibling, x, sibling === node
				? parent.dx * k / node.value
				: parent.dx * (1 - k) / (parent.value - node.value));
			});
		}
	} else {
		reposition(node, 0, node.dx / node.value);
	}
	
	path.transition()
      .duration(750)
      .attrTween("d", arcTween);
	}

//expand the node if it has children, or create a new tab that links to the URL if it's the leaf node
	function expandNode(node){
		if (typeof node.children !== "undefined")
			path.filter(function(d){return node.children.includes(d)}).style("visibility", "visible");
		else if (typeof node.url != "undefined"){
			console.log("injecting");
			browser.tabs.create({"url": node.url});
		}
	}
// Recursively reposition the node at position x with scale k.
	function reposition(node, x, k) {
		node.x = x;
		if (node.children && (n = node.children.length)) {
			var i = -1, n;
			while (++i < n) x += reposition(node.children[i], x, k);
		}
	return node.dx = node.value * k;
	}

// Stash the old values for transition.
	function stash(d) {
		d.x0 = d.x;
		d.dx0 = d.dx;
	}

// Interpolate the arcs in data space.
	function arcTween(a) {
		var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
		return function(t) {
			var b = i(t);
			a.x0 = b.x;
			a.dx0 = b.dx;
			return arc(b);
		};
	}
}