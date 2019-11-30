(function ($, window) {

/**
 * Provides Ajax page updating via jQuery $.ajax (Asynchronous JavaScript and XML).
 *
 * Ajax is a method of making a request via JavaScript while viewing an HTML
 * page. The request returns an array of commands encoded in JSON, which is
 * then executed to make any changes that are necessary to the page.
 *
 * Backdrop uses this file to enhance form elements with #ajax['path'] and
 * #ajax['wrapper'] properties. If set, this file will automatically be included
 * to provide Ajax capabilities.
 */

Backdrop.ajax = Backdrop.ajax || {};

Backdrop.settings.urlIsAjaxTrusted = Backdrop.settings.urlIsAjaxTrusted || {};

/**
 * Attaches the Ajax behavior to each Ajax form element.
 */
Backdrop.behaviors.AJAX = {
  attach: function (context, settings) {
    
     function loadAjaxBehaviour(base) {
      if (!$('#' + base + '.ajax-processed').length) {
        var element_settings = settings.ajax[base];

        if (typeof element_settings.selector == 'undefined') {
          element_settings.selector = '#' + base;
        }
        $(element_settings.selector).each(function () {
          element_settings.element = this;
          Backdrop.ajax[base] = new Backdrop.ajax(base, this, element_settings);
        });

        $('#' + base).addClass('ajax-processed');
      }
    }

    // Load all Ajax behaviors specified in the settings.
    for (var base in settings.ajax) {
      if (settings.ajax.hasOwnProperty(base)) {
        loadAjaxBehaviour(base);
      }
    }

    // Bind Ajax behaviors to all items showing the class.
    $('.use-ajax:not(.ajax-processed)').addClass('ajax-processed').each(function () {
      var element_settings = {};
      // Clicked links look better with the throbber than the progress bar.
      element_settings.progress = { 'type': 'throbber' };

      // For anchor tags, these will go to the target of the anchor rather
      // than the usual location.
      if ($(this).attr('href')) {
        element_settings.url = $(this).attr('href');
        element_settings.event = 'click';
      }
      // Allow any AJAX link to set the HTTP "Accept" header.
      element_settings.accepts = $(this).data('accepts');

      // Special handling if the data-dialog attribute is TRUE.
      if ($(this).data('dialog')) {
        element_settings.dialog = $(this).data('dialog-options') || {};
        element_settings.accepts = 'application/vnd.backdrop-dialog';
      }

      var base = $(this).attr('id');
      Backdrop.ajax[base] = new Backdrop.ajax(base, this, element_settings);
    });

    // This class means to submit the form to the action using Ajax.
    $('.use-ajax-submit:not(.ajax-processed)').addClass('ajax-processed').each(function () {
      var element_settings = {};

      // Ajax submits specified in this manner automatically submit to the
      // normal form action.
      element_settings.url = $(this.form).attr('action');
      // Form submit button clicks need to tell the form what was clicked so
      // it gets passed in the POST request.
      element_settings.setClick = true;
      // Form buttons use the 'click' event rather than mousedown.
      element_settings.event = 'click';
      // Clicked form buttons look better with the throbber than the progress bar.
      element_settings.progress = { 'type': 'throbber' };

      var base = $(this).attr('id');
      Backdrop.ajax[base] = new Backdrop.ajax(base, this, element_settings);
    });
  }
};

/**
 * Ajax object.
 *
 * All Ajax objects on a page are accessible through the global Backdrop.ajax
 * object and are keyed by the submit button's ID. You can access them from
 * your module's JavaScript file to override properties or functions.
 *
 * For example, if your Ajax enabled button has the ID 'edit-submit', you can
 * redefine the function that is called to insert the new content like this
 * (inside a Backdrop.behaviors attach block):
 * @code
 *    Backdrop.behaviors.myCustomAJAXStuff = {
 *      attach: function (context, settings) {
 *        Backdrop.ajax['edit-submit'].commands.insert = function (ajax, response, status) {
 *          new_content = $(response.data);
 *          $('#my-wrapper').append(new_content);
 *          alert('New content was appended to #my-wrapper');
 *        }
 *      }
 *    };
 * @endcode
 *
 * @param string base
 *   The unique identifier for this AJAX object. Usually this is the ID of the
 *   HTML element receiving the newly generated HTML content.
 * @param DOMElement element
 *   The HTML DOM element that triggers the AJAX behavior. Usually this is an
 *   anchor tag or submit button, but it may be any type of DOM element.
 * @param object element_settings
 *   An object containing configuration for the AJAX behavior.
 */
Backdrop.ajax = function (base, element, element_settings) {
  var defaults = {
    event: 'mousedown',
    keypress: true,
    selector: '#' + base,
    effect: 'none',
    speed: 'none',
    method: 'replaceWith',
    progress: {
      type: 'throbber',
      message: Backdrop.t('Please wait...'),
      object: null,
      element: null
    },
    submit: {
      'js': true
    },
    currentRequests: []
  };

  $.extend(this, defaults, element_settings);

  // @todo Remove this after refactoring the PHP code to:
  //   - Call this 'selector'.
  //   - Include the '#' for ID-based selectors.
  //   - Support non-ID-based selectors.
  if (this.wrapper) {
    this.wrapper = '#' + this.wrapper;
  }

  // Ensure element is a DOM element (and not a jQuery object).
  if (element instanceof jQuery) {
    element = element.get(0);
  }

  this.element = element;
  this.element_settings = element_settings;

  // If there isn't a form, jQuery.ajax() will be used instead, allowing us to
  // bind Ajax to links as well.
  if (this.element && this.element.form) {
    this.form = $(this.element.form);
  }

  // If no Ajax callback URL was given, use the link href or form action.
  if (!this.url) {
    if ($(element).is('a')) {
      this.url = $(element).attr('href');
    }
    else if (element.form) {
      this.url = this.form.attr('action');
    }
  }

  // Replacing 'nojs' with 'ajax' in the URL allows for an easy method to let
  // the server detect when it needs to degrade gracefully.
  // There are five scenarios to check for:
  // 1. /nojs/
  // 2. /nojs$ - The end of a URL string.
  // 3. /nojs? - Followed by a query (e.g. path/nojs?destination=foobar).
  // 4. /nojs# - Followed by a fragment (e.g.: path/nojs#myfragment).
  this.url = this.url.replace(/\/nojs(\/|$|\?|#)/g, '/ajax$1');

  // If the 'nojs' version of the URL is trusted, also trust the 'ajax' version.
  if (Backdrop.settings.urlIsAjaxTrusted[element_settings.url]) {
    Backdrop.settings.urlIsAjaxTrusted[this.url] = true;
  }

  // Set the options for the ajaxSubmit function.
  // The 'this' variable will not persist inside of the options object.
  var currentAjaxRequestNumber = 0;
  var ajax = this;
  ajax.options = {
    url: ajax.url,
    data: ajax.submit,
    beforeSerialize: function (element_settings, options) {
      return ajax.beforeSerialize(element_settings, options);
    },
    beforeSubmit: function (form_values, element_settings, options) {
      return ajax.beforeSubmit(form_values, element_settings, options);
    },
    beforeSend: function (jqXHR, options) {
      jqXHR.ajaxRequestNumber = ++currentAjaxRequestNumber;
      return ajax.beforeSend(jqXHR, options);
    },
    uploadProgress: function (event, position, total, percentComplete) {
      ajax.uploadProgress(event, position, total, percentComplete);
    },
    success: function (response, status, jqXHR) {
      // Skip success if this request has been superseded by a later request.
      if (jqXHR.ajaxRequestNumber < currentAjaxRequestNumber) {
        return false;
      }
      // Sanity check for browser support (object expected).
      // When using iFrame uploads, responses must be returned as a string.
      if (typeof response == 'string') {
        response = $.parseJSON(response);

        // Prior to invoking the response's commands, verify that they can be
        // trusted by checking for a response header. See
        // ajax_set_verification_header() for details.
        // - Empty responses are harmless so can bypass verification. This avoids
        //   an alert message for server-generated no-op responses that skip Ajax
        //   rendering.
        // - Ajax objects with trusted URLs (e.g., ones defined server-side via
        //   #ajax) can bypass header verification. This is especially useful for
        //   Ajax with multipart forms. Because IFRAME transport is used, the
        //   response headers cannot be accessed for verification.
        if (response !== null && !Backdrop.settings.urlIsAjaxTrusted[ajax.url]) {
          if (jqXHR.getResponseHeader('X-Backdrop-Ajax-Token') !== '1') {
            var customMessage = Backdrop.t("The response failed verification so will not be processed.");
            return ajax.error(jqXHR, ajax.url, customMessage);
          }
        }

      }
      return ajax.success(response, status, jqXHR);
    },
    complete: function (jqXHR, status) {
      ajax.cleanUp(jqXHR);
      if (status == 'error' || status == 'parsererror') {
        return ajax.error(jqXHR, ajax.url);
      }
    },
    dataType: 'json',
    accepts: {
      json: element_settings.accepts || 'application/vnd.backdrop-ajax'
    },
    type: 'POST'
  };
  if (element_settings.dialog) {
    ajax.options.data.dialogOptions = element_settings.dialog;
  }

  // Bind the ajaxSubmit function to the element event.
  $(ajax.element).bind(element_settings.event, function (event) {
    if (!Backdrop.settings.urlIsAjaxTrusted[ajax.url] && !Backdrop.urlIsLocal(ajax.url)) {
      throw new Error(Backdrop.t('The callback URL is not local and not trusted: !url', {'!url': ajax.url}));
    }
    return ajax.eventResponse(this, event);
  });

  // If necessary, enable keyboard submission so that Ajax behaviors
  // can be triggered through keyboard input as well as e.g. a mousedown
  // action.
  if (element_settings.keypress) {
    $(ajax.element).keypress(function (event) {
      return ajax.keypressResponse(this, event);
    });
  }

  // If necessary, prevent the browser default action of an additional event.
  // For example, prevent the browser default action of a click, even if the
  // AJAX behavior binds to mousedown.
  if (element_settings.prevent) {
    $(ajax.element).bind(element_settings.prevent, false);
  }
};

/**
 * Handle a key press.
 *
 * The Ajax object will, if instructed, bind to a key press response. This
 * will test to see if the key press is valid to trigger this event and
 * if it is, trigger it for us and prevent other keypresses from triggering.
 * In this case we're handling RETURN and SPACEBAR keypresses (event codes 13
 * and 32. RETURN is often used to submit a form when in a textfield, and
 * SPACE is often used to activate an element without submitting.
 */
Backdrop.ajax.prototype.keypressResponse = function (element, event) {
  // Create a synonym for this to reduce code confusion.
  var ajax = this;

  // Detect enter key and space bar and allow the standard response for them,
  // except for form elements of type 'text' and 'textarea', where the
  // spacebar activation causes inappropriate activation if #ajax['keypress'] is
  // TRUE. On a text-type widget a space should always be a space.
  if (event.which == 13 || (event.which == 32 && element.type != 'text' && element.type != 'textarea')) {
    $(ajax.element_settings.element).trigger(ajax.element_settings.event);
    return false;
  }
};

/**
 * Handle an event that triggers an Ajax response.
 *
 * When an event that triggers an Ajax response happens, this method will
 * perform the actual Ajax call. It is bound to the event using
 * bind() in the constructor, and it uses the options specified on the
 * ajax object.
 */
Backdrop.ajax.prototype.eventResponse = function (element, event) {
  // Create a synonym for this to reduce code confusion.
  var ajax = this;

  try {
    if (ajax.form) {
      // If setClick is set, we must set this to ensure that the button's
      // value is passed.
      if (ajax.setClick) {
        // Mark the clicked button. 'form.clk' is a special variable for
        // ajaxSubmit that tells the system which element got clicked to
        // trigger the submit. Without it there would be no 'op' or
        // equivalent.
        element.form.clk = element;
      }

      ajax.form.ajaxSubmit(ajax.options);
    }
    else {
      ajax.beforeSerialize(ajax.element, ajax.options);
      $.ajax(ajax.options);
    }
  }
  catch (e) {
    $.error("An error occurred while attempting to process " + ajax.options.url + ": " + e.message);
  }

  // For radio/checkbox, allow the default event. On IE, this means letting
  // it actually check the box.
  if (typeof element.type != 'undefined' && (element.type == 'checkbox' || element.type == 'radio')) {
    return true;
  }
  else {
    return false;
  }

};

/**
 * Handler for the form serialization.
 *
 * Runs before the beforeSend() handler (see below), and unlike that one, runs
 * before field data is collected.
 */
Backdrop.ajax.prototype.beforeSerialize = function (element, options) {
  // Allow detaching behaviors to update field values before collecting them.
  // This is only needed when field values are added to the POST data, so only
  // when there is a form such that this.form.ajaxSubmit() is used instead of
  // $.ajax(). When there is no form and $.ajax() is used, beforeSerialize()
  // isn't called, but don't rely on that: explicitly check this.form.
  if (this.form) {
    var settings = this.settings || Backdrop.settings;
    Backdrop.detachBehaviors(this.form, settings, 'serialize');
  }

  // Prevent duplicate HTML ids in the returned markup.
  // @see backdrop_html_id()
  options.data['ajax_html_ids[]'] = [];
  $('[id]').each(function () {
    options.data['ajax_html_ids[]'].push(this.id);
  });

  // Allow Backdrop to return new JavaScript and CSS files to load without
  // returning the ones already loaded.
  // @see ajax_base_page_theme()
  // @see backdrop_get_css()
  // @see backdrop_get_js()
  var pageState = Backdrop.settings.ajaxPageState;
  options.data['ajax_page_state[theme]'] = pageState.theme;
  options.data['ajax_page_state[theme_token]'] = pageState.theme_token;
  for (var cssFile in pageState.css) {
    if (pageState.css.hasOwnProperty(cssFile)) {
      options.data['ajax_page_state[css][' + cssFile + ']'] = 1;
    }
  }
  for (var jsFile in pageState.js) {
    if (pageState.js.hasOwnProperty(jsFile)) {
      options.data['ajax_page_state[js][' + jsFile + ']'] = 1;
    }
  }

  // Provide an error if the dialog options can't be parsed.
  if (this.options.data.dialogOptions && typeof this.options.data.dialogOptions !== 'object') {
    $.error(Backdrop.t('The data-dialog-options property on this link is not valid JSON.'));
  }
};

/**
 * Modify form values prior to form submission.
 */
Backdrop.ajax.prototype.beforeSubmit = function (form_values, element, options) {
  // This function is left empty to make it simple to override for modules
  // that wish to add functionality here.
};

/**
 * Prepare the Ajax request before it is sent.
 */
Backdrop.ajax.prototype.beforeSend = function (jqXHR, options) {
  // For forms without file inputs, the jQuery Form plugin serializes the form
  // values, and then calls jQuery's $.ajax() function, which invokes this
  // handler. In this circumstance, options.extraData is never used. For forms
  // with file inputs, the jQuery Form plugin uses the browser's normal form
  // submission mechanism, but captures the response in a hidden IFRAME. In this
  // circumstance, it calls this handler first, and then appends hidden fields
  // to the form to submit the values in options.extraData. There is no simple
  // way to know which submission mechanism will be used, so we add to extraData
  // regardless, and allow it to be ignored in the former case.
  if (this.form) {
    options.extraData = options.extraData || {};

    // Let the server know when the IFRAME submission mechanism is used. The
    // server can use this information to wrap the JSON response in a TEXTAREA,
    // as per http://jquery.malsup.com/form/#file-upload.
    options.extraData.ajax_iframe_upload = '1';

    // The triggering element is about to be disabled (see below), but if it
    // contains a value (e.g., a checkbox, textfield, select, etc.), ensure that
    // value is included in the submission. As per above, submissions that use
    // $.ajax() are already serialized prior to the element being disabled, so
    // this is only needed for IFRAME submissions.
    var v = $.fieldValue(this.element);
    if (v !== null) {
      options.extraData[this.element.name] = Backdrop.checkPlain(v);
    }
  }

  // Disable the element that received the change to prevent user interface
  // interaction while the Ajax request is in progress.
  if (this.disable !== false) {
    $(this.element).addClass('progress-disabled').prop('disabled', true);
  }

  // Insert progressbar or throbber.
  if (this.progress.type == 'bar') {
    var progressBar = new Backdrop.progressBar('ajax-progress-' + this.element.id, $.noop, this.progress.method, $.noop);
    if (this.progress.message) {
      progressBar.setProgress(-1, this.progress.message);
    }
    if (this.progress.url) {
      progressBar.startMonitoring(this.progress.url, this.progress.interval || 1500);
    }
    this.progress.element = $(progressBar.element).addClass('ajax-progress ajax-progress-bar');
    this.progress.object = progressBar;
    $(this.element).after(this.progress.element);
  }
  else if (this.progress.type == 'throbber') {
    this.progress.element = $('<div class="ajax-progress ajax-progress-throbber"><div class="throbber">&nbsp;</div></div>');
    if (this.progress.message) {
      $('.throbber', this.progress.element).after('<div class="message">' + this.progress.message + '</div>');
    }
    $(this.element).after(this.progress.element);
  }

  // Register the AJAX request so it can be cancelled if needed.
  this.currentRequests.push(jqXHR);
};

/**
 * Handler for the updateProgress form event.
 */
Backdrop.ajax.prototype.uploadProgress = function (jqXHR, position, total, percentComplete) {
  if (this.progress.object) {
    var message = Backdrop.t('Uploading... (@current of @total)', {
      '@current': Backdrop.formatSize(position),
      '@total': Backdrop.formatSize(total)
    });
    this.progress.object.setProgress(percentComplete, message);
  }
};

/**
 * Handler for the form redirection completion.
 */
Backdrop.ajax.prototype.success = function (response, status, jqXHR) {
  // Remove the throbber and progress elements.
  this.cleanUp(jqXHR);

  // Process the response.
  Backdrop.freezeHeight();
  for (var i in response) {
    if (response.hasOwnProperty(i) && response[i].command && this.commands[response[i].command]) {
       this.commands[response[i].command](this, response[i], status);
    }
  }

  // Reattach behaviors, if they were detached in beforeSerialize(). The
  // attachBehaviors() called on the new content from processing the response
  // commands is not sufficient, because behaviors from the entire form need
  // to be reattached.
  if (this.form) {
    var settings = this.settings || Backdrop.settings;
    Backdrop.attachBehaviors(this.form, settings);
  }

  Backdrop.unfreezeHeight();

  // Remove any response-specific settings so they don't get used on the next
  // call by mistake.
  this.settings = null;
};

/**
 * Clean up after an AJAX response, success or failure.
 */
Backdrop.ajax.prototype.cleanUp = function (jqXHR) {
  // Remove the AJAX request from the current list.
  var index = this.currentRequests.indexOf(jqXHR);
  if (index > -1) {
    this.currentRequests.splice(index, 1);
  }

  // Remove the progress element (bar or throbber).
  if (this.progress.element) {
    $(this.progress.element).remove();
  }
  // Stop monitoring of the progress bar if present (bar only).
  if (this.progress.object) {
    this.progress.object.stopMonitoring();
    this.progress.object = null;
  }

  // Reactivate the triggering element.
  if (this.disable !== false) {
    $(this.element).removeClass('progress-disabled').prop('disabled', false);
  }
};

/**
 * Build an effect object which tells us how to apply the effect when adding new HTML.
 */
Backdrop.ajax.prototype.getEffect = function (response) {
  var type = response.effect || this.effect;
  var speed = response.speed || this.speed;

  var effect = {};
  if (type == 'none') {
    effect.showEffect = 'show';
    effect.hideEffect = 'hide';
    effect.showSpeed = '';
  }
  else if (type == 'fade') {
    effect.showEffect = 'fadeIn';
    effect.hideEffect = 'fadeOut';
    effect.showSpeed = speed;
  }
  else {
    effect.showEffect = type + 'Toggle';
    effect.hideEffect = type + 'Toggle';
    effect.showSpeed = speed;
  }

  return effect;
};

/**
 * Handler for the form redirection error.
 */
Backdrop.ajax.prototype.error = function (jqXHR, uri) {
  this.cleanUp(jqXHR);

  // Reattach behaviors, if they were detached in beforeSerialize().
  if (this.form) {
    var settings = this.settings || Backdrop.settings;
    Backdrop.attachBehaviors(this.form, settings);
  }
};

/**
 * Provide a series of commands that the server can request the client perform.
 */
Backdrop.ajax.prototype.commands = {
  /**
   * Command to insert new content into the DOM.
   */
  insert: function (ajax, response, status) {
    // Get information from the response. If it is not there, default to
    // our presets.
    var wrapper = response.selector ? $(response.selector) : $(ajax.wrapper);
    var method = response.method || ajax.method;
    var effect = ajax.getEffect(response);
    var settings;

    // We don't know what response.data contains: it might be a string of text
    // without HTML, so don't rely on jQuery correctly iterpreting
    // $(response.data) as new HTML rather than a CSS selector. Also, if
    // response.data contains top-level text nodes, they get lost with either
    // $(response.data) or $('<div></div>').replaceWith(response.data).
    var new_content_wrapped = $('<div></div>').html(response.data.replace(/^\s+|\s+$/g, ''));
    var new_content = new_content_wrapped.children();

    // For legacy reasons, the effects processing code assumes that new_content
    // consists of a single top-level element. Also, it has not been
    // sufficiently tested whether attachBehaviors() can be successfully called
    // with a context object that includes top-level text nodes. However, to
    // give developers full control of the HTML appearing in the page, and to
    // enable Ajax content to be inserted in places where DIV elements are not
    // allowed (e.g., within TABLE, TR, and SPAN parents), we check if the new
    // content satisfies the requirement of a single top-level element, and
    // only use the container DIV created above when it doesn't. For more
    // information, please see http://drupal.org/node/736066.
    if (new_content.length != 1 || new_content.get(0).nodeType != 1) {
      new_content = new_content_wrapped;
    }

    // If removing content from the wrapper, detach behaviors first.
    switch (method) {
      case 'html':
      case 'replaceWith':
      case 'replaceAll':
      case 'empty':
      case 'remove':
        settings = response.settings || ajax.settings || Backdrop.settings;
        Backdrop.detachBehaviors(wrapper, settings);
    }

    // Add the new content to the page.
    wrapper[method](new_content);

    // Immediately hide the new content if we're using any effects.
    if (effect.showEffect != 'show') {
      new_content.hide();
    }

    // Determine which effect to use and what content will receive the
    // effect, then show the new content.
    if ($('.ajax-new-content', new_content).length > 0) {
      $('.ajax-new-content', new_content).hide();
      new_content.show();
      $('.ajax-new-content', new_content)[effect.showEffect](effect.showSpeed);
    }
    else if (effect.showEffect != 'show') {
      new_content[effect.showEffect](effect.showSpeed);
    }

    // Attach all JavaScript behaviors to the new content, if it was
    // successfully added to the page and the elements not part of a larger form
    // (in which case they'll be processed all at once in
    var alreadyAttached = ajax.form && ajax.form.has(new_content).length > 0;
    if (!alreadyAttached && new_content.parents('body').length > 0) {
      // Apply any settings from the returned JSON if available.
      settings = response.settings || ajax.settings || Backdrop.settings;
      Backdrop.attachBehaviors(new_content, settings);
    }
  },

  /**
   * Command to remove a chunk from the page.
   */
  remove: function (ajax, response, status) {
    var settings = response.settings || ajax.settings || Backdrop.settings;
    Backdrop.detachBehaviors($(response.selector), settings);
    $(response.selector).remove();
  },

  /**
   * Command to mark a chunk changed.
   */
  changed: function (ajax, response, status) {
    if (!$(response.selector).hasClass('ajax-changed')) {
      $(response.selector).addClass('ajax-changed');
      if (response.asterisk) {
        $(response.selector).find(response.asterisk).append(' <abbr class="ajax-changed" title="' + Backdrop.t('Changed') + '">*</abbr> ');
      }
    }
  },

  /**
   * Command to provide an alert.
   */
  alert: function (ajax, response, status) {
    window.alert(response.text, response.title);
  },

  /**
   * Command to set the window.location, redirecting the browser.
   */
  redirect: function (ajax, response, status) {
    window.location = response.url;
  },

  /**
   * Command to provide the jQuery css() function.
   */
  css: function (ajax, response, status) {
    $(response.selector).css(response.argument);
  },

  /**
   * Command to set the settings that will be used for other commands in this response.
   */
  settings: function (ajax, response, status) {
    if (response.merge) {
      $.extend(true, Backdrop.settings, response.settings);
    }
    else {
      ajax.settings = response.settings;
    }
  },

  /**
   * Command to attach data using jQuery's data API.
   */
  data: function (ajax, response, status) {
    $(response.selector).data(response.name, response.value);
  },

  /**
   * Command to apply a jQuery method.
   */
  invoke: function (ajax, response, status) {
    var $element = $(response.selector);
    $element[response.method].apply($element, response.args);
  },

  /**
   * Command to restripe a table.
   */
  restripe: function (ajax, response, status) {
    // :even and :odd are reversed because jQuery counts from 0 and
    // we count from 1, so we're out of sync.
    // Match immediate children of the parent element to allow nesting.
    $('> tbody > tr:visible, > tr:visible', $(response.selector))
      .removeClass('odd even')
      .filter(':even').addClass('odd').end()
      .filter(':odd').addClass('even');
  },

  /**
   * Command to add css.
   *
   * Uses the proprietary addImport method if available as browsers which
   * support that method ignore @import statements in dynamically added
   * stylesheets.
   */
  addCss: function (ajax, response, status) {
    // Add the styles in the normal way.
    $('head').prepend(response.data);
    // Add imports in the styles using the addImport method if available.
    var match, importMatch = /^@import url\("(.*)"\);$/igm;
    if (document.styleSheets[0].addImport && importMatch.test(response.data)) {
      importMatch.lastIndex = 0;
      while (match = importMatch.exec(response.data)) {
        document.styleSheets[0].addImport(match[1]);
      }
    }
  },

  /**
   * Command to update a form's build ID.
   */
  updateBuildId: function(ajax, response, status) {
    $('input[name="form_build_id"][value="' + response['old'] + '"]').val(response['new']);
  }
};

})(jQuery, this);
