var gulp = require('gulp'),
    gfi = require('gulp-file-insert'),
    replace = require('gulp-replace'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-spawn-mocha'),
    phantom = require('gulp-mocha-phantomjs');

gulp.task('hint', function() {
    return gulp.src('src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});
gulp.task('node', function() {
    return gulp.src('src/mosaic-rest-js.js')
    .pipe(gfi({
        "/* include */": "src/node.js",
    }))
    .pipe(gulp.dest('./dist/node/'));
});
gulp.task('jquery', function() {
    return gulp.src('src/mosaic-rest-js.js')
    .pipe(replace("'#lib#'", "'jquery'"))
    .pipe(replace("'#lib_global#'", 'jQuery'))
    .pipe(gfi({
        "/* include */": "src/jquery.js",
    }))
    .pipe(gulp.dest('./dist/jquery/'));
});
gulp.task('angular', function() {
    return gulp.src('src/mosaic-rest-js.js')
    .pipe(replace("'#lib#'", "'angular'"))
    .pipe(replace("'#lib_global#'", 'angular'))
    .pipe(gfi({
        "/* include */": "src/angular.js",
    }))
    .pipe(gulp.dest('./dist/angular/'));
});
gulp.task('min', ['jquery', 'angular'], function() {
    return gulp.src(['./dist/jquery/mosaic-rest-js.js', './dist/angular/mosaic-rest-js.js'])
    .pipe(uglify())
    .pipe(rename(function(path) {
        path.basename += '.min';
    }))
    .pipe(gulp.dest(function(vyn) {
        return vyn.base;
    }));
});

gulp.task('test-node', ['node'], function () {
    return gulp.src('./test/spec.js', {read: false})
    .pipe(mocha({
        r: './test/config/node.js'
    }));
});
gulp.task('test-jq', ['jquery'], function () {
    return gulp
    .src('test/runner_jquery.html')
    .pipe(phantom({
        phantomjs: {
            settings: {
                localToRemoteUrlAccessEnabled: true
            }
        }
    }));
});
gulp.task('test-ng', ['angular'], function () {
    return gulp
    .src('test/runner_angular.html')
    .pipe(phantom({
        phantomjs: {
            settings: {
                localToRemoteUrlAccessEnabled: true
            }
        }
    }));
});
