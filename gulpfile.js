'use strict';
const   gulp            = require('gulp'),                      // Сам сборщик Gulp
        pug             = require('gulp-pug'),                  // Пакет компиляции Pug (бывш. Jade)
        rename          = require('gulp-rename'),               // Переименование файлов в Gulp
        concat          = require('gulp-concat'),               // конкатенация (соединение нескольких файлов в один файл)
        autoPrefixer    = require('gulp-autoprefixer'),         // Пакет расстановки вендорных перфиксов
        sourcemaps      = require('gulp-sourcemaps'),           // Sourcemaps
        uglify          = require('gulp-uglify'),               // Минификация JS-файлов
        sass            = require('gulp-sass'),                 // Компиляции SCSS-файлов в CSS-файлы, более стабильный
        scssLint        = require('gulp-scss-lint'),            // sass(scss) линтер
        less            = require('gulp-less'),                 // Компиляции LESS-файлов в CSS-файлы
        imagemin        = require('gulp-imagemin'),             // Сжатие изображений в Gulp
        plumber         = require('gulp-plumber'),              // Настройка обработки ошибок в Gulp,
        debug           = require('gulp-debug'),                // дебаггер
        esLint          = require('gulp-eslint'),               // JS линтер
        cleaner         = require('gulp-clean'),
        browserSync     = require('browser-sync').create();     // 

/* This const need to src / dist simple notation :
 *
 * // const { src, dest, parallel, series, watch } = require('gulp');
 * 
 * EXAMPLE :
 *   return src(' ... ')
 *      .pipe(dest(' ... '))
 *   
 *   watch('path', option);
 */

/* Define paths & directories */
/* ========================================================================= */

const rootDir = './';
// const dir = {
//  src: 'src/',
//  dist: 'dist/',
//  build: 'build/',
//  assets: 'assets/'
// };
const path = {
//  scripts: [
//      '',
//      ''
//  ],
//  fonts: {
//      src: rootDir + dir.src + 'fonts/**/*.{eot,svg,ttf,woff,woff2}',
//      dest: 'dist/'
//  },
//  images: {
//      src: rootDir + dir.src + 'images/**.{png,jpg,gif,svg}',
//      dest: rootDir + dir.dist + 'images/**.{png,jpg,gif,svg}'
//  },
 src: {
     sass: rootDir + 'src/style/**/*.s+(a|c)ss',
//      fonts: rootDir + dir.src + 'fonts/**/*.{eot,svg,ttf,woff,woff2}',
//      images: {
//          input: '', 
//          output: rootDir + dir.src + 'images/**.{png,jpg,gif,svg}',
//      }
 }
//     dest: {
//         js: rootDir + dir.dist,
//         constants: rootDir + dir.dist,
//         html: 'dist/',
//         css: 'dist/'
//     },
//     watch: {
//         html: rootDir + 'src/html/**/*.pug',
//         images: rootDir + 'src/images/**',
//         sass: rootDir + 'src/style/**/*.scss',
//         js: rootDir + 'src/scripts/**/*.js'
//     }
// };
// const paths = {
//   styles: {
//     src: 'src/styles/**/*.less',
//     dest: 'dist/styles/'
//   },
//   scripts: {
//     src: 'src/scripts/**/*.js',
//     dest: 'dist/scripts/'
//   }
};

/* Define tasks plain functions */
/* ========================================================================= */

// HTML / PUG TASKS
// ------------------------------------------------------------------------- */

function html() {
    return gulp.src('src/html/*.pug')
        .pipe(plumber())
        .pipe(pug({
            pretty: '\t'
        }))
        .pipe(plumber.stop())
        .pipe(rename('index.html'))
        .pipe(gulp.dest('dist'))
}

// STYLE TASKS (SCSS)
// ------------------------------------------------------------------------- */

function styleSCSS() {

    // sass.compiler = require('node-sass');
    
    return gulp.src(path.src.sass)
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(autoPrefixer({
            browsers: ['last 3 versions'],
            cascade: false
        }))
        .pipe(plumber())
        .pipe(sass({
            // outputStyle: 'expanded'
            outputStyle: 'compact'
            // outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(rename('style.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/css'))
}

// STYLE TASKS (LESS)
// ------------------------------------------------------------------------- */

let cleanCSS = require('gulp-clean-css');
var LessAutoprefix = require('less-plugin-autoprefix');
var autoprefix = new LessAutoprefix({ browsers: ['last 2 versions'] });

function styleLESS() {
  return gulp.src('src/style/**/*.less')
    .pipe(sourcemaps.init())
    .pipe(less({
        plugins: [autoprefix]
    }))
    .pipe(sourcemaps.write('./maps'))
    // .pipe(cleanCSS({
    //         debug: true,
    //         compatibility: 'ie8'
    //     }, (details) => {
    //         console.log(`${details.name}: ${details.stats.originalSize}`);
    //         console.log(`${details.name}: ${details.stats.minifiedSize}`);
    // }))
    .pipe(rename({
        basename: 'main',
        suffix: '.min'
    }))
    .pipe(gulp.dest('dist/css'));
}

// JAVASCRIPT TASKS
// ------------------------------------------------------------------------- */

function scripts() {

    var rootDir = './src';
    var js = [
        // rootDir + '/partials/lib/jquery-2.1.1.js',
        // rootDir + '/partials/lib/jquery.mask.js',
        rootDir + '/scripts/js/scripts.js'
    ];
    
    // return src(js)
    return gulp.src(js)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('script.js'))
        // .pipe(uglify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('dist/js/'))
}

// TYPESCRIPT TASKS
// ------------------------------------------------------------------------- */

const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

function typeScript() {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"))
}

// IMAGES TASKS
// ------------------------------------------------------------------------- */

var imgPATH = {
    "input": ["src/images/**/*.{png,jpg,gif,svg}",
        '!src/images/svg/*'],
    "ouput": "dist/images/"
};

function images() {
    return gulp.src('src/images/**')
        .pipe(plumber())
        .pipe(imagemin({
                optimizationLevel: 5,
                progressive: true
            },
            [
                imagemin.gifsicle({interlaced: true}),
                imagemin.jpegtran({progressive: true}),
                imagemin.optipng({optimizationLevel: 5}),
                imagemin.svgo({
                    plugins: [
                        {removeViewBox: true},
                        {cleanupIDs: false}
                    ]
                })
            ])
        )
        .pipe(gulp.dest('dist/images'))
}

// FONTS TASKS
// ------------------------------------------------------------------------- */

function fonts() {
    return gulp.src('src/fonts/**')
        .pipe(gulp.dest('dist/fonts'))
}

// LIBRARIES TASKS
// ------------------------------------------------------------------------- */

// TESTS and LINTERS TASKS
// ------------------------------------------------------------------------- */

function scss_lint() {

    return gulp.src('src/style/**')
        .pipe(plumber())
        .pipe(scssLint({ 
            'config': 'smacss.yml',
            'reporterOutput': 'scssReport.json'
        }))
}

function js_lint() {
    return gulp.src('src/scripts/**/*.js')
        .pipe(esLint())
        .pipe(esLint.format())
        .pipe(esLint.failAfterError())
}

// SERVICES TASKS
// ------------------------------------------------------------------------- */

function clean(callback) {
    gulp.src('dist', {read: false})
        .pipe(cleaner())
    callback();
}

// function del() {
//     return del([ 'dist' ]);
// }

function watch() {
    gulp.watch('src/html/**/*.pug', html).on("change", browserSync.reload);
    gulp.watch('src/style/**/*.s+(a|c)ss', styleSCSS).on("change", browserSync.reload);
    gulp.watch('src/fonts/**/*.{eot,svg,ttf,woff,woff2}', fonts).on("change", browserSync.reload);
    gulp.watch('src/images/**/*.{png,jpg,gif,svg}', images).on("change", browserSync.reload);
}

function livereload() {
    return browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });
}

// GULP RUN
/* ========================================================================= */

// Register tasks to expose to the CLI
// ------------------------------------------------------------------------- */

exports.html = html;
exports.styleSCSS = styleSCSS;
exports.styleLESS = styleLESS;
exports.fonts = fonts;
exports.images = images;
exports.clean = clean;
exports.scripts = scripts;
exports.typeScript = typeScript;
exports.scss_lint = scss_lint;
// exports.js_lint = js_lint;
exports.livereload = livereload;

/* -------------------------------------------------------------------------
 * Define default task that can be called by just running `gulp` from cli
 * -------------------------------------------------------------------------
 */ 

// v 0.1
// var prod = gulp.series(gulp.parallel(images));

// gulp.task('production', prod);
// gulp.task('default', build);

// v 0.2
exports.default = gulp.series(html, styleSCSS, scripts, images, fonts, gulp.parallel(watch, livereload));
