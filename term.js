var buffer = "";
var interpreter = new Interpreter();

document.onkeydown = function(e) {
    if ((e.which == 8 || e.keyCode == 8) && buffer.length > 0) {
	buffer = buffer.substr(0, buffer.length - 1);
    }
    $("#prompt").html(">> " + buffer);
}

document.onkeypress = function(e) {
    if (e.which != 8 && e.which != 13) {
	buffer += String.fromCharCode(e.which);
	$("#prompt").html(">> " + buffer);
    }
    else if (e.which != 8) {
	$("#version").append("<br><span>    >> " + buffer + "</span>");
	try {
	    $("#version").append("<br><span>    " + interpreter.input(buffer) + "</span>");
	}
	catch (e) {	    
	    $("#version").append("<br><span>    " + e + "</span>");
	}
	buffer = "";
	$("#prompt").html(">> " + buffer);
    }
}

$(document).ready(function() {
    setInterval("toggleCursorBlink()", 1100);
});

function toggleCursorBlink() {
    $("#cursor").animate({
	opacity: 0
    }, "fast", "swing").animate({
	opacity: 1
    }, "fast", "swing");
}
