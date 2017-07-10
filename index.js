var grunt = require('grunt'), 
  Path = require('path');

function createGrunter (Lib) {
  'use strict';
  var Q = Lib.q;
  function appendifKeys(tasklist,taskname, config) {
    if (!config || !Object.keys(config).length) {
      return;
    }
    tasklist.push (taskname);
  }

  function appendKeyMap (map, tasklist) {
    if (!tasklist) tasklist = [];
    for (var i in map) {
      appendifKeys(tasklist, i, map[i]);
    }
    return tasklist;
  }

  function finalizeGrunt(config) {
    var current = process.cwd();
    process.chdir(Path.resolve(__dirname, './'));
    config.GruntTasks.forEach(grunt.task.loadNpmTasks.bind(grunt.tasks));
    grunt.task.run(config.tasklist);
    process.chdir(current);
    if (Lib.isFunction(config.done)) {
      grunt.task.options({
        done: config.done
      });
    }
    grunt.task.start();

  }

  function goforGrunt (config, params, grunt_config) {
    if (grunt_config && grunt_config.verbose) {
      grunt.option('verbose', true);
    }
    if (config.async) {
      var d = Q.defer();
      d.promise.done(finalizeGrunt.bind(null, config));
      config.grunt(grunt, params, d);
    }else{
      config.grunt(grunt, params);
      finalizeGrunt(config);
    }
  }
  return {
    appendifKeys: appendifKeys,
    appendKeyMap: appendKeyMap,
    goforGrunt : goforGrunt
  };
}

module.exports = createGrunter;

