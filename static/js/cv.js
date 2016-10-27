$(document).ready(function() {
	
	$('.clickable, #expander').prepend("<span class='mono'>[+] </span>");
	$('.clickable').next('div').hide().addClass('data');
	$('.clickable, #expander').hover(function() {$(this).css('cursor', 'pointer');});

	var numExpanded = 0;

	$('.clickable').toggle(
		function() {
			$(this).addClass('expanded');
			numExpanded++;
			
			$(this).next('div').slideDown(300, 'linear');
			$(this).find('span').html("[-] ");
		}, //end toggle on
		function() {
			$(this).removeClass('expanded');
			numExpanded--;
			$(this).next('div').slideUp(300, 'linear');
			$(this).find('span').html("[+] "); 
		} //end toggle off
	); // end clickable toggle
	
	$('.clickable').click(function() {
		//console.log(this + ": " + numExpanded);
		if (numExpanded === 0 ) {
			$('#expander').removeClass('on');
			$('#expander').html('<span class="mono">[+] </span>Expand all');
		}
		else if (numExpanded > 0) {
			$('#expander').addClass('on');
			$('#expander').html('<span class="mono">[-] </span>Collapse all');
		}
	}); // end click


// Expand/Collapse All code
	
	$('#expander').click(function() {
		if ($(this).hasClass('on')) {
			//code to collapse all
			$(this).removeClass('on');
			$('.clickable').each(function() {
				if ( $(this).hasClass('expanded')) {
					$(this).click();
				}
			}); // end each
			
		} else {
			//code to expand all
			$('.clickable').each(function() {
				if (! $(this).hasClass('expanded')) {
					$(this).click();
				}
			}); //end each

		}

	}); // end expander click

}); // end ready

