module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jsdoc : {
      dist : {
        src: ['engine/src/**/*.js'],
        options: {
          destination: 'doc'
        }
      }
    },
    shell: {
      compileDebug: {
        command: [
          'cd engine/utils',
          './compile-debug.sh'
        ].join("&&")
      },
      compileMin: {
        command: [
          'cd engine/utils',
          './compile-min.sh'
        ].join("&&")
      },
    },
    watch: {
      scripts: {
        files: ['engine/src/**/*.js'],
        tasks: ['compile:debug'],
        options: {
          spawn: false,
        },
      },
    }
  });

  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('compile:debug', ['shell:compileDebug']);
  grunt.registerTask('compile:min', ['shell:compileMin']);
  grunt.registerTask('compile:all', ['compile:debug', 'compile:min']);
  grunt.registerTask('compile', ['compile:all']);
};
