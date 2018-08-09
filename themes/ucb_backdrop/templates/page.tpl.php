<?php
/**
 * @file
 * Default theme implementation to display the basic html structure of a single
 * Backdrop page.
 *
 * Variables:
 * - $css: An array of CSS files for the current page.
 * - $language: (object) The language the site is being displayed in.
 *   $language->langcode contains its textual representation.
 *   $language->dir contains the language direction.
 *   It will either be 'ltr' or 'rtl'.
 * - $head_title: A modified version of the page title, for use in the TITLE
 *   tag.
 * - $head_title_array: (array) An associative array containing the string parts
 *   that were used to generate the $head_title variable, already prepared to be
 *   output as TITLE tag. The key/value pairs may contain one or more of the
 *   following, depending on conditions:
 *   - title: The title of the current page, if any.
 *   - name: The name of the site.
 *   - slogan: The slogan of the site, if any, and if there is no title.
 * - $head: Markup for the HEAD section (including meta tags, keyword tags, and
 *   so on).
 * - $styles: Style tags necessary to import all CSS files for the page.
 * - $scripts: Script tags necessary to load the JavaScript files and settings
 *   for the page.
 *   page. This variable should always be output first, before all other dynamic
 *   content.
 * - $page: The rendered page content.
 * - $page_bottom: Final closing markup from any modules that have altered the
 *   page. This variable should always be output last, after all other dynamic
 *   content.
 * - $classes Array of classes that can be used to style contextually through
 *   CSS.
 *
 * @see template_preprocess()
 * @see template_preprocess_html()
 *
 * @ingroup themeable
 */
 global $base_url;
?><!DOCTYPE html>
<html<?php print backdrop_attributes($html_attributes); ?>>
  <head>
    <?php print backdrop_get_html_head(); ?>
    <title><?php print $head_title; ?></title>
    <?php print backdrop_get_css(); ?>
    <?php print backdrop_get_js(); ?>
  </head>
  <body class="<?php print implode(' ', $classes); ?>"<?php print backdrop_attributes($body_attributes); ?>>
    <div class="brand-header l-brand-header">
      <div class="l-brand-header-inner container container-fluid">
        <a href="https://www.colorado.edu"><img src="<?php print $base_url; ?>/<?php print backdrop_get_path('theme', 'ucb_backdrop'); ?>/images/cu-boulder-logo-text-white.svg" alt="University of Colorado Boulder" class="cu-boulder-logo"/></a>
      </div>
    </div>
    <?php print $page; ?>
    <div class="brand-footer">
      <div class="brand-footer-inner container container-fluid">
        <div class="row">
          <div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">
            <p><a href="<?php print $front_page; ?>">
              <strong><?php print $site_name; ?></strong>
            </a></p>
            <?php
              $site_contact_information = theme_get_setting('site_contact_information', 'ucb_backdrop');
              $contact_info = check_markup($site_contact_information['value'], $site_contact_information['format']);
              print $contact_info;
            ?>
          </div>
          <div class="col-lg-4 col-lg-push-2 col-md-4 col-md-push-2 col-sm-4 col-sm-push-2 col-xs-12">
            <p><a href="//www.colorado.edu"><img src="<?php print $base_url; ?>/<?php print backdrop_get_path('theme', 'ucb_backdrop'); ?>/images/beboulder/be-boulder-white.png" alt="University of Colorado Boulder" class="beboulder"/></a></p>
            <p><strong><a href="http://www.colorado.edu">University of Colorado Boulder</a></strong><br />&copy; Regents of the University of Colorado<br />
    <span class="required-links"><a href="http://www.colorado.edu/about/privacy-statement">Privacy</a> &bull; <a href="http://www.colorado.edu/about/legal-trademarks">Legal &amp; Trademarks</a> &bull; <a href="http://www.colorado.edu/map">Campus Map</a></span></p>
          </div>
        </div>
      </div>
    </div>
    <?php print $page_bottom; ?>
    <?php print backdrop_get_js('footer'); ?>
  </body>
</html>
