<?php

/**
 * Provides a class for managing anonymous users.
 *
 * This class is not an entity, as fields cannot be added to an anonymous user,
 * it has no URL, and it cannot be saved to the database. Despite this, it
 * includes a large amount of consistency with the normal User class to allow
 * use of the AnonymousUser class in places where different kinds of users are
 * listed together.
 */
class AnonymousUser extends stdClass implements UserInterface {

  public $uid = 0;
  public $name = NULL;
  public $hostname = NULL;
  public $roles = array(BACKDROP_ANONYMOUS_ROLE);
  public $status = 1;
  public $cache = 0;

  /**
   * Constructor for an anonymous user object.
   */
  public function __construct($values = array()) {
    foreach ($values as $key => $value) {
      $this->$key = $value;
    }
  }

  /**
   * Provides the UID for consistency with User entities.
   */
  public function id() {
    return 0;
  }

  /**
   * Provides the anonymous user name for consistency with User entities.
   */
  public function label() {
    return user_format_name($this);
  }

  /**
   * Provides the anonymous user URI for consistency with User entities.
   */
  public function uri() {
    return FALSE;
  }

  /**
   * Provides anonymous user createAccess for consistency with User entities.
   */
  public static function createAccess($bundle = NULL, $account = NULL) {
    return FALSE;
  }

  /**
   * Provides anonymous user access for consistency with User entities.
   */
  public function access($op, $account = NULL) {
    return FALSE;
  }

}
