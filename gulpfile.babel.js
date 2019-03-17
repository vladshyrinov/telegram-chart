import gulp from 'gulp';
import sass from 'gulp-sass';
import babel from 'gulp-babel';
import rename from 'gulp-rename';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import htmlmin from 'gulp-htmlmin';
import cleanCss from 'gulp-clean-css';
import del from 'del';
import browserSync from 'browser-sync';

const server = browserSync.create();

const paths = {
    html: {
        src: './src/index.html',
        dest: './dist'
    },
    styles: {
        src: './src/styles/**/*.scss',
        dest: './dist/styles'
    },
    scripts: {
        src: ['node_modules/regenerator-runtime/runtime.js', 
        './src/scripts/SwipeHandler.js', 
        './src/scripts/chart.js'],
        dest: './dist/scripts'
    },
    data: {
        src: './src/data/*',
        dest: './dist/data'
    },
    fonts: {
        src: './src/fonts/*',
        dest: './dist/fonts'
    }
};

const clean = () => {
    return del(['dist']);
}

const html = () => {
    return gulp.src(paths.html.src)
        .pipe(htmlmin({collapseWhitespace: true }))
        .pipe(gulp.dest(paths.html.dest));
}

const styles = () => {
    return gulp.src(paths.styles.src)
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCss())
        .pipe(rename({
            basename: 'main',
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.styles.dest));
}

const scripts = () => {
    return gulp.src(paths.scripts.src, {sourcemaps: true})
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))    
        .pipe(uglify({
            mangle: false
        }))
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest(paths.scripts.dest));
}

const data = () => {
    return gulp.src(paths.data.src)
        .pipe(gulp.dest(paths.data.dest))
}

const fonts = () => {
    return gulp.src(paths.fonts.src)
        .pipe(gulp.dest(paths.fonts.dest))
}

const reload = (done) => {
    server.reload();
    done();
}

const serve = (done) => {
    server.init({
        server: {
            baseDir: "./dist"
        }
    });
    done();
}

const watch = () => {
    gulp.watch(paths.html.src, gulp.series(html, reload));
    gulp.watch(paths.scripts.src, gulp.series(scripts, reload));
    gulp.watch(paths.styles.src, gulp.series(styles, reload));
}

const build = gulp.series(clean, fonts, data, html, gulp.parallel(styles, scripts), serve, watch);

export default build;