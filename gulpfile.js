"use strict";

const { src, dest, watch } = require("gulp");
const gulp = require("gulp");

const browsersync = require("browser-sync").create();
const clean = require("gulp-clean");
const autoprefixer = require("gulp-autoprefixer");
const cssbeautify = require("gulp-cssbeautify");
const cssnano = require("gulp-cssnano");
const imagemin = require("gulp-imagemin");
const plumber = require("gulp-plumber");
const pug = require("gulp-pug");
const rename = require("gulp-rename");
const rigger = require("gulp-rigger");
const sass = require("gulp-sass")(require("node-sass"));
const stripcsscomments = require("gulp-strip-css-comments");
const uglify = require("gulp-uglify");

let path = {
  build: {
    html: "dist/",
    js: "dist/assets/js/",
    css: "dist/assets/css/",
    font: "dist/assets/fonts/",
    images: "dist/assets/img/",
  },
  src: {
    html: "src/*.html",
    js: "src/assets/js/*.js",
    pug: "src/pug/pages/*.pug",
    css: "src/assets/sass/style.scss",
    font: "src/assets/fonts/*",
    images: "src/assets/img/**/*.{jpg,png,gif,ico,svg}",
  },
  watch: {
    html: "src/*.html",
    js: "src/assets/js/**/*.js",
    pug: "src/pug/**/*.pug",
    css: "src/assets/sass/**/*.scss",
    font: "src/assets/fonts/*",
    images: "src/assets/img/**/*.{jpg,png,gif,ico,svg}",
  },
  clean: "./dist",
};

function browserSync() {
  browsersync.init({
    server: {
      baseDir: "./dist/",
    },
    port: 3000,
  });
}

function css() {
  return src(path.src.css, { base: "src/assets/sass/" })
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(cssbeautify())
    .pipe(dest(path.build.css))
    .pipe(cssnano())
    .pipe(stripcsscomments())
    .pipe(rename({ suffix: ".min", extname: ".css" }))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

function js() {
  return src(path.src.js, { base: "./src/assets/js/" })
    .pipe(plumber())
    .pipe(rigger())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({ suffix: ".min", extname: ".js" }))
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

function images() {
  return src(path.src.images)
    .pipe(imagemin())
    .pipe(dest(path.build.images));
}

function clean() {
  return src(path.clean, { allowEmpty: true, read: false }).pipe(clean());
}

function pug() {
  return src(path.src.pug, { base: "./src/pug/pages/" })
    .pipe(pug({ pretty: true }))
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

function font() {
  return src(path.src.font, { base: "./src/assets/fonts/" })
    .pipe(dest(path.build.font))
    .pipe(browsersync.stream());
}

function watchFiles() {
  watch([path.watch.pug], pug);
  watch([path.watch.font], font);
  watch([path.watch.images], images);
  watch([path.watch.css], css);
  watch([path.watch.js], js);
}

const build = gulp.parallel(clean, css, font, images, pug, js);
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.css = css;
exports.js = js;
exports.pug = pug;
exports.font = font;
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;
