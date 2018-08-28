<?php

function ucb_backdrop_preprocess_layout(&$vars) {
  //dpm($vars);
}

function ucb_backdrop_preprocess_html(&$vars) {
  //dpm($vars);
}

function ucb_backdrop_preprocess_page(&$vars) {
  //dpm($vars);
  backdrop_add_css('https://use.fontawesome.com/releases/v5.2.0/css/all.css', array('type' => 'external'));
  backdrop_add_library('layout', 'bootstrap4-gs');
  $site_config = config('system.core');
  $vars['site_name'] = check_plain($site_config->get('site_name'));
  $vars['front_page'] = config_get('system.core', 'site_frontpage');
}

function ucb_backdrop_preprocess_node(&$vars) {

  //$vars['theme_hook_suggestions'][] = 'node__' . $vars['type'];
  //$vars['theme_hook_suggestions'][] = 'node__' . $vars['view_mode'];
  //$vars['theme_hook_suggestions'][] = 'node__' . $vars['type'] . '__' . $vars['view_mode'];
  $vars['submitted'] = date('F j, Y', $vars['created']) . ' &bull; ' . $vars['user']->name;

  if ($vars['type'] == 'post') {
    if (!empty($vars['field_tags'])) {
      $tags = array();
      foreach ($vars['field_tags'] as $tag) {
        $tags[] = l($tag['taxonomy_term']->name, $tag['taxonomy_term']->path['alias']);
      }
      $vars['post_tags'] = join(', ', $tags);
    }
  }
}

function ucb_backdrop_preprocess_block(&$vars) {

  if ($vars['block']->delta == 'main-menu') {
    //dpm($vars);
    //dpm($vars['block']);
  }
  $vars['classes'] = join(' ', $vars['classes']);
}


function ucb_backdrop_menu_link(&$vars) {
  //dpm($vars);
  if ($vars['element']['#href'] == '<front>') {
    $vars['element']['#title'] = '<i class="fa fa-home"></i><span class="element-invisible">Home</span>';
    $vars['element']['#localized_options']['html'] = TRUE;
  }
  $output = l($vars['element']['#title'], $vars['element']['#href'], $vars['element']['#localized_options']);
  return '<li>' . $output . "</li>\n";
}


/**
 * Function to add home icon to menu items set to <front>.
 */
function ucb_backdrop_home_icon(&$vars, $menu) {
  if (isset($vars[$menu])) {
    foreach ($vars[$menu] as $key => $value) {
      if($vars[$menu][$key]['href'] == '<front>') {
        $vars[$menu][$key]['html'] = TRUE;
        $vars[$menu][$key]['title'] = '<i class="fa fa-home"></i><span class="element-invisible">Home</span>';
        $vars[$menu][$key]['attributes']['class'][] = 'home-link';
      }
    }
  }
}

/**
 * Overrides theme_breadcrumb(). Removes &raquo; from markup.
 *
 * @see theme_breadcrumb().
 */
function ucb_backdrop_breadcrumb($variables) {
  $breadcrumb = $variables['breadcrumb'];
  $output = '';

  if (theme_get_setting('breadcrumbs', 'ucb_backdrop') && !empty($breadcrumb)) {
    $output .= '<nav role="navigation" class="breadcrumb">';
    // Provide a navigational heading to give context for breadcrumb links to
    // screen-reader users. Make the heading invisible with .element-invisible.
    $output .= '<h2 class="element-invisible">' . t('You are here') . '</h2>';
    $output .= '<ol><li>' . implode('</li><li>', $breadcrumb) . '</li></ol>';
    $output .= '</nav>';
  }
  return $output;
}
