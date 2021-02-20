(function($) {
//--- jQuery No Conflict

//Global Variables
var ajax_url = '/wp-content/plugins/sticker_print/ajax_php/';

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

  dropzone_settings();

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

  //Adjust Canvas
  adjust_canvas();
  $(window).on('resize', function(){
    adjust_canvas();
  });

  function adjust_canvas(){
    let win = $(this); //this = window

      width = $('#sb_sticker_area').width();
      if (width >= 800) { width=800 }
      let height = width*1.41;

      $('#sticker_canvas').css('width',width+'px');
      $('#sticker_canvas').css('height',height+'px');
  }
}



/**
 * 
 * Dropzone settings
 */
function dropzone_settings(){
  
  $(".sticker_image_dropzone").dropzone({ 
    url: ajax_url+"file_upload.php",
    createImageThumbnails: false,
    resizeQuality: 1,
    maxFiles: 1,
    acceptedFiles: 'image/*',
    //capture: 'image/*',
    dragenter: drag_enter,
    dragleave: drag_left,
    dragend: drag_ended,
    renameFile: function(e){
      return e.name = Date.now()+'_'+e.name;
    },
    complete: upload_complete,
  });

  function drag_enter(){
    let element = $(this)[0].element;
    $(element).closest('.sticker_outer').addClass('image_in_dropzone');
  }

  function drag_left(){
    let element = $(this)[0].element;
    $(element).closest('.sticker_outer').removeClass('image_in_dropzone');
  }

  function drag_ended(){
    $('.sticker_outer').each(function(){
      $(this).removeClass('image_in_dropzone');
    });
  }

  function upload_complete(e){
    console.log(e);
    if (e.status=="success"){
      $(e.previewElement).closest('.sticker_outer').removeClass('image_in_dropzone');
      $(e.previewElement).closest('.sticker_outer').addClass('image_uploaded');
      $(e.previewElement).closest('.sticker_outer').find('.sn_image')
        .attr('src',window.plugin_url+'assets/images/'+e.upload.filename);
    }
    
    reset_image_set_ui_functions(e);
    this.removeAllFiles(true); 
  }

  function reset_image_set_ui_functions(e){

    $(e.previewElement).closest('.sticker_set').find('.sticker_set_controls .sbcs_remove').off().on('click', function(){
      $(this).closest('.sticker_set').find('.sticker_outer').removeClass('image_uploaded');
      $(this).closest('.sticker_set').find('.sticker_outer').removeClass('image_in_dropzone');
      $(this).closest('.sticker_set').find('.sn_image').attr('src','');
      $(this).closest('.sticker_set').find('.dz-preview').remove();    
    });
  }



}
//--- jQuery No Conflict
})(jQuery);