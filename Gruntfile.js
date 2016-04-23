module.exports = function(grunt) {
  
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'assets/src/js/jquery.gennav.js',
        dest: 'assets/js/jquery.gennav.min.js'
      }
    },

    less: {
      expanded: {
        options: {
          paths: ['assets/css']
        },
        files: {
          'assets/css/main.css': 'assets/src/less/main.less'
        }
      }
    },

    watch: {
      build: {
        files: ['assets/src/less/*.less', 'assets/src/js/*.js'],
        tasks: ['uglify', 'less'],
        options: { spawn: false }
      }
    }
  });

  // Load task plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Register tasks
  grunt.registerTask('default', ['uglify', 'less', 'watch']);

};
