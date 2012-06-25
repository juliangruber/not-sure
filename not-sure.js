;(function() {
	
	var fs = require('fs');
	var exec = require('child_process').exec;
	var rl = require('readline');

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
		// FIXME: Use a control flow library
		var i = rl.createInterface(process.stdin, process.stdout, null);
		i.question('Title of issue: ', function(title) {
			i.question('Description: ', function(description) {
				i.question('Developers to ask: ', function(developers) {
					i.close();
					process.stdin.destroy();
					if (developers.length === 0)
						return cb(new Error('No developers specified'));
					cb(null, {
						title:title,
						description:description,
						developers:developers
					});
				})
			})
		})
	};

	/**
	 * Helper function that underlines a string
	 *
	 * @param {String} string
	 * @param {String} char Character to underline `string` with
	 * @returns {String} Underlined string
	 */
	notSure.underline = function(string, char) {
		char = char || '-';
		var underline = '';
		for (var i=0; i<string.length; i++) underline += char;
		return string+'\n'+underline;
	}

	/**
	 * Perform the whole dance from checks and questions to the finished
	 * output
	 */
	notSure.ask = function() {
		// FIXME: Use a control flow library
		notSure.findVcs(function(err, scm) {
			if (err) throw err;
			notSure.getDiff(scm, function(err, diff) {
				if (err) throw err;
				notSure.askQuestions(function(err, answers) {
					if (err) throw err;

					// clear the terminal
					for (var i=0;i<5;i++) console.log('');
					console.log('\u001B[2J\u001B[0;0f');

					console.log(notSure.underline(answers.title, '='));
					console.log(answers.description+'\n');
					console.log('asked: '+answers.developers+'\n');
					console.log(diff);
				});
			});
		});
	};
	/**
	 // Step (16)
	Step(
		function findVcs() {
			notSure.findVcs(this);
		},
		function getDiff(err, scm) {
			notSure.getDiff(scm, this);
		},
		function askQuestions(err, diff) {
			this.diff = diff;
			notSure.askQuestions(this);
		},
		function output(err, answers) {
			console.log(this.diff);
			console.log(answers);
		}
	);

	// Seq (14)
	Seq()
		.seq(function findVcs() {
			notSure.findVcs(this);
		})
		.seq('diff', function getDiff(err, scm) {
			notSure.getDiff(scm, this);
		})
		.seq(function askQuestions() {
			notSure.askQuestions(this);
		})
		.seq(function(err, answers) {
			console.log(this.vars['diff']);
			console.log(answers);
		});

	// invoke (11)
	invoke(function findVcs(data, cb) {

		notSure.findVcs(cb);

	}).then(function getDiff(vcs, cb) {

		notSure.getDiff(vcs, cb);

	}).then(function askQuestions(diff, cb) {

		this.diff = diff // ?
		notSure.askQuestions(cb);

	}).rescue(function(err) {

		throw err;

	}).end(initialData, function(answers) {

		console.log(answers);
		console.log(data[0]); // ?

	});
	 */

	/**
	 * Only call `ask()` if not included by another module.
	 */
	if (!module.parent) {
		notSure.ask()
	} else {
		module.exports = notSure;
	}

})();