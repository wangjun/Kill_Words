module.exports = function(config) {
  config.set({
    basePath: './',
    frameworks: ['jasmine'],
    files: [
        'static/js/angular.js',
        'static/js/angular-*.js',
        'static/js/*.js',
        'tests/*.js'
    ],
    exclude: [
        'static/js/*.min.js'
    ],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['PhantomJS'],
    singleRun: false
  });
};
