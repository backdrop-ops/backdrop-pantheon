/**
 * @file
 * Backdrop Code Syntax Highlighting plugin.
 */

(function ($, Backdrop, CKEDITOR) {

  "use strict";

  console.log('foop');

  CKEDITOR.plugins.add('csh', {
    init: function (editor) {
      editor.addCommand('csh_command', new CKEDITOR.dialogCommand('code_sc_generatorDialog'));

      if (editor.ui.addButton) {
        editor.ui.addButton('CSH', {
          label: 'Code Syntax Highlighting',
          command: 'csh_command',
          icon: this.path + 'images/code_sc_button.png'
        });
      }

      CKEDITOR.dialog.add('code_sc_generatorDialog', this.path + 'dialogs/code_sc_generator.js');
    }
  });
})(jQuery, Backdrop, CKEDITOR);
