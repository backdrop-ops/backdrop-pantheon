# code_syntax_highlighting_bundle

Adds a shortcode integration for using Highlight.js in the WYSIWYG editor.

## How To Install

1. Enable the bundle like any Backdrop module. 
2. Add it to the WYSIWYG Editor by choosing a text format under "admin/config/content/formats".
3. On your text format settings, check "Enable Insert Code Syntax shortcode" under the shortcode settings and "ShortCodes" under the "enabled filters"
select list.
4. Add the "{code}" button to "Avaiable Toolbar".
5. Add the Highlight.js bundled library from [the Highlight.js project bundler](https://highlightjs.org/download/) to a new `/libraries` directory in 
this module's root folder, e.g `/libraries/highlightjs/`.

## How To Use In WYSIWYG Editor

When you edit a node using the WYSIWYG text filter, you'll see button with brackets that allows you to enter code syntax.

<img width="363" alt="screen shot 2018-05-18 at 2 38 01 pm" src="https://user-images.githubusercontent.com/3640707/40257012-c22b0bbe-5aa9-11e8-845c-6a772b0272ff.png">

Once the dialog window is open, you can choose the language and insert the code syntax. 

<img width="478" alt="screen shot 2018-05-18 at 2 43 26 pm" src="https://user-images.githubusercontent.com/3640707/40257035-dc79e7f6-5aa9-11e8-9727-da38739f5492.png">

Then you will see a shortcode `[code lang="php"]$foo = "bar";[/code]` inserted into the body field with line breaks and indentation preserved.

<img width="703" alt="screen shot 2018-05-18 at 2 43 58 pm" src="https://user-images.githubusercontent.com/3640707/40257051-efe06f90-5aa9-11e8-9417-e55114b2c451.png">

Once saved, the code is rendered with syntax highlighting. You can change the theme by setting a variable, `drush vset csh_theme sunburst`, and the 
themes are located at https://highlightjs.org/static/demo/.

<img width="1212" alt="screen shot 2018-05-18 at 2 44 25 pm" src="https://user-images.githubusercontent.com/3640707/40257071-009f761e-5aaa-11e8-96eb-2e959289029c.png">
