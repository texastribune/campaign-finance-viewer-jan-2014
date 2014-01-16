var gulp = require('gulp');
var _ = require('lodash');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var preFile = ['src/js/pre.js'];
var postFile = ['src/js/post.js'];

var scriptFiles = [
    'src/js/models.js',
    'src/js/collections.js',
    'src/js/views.js',
    'src/js/app.js'
];

var styleFiles = 'src/css/*.css';

gulp.task('compile', function() {
    gulp.src(_.union(preFile, scriptFiles, postFile, ['!src/libs/*.js']))
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./dist/'))
        .pipe(rename('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/'));

    gulp.src('./src/js/libs/*.js')
        .pipe(gulp.dest('./dist/libs/'));

    gulp.src(styleFiles)
        .pipe(gulp.dest('./dist/'));
});

gulp.task('lint', function() {
    gulp.src(scriptFiles).pipe(jshint());
});

gulp.task('default', function(){
    gulp.run('lint', 'compile');
    gulp.watch([scriptFiles, styleFiles], function(){
        gulp.run('lint', 'compile');
    });
});
