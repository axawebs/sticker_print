<?php
/**
 * @package sticker_print
 */

 /* 
 Plugin Name: Sticker Print
 Plugin URI: https://github.com/axawebs/flightbooking
 Description: Custom created Sticker Print plugin for Hosanna Farm Retreat Pty Ltd on Wordpress
 Version: 1.0
 Author: Chandima Jayasiri
 Author URI: mailto:chandimaj@icloud.com
 License: GPLV2 or later
 Text Domain: sticker_print
 */

 /*
 This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/

if (! defined( 'ABSPATH') ){
    die;
}

class stickerprint
{

    public $plugin_name;
    public $settings = array();
    public $sections = array();
    public $fields = array();

    //Method Access Modifiers
    // public - can be accessed from outside the class
    // protected - can only be accessed within the class ($this->protected_method())
    // protected - can only be accessed from constructor

    function __construct(){
        //add_action ('init', array($this, 'custom_post_type')); // tell wp to execute method on init
        $this->plugin_name = plugin_basename( __FILE__ );
    }

    function register(){
        add_shortcode( 'stickerprint', array($this, 'shortcode_frontend') );

        add_action( 'admin_enqueue_scripts', array($this, 'enqueue_admin') );
        add_action( 'wp_enqueue_scripts', array($this, 'enqueue') );

        add_action ( 'admin_menu', array( $this, 'add_admin_pages' ));
        add_filter ("plugin_action_links_$this->plugin_name", array ($this, 'settings_link'));

       // add_filter( 'single_template', array($this, 'load_custom_post_specific_template'));
    }


    function add_admin_pages(){
        add_menu_page( 'StickerPrint Plugin - Settings', 'StickerPrint', 'manage_options', 'stickerprint_settings', array($this,'admin_index'), 'dashicons-list-view', 100);
    }    

    function admin_index(){
        //require template
        require_once plugin_dir_path( __FILE__ ) . 'templates/admin.php';
    }


    function settings_link($links){
        //add custom setting link
        $settings_link = '<a href="admin.php?page=stickerprint_settings">Settings Page</a>';
        array_push ( $links, $settings_link );
        return $links;
    }


    function activate(){
        // Plugin activated state
        // generate a Custom Post Style
        // $this->custom_post_type();
        //$this->create_table();
        // Flush rewrite rules 
        flush_rewrite_rules();
    }
 
    function deactivate(){
        // Plugin deactivate state
        //Flush rewrite rules
        flush_rewrite_rules();
    }

    function uninstall(){
        //Plugin deleted
        //delete Custom Post Style
        //delete all plugin data from the DB

    }
 

    
    
    //Enqueue on admin pages
    function enqueue_admin($hook_suffix){

        if (strpos($hook_suffix, 'stickerprint_settings') !== false) {
            //Bootstrap
            wp_enqueue_style( 'bootstrap4_styles', plugins_url('/assets/bootstrap4/bootstrap_4_5_2_min.css',__FILE__));
            wp_enqueue_script( 'bootstrap4_scripts', plugins_url('/assets/bootstrap4/bootstrap_4_5_2_min.js',__FILE__), array('jquery'));
            //Font-Awesome
            wp_enqueue_style( 'fontawesome_css', plugins_url('/assets/font_awesome/css/font-awesome.css',__FILE__));
            //Admin scripts and styles
            wp_enqueue_style( 'stickerprint_admin_styles', plugins_url('/assets/stickerprint_admin_style.css',__FILE__));
            wp_enqueue_script( 'stickerprint_admin_script', plugins_url('/assets/stickerprint_admin_scripts.js',__FILE__), array('jquery'));
            //Select2
            wp_enqueue_style( 'stickerprint_select2_styles', plugins_url('/assets/select2/select2.css',__FILE__));
            wp_enqueue_script( 'stickerprint_select2_scripts', plugins_url('/assets/select2/select2.full.js',__FILE__), array('jquery'));
        }
    }

    //Enqueue on all other pages
    function enqueue(){ 

        //Load only on page id = 2
        global $post;
        $post_slug = $post->post_name;
        //echo($post_slug);
        if ( $post_slug=="stickerprint" || true ){
            //Bootstrap
            wp_enqueue_style( 'bootstrap4_css', plugins_url('/assets/bootstrap4/bootstrap_4_5_2_min.css',__FILE__),80);
            wp_enqueue_script( 'bootstrap_bundle_scripts', plugins_url('/assets/bootstrap4/bootstrap.bundle.min.js',__FILE__), array('jquery'));
            wp_enqueue_script( 'bootstrap_input_spinner', plugins_url('/assets/bootstrap4/bootstrap-input-spinner.js',__FILE__), array('bootstrap_bundle_scripts'));
            
            
            //jQuery UI
            wp_enqueue_style( 'jquery_ui_styles', plugins_url('/assets/jquery_ui/jquery-ui.min.css',__FILE__),82);
            wp_enqueue_script( 'jquery_ui_scripts', plugins_url('/assets/jquery_ui/jquery-ui.min.js',__FILE__), array('jquery'));
            wp_enqueue_script( 'jquery_ui_rotatable_scripts', plugins_url('/assets/jquery_ui/jquery.ui.rotatable.js',__FILE__), array('jquery_touch_punch'));
            //Touch Punch
            wp_enqueue_script( 'jquery_touch_punch', plugins_url('/assets/touch-punch/touch-punch.min.js',__FILE__), array('jquery_ui_scripts'));

            //Font-Awesome
            wp_enqueue_style( 'fontawesome_css', plugins_url('/assets/font_awesome/css/font-awesome.css',__FILE__),90);

            //DropzoneJs
            wp_enqueue_style( 'stickerprint_dropzone_styles', plugins_url('/assets/dropzonejs/dropzone.css',__FILE__),98);
            wp_enqueue_script( 'stickerprint_dropzone_scripts', plugins_url('/assets/dropzonejs/dropzone.js',__FILE__), array('jquery'));

            //PrintJs
            wp_enqueue_style( 'stickerprint_printjs_styles', plugins_url('/assets/printjs/print.min.css',__FILE__),98);
            //wp_enqueue_script( 'stickerprint_printjs_scripts', plugins_url('/assets/printjs/print.min.js',__FILE__), array('jquery'));
            //wp_enqueue_script( 'stickerprint_printjs_scripts', plugins_url('/assets/printjs/printThis.js',__FILE__), array('jquery'));
            wp_enqueue_script( 'stickerprint_jspdf_scripts', plugins_url('/assets/printjs/jspdf.js',__FILE__), array('jquery'));

            //HTML2CANVAS
            wp_enqueue_script( 'stickerprint_html2canvas_scripts', plugins_url('/assets/html2canvas/html2canvas.js',__FILE__), array('jquery'));

            //HEIC 2 ANY
            wp_enqueue_script( 'stickerprint_heic2any_scripts', plugins_url('/assets/heic2any/heic2any.min.js',__FILE__), array('jquery'));

            //Common CSS
            wp_enqueue_style( 'stickerprint_common_styles', plugins_url('/assets/common.css',__FILE__),101);

            //FrontEnd scripts and styles
            wp_enqueue_script( 'stickerprint_script', plugins_url('/assets/stickerprint_scripts.js',__FILE__), array('stickerprint_heic2any_scripts','stickerprint_html2canvas_scripts','stickerprint_jspdf_scripts','stickerprint_dropzone_scripts','jquery'));
        }
    }


 


    //------ Shortcode
    function shortcode_frontend($atts){
        include 'templates/stickerprint.php';
    }
    
}

if ( class_exists('stickerprint') ){
    $sticker_print = new stickerprint();
    $sticker_print -> register();
}

//activate
register_activation_hook (__FILE__, array($sticker_print, 'activate'));

//deactivation
register_deactivation_hook (__FILE__, array($sticker_print, 'deactivate'));