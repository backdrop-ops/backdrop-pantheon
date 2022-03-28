<?php

/**
 * @file
 * Pantheon configuration file.
 *
 * IMPORTANT NOTE:
 * Do not modify this file. This file is maintained by Backdrop Pantheon
 * upstream.
 *
 * @see: https://github.com/backdrop-ops/backdrop-pantheon
 *
 * Site-specific modifications belong in settings.php, not this file. This file
 * may change in future releases and modifications would cause conflicts when
 * attempting to apply upstream updates.
 */

/**
 * Version of Pantheon files.
 *
 * This is a monotonically-increasing sequence number that is
 * incremented whenever a change is made to any Pantheon file.
 * Not changed if Backdrop core is updated without any change to
 * any Pantheon file.
 *
 * The Pantheon version is included in the git tag only if a
 * release is made that includes changes to Pantheon files, but
 * not to any Backdrop files.
 */
if (!defined("PANTHEON_VERSION")) {
  define("PANTHEON_VERSION", "1");
}

/**
 * Pantheon environment variables.
 *
 * See https://github.com/backdrop-ops/backdrop-pantheon/issues/58
 */
if (isset($_SERVER['PRESSFLOW_SETTINGS'])) {
  $pressflow_settings = json_decode($_SERVER['PRESSFLOW_SETTINGS'], TRUE);
  $pressflow_settings['settings'] = $pressflow_settings['conf'];
  $_SERVER['PRESSFLOW_SETTINGS'] = json_encode($pressflow_settings);
  $_SERVER['BACKDROP_SETTINGS'] = $_SERVER['PRESSFLOW_SETTINGS'];
}

/**
 * Define appropriate location for tmp directory
 *
 * Issue: https://github.com/backdrop-ops/backdrop-pantheon/issues/34
 *
 */
if (isset($_ENV['PANTHEON_ENVIRONMENT'])) {
  $config['system.core']['file_temporary_path'] = sys_get_temp_dir();
}

/**
 * Handle Hash Salt Value on Pantheon.
 *
 * Issue: https://github.com/backdrop-ops/backdrop-pantheon/issues/62
 */
if (isset($_ENV['PANTHEON_ENVIRONMENT'])) {
  $settings['hash_salt'] = $_ENV['HASH_SALT'];
}

/**
 * Define appropriate location for public file directory, and
 * private file directory (optional).
 */
if (isset($_ENV['PANTHEON_ENVIRONMENT'])) {
  $config['system.core']['file_public_path'] = 'files';
  // $config['system.core']['file_private_path'] = 'files/private';
}

/**
 * "Trusted host settings" are not necessary on Pantheon; traffic will only
 * be routed to your site if the host settings match a domain configured for
 * your site in the dashboard.
 *
 * Issue: https://github.com/backdrop-ops/backdrop-pantheon/issues/46
 */
if (isset($_ENV['PANTHEON_ENVIRONMENT'])) {
  $settings['trusted_host_patterns'][] = '.*';
}
