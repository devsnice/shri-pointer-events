const gulp = require("gulp");
const gulpSequence = require("gulp-sequence");

const path = require("path");

const pug = require("gulp-pug");

const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const concatCss = require("gulp-concat-css");
const sass = require("gulp-sass");

const flatten = require("gulp-flatten");

const webpack = require("webpack");
const webpackStream = require("webpack-stream");

const svgSymbols = require("gulp-svg-symbols");

const browserSync = require("browser-sync").create();

const paths = {
  public: "./docs",
  views: "./src/**/*.pug",
  pages: "./src/pages/**/*.pug",
  styles: "./src/**/*.scss",
  scripts: "./src/**/*.js",
  images: "./src/images/**/*.{png,svg,jpeg}",
  icons: "./src/icons/**/*.svg"
};

/*
    Pug to HTML
*/

gulp.task("pug", () =>
  gulp
    .src(paths.pages)
    .pipe(
      pug({
        verbose: true,
        pretty: true
      })
    )
    .pipe(gulp.dest(paths.public))
);

/*
    PostCSS
*/

gulp.task("scss", () => {
  const plugins = [autoprefixer({ browsers: ["last 2 version"] })];

  return gulp
    .src(paths.styles)
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss(plugins))
    .pipe(concatCss("styles.css"))
    .pipe(gulp.dest(`${paths.public}`));
});

/*
    Scripts
*/

gulp.task("scripts", () =>
  gulp
    .src("./src/pages/index.js")
    .pipe(
      webpackStream({
        output: {
          filename: "main.js"
        },
        mode: "development",
        devtool: "source-map",
        module: {
          rules: [
            {
              test: /\.(js)$/,
              loader: "babel-loader"
            }
          ]
        }
      })
    )
    .pipe(gulp.dest(`${paths.public}/scripts`))
);

/*
    Images
*/

gulp.task("images", () =>
  gulp
    .src(paths.images)
    .pipe(flatten())
    .pipe(gulp.dest(`${paths.public}/images`))
);

/*
    Icons
*/

gulp.task("icons", () =>
  gulp
    .src(paths.icons)
    .pipe(
      svgSymbols({
        templates: ["default-svg"]
      })
    )
    .pipe(gulp.dest(`./src/layout/css`))
);

/*
    Static server
*/

gulp.task("browser-sync", () => {
  browserSync.init({
    server: {
      baseDir: paths.public
    }
  });
});

const reloadServer = done => {
  browserSync.reload();
  done();
};

/*
    Watchers
*/

gulp.task("pug-watch", ["pug"], reloadServer);
gulp.task("css-watch", ["scss"], reloadServer);
gulp.task("scripts-watch", ["scripts"], reloadServer);

gulp.task("watch", () => {
  gulp.watch(paths.views, ["pug-watch"]);
  gulp.watch(paths.pages, ["pug-watch"]);
  gulp.watch(paths.styles, ["css-watch"]);
  gulp.watch(paths.scripts, ["scripts-watch"]);
});

gulp.task(
  "sequence-gulp",
  gulpSequence(["icons", "pug", "scss", "scripts", "images", "watch"])
);

gulp.task("default", ["sequence-gulp"], () => {
  browserSync.init({
    server: {
      baseDir: paths.public
    }
  });
});
