<?php
/**
 * @file
 * Display generic site information such as logo, site name, etc.
 *
 * Available variables:
 *
 * - $base_path: The base URL path of the Backdrop installation. At the very
 *   least, this will always default to /.
 * - $directory: The directory the template is located in, e.g. modules/system
 *   or themes/basis/templates.
 * - $is_front: TRUE if the current page is the front page.
 * - $logged_in: TRUE if the user is registered and signed in.
 * - $front_page: The URL of the front page. Use this instead of $base_path when
 *   linking to the front page since it includes the language domain or prefix.
 *
 * - $logo: The path to the logo image, as defined in site configuration.
 * - $site_name: The name of the site, empty when display has been disabled.
 * - $site_slogan: The site slogan, empty when display has been disabled.
 * - $menu: The menu for the header (if any), as an HTML string.
 */
?>

<?php if ($site_name): ?>
  <div class="header-identity-wrapper">
    <div class="header-site-name-wrapper">
      <?php // Strong class only added for semantic value ?>
      <a href="<?php print $front_page; ?>" title="<?php print t('Home'); ?>" class="header-site-name-link" rel="home">
        <strong><?php print $site_name; ?></strong>
      </a>
    </div>
  </div>
<?php endif; ?>

<?php if ($menu): ?>
  <nav class="header-menu">
    <?php print $menu; ?>
  </nav>
<?php endif; ?>
