<?php
if (! defined( 'ABSPATH') ){
    die;
}

//setting script variables
if(isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on')   
$site_host = "https://";   
else  
$site_host = "http://";   
// Append the host(domain name, ip) to the URL.   
$site_host.= $_SERVER['HTTP_HOST']; 
$plugin_url = $site_host."/wp-content/plugins/sticker_print/";

