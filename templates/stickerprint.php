<?php
if (! defined( 'ABSPATH') ){
    die;
}

    //setting script variables
    if(isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on'){
        $site_host = "https://";   
    }else{
        $site_host = "http://";   
    }

    //$site_host = "http://"; 


    // Append the host(domain name, ip) to the URL.   
    $site_host.= $_SERVER['HTTP_HOST'];

    $plugin_url = $site_host."/wp-content/plugins/sticker_print/";
?>

<?php
    // Sticker set html
    $sticker_set = 
    '<div class="sticker_set">
        <div class="sticker_set_controls">
            <button class="btn btn-secondary sbcs_remove"><img src="'.$plugin_url.'/assets/bin_icon.png" style="height:20px" /></button>
            <button class="btn btn-secondary sbcs_resize"><img src="'.$plugin_url.'/assets/expand_icon.png" style="height:20px" /></button>
            <button class="btn btn-secondary sbcs_move"><img src="'.$plugin_url.'/assets/move_icon.png" style="height:20px" /></button>
            <button class="btn btn-secondary sbcs_rotate"><img src="'.$plugin_url.'/assets/rotate_icon.png" style="height:20px" /></button>
        </div>
        <div class="sticker_outer">
            <div class="sticker_boarder_outer">
                <div class="sticker_boarder_inner"></div>
            </div>
            <div class="sticker_image_holder">
                <img class="sn_image"/>
            </div>
            <div class="sticker_inner">
                <div class="sticker_image_dropzone">
                    <div class="progress_handle">
                        <div class="progress_bar_outer">
                            <div class="progress_bar_inner"></div>
                            <div class="progress_bar_percent">0%</div>
                        </div>
                    </div>
                </div>
                <div class="sticker_image_notice">
                    <div class="sticker_image_addcontrols">
                        <div class="sbac_add_image"><i class="fa fa-plus-circle"></i> <br> <span class="add_img_desc">add or drop photo</span></div>
                    </div>
                </div>
            </div>
        </div>
    </div>';
?>

<div id="plugin_settings" style="display:none">
    <input id="ps_pluginurl" value="<?= $plugin_url ?>" disabled/>

    <script type="text/javascript">
        var plugin_url = "<?= $plugin_url ?>";
        console.log('plugin_url:'+plugin_url);
    </script>
</div>

<!-- Frontend HTML -->
<div class="container">
    <div class="row sb_sticker_area">
        <div id="sticker_area_controls">
            <!--
            <button class="btn btn-secondary sbcs_download_sticker"><i class="fa fa-download"></i> Download</button>
            -->
            <button class="btn btn-secondary sbcs_print_sticker"><i class="fa fa-download"></i> Download PDF</button>
        </div>

        <div id="sb_sticker_area" class="col-12 sb_sticker_area">
            <div id="sticker_canvas">
                <?= $sticker_set ?>
                <?= $sticker_set ?>
                <?= $sticker_set ?>
                <?= $sticker_set ?>
                <?= $sticker_set ?>
                <?= $sticker_set ?>
                <?= $sticker_set ?>
                <?= $sticker_set ?>
                <?= $sticker_set ?>
                <?= $sticker_set ?>
            </div>
        </div>
    </div>

    <!--
    <div id="sb_sticker_single" class="row">
        <div id="sb_single_controls" class="col-12">
            <button class="btn btn-secondary sbcs_add"><i class="fa fa-repeat"></i></button>
            <button class="btn btn-secondary sbcs_remove"><i class="fa fa-undo"></i></button>
            <button class="btn btn-secondary sbcs_print_single"><i class="fa fa-print"></i> Print</button>
        </div>
        <div id="sb_single_area" class="col-12">
            <div id="sb_single_canvas">
            </div>
        </div>
    </div>
    -->
</div>


<div class="modal" tabindex="-1" role="dialog" id="error_message">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title text-danger">Modal title</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <p>Modal body text goes here.</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>



<div class="modal" tabindex="4" role="dialog" id="printing_message">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title ">Generating your print file...</h3>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div>
          <img id="loading_image" src="<?= $plugin_url?>/assets/loading.gif" />
          Please wait while print ready PDF file is prepared.<br>
          It might take upto a few minutes depending on the size and resolution of the  images uploaded. <br>
          <div class="print_status">Status: <span>Initializing...</span></div>
        </div>
      </div>
      <div class="modal-footer">
        <!--
        <button type="button" class="btn btn-secondary" data-dismiss="modal">OK</button>
        -->
      </div>
    </div>
  </div>
</div>

<?php
  $canvas_width = 2480;
  $canvas_height = $canvas_width * 1.41;

  $print_section_html = 
  '<div class="print_section">
    <div class="print_image_holder" id="{{print_img_id}}">
    <!--
      <img class="print_sn_image" style="width:100%; height:100%;">
      -->
    </div>
  </div>';
?>

<div id="hidden_canvas">
  <div id="print_canvas">
    <?php 
      for ($i=0; $i<10; $i++){
        $new_html = str_replace('{{print_img_id}}','print_imgid_'.$i,$print_section_html);
        echo($new_html);
      }
    ?>
  </div>
</div>