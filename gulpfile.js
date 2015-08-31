var gulp = require('gulp');

var sass        = require('gulp-sass');
var iconfont    = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');

var sassOptions =    {
    errLogToConsole: true,
    outputStyle: 'expanded'
};

gulp.task('styles', function () {
    return gulp
        .src('./src/styles/*.scss')
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(gulp.dest('./src/css'));
});

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
                    return { name: glyph.name, codepoint: glyph.unicode[0].charCodeAt(0) };
                }),
                fontName: 'player-font',
                fontPath: '../fonts/',
                className: 'pf'
            };

            gulp.src('src/styles/templates/player-font.css')
                .pipe(consolidate('lodash', options))
                .pipe(gulp.dest('src/css/'));
        })
        .pipe(gulp.dest('src/fonts/'));
});

// Watch task(s)
gulp.task('default', ['styles', 'font'], function() {
    gulp.watch('./src/styles/*.scss',['styles']);
});
