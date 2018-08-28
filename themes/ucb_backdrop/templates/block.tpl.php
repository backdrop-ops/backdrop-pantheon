<div class="block <?php print $classes; ?>">
  <div class="block-inner">
    <?php print render($title_prefix); ?>
    <?php if ($title): ?>
      <h2 class="block-title"><?php print $title; ?></h2>
    <?php endif; ?>
    <?php print render($title_suffix); ?>

    <div class="block-content">
      <?php print render($content); ?>
    </div>
  </div>
</div>
