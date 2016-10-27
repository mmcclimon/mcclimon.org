// a whole bunch of stuff to support the fancy presentation page

// allows page to remember your current slide, if you reload within three minutes
function setCookie(slider_pos) {
	var exdate = new Date();
	exdate.setTime(exdate.getTime() + (1000 * 60 * 3));
	var c_value = escape(slider_pos) + "; expires=" + exdate.toUTCString();
	document.cookie = 'slider_pos=' + c_value;
}

function getCookie() {
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++) {
	  x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
	  y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
	  x=x.replace(/^\s+|\s+$/g,"");
	  if (x=='slider_pos'){
	 	return unescape(y);
	  }
	}
	return false;
}

// functions to move slider left and right via keyboard
function leftClick() {
	if ($("#slider").slider("value") != 0) {
        $("#slider").slider("value", $("#slider").slider("value") - 1);
	}
}

function rightClick() {
	if ($("#slider").slider("value") != $("#examples").find("div").length - 1) {
        $("#slider").slider("value", $("#slider").slider("value") + 1);
	}
}

$(document).ready(function() {
    
    // make all the flats pretty
	$(".flat").html('<img border="0" src="exx/flat.png" style="align: text-top; margin: 0">');
 
    // populate a list of examples for shortcut nav
	var divs = $("#examples div");
	for (var i=0; i < divs.length; ++i) {
		var thisHref = "ex" + i;
		var $thisDiv = $(divs[i]);
		if ($thisDiv.hasClass("dupe")) { continue; }
		var thisText = $thisDiv.find("p").html();
		$("#examplelist").append('<li><a id="' + thisHref + '"href="#" class="navLink">' + thisText +'</li>');
	}

	// hide the example list and show it on hover
	$exampleList = $("#examplelist");
	$exampleList.hide();
	$("#exampleNav").hover(
		function() { $exampleList.stop(); $exampleList.slideDown(); },
		function() { $exampleList.stop(); $exampleList.slideUp(); }
	);
 
    
    // set up the slider
    $("#slider").slider({
        min: 0,
        max: $("#examples").find("div").length - 1,
        change: function(event, ui) {
            $("#contentsPane").html($("#examples").find("div").eq(ui.value).html());
			setCookie($("#slider").slider("value"));
        }
    });

    // if we have a cookie, set the slider position accordingly; otherwise start at the beginning
	var slider_pos = getCookie();
	if (! slider_pos) { slider_pos == 0; }
    $("#slider").slider("value", slider_pos);
 
    // slider handlers, for visual links and keyboard events
    $("#navLeft").click(function() { leftClick(); return false; });
    $("#navRight").click(function() { rightClick(); return false; });
    
    $(".navLink").click(function() {
		var val = event.target.id.substring(2, 5)
		$("#slider").slider("value", $("#slider").value = val);
		return false;
	});
    
	$(window).keydown(function() {
		switch (event.which) {
			case 37:			// left arrow
			case 66:			// 'b'
				//console.log('left arrow pressed!');
				leftClick();
				break;		
			case 39:			// right arrow
			case 78:			// 'n'
				//console.log('right arrow pressed!');
				rightClick();
				break;
			
			default:
				// nothing
		}
	});
	

	


});