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
  console.log('StickerPrint Shortcode JavaScripts Loaded V1.23');

  ajax_url = window.plugin_url + 'ajax_php';
  console.log('ajax_url:'+ajax_url);

  //UI Settings
  ui_settings();

  dropzone_settings();

  print_sticker();

});




/**
 * 
 * 
 *  UI Settings
 */   
function ui_settings(){

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

      $('#sticker_canvas, #sticker_area_controls').css('width',width+'px');
      $('#sticker_canvas').css('height',height+'px');
  }
}


function error_message(title,body){
  $('#error_message .modal-title').html(title);
  $('#error_message .modal-body').html('<p>'+body+'</p>');
  $('#error_message').modal('show');

}


/**
 * 
 * Dropzone settings
 */
function dropzone_settings(){
  
  $(".sticker_image_dropzone").dropzone({ 
    url: ajax_url+"/file_upload.php",
    createImageThumbnails: false,
    resizeQuality: 1,
    maxFiles: 1,
    acceptedFiles: '.heic, image/*',
    //capture: 'image/*',
    dragenter: drag_enter,
    dragleave: drag_left,
    dragend: drag_ended,
    renameFile: function(e){
      let extension = e.name.substr( (e.name.lastIndexOf('.') +1) );
      return e.name = 'sp'+Date.now()+'.'+extension;
    },
    uploadprogress: log_progress,
    complete: upload_complete,
    timeout: 240000,
    clickable: true,
  });

  $('.sticker_image_dropzone').on('touchstart', function(){
    $(this).trigger('click');
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

  function log_progress(e, progress){
    if (progress>0 && progress<100){
      let progress_new = Math.round(progress);
      $(e.previewElement).closest('.sticker_image_dropzone').find('.progress_handle').show();
      $(e.previewElement).closest('.sticker_image_dropzone').find('.progress_bar_percent').html(progress_new+' %');
      $(e.previewElement).closest('.sticker_image_dropzone').find('.progress_bar_inner').css('width',progress_new+'%');
    }
  }

  function upload_complete(e){
    console.log(e);
    if (e.status=="success"){
      $(e.previewElement).closest('.sticker_outer').removeClass('image_in_dropzone');
      $(e.previewElement).closest('.sticker_outer').addClass('image_uploaded');
      $(e.previewElement).closest('.sticker_set').addClass('image_attached');

      
      let image_url = window.plugin_url+'/assets/images/'+e.upload.filename;
      
      set_image(e, image_url);
      
    }else if(e.status=="error"){
      error_message('File upload error',"Server rejected file upload. :(")
    }


    $(e.previewElement).parent().closest('.sticker_image_dropzone').find('.progress_handle').hide();
    reset_image_set_ui_functions(e.previewElement);
    this.removeAllFiles(true); 
  }

  
  function set_image(e, image_url){
    console.log('setting image:');
    console.log("url:" + image_url);
    console.log(e);

    //Formatting heics
    let image_extension = e.upload.filename.substr( (e.upload.filename.lastIndexOf('.') +1) );
    image_extension = image_extension.toLowerCase();

    if (image_extension=='heic'){
      console.log('Converting .heic to .jpg');

      fetch(image_url)
      .then((res) => res.blob())
      .then((blob) => heic2any({
        blob,
        toType: "image/jpeg",
        quality: 1,
      }))
      .then((conversionResult) => {
        let blob_url = URL.createObjectURL(conversionResult);
        $(e.previewCox).closest('.sticker_outer').find('.sn_image').remove();
        $(e.previewCox).closest('.sticker_outer').find('.sticker_image_holder').append(`<img class="sn_image xxx" src="${blob_url}" />`)
      })
      .catch((e) => {
        console.log(e);
        error_message('Image conversion error!',"Couldn't convert .heic file to .jpg . :(");
      });

    }else{
      $(e.previewElement).closest('.sticker_outer').find('.sn_image').remove();
      $(e.previewElement).closest('.sticker_outer').find('.sticker_image_holder').append(`<img class="sn_image xxx" src="${image_url}" />`)
    }
  }



  function reset_image_set_ui_functions(e){

    // If remove button clicked
    let sticker_set = $(e).closest('.sticker_set');


    //If remove Clicked
    sticker_set.find('.sticker_set_controls .sbcs_remove').off().on('click', function(){
      sticker_set.removeClass('image_attached');

      sticker_set.find('.sticker_outer').removeClass('image_uploaded');
      sticker_set.find('.sticker_outer').removeClass('image_in_dropzone');
      sticker_set.find('.sticker_set').removeClass('image_on_edit');
      sticker_set.find('.sticker_set').removeClass('image_on_edit_resize');
      sticker_set.find('.sticker_set').removeClass('image_on_edit_move');
      sticker_set.find('.sticker_set').removeClass('image_on_edit_rotate');
      
      sticker_set.find('.dz-preview').remove();
      sticker_set.children('.ui-wrapper').remove();
      sticker_set.find('.sn_image').remove();
      sticker_set.find('.sticker_image_holder').html('<img class="sn_image"/>');

      if ( sticker_set.find('.sticker_outer .sn_image').hasClass('ui-resizable') ){
        sticker_set.find('.sticker_outer .sn_image').resizable('destroy');
      }

      if ( sticker_set.find('.sticker_outer .sn_image').parent().hasClass('ui-draggable') ){
        sticker_set.find('.sticker_outer .sn_image').parent().draggable('destroy');
      }

    });





    // If resize clicked
    $(e).closest('.sticker_set').find('.sticker_set_controls .sbcs_resize').off().on('click', function(){
      if ( $(this).closest('.sticker_set').find('.sticker_outer').hasClass('image_uploaded') ){
        $(this).closest('.sticker_set').addClass('image_on_edit');
        $(this).closest('.sticker_set').addClass('image_on_edit_resize');
        let resize = $(this).closest('.sticker_set').find('.sn_image');
        resize.resizable({
          handles: 'ne, se, sw, nw',
        });
        resize.parent().parent().css( 'pointer-events','auto' );
        resize.parent().css( 'pointer-events','auto' );
        resize.closest('.sticker_image_holder').append('<button class="btn btn-success sn_edit_done"><i class="fa fa-check"></i> Done</button>');

        // done editing
        resize.closest('.sticker_image_holder').find('.sn_edit_done').off().on('click touchstart',function(){
          console.log('resize done editing');
          $(this).closest('.sticker_set').removeClass('image_on_edit');
          $(this).closest('.sticker_set').removeClass('image_on_edit_resize');
          $(this).remove();
          resize.parent().css( 'pointer-events','none' );

          //let parent_styles = resize.parent().attr('style');
          //resize.attr('style', parent_styles);
          resize.resizable('destroy');
        });
      }
    });
  // / Resize




    // If move clicked
    $(e).closest('.sticker_set').find('.sticker_set_controls .sbcs_move').off().on('click', function(){

      if ( $(this).closest('.sticker_set').find('.sticker_outer').hasClass('image_uploaded') ){

        $(this).closest('.sticker_set').addClass('image_on_edit');
        $(this).closest('.sticker_set').addClass('image_on_edit_move');
        let mover = $(this).closest('.sticker_set').find('.sn_image');

        mover.draggable({
            stack: "div",
            disabled: false,

            /*
            cursorAt: {
              left: 0,
              top: 0
            }
            */
        });
        mover.parent().css( 'pointer-events','auto' );
        mover.parent().append('<button class="btn btn-success sn_edit_done"><i class="fa fa-check"></i> Done</button>');


        // done editing
        mover.parent().parent().find('.sn_edit_done').off().on('click touchstart',function(){
          $(this).closest('.sticker_set').removeClass('image_on_edit');
          $(this).closest('.sticker_set').removeClass('image_on_edit_move');
          $(this).remove();
          mover.parent().css( 'pointer-events','none' );
          mover.draggable('destroy');
          $( ".sticker_outer" ).droppable('destroy');
        });


        //On draggable dropped to droppable
        $( ".sticker_outer" ).droppable({
          
          hoverClass: "drop_hover",
          tolerance: "pointer",
          
          drop: function( event, ui ) {
            if ( !$(this).closest('.sticker_set').hasClass('image_on_edit_move') ){

              console.log(ui);
              
              let image_src = $(ui.draggable).attr('src');

              // Draggable UI reset as if remove button clicked
              $(ui.draggable).closest('.sticker_set').find('.sticker_outer').removeClass('image_uploaded');
              $(ui.draggable).closest('.sticker_set').find('.sticker_outer').removeClass('image_in_dropzone');
              $(ui.draggable).closest('.sticker_set').removeClass('image_attached');


              console.log('droppble src:'+$(this).find('.sn_image').attr( 'src') );

              /*
              if ( typeof ( $(this).find('.sn_image').attr( 'src') ) !== 'undefined' && $(this).find('.sn_image').attr( 'src') != ''){
                $(ui.draggable).closest('.sticker_set').find('.sn_image').attr('src',$(this).find('.sn_image').attr( 'src'));
                $(ui.draggable).closest('.sticker_set').find('.sn_image').attr('style','');
                $(ui.draggable).closest('.sticker_set').find('.sticker_outer').addClass('image_uploaded');
                $(ui.draggable).closest('.sticker_set').addClass('image_attached');
              }else{
                */
                $(ui.draggable).closest('.sticker_set').find('.sn_image').attr('src','');
                /*
              }
              */
              $(ui.draggable).closest('.sticker_set').find('.dz-preview').remove();

              // Draggable specific UI reset
                $(ui.draggable).closest('.sticker_set').removeClass('image_on_edit');
                $(ui.draggable).closest('.sticker_set').removeClass('image_on_edit_move');
                $(ui.draggable).closest('.sticker_set').find('.sn_edit_done').remove();
                $(ui.draggable).css( 'pointer-events','none' );
                $(ui.draggable).attr( 'style','none' );
                $(ui.draggable).parent().attr( 'style','none' );

                $(ui.draggable).css({
                  /*
                  'left': $(ui.draggable).closest('.sticker_set').find('.sticker_image_holder').css('left'),
                  'top': $(ui.draggable).closest('.sticker_set').find('.sticker_image_holder').css('top'),
                  'width':$(ui.draggable).closest('.sticker_set').find('.sticker_image_holder').css('width'),
                  'height':$(ui.draggable).closest('.sticker_set').find('.sticker_image_holder').css('height'),
                  */
                });
                $(ui.draggable).draggable( "destroy" );
                

                // Droppable ui set
                console.log ( image_src );

                $(this).find('.sn_image').attr( 'src',image_src );
                $(this).find('.sn_image').attr( 'style','' );
                $(this).closest('.sticker_outer').removeClass('image_in_dropzone');
                $(this).closest('.sticker_set').addClass('image_attached');
                $(this).closest('.sticker_set').removeClass('image_on_edit_move');
                $(this).closest('.sticker_set').removeClass('image_on_edit_resize');
                $(this).closest('.sticker_outer').addClass('image_uploaded');
                $(this).closest('.sticker_image_dropzone').find('.progress_handle').hide();
                reset_image_set_ui_functions( $(this) );
            }
          },
          
        });

      }

    });
    // / Move
    



    // If rotate  clicked
    $(e).closest('.sticker_set').find('.sticker_set_controls .sbcs_rotate').off().on('click', function(){

      if ( $(this).closest('.sticker_set').find('.sticker_outer').hasClass('image_uploaded') ){

        $(this).closest('.sticker_set').addClass('image_on_edit');
        $(this).closest('.sticker_set').addClass('image_on_edit_rotate');

        //Clear rotation
        let current_rotation = $(this).closest('.sticker_set').find('.sn_image').css("transform");
        $(this).closest('.sticker_set').find('.sn_image').css("transform",'');

        let rotator_html = $(this).closest('.sticker_set').find('.sticker_image_holder').html();
        $(this).closest('.sticker_set').find('.sticker_image_holder').html('<div class="rotate_wrapper" style="transform:'+current_rotation+'">'+rotator_html+'</div>');
        let rotator = $(this).closest('.sticker_set').find('.rotate_wrapper');

        rotator.parent().css( 'pointer-events','auto' );
        rotator.parent().append('<button class="btn btn-success sn_edit_done"><i class="fa fa-check"></i> Done</button>');


        // done editing
        rotator.parent().parent().find('.sn_edit_done').off().on('click touchstart',function(){
         
          rotator.parent().css( 'pointer-events','none' );
          
          let rotate_style = rotator.attr('style');
          //---
          rotator.find('.sn_image').css('transform','');
         // let image_style = rotator.find('.sn_image').attr('style');
          console.log('rotate css'+rotate_style);
          
          let image_styles = rotator.find('.sn_image').attr('style') ;
          if (typeof image_styles === 'undefined'){
            image_styles = '';
          }
          rotator.find('.sn_image').attr('style', image_styles + ' ' + rotate_style );
          let image_clone = rotator.find('.sn_image').clone();

          console.log(image_clone);

          rotator.parent().append(image_clone);
          rotator.rotatable('destroy');
          rotator.remove();

          $(this).closest('.sticker_set').removeClass('image_on_edit');
          $(this).closest('.sticker_set').removeClass('image_on_edit_rotate');
          $(this).remove();
        });

        rotator.rotatable({
          handle:'rotatehandle',    
          handleOffset: {   
                top: 0,
                right: 0
              },
            
        });
      }

    });


    

  }
}

/**
 * 
 * 
 * Modal Message
 */

function modal_msg(title, mbody){
  if (typeof title === 'undefined' && title == ''){
    title = "Preparing Print"
  }

  $('#printing_message .modal-title').html(title);

  if (typeof mbody === 'undefined' && mbody == ''){
    mbody = "<p>Please wait while print ready PDF file is prepared. It might take upto a few minutes depending on the size and resolution of the  images uploaded. <br></p>"  
  }
  $('#printing_message .modal-body').html(mbody);


  $('#printing_message').modal('show');
}


 /**
   * 
   * 
   * Print Sticker
   * 
   */
  function print_sticker(){

    $('.sbcs_print_sticker').on('click', function(){


      modal_msg();

      for (i=0; i<10; i++){
        let source_image = $('#sb_sticker_area .sticker_image_holder').eq(i).find('.sn_image');

        if ( typeof source_image.attr('src') === 'undefined' || source_image.attr('src')=='' ){
         // modal_msg('Please add stickers',);
         console.log('skipping undefined image src for sn_image:'+i)
          continue;
        }
      
        $('#print_canvas .print_section').eq(i).find('.print_sn_image').remove();
        $('#print_canvas .print_section').eq(i).find('.print_image_holder').append('<img src="'+source_image.attr('src')+'" style="'+source_image.attr('style')+ 'position:relative;" class="print_sn_image" id="sn_print_img'+i+'" />');
        $('#print_canvas .print_section').eq(i).find('.print_image_holder .print_sn_image').css({
          'zoom':'',
          'resize':'',
        });
        $('#print_canvas .print_section').eq(i).find('.print_sn_image').load(function(){
          modify_print_image_styles(source_image, $('#print_canvas .print_section').eq(i).find('.print_sn_image') );
        });
      }


      /**
       * 
       * Convert individual image to mini canvasas ( Rasterizing each image )
       */
      let image_element = 0;
      function convert_individual_pringimg_to_canvas(){
        let current_image = document.getElementById('print_imgid_'+image_element);
        let temp_element = $('<div style="top:100%; width:1230.08px; height:685.41px; position:absolute; overflow:scroll;" id="temp_div"></div>');
        temp_element.append( $(current_image).parent().html() );
        temp_element.find('.print_image_holder').css({
          'width':'100% !important',
          'height':'100% !important',
          'position':'absolute'
        });
        $('#hidden_canvas').append(temp_element);

        
        html2canvas( document.getElementById('temp_div').getElementsByClassName('print_image_holder')[0], {
          //dpi: 300, // Set to 300 DPI
          //scale: 1, // Adjusts your resolution
          //allowTaint: true,
          logging: true,
          width:1230.08,
          height:685.412,
          //useCORS:true,
          //windowWidth:1230.08,
          //windowHeight:685.412,
          //letterRendering: 1,
          scrollX:0,
          scrollY:0,
          imageTimeout:0
        }).then(function(canvas){
          console.log('canvas image rendered for imageid: '+image_element);
          let img = canvas.toDataURL("image/jpeg", 1);
          $('#print_imgid_'+image_element).find('.print_sn_image').remove();
          $('#print_imgid_'+image_element).css({
              'background-image':'url('+img+')',
              'background-size':'contain'
          });

          if(image_element>=9){
            generate_output_pdf();
          }else{
            image_element++;
           // convert_individual_pringimg_to_canvas();
          }
        }); 
      }
      convert_individual_pringimg_to_canvas();
      //generate_output_pdf();
      


      function modify_print_image_styles(source_image, on_image){
        
        if ( typeof source_image.attr('src') !== 'undefined' && source_image.attr('src') != ''  ){
          //Size calculations
          let ratio = on_image.parent().width()/source_image.parent().width();

          
          let original_sni_width = source_image.width();
          let original_sni_height = source_image.height();
          let original_sni_position = source_image.position();
          let sni_aspectRatio = source_image.width() / source_image.height();

          let new_sni_width = source_image.width() * ratio;
          let new_sni_height = new_sni_width / sni_aspectRatio;

          on_image.css('width', new_sni_width+"px");
          on_image.css('max-width', new_sni_width+"px");
          on_image.css('height', new_sni_height+"px");
          on_image.css('max-width', new_sni_width+"px");


          let new_top = original_sni_position.top * ratio;
          let new_left = original_sni_position.left * ratio;

          on_image.css('top', new_top+"px");
          on_image.css('left', new_left+"px");

          console.log('--------------------- Image Scaling Started ------------------');
          console.log('width & height ratio:'+ratio);
          console.log('original sni width & height:'+original_sni_width+" &"+original_sni_height);
          console.log('New sni width & height:'+new_sni_width+" &"+new_sni_height);
          console.log('original sni Position:');
          console.log(original_sni_position);
          console.log('New sni Position:');
          console.log( on_image.position() );
          console.log('--------------------- Image Scaling Finished for image ------------------');
        }
      }
      

      function generate_output_pdf(){
        var w = 2480;
        var h = 2480*1.41;
        
        
        html2canvas(document.getElementById('print_canvas'), {
          dpi: 300, // Set to 300 DPI
          scale: 1, // Adjusts your resolution
          //allowTaint: true,
          logging: true,
          width:2480,
          height:3497,
          //useCORS:true,
          windowWidth:2480,
          windowHeight:3497,
          //letterRendering: 1,
          //scrollX:0,
          //scrollY:0,
          imageTimeout:0
        }).then(function(canvas){
          console.log('canvas image rendered');
          var img = canvas.toDataURL("image/jpeg", 1);
          $('body').append('<img src="'+img+'" style="position:absolute; top:200vw; width:100%;" />');

          var doc = new jsPDF('p', 'mm', [210, 297]);
          doc.addImage(img, 'png', 20, 22, 170, 253);
          doc.save('stricker_print.pdf'); 

          $('#printing_message').modal('hide');
        }); 
        

      }
      
    });


    $('.sbcs_download_sticker').on('click', function(){
    });
  }

//--- jQuery No Conflict
})(jQuery);


/**
 * 
 * margin: 0px; resize: none; position: relative; zoom: 1; display: block; height: 251.641px; width: 378.141px; top: -63px; left: -24px; z-index: 194;
 */