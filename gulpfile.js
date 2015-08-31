var gulp = require('gulp');
var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');

gulp.task('font', function() {
  return gulp
    .src(['src/images/icons/*.svg'])
    .pipe(iconfont({
      fontName: 'player-font',
      appendUnicode: true,
      formats: ['ttf', 'eot', 'woff'],
      timestamp: Math.round(Date.now()/1000)
    }))
    .on('glyphs', function(glyphs, options) {
      var options = {
        glyphs: glyphs.map(function(glyph) {
          return { name: glyph.name, codepoint: glyph.unicode[0].charCodeAt(0) }
        }),
        fontName: 'player-font',
        fontPath: '../fonts/',
        className: 'pf'
      };

      gulp.src('src/css/templates/player-font.css')
        .pipe(consolidate('lodash', options))
        .pipe(gulp.dest('src/css/'));
    })
    .pipe(gulp.dest('src/fonts/'));
});
