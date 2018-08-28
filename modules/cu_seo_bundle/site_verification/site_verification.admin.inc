<?php

/**
 * @file
 * Administration settings for Site verification.
 */

/**
 * Menu callback for administration settings.
 *
 * @return array
 */
function site_verification_admin_settings() {
  $form = array();
  $form['bing'] = array(
    '#type' => 'fieldset',
    '#title' => t('Bing'),
    '#description' => l('Bing Webmaster - My Sites', 'https://www.bing.com/webmaster/home/mysites'),
  );
  $form['bing']['bing_meta'] = array(
    '#type' => 'textfield',
    '#size' => 32,
    '#title' => t('HTML META tag content'),
    '#default_value' => config_get('site_verification.settings', 'bing_meta'),
    '#description' => t('Value of the content argument from the msvalidate.01 META tag. Example: 8AABDA66DBFBBB17C41DDD17624A6CF4'),
  );
  $form['google'] = array(
    '#type' => 'fieldset',
    '#title' => t('Google'),
    '#description' => l('Google Search Console', 'https://www.google.com/webmasters/tools/dashboard'),
  );
  $form['google']['google_html'] = array(
    '#type' => 'textfield',
    '#size' => 28,
    '#title' => t('HTML file name'),
    '#default_value' => config_get('site_verification.settings', 'google_html'),
    '#description' => t('Example: google3dkn3d7e27b48d220.html'),
  );
  $form['google']['google_meta'] = array(
    '#type' => 'textfield',
    '#size' => 44,
    '#title' => t('HTML META tag content'),
    '#default_value' => config_get('site_verification.settings', 'google_meta'),
    '#description' => t('Value of the content argument from the google-site-verification META tag. Example: DKnmc3xnVdxZac5a2wHvpnI0bBZP0Db9L70tN0Cw7qU'),
  );
  $form['wot'] = array(
    '#type' => 'fieldset',
    '#title' => t('Web of Trust (WOT)'),
    '#description' => l('WOT', 'https://www.mywot.com'),
  );
  $form['wot']['wot_meta'] = array(
    '#type' => 'textfield',
    '#size' => 20,
    '#title' => t('HTML META tag content'),
    '#default_value' => config_get('site_verification.settings', 'wot_meta'),
    '#description' => t('Value of the content argument from the wot-verification META tag. Example: 1b2bd5e5c3f8cea24d84'),
  );
  $form['yandex'] = array(
    '#type' => 'fieldset',
    '#title' => t('Yandex'),
    '#description' => l('Yandex site verification', 'https://tech.yandex.com/webmaster/doc/dg/reference/hosts-type-docpage/'),
  );
  $form['yandex']['yandex_uin'] = array(
    '#type' => 'textfield',
    '#size' => 16,
    '#title' => t('Yandex UIN'),
    '#default_value' => config_get('site_verification.settings', 'yandex_uin'),
    '#description' => t('Value of the content argument from the yandex-verification META tag. Example: b6741269901d6c29'),
  );

  $form['#submit'][] = 'site_verification_admin_settings_submit';

  $form['actions']['#type'] = 'actions';
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration'),
  );

  return $form;
}

/**
 * Submission handler for verification settings.
 */
function site_verification_admin_settings_submit($form, &$form_state) {
  config('site_verification.settings')
    ->set('bing_meta', $form_state['values']['bing_meta'])
    ->set('google_html', $form_state['values']['google_html'])
    ->set('google_meta', $form_state['values']['google_meta'])
    ->set('wot_meta', $form_state['values']['wot_meta'])
    ->set('yandex_uin', $form_state['values']['yandex_uin'])
    ->save();

  menu_rebuild();
  backdrop_set_message(t('The site verification module re-built the menu information to set verification file paths.'), 'status');
  watchdog('site_verification', 'Re-built menus to set verification file paths.', array(), WATCHDOG_DEBUG);
}
