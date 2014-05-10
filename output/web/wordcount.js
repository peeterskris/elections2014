function drawWordCounts(dataset){
	var example = [dataset["sociale"], dataset["ecologische"], dataset["economische"]];
	drawWordCountSet(example, "#differences");
	
	var example = [dataset["ondernemers"], dataset["burgers"], dataset["overheid"], dataset["werknemers"]];
	drawWordCountSet(example, "#economics");
	
	var example = [dataset["moeten"], dataset["willen"], dataset["geven"], dataset["nemen"]];
	//var example = [dataset["staatshervorming"], dataset["vooruitgang"]];
	//var example = [dataset["lastenverlaging"], dataset["besparen"], dataset["investeren"]];
	//var example = [dataset["milieu"]];
	drawWordCountSet(example, "#actions");
	
	var example = [dataset["europa"], dataset["belgie"], dataset["wallonie"],dataset["vlaanderen"]];	
	drawWordCountSet(example, "#geography");
	
	drawUserInput();
}

function drawUserInput()
{
	var userword1 = d3.select("#userInput1")[0][0].value.toLowerCase();
	var userword2 = d3.select("#userInput2")[0][0].value.toLowerCase();
	
	var userEntry1 = dataset[userword1];
	if(userEntry1 == undefined)
	{
		userEntry1 = [];
		userEntry1.word = userword1;
	}
	
	var userEntry2 = dataset[userword2];
	if(userEntry2 == undefined)
	{
		userEntry2 = [];
		userEntry2.word = userword2;	
	}
	drawWordCountSet([userEntry1, userEntry2], "#user");
}

var dataset = [];
var suggestions = [];
    
// Find the all nodes in the tree that overlap a given circle.
// quadroot is the root node of the tree, scaledX and scaledR
//are the position and dimensions of the circle on screen
//maxR is the (scaled) maximum radius of dots that have
//already been positioned.
//This will be most efficient if you add the circles
//starting with the smallest.  
function findNeighbours(root, scaledX, scaledR, maxR, padding, xScale, rScale) {

    var neighbours = [];
    //console.log("Neighbours of " + scaledX + ", radius " + scaledR);
    
  root.visit(function(node, x1, y1, x2, y2) {
      //console.log("visiting (" + x1 + "," +x2+")");
    var p = node.point; 
    if (p) {  //this node stores a data point value
        var overlap, x2=xScale(p.x), r2=rScale(p.r);        
        if (x2 < scaledX) {
            //the point is to the left of x
            overlap = (x2+r2 + padding >= scaledX-scaledR);
            /*console.log("left:" + x2 + ", radius " + r2 
                        + (overlap?" overlap": " clear"));//*/
        }      
        else {
            //the point is to the right
            overlap = (scaledX + scaledR + padding >= x2-r2);
            /*console.log("right:" + x2 + ", radius " + r2 
                        + (overlap?" overlap": " clear"));//*/
        }
        if (overlap) neighbours.push(p);
    }
   
    return (x1-maxR > scaledX + scaledR + padding) 
            && (x2+maxR < scaledX - scaledR - padding) ;
      //Returns true if none of the points in this 
      //section of the tree can overlap the point being
      //compared; a true return value tells the `visit()` method
      //not to bother searching the child sections of this tree
  });
    
    return neighbours;
}

function calculateOffset(maxR, quadroot, xScale, rScale, padding){
    return function(d) {
        neighbours = findNeighbours(quadroot, 
                                   xScale(d.x),
                                   rScale(d.r),
                                   maxR, padding, xScale, rScale);
        var n=neighbours.length;
        //console.log(j + " neighbours");
        var upperEnd = 0, lowerEnd = 0;      
        
        if (n){
            //for every circle in the neighbour array
            // calculate how much farther above
            //or below this one has to be to not overlap;
            //keep track of the max values
            var j=n, occupied=new Array(n);
            while (j--) { 
                var p = neighbours[j];
                var hypoteneuse = rScale(d.r)+rScale(p.r)+padding; 
                //length of line between center points, if only 
                // "padding" space in between circles
                
                var base = xScale(d.x) - xScale(p.x); 
                // horizontal offset between centres
                
                var vertical = Math.sqrt(Math.pow(hypoteneuse,2) -
                    Math.pow(base, 2));
                //Pythagorean theorem
                
                occupied[j]=[p.offset+vertical, 
                             p.offset-vertical];
                //max and min of the zone occupied
                //by this circle at x=xScale(d.x)
            }
            occupied = occupied.sort(
                function(a,b){
                    return a[0] - b[0];
                });
            //sort by the max value of the occupied block
            //console.log(occupied);
            lowerEnd = upperEnd = 1/0;//infinity
                
            j=n;
            while (j--){
                //working from the end of the "occupied" array,
                //i.e. the circle with highest positive blocking
                //value:
                
                if (lowerEnd > occupied[j][0]) {  
                    //then there is space beyond this neighbour  
                    //inside of all previous compared neighbours
                    upperEnd = Math.min(lowerEnd,
                                        occupied[j][0]);
                    lowerEnd = occupied[j][1];
                }
                else {
                    lowerEnd = Math.min(lowerEnd,
                                        occupied[j][1]);
                }
            //console.log("at " + formatPercent(d.x) + ": "
              //          + upperEnd + "," + lowerEnd);
            }
        }
            
            //assign this circle the offset that is smaller
            //in magnitude:
        return d.offset = 
                (Math.abs(upperEnd)<Math.abs(lowerEnd))?
                        upperEnd : lowerEnd;
    };
}

function drawWordCountSet(dataset, div){

	var axisHeight = 20;
	var legendHeight = 50;
	var height = dataset.length*100;
	var width = "100%";
	d3.select(div).selectAll("*").remove();
	var div = d3.select(div);
	var svg = div.append("svg").attr("width", width).attr("height",axisHeight + height+legendHeight);
	
	var digits = /(\d*)/;
	var margin = 20; //space in pixels from edges of SVG
	var textMargin = 110;
	var padding = 0; //space in pixels between circles
	var biggestFirst = true; //should largest circles be added first?
	
	var width = window.getComputedStyle(svg[0][0])["width"];
	    width = digits.exec(width)[0];
	 //window.getComputedStyle(svg[0][0])["height"];
	    //height = Math.min(digits.exec(height)[0], width);		
	svg.style("height", height);
	
	var maxX = 0;
	dataset.forEach(function(wordEntry){
		wordEntry.forEach(function(entry){
			maxX = Math.max(entry.x, maxX);	
		})
	});	   
	var maxRadius = 5;
		
	var xScale = d3.scale.linear()
	        .domain([0,maxX])
	        .range([margin,width-margin-textMargin]);

	var rScale = d3.scale.sqrt()  
	        //make radius proportional to square root of data r
	        .domain([0,1])
	        .range([1,maxRadius]);	   
	
	var i = 0;
	var entries = dataset.length;
	dataset.forEach(function(wordEntry){
		i++;
		//drawSingleWordCount(dataset[0], i, entries);	
		
		var baselineHeight = axisHeight +  (margin + height)/(entries+1) * i;
			
		var xAxis = d3.svg.axis()
		    .scale(xScale)
		    .orient("bottom")
		    .ticks(3)
		    
		var xAxisPos = margin;
		svg.append("g")
		    .attr("class", "x axis")
		    .attr("transform", "translate(" + textMargin + "," + xAxisPos + ")")
		    .call(xAxis);
		    
		var threads = svg.append("g")
		    .attr("class", "threads");
		
		    
		var bubbleLine = svg.append("g")
		        .attr("class", "bubbles")
		        .attr("transform", 
		              "translate(" + textMargin + "," + baselineHeight + ")");
		    
		    bubbleLine.append("line")
		        .attr("x1", xScale.range()[0])
		        .attr("x2", xScale.range()[1]);
		        
		var textlabel = svg.append("g")
		        .attr("class", "textlabel")
		        .attr("transform", 
		              "translate("+margin+"," + baselineHeight + ")");
		              	        
	
		 textlabel.append("text")
	          .attr("x", 0)
	          .attr("y", 2)
	          .attr("height",30)
	          .attr("width",100)
			  .style("align","right")
	          .style("fill", "black")
	          .text(wordEntry.word);

		    
		//Create Quadtree to manage data conflicts & define functions//
		    
		var quadtree = d3.geom.quadtree()
		        .x(function(d) { return xScale(d.x); }) 
		        .y(0) //constant, they are all on the same line
		        .extent([[xScale(-1),0],[xScale(maxX*1.20),0]]);
		
		var quadroot = quadtree([]);
	          
		var maxR = 0;
		bubbleLine.selectAll("circle")
		    .data(wordEntry)       
		    .enter()
		        .append("circle")
		        .attr("r", function(d){
		            var r=rScale(d.r);
		            maxR = Math.max(r,maxR);
		            return r;})
		        .each(function(d, i) {
		            //for each circle, calculate it's position
		            //then add it to the quadtree
		            //so the following circles will avoid it.
		            
		            //console.log("Bubble " + i);
		            var scaledX = xScale(d.x);            
		            d3.select(this)
		            	.attr("class", d.party)
		            	.attr("fill", d.partycolor)
		                .attr("cx", margin)
		                .transition().duration(600)
		                .attr("cx", scaledX)
		                .attr("cy", calculateOffset(maxR, quadroot, xScale, rScale, padding));	            
		            quadroot.add(d);
		            
		        });	
	});
			
	var legendX = margin;
	var legendItemWidth = 110;
	var currentLegendX = legendX;
	var maxLegendWidth = width-margin-legendItemWidth;
	var legendY = axisHeight + height;
	var legend = svg.append("g")
	  .attr("class", "legend")
	  .attr("x", legendX)
	  .attr("y", legendY)
	  .attr("height", 50)
	  .attr("width", width);

	legend.selectAll('g').data(dataset[0])
      .enter()
      .append('g')
      .each(function(d, i) {
        var g = d3.select(this);
        g.append("circle")
          .attr("cx", legendX + i*legendItemWidth % maxLegendWidth)
          .attr("cy", legendY + Math.floor(i*legendItemWidth/maxLegendWidth)*22)
          .attr("r", 5)
          .style("fill", d.partycolor);
        
        g.append("text")
          .attr("x", legendX + i*legendItemWidth % maxLegendWidth + 15)
          .attr("y", legendY + Math.floor(i*legendItemWidth/maxLegendWidth)*22 +4)
          .attr("height",30)
          .attr("width",100)
          .style("fill", d.partycolor)
          .text(d.partytext);

      });

}

	
	
//http://fiddle.jshell.net/6cW9u/8/
window.onresize=function(){
drawWordCounts(dataset)};

window.onload=function(){
    //D3 program to fit circles of different sizes along a 
    //horizontal dimension, shifting them up and down
    //vertically only as much as is necessary to make
    //them all fit without overlap.
    //By Amelia Bellamy-Royds, in response to 
    //http://stackoverflow.com/questions/20912081/d3-js-circle-packing-along-a-line
    //inspired by
    //http://www.nytimes.com/interactive/2013/05/25/sunday-review/corporate-taxes.html
    //Freely released for any purpose under Creative Commons Attribution licence: http://creativecommons.org/licenses/by/3.0/
    //Author name and link to this page is sufficient attribution.
                
	var radius = 2.7;
    var parties = [
    	{ text:"cdv", label:"CD&V", color:"#F47D2A"},
    	{ text:"groen", label:"Groen", color:"#008379"},
    	{ text:"nva", label:"N-VA", color:"#FFCB00"},
		{ text:"openvld", label:"Open Vld", color:"#0053A1"},
		{ text:"pvda", label:"pvda+", color:"#A03893"},
		{ text:"spa", label:"sp.a", color:"#E20024"},
		{ text:"vlaamsbelang", label:"Vlaams Belang", color:"#431C0D"}
	];

	d3.csv("wordcount.csv", function(data) {
	   data.map(function(d) { 
	   	var word = d["word"];
	   	dataset[word] = [];
	   	dataset[word].word = word;
	   	parties.forEach(function(party) {
		    dataset[word].push({
		    x:Math.round(+d[party.text + ".txt"]),
		    r: radius,
		    party:party.text,
		    partytext:party.label,
		    partycolor:party.color});
		});	   	
	   });
	   console.log(dataset);
	   drawWordCounts(dataset);
	   suggestions = Object.keys(dataset);
	});
}
