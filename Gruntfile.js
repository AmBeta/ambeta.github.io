module.exports = function(grunt) {
  
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: {
          'assets/js/jquery.gennav.min.js': 'assets/js/jquery.gennav.js', 
          'assets/js/ambeta.main.min.js': 'assets/js/ambeta.main.js'
        }
      }
    },

    less: {
      expanded: {
        options: {
          paths: ['assets/css']
        },
        files: {
          'assets/css/ambeta.main.css': 'assets/less/ambeta.main.less'
        }
      }
    },

    watch: {
      build: {
        files: ['assets/less/*.less', 'assets/js/*.js'],
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
