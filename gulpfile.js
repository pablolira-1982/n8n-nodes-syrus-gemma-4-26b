const gulp = require('gulp');

function copyIcons() {
  return gulp.src('nodes/**/*.{png,svg}')
    .pipe(gulp.dest('dist/nodes'));
}

exports['copy:icons'] = copyIcons;
exports.default = copyIcons;
