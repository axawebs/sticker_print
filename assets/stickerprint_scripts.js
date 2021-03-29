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
  console.log('StickerPrint Shortcode JavaScripts Loaded V2.20');

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
          /*
          rotationCenterOffset: {
                top: 0,
                left: 0
                  },
          */
            
        });
      }

    });


    

  }
}













function print_sticker(){
  // (function($) {
       //--- jQuery No Conflict

  
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



   $('.sbcs_print_sticker').on('click', function(){

    print_test();
     var images_processed = 0;


     function iterate_process_images(){


       console.log('************ Image iteration for:'+images_processed);
       let source_image = $('#sb_sticker_area .sticker_image_holder').eq(images_processed).find('.sn_image');
   
       //No image on any source found to processed
       if (images_processed>10){ 
         $('.print_status span').html('[10/10] Stickers Processed. <br>No image found to generate sticker.');
         return;
       
       //All 10 images are processed
       }else if(images_processed==10){
         $('.print_status span').html('[10/10] Stickers Processed. <br>Generating print ready PDF file...');
         generate_output_pdf();
         return;
       
       //No image is set for current souce image
       }else if ( typeof source_image.attr('src') === 'undefined' || source_image.attr('src')=='' ){
        // modal_msg('Please add stickers',);
        console.log('skipping undefined image src for sn_image:'+images_processed);
        $('.print_status span').html('['+(images_processed+1)+'/10] Stickers Processed. <br>No image found on current section.<br>Skipping...');
        console.log('images process set at ignored empty souce image for'+images_processed+" is: ");
        images_processed++;
        console.log(images_processed);
        pseudo_function (images_processed);
        return;

       }else{
         process_images();
         return;
       }
     }
   
     function pseudo_function(){
       iterate_process_images(images_processed);
     }

     
     $('.print_status span').html('Initializing...');
     modal_msg();



     function process_images(){
         console.log('process images called for '+images_processed);

       let i = images_processed;
       let source_image = $('#sb_sticker_area .sticker_image_holder').eq(i).find('.sn_image');
       let source_image_src = source_image.attr('src');
       
         //-- source Image found
         $('#print_canvas .print_section').eq(i).find('.print_sn_image').remove();

         //Check if source image has styles
         let source_styles = source_image.attr('style');
         if ( typeof source_styles === 'undefined' || source_styles == ''){ source_styles = '';}

         $('#temp_div').css('display','block');
         $('#temp_div .print_image_holder').remove();
         $('#temp_div').append('<div class="print_image_holder"><img class="print_sn_image"/></div>');
         $('#temp_div img').attr('src','');
         $('#temp_div img').off().on('load',function(){
             console.log('Image loaded to the temp div for'+i);
               modify_print_image_styles();
         });

         $('#temp_div .print_sn_image').attr('src', source_image_src);
         
     }






       function modify_print_image_styles(){

           let i = images_processed;
           let source_image = $('#sb_sticker_area .sticker_image_holder').eq(i).find('.sn_image');

           $('#hidden_canvas').css({
           top:'0px',
           width:'2480px',
           height:'3497px',
           });
           
           if ( typeof source_image.attr('src') !== 'undefined' && source_image.attr('src') != ''  ){
               //Size calculations
               let ratio = 1230.08/source_image.parent().width();
               let on_image = $('#temp_div .print_sn_image');

               let original_sni_width = source_image.width();
               let original_sni_height = source_image.height();
               let original_sni_position = source_image.position();
               let sni_aspectRatio = source_image.width() / source_image.height();

               let new_sni_width = source_image.width() * ratio;
               let new_sni_height = new_sni_width / sni_aspectRatio;

               let new_top = source_image.css('top').replace('px','') * ratio;
               let new_left = source_image.css('left').replace('px','') * ratio;

               let image_rotation = getRotationDegrees(source_image);

               on_image.css({
                   'width':new_sni_width+"px",
                   'max-width': new_sni_width+"px",
                   'height': new_sni_height+"px",
                   'max-height': new_sni_height+"px",
                   'top': new_top+"px",
                   'left': new_left+"px",
                   
               }); 

               let top_offset = 0;
               let left_offset = 0;
               let new_top_withoffset = 0;
               let new_left_withoffset = 0;

               //If rotation applied 
               if( image_rotation!=0 ){

                   if(new_top != 0 || new_left !=0){
                       on_image.css({
                           'transform-origin':new_sni_width/2+'px '+new_sni_height/2+'px',
                       });
                   }

                   on_image.css({
                   'position':'absolute',
                   //'transform-origin': (new_sni_height/2)+'px '+(new_sni_width/2)+'px',
                   'top':original_sni_position.top + 'px',
                   'left':original_sni_position.left + 'px',
                   'transform': 'rotate('+image_rotation+'deg)',
                   });
                   
                   let img_transverse = Math.sqrt( (new_sni_height/2)^2 + (new_sni_width/2)^2 );

                   top_offset = img_transverse * Math.sin(image_rotation);
                   left_offset = img_transverse * Math.cos(image_rotation);
                   new_top_withoffset = new_top + top_offset;
                   new_left_withoffset = new_sni_width/2 - left_offset;
               }

               /*
               console.log('--------------------- Image Scaling Started ------------------');
               console.log('width & height ratio:'+ratio);
               console.log('original sni width & height:'+original_sni_width+" &"+original_sni_height);
               console.log('New sni width & height:'+new_sni_width+" &"+new_sni_height);
               console.log('original sni Position:');
               console.log(original_sni_position);
               console.log('New sni Position:');
               console.log( on_image.position() );
               console.log('--- Rotation ---');
               console.log('image rotation:'+image_rotation);
               console.log('top offest:'+top_offset);
               console.log('left offest:'+left_offset);
               console.log('new top with offset:'+new_top_withoffset);
               console.log('new left with offset:'+new_left_withoffset);
               console.log('--------------------- Image Scaling Finished for image ------------------');
               */
               
               convert_individual_pringimg_to_canvas();
           
           }
       }
     




       function getRotationDegrees(obj) {
           var matrix = obj.css("-webkit-transform") ||
           obj.css("-moz-transform")    ||
           obj.css("-ms-transform")     ||
           obj.css("-o-transform")      ||
           obj.css("transform");
           if(matrix !== 'none') {
               var values = matrix.split('(')[1].split(')')[0].split(',');
               var a = values[0];
               var b = values[1];
               var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
           } else { var angle = 0; }
           //return (angle < 0) ? angle + 360 : angle;
           return angle;
       }







      /**
      * 
      * Convert individual image to mini canvasas ( Rasterizing each image )
      */
       function convert_individual_pringimg_to_canvas(){
           let image_element = images_processed;
         console.log('--------------------- Image individual rendering Started for '+image_element+'------------------');
         $('.print_status span').html('['+(image_element+1)+'+/10] Processing... <br>Generating high resolution image for current image...');

         html2canvas( document.getElementById('temp_div').getElementsByClassName('print_image_holder')[0], {
           dpi: 300, // Set to 300 DPI
           scale: 1, // Adjusts your resolution
           allowTaint: true,
           logging: true,
           width:1230.08,
           height:685.412,
           useCORS:true,
           windowWidth:1230.08,
           windowHeight:685.412,
           //letterRendering: 1,
           //scrollX:0,
           //scrollY:0,
           imageTimeout:0
         }).then(function(canvas){
           console.log('canvas image rendered for imageid: '+image_element);
           let img = canvas.toDataURL("image/jpeg", 1);

           $('#print_imgid_'+image_element).children('img').eq(0).remove();
           let append_img = $('<img src="'+img+'" class="fullwidthimgs" />');
           $('#print_imgid_'+image_element).append(append_img);

           console.log('--------------------- Image individual rendering Finished ------------------');

           images_processed++;

           //Calling next image for processing
           $('#print_imgid_'+image_element +' img').load(function(){
             console.log('images process set at processed canvas load for image element'+image_element+" is: "+images_processed);
             iterate_process_images();
           });

           $('#temp_div').css('display','none');
           
         }); 
       }








    //Final output generator   

     function generate_output_pdf(){
       var w = 2480;
       var h = 2480*1.41;

       /*
       $('#hidden_canvas').css({
         'top':'0',
         'height':'100%',
         'width':'100%',
       });
     */

       /*
       let win = window.open('','_blank');
       win.document.write('<html><head></head><body><div id="print_div_clone"></div></body></html>');
       win.document.getElementById('print_div_clone').innerHTML = $('#print_canvas').html();
       */

       html2canvas(document.getElementById('print_canvas'), {
         dpi: 300, // Set to 300 DPI
         scale: 1, // Adjusts your resolution
         allowTaint: true,
         logging: true,
         width:2480,
         height:3497,
         //useCORS:true,
         //windowWidth:2480,
         //windowHeight:3497,
         //letterRendering: 1,
         scrollX:0,
         scrollY:0,
         imageTimeout:0
       }).then(function(canvas){
         console.log('canvas image rendered');
         var img = canvas.toDataURL("image/jpeg", 1);
         //$('body').append('<img src="'+img+'" style="position:absolute; top:200vw; width:100%;" />');
         let { jsPDF } = window.jspdf;
         var doc = new jsPDF('p', 'mm', [210, 297]);
         doc.addImage(img, 'png', 20, 22, 170, 253);
         
         $('#hidden_canvas').css({
           'top':'200vw',
          // 'height':'10px',
          // 'width':'10px',
         });

         doc.save('printready_sticker.pdf');

         $('.print_status span').html('High Resolution image generated. <br> Creating PDF File...');
         $('#printing_message').modal('hide');
         //var win = window.open("", "_blank");
                 //win.document.write("<html><head><title>Generated PDF</title></head><body><embed style='width:100%; height:100%;' src='" +doc.output('datauri').replace('data:application/pdf;filename=generated.pdf;base64','data:application/octet-stream;filename=generated.pdf;base64') + "'></embed></body></html>");
           //doc.output('dataurlnewwindow');          
       }); 
       
     }

    // iterate_process_images(0); // Initiate Process Images
     
   });
     //--- jQuery No Conflict
//})(jQuery);
}






function print_test(){

  $('#sticker_canvas').css({
    'padding':'0% 0%',
    'background-color':'#fff',
    'border':'none',
  });

  $('#sticker_canvas .sticker_boarder_outer').css({
    'display':'none'
  });

  $('#sticker_canvas .sticker_inner').css({
    'display':'none'
  });

  html2canvas(document.getElementById('sticker_canvas'), {
    dpi: 300, // Set to 300 DPI
    scale: 4, // Adjusts your resolution
    allowTaint: true,
    logging: true,
    //width:2480,
    //height:3497,
    //useCORS:true,
    //windowWidth:2480,
    //windowHeight:3497,
    //letterRendering: 1,
    scrollX:0,
    scrollY:0,
    imageTimeout:0
  }).then(function(canvas){
    console.log('canvas image rendered');
   
    //Resetting css
    $('#sticker_canvas').css({
      //'padding':'10% 9.5%',
      'background-color':'#eee',
      'border':'solid 1px #444',
    });
  
    $('#sticker_canvas .sticker_boarder_outer').css({
      'display':'block'
    });
  
    $('#sticker_canvas .sticker_inner').css({
      'display':'block'
    });

    var img = canvas.toDataURL("image/jpeg", 1);
    $('#prnt_temp_div img').remove();
    $('#prnt_temp_div').append('<img id="print_ready_img" src=""/>');
    $('#print_ready_img').off().on('load',function(){
      $('.print_status span').html('High Resolution image generated. <br> Creating PDF File...');          
      scaled_print();
    });
    $('#print_ready_img').attr('src',img);
    $('#prnt_temp_div').css('display', 'block');
  }); 
}


function scaled_print(){
  html2canvas(document.getElementById('print_ready_img'), {
    dpi: 300, // Set to 300 DPI
    scale: 1, // Adjusts your resolution
    allowTaint: true,
    logging: true,
    width:2480,
    height:3497,
    useCORS:true,
    windowWidth:2480,
    windowHeight:3497,
    //letterRendering: 1,
    scrollX:0,
    scrollY:0,
    imageTimeout:0
  }).then(function(canvas){
    
    console.log('Second pdf ready image rendered');
    var img = canvas.toDataURL("image/jpeg", 1);
    let { jsPDF } = window.jspdf;
    var doc = new jsPDF('p', 'mm', [210, 297]);
    doc.addImage(img, 'png', 20, 22, 170, 253);

    doc.save('printready_sticker.pdf');
    $('#prnt_temp_div').css('display', 'none');
    $('#printing_message').modal('hide');         
  }); 
}




//--- jQuery No Conflict
})(jQuery);


/**
 * 
 * margin: 0px; resize: none; position: relative; zoom: 1; display: block; height: 251.641px; width: 378.141px; top: -63px; left: -24px; z-index: 194;
 */