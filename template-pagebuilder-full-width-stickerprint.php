<?php
/**
 * Template Name: StickerPrint Page (for StickerPrint Plugin)
 *
 * The template for the page builder full-width.
 *
 * It contains header, footer and 100% content width.
 *
 * @package Neve
 */

get_header();

echo do_shortcode("[stickerprint]");

get_footer();
