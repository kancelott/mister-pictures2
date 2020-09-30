var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var sitemap = require('gulp-sitemap');
var pkg = require('./package.json');
var modernizr = require('gulp-modernizr');

// used for webp detection for CSS
gulp.task('modernizr', function() {
    return gulp.src('./js/*.js')
        .pipe(modernizr('modernizr.min.js', {
            "crawl": false,
            "customTests": [],
            "tests": [
                "webp"
            ],
            "options": [
                "setClasses"
            ]
        }))
        .pipe(uglify())
        .pipe(gulp.dest('js/'))
});

// Set the banner content
var banner = ['/*!\n',
    ' * Yarraville Picture Framing - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
    ' */\n',
    ''
].join('');

// Compiles SCSS files from /scss into /css
gulp.task('sass', function() {
    return gulp.src('scss/creative.scss')
        .pipe(sass())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify compiled CSS
gulp.task('minify-css', ['sass'], function() {
    return gulp.src('css/creative.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify custom JS
gulp.task('minify-js', function() {
    return gulp.src('js/creative.js')
        .pipe(uglify())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('js'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Copy vendor files from /node_modules into /vendor
// NOTE: requires `npm install` before running!
gulp.task('copy', function() {
    gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
        .pipe(gulp.dest('vendor/bootstrap'))

    gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('vendor/jquery'))

    gulp.src(['node_modules/magnific-popup/dist/*'])
        .pipe(gulp.dest('vendor/magnific-popup'))

    gulp.src(['node_modules/scrollreveal/dist/*.js'])
        .pipe(gulp.dest('vendor/scrollreveal'))

    gulp.src(['node_modules/tether/dist/js/*.js'])
        .pipe(gulp.dest('vendor/tether'))

    gulp.src(['node_modules/jquery.easing/*.js'])
        .pipe(gulp.dest('vendor/jquery-easing'))

    gulp.src([
            'node_modules/font-awesome/**',
            '!node_modules/font-awesome/**/*.map',
            '!node_modules/font-awesome/.npmignore',
            '!node_modules/font-awesome/*.txt',
            '!node_modules/font-awesome/*.md',
            '!node_modules/font-awesome/*.json'
        ])
        .pipe(gulp.dest('vendor/font-awesome'))
})

// Generate sitemap
gulp.task('sitemap', function () {
    gulp.src('*.html', {
            read: false,
            lastmod: function(file) {
                var cmd = 'git log -1 --format=%cI "' + file.relative + '"';
                return execSync(cmd, {
                    cwd: file.base
                }).toString().trim();
            }
        })
        .pipe(sitemap({
            siteUrl: 'https://yarravillepictureframing.com.au'
        }))
        .pipe(gulp.dest('./'));
});

// Default task
gulp.task('default', ['modernizr', 'sass', 'minify-css', 'minify-js', 'copy', 'sitemap']);

// Configure the browserSync task
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: ''
        },
    })
})

// Dev task with browserSync
gulp.task('dev', ['modernizr', 'sass', 'minify-css', 'minify-js'], function() {
    browserSync.init({
        open: false,
        server: {
            baseDir: './',
            index: "index.html"
        }
    });
    gulp.watch('scss/*.scss', ['sass']);
    gulp.watch('css/*.css', ['minify-css']);
    gulp.watch('js/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('*.html', browserSync.reload);
    gulp.watch('js/**/*.js', browserSync.reload);
});
