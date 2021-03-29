

/**
   * 
   * 
   * Print Sticker
   * 
   */

/**
 * 
 * 
 * Modal Message
 */

 
  

  //Printing starts on click
function print_sticker(){
    (function($) {
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

      iterate_process_images(0); // Initiate Process Images
      
    });
      //--- jQuery No Conflict
})(jQuery);
}

