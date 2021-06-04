var isMobile = window.screen.width < 400 ? true : false;

if(isMobile) {
	d3.selectAll(".mobile").style("display", "inline-block");
	d3.selectAll(".desktop").style("display", "none");
	d3.selectAll(".outer-margin").style("margin-left", "10px").style("margin-right", "10px");
	d3.selectAll(".title").style("font-size", "2.7em");
	// d3.selectAll(".heart").style("font-size", "1.4em");
} else {

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Set up the SVG ///////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	var margin = {
	  top: 120,
	  right: 150,
	  bottom: 0,
	  left: -350
	};
	var widthOriginal = 2150 - 100 - 150;
	var width = 1700 - margin.left - margin.right;
	var height = 620 - margin.top - margin.bottom;
		
	//SVG container
	var svg = d3.select('#chart')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g").attr("class", "top-wrapper")
		.attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")");	

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Create the scales //////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	var monthScale = d3.scaleLinear()
		.domain([2021-05-30, 2021-02-01])
	    .range([0, widthOriginal]);
		
	var rScale = d3.scaleSqrt()
		.domain([1,10,25,50,100,250,500,1000,2000])
		.range([25,21,17,13,10,7,5,3,2]);
		
	var colorScale = d3.scaleLinear()
		.domain([1,10,25,50,100,250,500,1000,2000])
		.range(["#FF4E50","FE5D4B","#FD7244","#FD7144","#FC873D","#FBA034","#FABA2C","ECC335","F6E37C"]);

	///////////////////////////////////////////////////////////////////////////
	///////////////////////// Choose annotated songs //////////////////////////
	///////////////////////////////////////////////////////////////////////////
			
	var interestingSongs = [
		1989, //Oldest song - Billy Holiday
		363, //Highest song from 2016 - Can't Stop The Feeling | Justin Timberlake
		270, //Highest new song - Starman | David Bowie
		144, //Highest riser - When We Were Young | Adele
		232, //Pokemon song
	];

	//David Bowie songs
	var DB = [7];

	//Prince songs
	var PR = [13];

	var strokeWidthColored = 1,	//The Beatles, Prince and David Bowie
		strokeWidthRed = 1;		//Interesting Songs
		
	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Read in the data /////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	d3.csv('data/top2000_2016_positions.csv', function (error, data) {

		///////////////////////////////////////////////////////////////////////////
		///////////////////////////// Final data prep /////////////////////////////
		///////////////////////////////////////////////////////////////////////////
		
		if (error) throw error;
		
		data.forEach(function(d) {
			d.rank = +d.rank;
			d.releaseYear = +d.releaseYear;
			d.listHighestRank = +d.listHighestRank;
			d.x = +d.x;
			d.y = +d.y;
		});
		
		//Add a few more "circles" to the data that will make room for the decade numbers
		var months = [2021-02-01,2021-02-02];
		for(var i=0; i<1; i++) {
			data.push({
				rank: 0,
				releaseYear: months[i],
				// type: "month",
				x: monthScale(months[i]),
				y: height/2
			});
		}//for i

		///////////////////////////////////////////////////////////////////////////
		///////////////////////////// Create the axis /////////////////////////////
		///////////////////////////////////////////////////////////////////////////

		svg.append("g")
	      .attr("class", "axis axis--x")
	      .attr("transform", "translate(0," + (height/8) + ")")
	      .call(d3.axisBottom(monthScale).tickFormat(d3.timeFormat("%Y-%m-%d")));
		  
		svg.selectAll(".axis text")
		  .attr("dy", "-0.25em");

		///////////////////////////////////////////////////////////////////////////
		//////////////////////////// Draw the circles /////////////////////////////
		///////////////////////////////////////////////////////////////////////////

		//Wrapper for all songs
	  	var songWrapper = svg.append("g")
	      .attr("class", "song-wrapper");
		  
		//Create a group per song
		var song = songWrapper.selectAll(".song-group")
		  	.data(data)
		  	.enter().append("g")
		  	.attr("class", "song-group")
		  	.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		  	.on("mouseover", function(d) { 
		  		console.log(d.artist, d.title, d.releaseYear, d.rank, d.listHighestRank); 

		  		//Move the tooltip to the right location
		  		tooltipSong.text(d.title);
		      	tooltipArtist.text(d.artist + " | " + d.releaseYear);
		      	tooltipRank.text("排名 " + d.rank);
		      	if(1) {
		      		tooltipTop40.text("时间 " + d.releaseYear);
		      	} else {
		      		tooltipTop40.text("无");
		      	}//else
		      	//Find the largest title
		      	var maxSize = Math.max(document.getElementById("tooltipSong").getComputedTextLength(), 
		      		document.getElementById("tooltipArtist").getComputedTextLength(), 
		      		document.getElementById("tooltipRank").getComputedTextLength(),
		      		document.getElementById("tooltipTop40").getComputedTextLength());
		      	tooltipBackground
		      		.transition().duration(100)
		      		.attr("x", -0.5 * maxSize*1.2)
		      		.attr("width", maxSize*1.2)
		      	tooltipWrapper
		      		.transition().duration(200)
		        	.attr("transform", "translate(" + d.x + "," + (d.y + 40) + ")")
		        	.style("opacity", 1);
		  	})
		  	.on("mouseout", function(d) {
		  		//Hide the tooltip
				tooltipWrapper
					.transition().duration(200)
					.style("opacity", 0);
		  	});

		//The colored background for some songs (since I can't do an outside stroke)
		song
			.filter(function(d) { return d.artist === "The Beatles" || DB.indexOf(d.rank) > -1 || PR.indexOf(d.rank) > -1 || interestingSongs.indexOf(d.rank) > -1; })
			.append("circle")
			.attr("class", "song-background")
	      	.attr("r", function(d) { 
	      		if(d.artist === "The Beatles" || DB.indexOf(d.rank) > -1 || PR.indexOf(d.rank) > -1) {
					return rScale(d.rank) + strokeWidthColored;
				} else if(interestingSongs.indexOf(d.rank) > -1) {
					return rScale(d.rank) + strokeWidthRed;
				} else {
					return -1; //check for error
				}//else
	      	})
		  	.style("fill", function(d) {
			  	if(d.artist === "The Beatles") {
				  	return "#46a1ef";
			  	} else if (interestingSongs.indexOf(d.rank) > -1) {
				  	return "#CB272E";
			  	} else if (DB.indexOf(d.rank) > -1) {
				  	return "#f1aa11";
			  	} else if (PR.indexOf(d.rank) > -1) {
				  	return "#C287FF";
			  	} else {
				  	return "#C287FF";
			  	}//else
		  	});

		//The grey scaled circle of the song
		song.append("circle")
			.attr("class", "song")
	      	.attr("r", function(d) { return rScale(d.rank); })
		  	.style("fill", function(d) { 
			  	if(d.type === "decade") {
				  	return "#533BE3";
			  	} else if (d.listHighestRank === 0 || d.listType === "tip") {
				  	return "#533BE3";
			  	} else {
					return colorScale(d.listHighestRank);
				}//else 
		  	});

		//Colored piece of the "vinyl" part of the top 10
		song
		  .filter(function(d) { return d.rank > 0 && d.rank <= 10; })
		  .append("circle")
	      .attr("r", function(d) { return rScale(d.rank)*0.8; })
		  .style("fill", "#E3533B");
		//White center of the "vinyl" part of the top 10
		song
		  .filter(function(d) { return d.rank > 0 && d.rank <= 10; })
		  .append("circle")
	      .attr("r", function(d) { return rScale(d.rank)*0.065; })
		  .style("fill", "#E3533B");
		song
		  .filter(function(d) { return d.rank > 800 && d.rank <= 2000; })
		  .append("circle")
	      .attr("r", function(d) { return rScale(d.rank)*0.65; })
		  .style("fill", "#F9D423");
		song
		  .filter(function(d) { return d.rank > 500 && d.rank <= 800; })
		  .append("circle")
	      .attr("r", function(d) { return rScale(d.rank)*0.65; })
		  .style("fill", "#F9D423");

		///////////////////////////////////////////////////////////////////////////
		////////////////////////////// Add Tooltip ////////////////////////////////
		///////////////////////////////////////////////////////////////////////////

		var tooltipWrapper = svg.append("g")
		  .attr("class", "tooltip-wrapper")
		  .attr("transform", "translate(" + 0 + "," + 0 + ")")
		  .style("opacity", 0);

		var tooltipBackground = tooltipWrapper.append("rect")
			.attr("class", "tooltip-background")
			.attr("x", 0)
			.attr("y", -28)
			.attr("width", 0)
			.attr("height", 100);

		var tooltipArtist = tooltipWrapper.append("text")
		  .attr("class", "tooltip-artist")
		  .attr("id", "tooltipArtist")
		  .attr("y", -4)
		  .text("");

		var tooltipSong = tooltipWrapper.append("text")
		  .attr("class", "tooltip-song")
		  .attr("id", "tooltipSong")
		  .attr("y", 17)
		  .text("");

		var tooltipRank = tooltipWrapper.append("text")
		  .attr("class", "tooltip-rank")
		  .attr("id", "tooltipRank")
		  .attr("y", 42)
		  .text("");
		var tooltipTop40 = tooltipWrapper.append("text")
		  .attr("class", "tooltip-rank")
		  .attr("id", "tooltipTop40")
		  .attr("y", 55)
		  .text("");

		///////////////////////////////////////////////////////////////////////////
		//////////////////////////// Add size legend //////////////////////////////
		///////////////////////////////////////////////////////////////////////////

		var sizeLegend = svg.append("g")
			.attr("class", "size-legend")
			.attr("transform", "translate(" + 415 + "," + -40 + ")");

		sizeLegend.append("text")
			.attr("class", "legend-title")
			.attr("x", -13)
			.attr("y", -40)
			.text("热度");

		var sizeDistance = [13,65,108,144,175,203,230,255,280];
		sizeLegend.selectAll(".song-size")
			.data(rScale.range())
			.enter().append("circle")
			.attr("class", "song-size")
			.attr("cx", function(d,i) { return sizeDistance[i]; })
			.attr("r", function(d) { return d; });

		//Add small red and white circle to the first
		sizeLegend.append("circle")
			.attr("cx", sizeDistance[0])
			.attr("r", rScale.range()[0] * 0.35)
			.style("fill", "#CB272E");
		sizeLegend.append("circle")
			.attr("cx", sizeDistance[0])
			.attr("r", rScale.range()[0] * 0.065)
			.style("fill", "red");

		//Add numbers below
		var sizeFont = [14,13,12,11,10,9,9,8,8];
		sizeLegend.selectAll(".song-legend-value")
			.data(rScale.domain())
			.enter().append("text")
			.attr("class", "song-legend-value")
			.attr("x", function(d,i) { return sizeDistance[i]; })
			.attr("y", 45)
			.style("font-size", function(d,i) { return sizeFont[i]; })
			.text(function(d) { return d; })


		///////////////////////////////////////////////////////////////////////////
		///////////////////////////// Add color legend ////////////////////////////
		///////////////////////////////////////////////////////////////////////////

		var colorLegend = svg.append("g")
			.attr("class", "color-legend")
			.attr("transform", "translate(" + 790 + "," + -40 + ")");

		colorLegend.append("text")
			.attr("class", "legend-title")
			.attr("x", -13)
			.attr("y", -40)
			.text("情绪");

		colorLegend.selectAll(".song-color")
			.data(colorScale.range())
			.enter().append("circle")
			.attr("class", "song-color")
			.attr("cx", function(d,i) { return 2 * i * rScale(100)*1.2; })
			.attr("r", rScale(100))
			.style("fill", function(d) { return d; });	
			//轴说明
		//Add extra circle for never reached top 40
		colorLegend.append("circle")
			.attr("class", "song-color")
			.attr("cx", function(d,i) { return 2 * 9 * rScale(100)*1.2; })
			.attr("r", rScale(100))
			.style("fill", "#F9D423");	

		//Add text below
		colorLegend.append("text")
			.attr("class", "song-legend-value")
			.attr("x", 0)
			.attr("y", 45)
			.style("font-size", sizeFont[0])
			.text("1");
		colorLegend.append("text")
			.attr("class", "song-legend-value")
			.attr("x", 2 * 6 * rScale(100)*1.2)
			.attr("y", 45)
			.style("font-size", sizeFont[0])
			.text("40");
		colorLegend.append("text")
			.attr("class", "song-legend-value")
			.attr("x", 2 * 9 * rScale(100)*1.2)
			.attr("y", 40)
			.style("font-size", sizeFont[4])
			.text("ok");
		colorLegend.append("text")
			.attr("class", "song-legend-value")
			.attr("x", 2 * 9 * rScale(100)*1.2)
			.attr("y", 51)
			.style("font-size", sizeFont[4])
			.text("最后");

	});//d3.csv

}//else

