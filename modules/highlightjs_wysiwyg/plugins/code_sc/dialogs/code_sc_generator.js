/**
 * The code dialog definition.
 *
 * Created out of the CKEditor Plugin SDK:
 * http://docs.ckeditor.com/#!/guide/plugin_sdk_sample_1
 */
CKEDITOR.dialog.add('code_sc_generatorDialog', function (editor) {

  return {
    title: 'Code Syntax Highlighting',
    minWidth: 400,
    minHeight: 300,
    contents: [
      {
        id: 'tab-settings',
        label: 'Code Syntax Highlighting Settings',
        // The tab contents.
        elements: [
          {
            // Select input for language.
            type: 'select',
            id: 'select-language',
            label: 'Select Language',
            items: [
              ['PHP', 'php'],
              ['JavaScript', 'javascript'],
              ['HTML', 'html'],
              ['CSS', 'css'],
              ['Bash', 'bash'],
              ['SQL', 'sql'],
            ],
            'default': 'php'
          },
          {
            // Text input for code.
            type: 'textarea',
            id: 'code-text',
            label: 'Code Syntax',
            // Validation checking whether the field is not empty.
            validate: CKEDITOR.dialog.validate.notEmpty("Please add some code.")
          }
        ]
      }
    ],

    // This method is invoked once a user clicks the OK button, confirming the dialog.
    onOk: function () {

      // The context of this function is the dialog object itself.
      // http://docs.ckeditor.com/#!/api/CKEDITOR.dialog
      var dialog = this;

      // Get Fields.
      var language = dialog.getValueOf('tab-settings', 'select-language');
      var code = dialog.getValueOf('tab-settings', 'code-text').split('\n').join('<br>').split(' ').join('&nbsp;');

      editor.insertHtml('[code language="' + language + '"]' + code + '[/code]');
    }
  };
});

