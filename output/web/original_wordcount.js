window.onload=function(){
(function() {
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
    
    
//create data array//
var data = [];
var N = 25, i = N;
var randNorm = d3.random.normal(0.5,0.2)
while(i--)data.push({
    x:randNorm(),
    r:Math.random()});
    //x for x-position
    //r for radius; value will be proportional to area  
//________________//
    
//Set up SVG and axis//   
var svg = d3.select("svg");
var digits = /(\d*)/;
var margin = 50; //space in pixels from edges of SVG
var padding = 4; //space in pixels between circles
var maxRadius = 25;
var biggestFirst = true; //should largest circles be added first?

var width = window.getComputedStyle(svg[0][0])["width"];
    width = digits.exec(width)[0];
var height = window.getComputedStyle(svg[0][0])["height"];
    height = Math.min(digits.exec(height)[0], width);
    
var baselineHeight = (margin + height)/2;

var xScale = d3.scale.linear()
        .domain([0,1])
        .range([margin,width-margin]);
var rScale = d3.scale.sqrt()  
        //make radius proportional to square root of data r
        .domain([0,1])
        .range([1,maxRadius]);
    
var formatPercent = d3.format(".0%");

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("top")
    .ticks(5)
    .tickFormat(formatPercent);
    
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + margin + ")")
    .call(xAxis);
    
var threads = svg.append("g")
    .attr("class", "threads");

    
var bubbleLine = svg.append("g")
        .attr("class", "bubbles")
        .attr("transform", 
              "translate(0," + baselineHeight + ")");
    
    bubbleLine.append("line")
        .attr("x1", xScale.range()[0])
        .attr("x2", xScale.range()[1]);
//________________//
    
//Create Quadtree to manage data conflicts & define functions//
    
var quadtree = d3.geom.quadtree()
        .x(function(d) { return xScale(d.x); }) 
        .y(0) //constant, they are all on the same line
        .extent([[xScale(-1),0],[xScale(2),0]]);
    //extent sets the domain for the tree
    //using the format [[minX,minY],[maxX, maxY]]
    //optional if you're adding all the data at once

var quadroot = quadtree([]);
          //create an empty adjacency tree; 
          //the function returns the root node.
    
// Find the all nodes in the tree that overlap a given circle.
// quadroot is the root node of the tree, scaledX and scaledR
//are the position and dimensions of the circle on screen
//maxR is the (scaled) maximum radius of dots that have
//already been positioned.
//This will be most efficient if you add the circles
//starting with the smallest.  
function findNeighbours(root, scaledX, scaledR, maxR) {

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

function calculateOffset(maxR){
    return function(d) {
        neighbours = findNeighbours(quadroot, 
                                   xScale(d.x),
                                   rScale(d.r),
                                   maxR);
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
    
    //Create circles!//
var maxR = 0;
bubbleLine.selectAll("circle")
    .data(data)       
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
                .attr("cx", scaledX)
                .attr("cy", -baselineHeight + margin)
                .transition().duration(600)
                .attr("cy", calculateOffset(maxR));
            quadroot.add(d);
            
            bubbleLine.append("text")
                .attr("x", scaledX)
                .attr("y", d.offset)
                .text(i);           
        });
    
    
})();

}