module.exports = function(grunt){
    grunt.initConfig ({
       pkg: grunt.file.readJSON('package.json'),
       concat: {
            dist: {
                src: [
                    'static/js/app.js',
                    'static/js/controllers.js',
                    'static/js/filters.js',
                    'static/js/service.js'
                ],
                dest: 'static/js/dist/killws.js'
            }
        },
        uglify: {
            build: {
                src: 'static/js/dist/killws.js',
                dest: 'static/js/dist/killws.min.js'
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('concat',['concat']);
    grunt.registerTask('default',['uglify']);
};