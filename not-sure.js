;(function() {
	
	var fs = require('fs');
	var exec = require('child_process').exec;
	var stream = require('stream');
	var rl = require('readline');
	var i = rl.createInterface(process.stdin, process.stdout, null);
	var diff = '';

	/**
	 * Shellscript that posts diffs to for-sure CodeReview server
	 * @type Object
	 */
	var notSure = {};
	
	
	notSure.getDiff = function(scm, cb) {
		exec(scm+' diff', function(err, stdin, stdout) {
			if (err) return cb(err);
			if (stdin.length === 0) return cb(new Error('No files changes'));
			cb(null, stdin);
		});
	};
		
	notSure.chooseScm = function(path, cb) {
		fs.readdir(path, function(err, files) {
			if (err) return cb(err);
			if (files.indexOf('.git') > -1) return cb(null, 'git');
			if (files.indexOf('.svn') > -1) return cb(null, 'svn');
			cb(new Error('No SCM found'));
		});
	};
	
	notSure.askQuestions = function(cb) {
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
	
	notSure.underline = function(string, char) {
		char = char || '-';
		var underline = '';
		for (var i=0; i<string.length; i++) underline += char;
		return string+'\n'+underline;
	}
	
	notSure.ask = function() {
		notSure.chooseScm('.', function(err, scm) {
			if (err) throw err;
			notSure.getDiff(scm, function(err, _diff) {
				if (err) throw err;
				diff = _diff;
			});
		});

		notSure.askQuestions(function(err, answers) {
			if (err) throw err;
			
			process.stdout.write('\u001B[2J\u001B[0;0f');
			
			console.log(notSure.underline(answers.title, '='));
			console.log(answers.description+'\n');
			console.log('asked: '+answers.developers+'\n');
			console.log(diff);
		});
	};
	
	if (!module.parent) {
		notSure.ask()
	} else {
		module.exports = notSure;
	}
	
})();