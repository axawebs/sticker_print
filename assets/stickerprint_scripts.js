(function($) {
//--- jQuery No Conflict

//Global Variables
var ajax_url = '/wp-content/plugins/flight_booking/ajax_php/';

/**
 * 
 * 
 * 
 * 
 * 
 * Execute functions on DOM ready
 * 
 */

$(document).ready(function() {
  console.log('StickerPrint Shortcode JavaScripts Loaded');

  //UI Settings
  ui_settings();

});




/**
 * 
 * 
 *  UI Settings
 */   
function ui_settings(){

  $('#open_sidebar').on('click', function(){
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
  });

  $('#close_sidebar').on('click', function(){
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
  });
}

//--- jQuery No Conflict
})(jQuery);