;(function() {
	
	var fs = require('fs');
	var exec = require('child_process').exec;
	var stream = require('stream');
	var rl = require('readline');
	var i = rl.createInterface(process.stdin, process.stdout, null);
	var diff = '';

	var notSure = {};
	
	notSure.getDiff = function(scm, cb) {
		exec(scm+' diff', function(err, stdin, stdout) {
			if (err) return cb(err);
			if (stdin.length === 0) {
				cb(new Error('No files changes'));
			} else {
				cb(null, stdin);
			}
		});
	};
		
	notSure.chooseScm = function(path, cb) {
		fs.readdir(path, function(err, files) {
			if (err) return cb(err);
			if (files.indexOf('.git') > -1) return cb(null, 'git');
			if (files.indexOf('.svn') > -1) return cb(null, 'svn');
		});
	};
	
	notSure.askQuestions = function(cb) {
		i.question('Title of issue: ', function(title) {
			i.question('Description: ', function(description) {
				i.question('Developers to ask: ', function(developers) {
					i.close();
					process.stdin.destroy();
					
					if (developers.length === 0) {
						return cb(new Error('No developers specified'));
					}
					cb(null, {
						title:title,
						description:description,
						developers:developers
					});
				})
			})
		})
	};
	
	if (!module.parent) {
		notSure.chooseScm('.', function(err, scm) {
			if (err) throw err;
			notSure.getDiff(scm, function(err, _diff) {
				if (err) throw err;
				diff = _diff;
			});
		});

		notSure.askQuestions(function(err, answers) {
			if (err) throw err;
			
			// TODO: Send to server
		});
	} else {
		module.exports = notSure;
	}
	
})();