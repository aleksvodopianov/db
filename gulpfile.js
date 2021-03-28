

let projectFolder = 'dist'; // or ... = require("path").basename(__dirname); to name the folder by the project name ****************************************
let sourceFolder = 'src';
let fs = require('fs');

let path = { 
    build: {
        html: projectFolder + '/',
        css: projectFolder + '/css/',
        js: projectFolder + '/js/',
        img: projectFolder + '/img/',
        fonts: projectFolder + '/fonts/',
        webfonts: projectFolder + '/fonts/webfonts/'
    },
    src: {
        html: [sourceFolder + '/*.html', '!' + sourceFolder + '/_*.html'],
        css: [
            sourceFolder + '/sass/style.scss',
            '!' + sourceFolder + '/_*.scss',
        ],
        js: sourceFolder + '/js/script.js',
        img: sourceFolder + '/img/**/*.+(png|jpg|gif|ico|svg|webp) ',
        fonts: sourceFolder + '/fonts/*.+(ttf|css|eot|svg)',
        webfonts: sourceFolder + '/fonts/webfonts/*.+(ttf|eot|svg|woff|woff2)'
    },
    watch: {
        html: sourceFolder + '/**/*.html',
        css: sourceFolder + '/sass/**/*.scss',
        js: sourceFolder + '/js/**/*.js',
        img: sourceFolder + '/img/**/*.+(png|jpg|gif|ico|svg|webp) ',
    },
    clean: './' + projectFolder + '/',
};

let { src, dest } = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    fileInclude = require('gulp-file-include'),
    del = require('del'),
    scss = require('gulp-sass'),
    autoPrefixer = require('gulp-autoprefixer'),
    groupMedia = require('gulp-group-css-media-queries'),
    cleanCss = require('gulp-clean-css'),
    renameFile = require('gulp-rename'),
    uglify = require('gulp-uglify-es').default,
    imagemin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    babel = require('gulp-babel'),
    webpHtml = require('gulp-webp-html'),
    prettify = require('gulp-html-prettify'),
    webpcss = require('gulp-webpcss'),
    svgSprite = require('gulp-svg-sprite'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    fonter = require('gulp-fonter');

function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: './' + projectFolder + '/',
        },
        port: 3000,
        notify: false,
    });
}

function html() {
    return src(path.src.html)
        .pipe(fileInclude())
        .pipe(webpHtml())
        .pipe(prettify({ indent_char: ' ', indent_size: 4 }))
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
}

function css() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: 'expanded',
            }),
        )
        .pipe(groupMedia())
        .pipe(
            autoPrefixer({
                overrideBrowserslist: ['last 5 versions'],
                cascade: true,
            }),
        )
        .pipe(webpcss({ webpClass: '.webp', noWebpClass: '.no-webp' }))
        .pipe(dest(path.build.css))
        .pipe(cleanCss())
        .pipe(
            renameFile({
                extname: '.min.css',
            }),
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream());
}

function js() {
    return src(path.src.js)
        .pipe(fileInclude())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(
            renameFile({
                extname: '.min.js',
            }),
        )
        .pipe(babel())
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream());
}

function images() {
    return src(path.src.img)
        .pipe(
            webp({
                quality: 70,
            }),
        )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(
            imagemin({
                interlaced: true,
                progressive: true,
                optimizationLevel: 3,
                svgoPlugins: [
                    {
                        removeViewBox: false,
                    },
                ],
            }),
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream());
}

function fonts(params) {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(cleanCss())
        .pipe(
            renameFile({
                extname: '.min.css',
            }),
        )
        .pipe(dest(path.build.fonts))
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts));
}

function webfonts(params) {
    src(path.src.webfonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.webfonts));
}

// Next task genereted otf-files to ttf-files on folder "src" on terminal command "gulp otf2ttf" ***********************************************************
gulp.task('otf2ttf', function () {
    return src([sourceFolder = '/fonts/*.otf'])
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(dest(sourceFolder + '/fonts/'));
});

// Next task genereted svgsprite on terminal command "gulp svgSprite" **************************************************************************************
gulp.task('svgSprite', function () {
    return gulp.src([sourceFolder + '/iconsprite/*.svg'])
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: '../icons/icons.svg',
                    example: true // creates html-file with examples of icons (if it's necessary) **********************************************************
                }
            },
        }
        ))
        .pipe(dest(path.build.img));
});

function fontsStyle(params) {
    let file_content = fs.readFileSync(sourceFolder + '/sass/global/_fonts.scss');
    if (file_content == '') {
        fs.writeFile(sourceFolder + '/sass/global/_fonts.scss', '', cb);
        return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(
                            sourceFolder + '/sass/global/_fonts.scss',
                            '@include font("' +
                                fontname +
                                '", "' +
                                fontname +
                                '", "400", "normal");\r\n',
                            cb,
                        );
                    }
                    c_fontname = fontname;
                }
            }
        });
    }
}

function cb() {}


function watchFiles(params) {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

function clean(params) {
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts, webfonts), fontsStyle);
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.webfonts = webfonts;
exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
