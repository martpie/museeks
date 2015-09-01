var gulp = require('gulp');

var react       = require('gulp-react')
var sass        = require('gulp-sass');
var iconfont    = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');

var sassOptions =    {
    errLogToConsole: true,
    outputStyle: 'expanded'
};



/*
|--------------------------------------------------------------------------
| React
|--------------------------------------------------------------------------
*/

gulp.task('react', function () {
    return gulp.src('./src/views/*.jsx')
        .pipe(react())
        .pipe(gulp.dest('./src/dist/jsx'));
});



/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

gulp.task('styles', function () {
    return gulp
        .src('./src/styles/*.scss')
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(gulp.dest('./src/dist/css'));
});



/*
|--------------------------------------------------------------------------
| Fonts
|--------------------------------------------------------------------------
*/

gulp.task('font', function() {
    return gulp
        .src(['src/images/icons/*.svg'])
        .pipe(iconfont({
            fontName: 'player-font',
            appendUnicode: true,
            formats: ['ttf', 'eot', 'woff'],
            timestamp: Math.round(Date.now()/1000)
        }))
        .on('glyphs', function(glyphs) {
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
                .pipe(gulp.dest('./src/dist/css/'));
        })
        .pipe(gulp.dest('src/dist/fonts/'));
});



/*
|--------------------------------------------------------------------------
| Watch Tasks
|--------------------------------------------------------------------------
*/

gulp.task('default', ['react', 'styles', 'font'], function() {
    gulp.watch('./src/styles/*.scss',['styles']);
    gulp.watch('./src/views/*.jsx',['react']);
});
