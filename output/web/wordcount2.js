

function drawWordCounts(dataset){

/*
	var example = [dataset["besparen"], dataset["investeren"]];
	drawWordCountSet(example, "#differences");
	
	var example = [dataset["ondernemers"], dataset["werkgevers"], dataset["werknemers"], dataset["burgers"]];
	drawWordCountSet(example, "#economics");
	
	var example = [dataset["moeten"], dataset["willen"], dataset["geven"], dataset["nemen"]]; 
	//var example = [dataset["staatshervorming"], dataset["vooruitgang"]];
	//var example = [dataset["lastenverlaging"], dataset["besparen"], dataset["investeren"]];
	//var example = [dataset["milieu"]];
	drawWordCountSet(example, "#actions");
	
	var example = [dataset["europa"], dataset["belgie"], dataset["vlaanderen"]];	
	drawWordCountSet(example, "#geography");
*/

	
	drawUserInput();
}


function split( val ) {
      return val.split( /,\s*/ );
}

function extractLast( term ) {
      return split( term ).pop();
}
 
    
function loadAutoComplete(dataset){
	var suggestions = Object.keys(dataset);
    
    $( "#userInput1" )
      .autocomplete({
        minLength: 0,
        source: function( request, response ) {
          // delegate back to autocomplete, but extract the last term
          response( $.ui.autocomplete.filter(
            suggestions, extractLast( request.term ) ).slice(1,10) );
        },
        focus: function() {
          // prevent value inserted on focus
          return false;
        },
        select: function( event, ui ) {
          var terms = split( this.value );
          // remove the current input
          terms.pop();
          // add the selected item
          terms.push( ui.item.value );
          // add placeholder to get the comma-and-space at the end
          terms.push( "" );
          this.value = terms.join( ", " );
          return false;
        }
      });
      
      $("#userInput1").keyup(function(ev) {
		    // 13 is ENTER
		    if (ev.which === 13) {
		      userInputChanged();
			}
	  });
}

(function($) {
    $.fn.goTo = function() {
        $('html, body').animate({
            scrollTop: $(this).offset().top + 'px'
        }, 'fast');
        return this; // for chaining...
    }
})(jQuery);

function userInputChanged()
{
	drawUserInput();
	$('#logo').html("");
	$('#text').html("");
	$('#text').hide();
	var userword1 = d3.select("#userInput1")[0][0].value;
	ga('send', 'event', 'search', 'start', 'search words', userword1);
	
}

function drawUserInput()
{
	var userword1 = d3.select("#userInput1")[0][0].value.toLowerCase();
	var userWords = split( userword1 );
	
	var entries = [];
	userWords.forEach(function(word){	
		word = word.replace(/^\s+/, '').replace(/\s+$/, '');
		if(word == "") return;	
		var entry = dataset[word];
		if(entry == undefined)
		{
			entry = [];
			entry.word = word;		
		}
		entries.push(entry);
	});
	drawWordCountSet(entries, "#user");
}

function exportToPng()
{
	var $container = $('#user'),
        // Canvg requires trimmed content
        content = $container.html().trim(),
        canvas = document.getElementById('svg-canvas');

    // Draw svg on canvas
    canvg(canvas, content);

    // Change img be SVG representation
    var theImage = canvas.toDataURL('image/png');
    $('#svg-img').attr('src', theImage);
}

var dataset = [];
var suggestions = [];
var parties = [
    	{ text:"cdv", label:"CD&V", color:"#F47D2A", position: 4, logo:"img/cdv.jpg", programme:"txt/cdv.txt.csv"},
    	{ text:"groen", label:"Groen", color:"#008379", position: 2, logo:"img/groen.jpg", programme:"txt/groen.txt.csv"},
    	{ text:"nva", label:"N-VA", color:"#FFCB00", position: 6, logo:"img/nva.png", programme:"txt/nva.txt.csv"},
		{ text:"openvld", label:"Open Vld", color:"#0053A1", position: 5, logo:"img/openvld.png", programme:"txt/openvld.txt.csv"},
		{ text:"pvda", label:"pvda+", color:"#E52F2C", position: 1, logo:"img/pvda.jpg", programme:"txt/pvda.txt.csv"},
		{ text:"spa", label:"sp.a", color:"#E20024", position: 3, logo:"img/spa.png", programme:"txt/spa.txt.csv"},
		{ text:"vlaamsbelang", label:"Vlaams Belang", color:"#431C0D", position: 7, logo:"img/vlaamsbelang.jpg", programme:"txt/vlaamsbelang.txt.csv"}
	];
	
var partyTexts = [];
partyTexts["cdv"] = "";
partyTexts["groen"] = "";
partyTexts["nva"] = "";
partyTexts["openvld"] = "";
partyTexts["pvda"] = "";
partyTexts["spa"] = "";
partyTexts["vlaamsbelang"] = "";

  
function drawWordCountSet(dataset, div){
	if(dataset == undefined) return;
	
	var logoHeight = 60;
	var legendHeight = 50;
	var height = dataset.length*65;
	var totalHeight = logoHeight +height+legendHeight;
	var width = "600px";
	d3.select(div).selectAll("*").remove();
	var div = d3.select(div);
	var svg = div.append("svg").style("width", width).style("height",totalHeight).attr("width", width).attr("height",totalHeight);
	
	var digits = /(\d*)/;
	var margin = 20; //space in pixels from edges of SVG
	var textMargin = 70;
	var padding = 0; //space in pixels between circles
	var biggestFirst = true; //should largest circles be added first?
	
	var width = window.getComputedStyle(svg[0][0])["width"];
	    width = digits.exec(width)[0];
	var partyWidth = (width-2*margin-textMargin-20)/parties.length;
	 //window.getComputedStyle(svg[0][0])["height"];
	    //height = Math.min(digits.exec(height)[0], width);		
	    
	
	var maxR = 0;
	dataset.forEach(function(wordEntry){
		wordEntry.forEach(function(entry){
			maxR = Math.max(entry.x, maxR);	
		})
	});	   
	var maxRadius = 25;
	if(maxR == NaN) maxR = maxRadius;
		
	var rScale = d3.scale.sqrt()  
	        //make radius proportional to square root of data r
	        .domain([0,maxR])
	        .range([0,maxRadius]);	   
	
	var i = 0;
	var entries = dataset.length;
	
	var imagesPosition = totalHeight - logoHeight*0.75;
	var partyImages =  svg.append("g")
		        .attr("class", "partyimages")
		        .attr("transform", 
		              "translate("+textMargin+"," +  margin + ")");
		              
	partyImages.selectAll("image")
	    .data(parties)       
	    .enter()             
		.append("image")
        .attr("width", partyWidth*0.80)
        .attr("height", 40)       
        .each(function(d, i) {                        
            var cx =  d.position * partyWidth ;
            //console.log("Bubble " + i);
            d3.select(this)
            	.attr("xlink:href", d.logo)
            	.attr("class", d.party)
            	.attr("fill", d.partycolor)
                //.attr("cx", margin)
                //.transition().duration(600)
                .attr("transform",  "translate("+cx+"," + 0 + ")")                       
        });	
                 
	dataset.forEach(function(wordEntry){
		i++;
		//drawSingleWordCount(dataset[0], i, entries);	
		
		var baselineHeight = logoHeight +  (margin + height)/(entries+1) * i;
			
		
		              
				    
		var bubbleLine = svg.append("g")
		        .attr("class", "bubbles")
		        .attr("transform", 
		              "translate(" + textMargin + "," + baselineHeight + ")");
		    
		        
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
                     
		bubbleLine.selectAll("circle")
		    .data(wordEntry)       
		    .enter()
		        .append("circle")
		        .attr("r", 0)
		        .transition().duration(600)
		        .attr("r", function(d){
		            var r=rScale(d.x);		           
		            return r;})
		        .each(function(d, i) {
		            //for each circle, calculate it's position
		            //then add it to the quadtree
		            //so the following circles will avoid it.
		            
		            var cx = margin + d.partyposition * partyWidth + 10;
		            //console.log("Bubble " + i);
		            d3.select(this)
		            	.on("click", function(d){readProgramme(d.partyobj, wordEntry.word)})
		            	.style('cursor','pointer')
		            	.attr("class", d.party)
		            	.attr("fill", d.partycolor)
		                //.attr("cx", margin)
		                //.transition().duration(600)
		                .attr("cx", cx)
		                .attr("cy", 0);	 
		                
		          
		            
		        });	
	});			
}

function extractAndHighlightRegex(text, word)
{
		
		var regExp = new RegExp('(\\W)?('+word+')(\\W)?', 'gi');  // regex pattern string
		var quoteRegExp = new RegExp('([a-z]+)\'|\’([a-z]+)', 'gi');  // regex pattern string
		var result = "...<br /><br />";
		var res = text.replace(quoteRegExp, '$1$2').split("\n\n");
		res.forEach(function(entry){
			if(entry.match(regExp) != null){
				result += entry + "<br /><br />...<br /><br />";
			}			
		});
		result = result.replace(regExp, '$1<span class="highlight">$2</span>$3');
		$("#text").html(result);
		$('#text').show();
}
	
function readProgramme(party, word)
{
	$("#text").html("Loading...");
	if(partyTexts[party.text]==""){
		d3.xhr(party.programme, "text/plain", function(data){
			extractAndHighlightRegex(data.responseText, word);
			partyTexts[party.text] = data.responseText;
		});
	}
	else{
		extractAndHighlightRegex(partyTexts[party.text], word);
	}
	$("#logo").html('<img src="' + party.logo +'" style="width: 80px">');
	$('#logo').goTo();
	ga('send', 'event', 'read', 'start', 'read text', party + ": " + word);
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
		    partycolor:party.color,
		    partyposition:party.position,
		    partyobj:party});
		});	   	
	   });
	   drawWordCounts(dataset);
	   loadAutoComplete(dataset);
	   $('#text').hide();
	});
}
