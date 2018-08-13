<?php

  $form['breadcrumbs'] = array(
    '#type' => 'checkbox',
    '#title' => 'Use breadcrumb navigation',
    '#default_value' => theme_get_setting('breadcrumbs', 'ucb_backdrop'),
  );

  $settings = theme_get_setting('site_contact_information', 'ucb_backdrop');
  $form['site_contact_information'] = array(
    '#type' => 'text_format',
    '#title' => 'Contact Information',
    '#default_value' => $settings['value'],
    '#format' => $settings['format'],
    '#required' => FALSE,
    '#description' => t('This will display as contact information for your visitors'),
  );
