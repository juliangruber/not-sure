;(function() {
  
  var fs = require('fs');
  var exec = require('child_process').exec;
  var rl = require('readline');
  var Seq = require('seq');

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
   * TODO: Check if svn includes new files in the diff
   * 
   * @param {String} cmd VCS shell command
   * @param {Function} cb Gets passed errors and diff output
   */
  notSure.getDiff = function(cmd, cb) {
    if (cmd === 'git') {
      exec('(export GIT_INDEX_FILE=.git/tempindex; '
        + 'cp .git/index $GIT_INDEX_FILE; '
        + 'git add .; git diff --cached)', consume);
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
      .seq('devs', function() { question('Developers to ask: ', this); })
      .seq(function() {
        i.close();
        process.stdin.destroy();
        var answers = [];
        
        if (this.vars['title'].length > 0) {
          answers.push(notSure.underline(this.vars['title']));
        }
        if (this.vars['desc'].length > 0) {
          answers.push(this.vars['desc']);
        }
        if (this.vars['devs'].length > 0) {
          answers.push('asked: '+this.vars['devs']);
        }
          
        cb(null, answers.join('\n\n'));
      });
  };

  /**
   * Helper function that underlines a string
   *
   * @param {String} string
   * @param {String} char Character to underline `string` with
   * @returns {String} Underlined string
   */
  notSure.underline = function(string, char) {
    char = char || '=';
    var underline = '';
    for (var i=0; i<string.length; i++) underline += char;
    return string+'\n'+underline;
  }

  notSure.clearTerminal = function() {
    for (var i=0;i<5;i++) console.log('');
    console.log('\u001B[2J\u001B[0;0f');
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
        notSure.clearTerminal();
        console.log(answers, '\n\n', this.vars['diff']);
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