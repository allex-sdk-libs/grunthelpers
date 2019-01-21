var grunt = require('grunt');

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

/*
function loadGrunter (Lib) {
  return createGrunter(Lib, );
}
*/

function createGrunter (Lib) {
  'use strict';
  var Q = Lib.q,
    Node = require('allex_nodehelpersserverruntimelib')(Lib),
    Path = Node.Path,
    gruntLocation = findGruntLocation();

  function checkForGrunt (dir) {
    return Node.Fs.dirExists(Node.Path.join(dir, 'node_modules', 'grunt'));
  }

  function findGruntLocation () {
    var dir = __dirname;
    while (!checkForGrunt(dir)) {
      dir = Path.resolve(dir, '..');
    }
    return dir;
  }

  function finalizeGrunt(config) {
    var current = process.cwd();
    process.chdir(gruntLocation);
    config.GruntTasks.forEach(grunt.task.loadNpmTasks.bind(grunt.task));
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
      var res = config.grunt(grunt, params);
      if (Q.isThenable(res)) {
        res.then(finalizeGrunt.bind(null, config));
        return;
      }
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

