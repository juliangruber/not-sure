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
	 * 
	 * @param {String} cmd VCS shell command
	 * @param {Function} cb Gets passed errors and diff output
	 */
	notSure.getDiff = function(cmd, cb) {
		exec(cmd+' diff', function(err, stdin, stdout) {
			if (err) return cb(err);
			if (stdin.length === 0) return cb(new Error('No files changes'));
			cb(null, stdin);
		});
	};

	/**
	 * Check the filesystem for a `.git`/`.svn` folder in `path`
	 * and pass the first found VCS to `cb()`
	 *
	 * @param {String} path Working directory
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
		Seq().seq('title', function() {
			question('Title of issue: ', this);
		}).seq('desc', function() {
			question('Description: ', this);
		}).seq('devs', function() {
			question('Developers to ask: ', this);
		}).seq(function() {
			i.close();
			process.stdin.destroy();
			cb(null, {
				title: this.vars['title'],
				description: this.vars['desc'],
				developers: this.vars['devs']
			});
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
				// clear the terminal
				for (var i=0;i<5;i++) console.log('');
				console.log('\u001B[2J\u001B[0;0f');

				console.log(notSure.underline(answers.title));
				console.log(answers.description+'\n');
				console.log('asked: '+answers.developers+'\n');
				console.log(this.vars['diff']);
			})
			.catch(function(err) { throw err; });
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