;(function() {
  
  var fs = require('fs');
  var exec = require('child_process').exec;
  var rl = require('readline');
  var Seq = require('seq');
  var request = require('superagent');
  var os = require('os');

  /**
   * notSure code review script
   *
   * Shellscript that grabs a git/svn diff of the current directory,
   * asks for `title`, `description` and `developers` to inform
   * and then prints a nice output ready to send for code review.
   */
  var notSure = {};

  /**
   * Execute a git/svn diff and pass results to `cb()`
   * 
   * @param {String} cmd VCS shell command
   * @param {Function} cb Gets passed errors and diff output
   */
  notSure.getDiff = function(cmd, cb) {
    if (cmd === 'git' && os.type() !== 'Windows_NT') {
      exec('(export GIT_INDEX_FILE=.git/tempindex; '
        + 'cp .git/index $GIT_INDEX_FILE; '
        + 'git add .; git diff -U3 --cached)', consume);
    } else {
      exec(cmd+' diff', consume);
    }
    function consume(err, stdout) {
      if (err) return cb(err);
      if (stdout.length === 0) return cb(new Error('No files changes'));
      cb(null, stdout);
    };
  };

  /**
   * Check the filesystem for a `.git`/`.svn` folder in the cwd
   * and pass the first found VCS to `cb()`
   *
   * @param {Function} cb Gets passed errors and Vcs name
   */
  notSure.findVcs = function(cb) {
    fs.readdir('.', function(err, files) {
      if (err) return cb(err);
      if (files.indexOf('.git') > -1) return cb(null, 'git');
      if (files.indexOf('.svn') > -1) return cb(null, 'svn');
      cb(new Error('No SCM found'));
    });
  };

  /**
   * Ask for the issue's `title` and `description`
   * and which developers to ask
   *
   * @param {Function} cb Gets passed answers object
   */
  notSure.askQuestions = function(cb) {
    var i = rl.createInterface(process.stdin, process.stdout, null);
    // Make i.questions() use a error param
    var question = function(q,c){i.question(q,function(a){c(null,a)})};

    Seq()
      .seq('title', function() { question('Title of issue: ', this); })
      .seq('desc', function() { question('Description: ', this); })
      .seq(function() {
        i.close();
        process.stdin.destroy();
        cb(null, {
          title: this.vars['title'],
          description: this.vars['desc']
        });
      });
  };

  notSure.sendToServer = function(data) {
    request
      .put('http://127.0.0.1:3000/reviews')
      .set('Content-Type', 'application/json')
      .send(data)
      .end(function(res){
        console.log('http://127.0.0.1:3000/reviews/'+res.body.id);
      });
  }

  /**
   * Perform the whole dance from checks and questions to the finished
   * output
   */
  notSure.ask = function() {
    Seq()
      .seq(function() { notSure.findVcs(this); })
      .seq('diff', function(vcs) { notSure.getDiff(vcs, this); })
      .seq(function() { notSure.askQuestions(this); })
      .seq(function(answers) {
        notSure.sendToServer({
          title: answers.title,
          description: answers.description,
          diff: this.vars['diff']
        });
      })
      .catch(function(err) { console.log(err); });
  }

  /**
   * Only call `ask()` if not included by another module.
   */
  if (!module.parent) {
    notSure.ask()
  } else {
    module.exports = notSure;
  }

})();