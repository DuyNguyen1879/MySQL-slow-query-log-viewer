// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var minify = require("gulp-minify");
var gutil = require('gulp-util');

// Lint Task
gulp.task('lint', function() {
    return gulp.src('src/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Compile Our Sass
gulp.task('sass', function() {
    return gulp.src([
            'src/scss/*.scss',
            "bower_components/**/alertify.css"
        ])
        .pipe(sass())
        .pipe(concat('app.css'))
        .pipe(gulp.dest('app/css'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src([
            'bower_components/jquery/**/*.min.js',
            'bower_components/**/alertify.js',
            'bower_components/**/handlebars.min.js',
            'src/js/**/*.js'
        ])
        .pipe(concat('app.min.js'))
        .pipe(uglify().on('error', gutil.log))
        .pipe(gulp.dest('app/js'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('src/js/**/*.js', ['lint', 'scripts']);
    gulp.watch('src/scss/*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['lint', 'sass', 'scripts', 'watch']);