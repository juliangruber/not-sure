var notSure = require('../not-sure');
var exec = require('child_process').exec;

describe('notSure', function() {
	describe('getDiff()', function() {
		it('shouldn\'t be a git working directory', function(done) {
			notSure.getDiff('git', function(err, diff) {
				console.log(err);
				done();
			})
		});
		it('shouldn\'t be a svn working directory', function(done) {
			notSure.getDiff('svn', function(err, diff) {
				console.log(err);
				done();
			})
		});
		it('should get a diff', function(done) {
			var ts = Date.now();
			var oldDir = process.cwd();
			exec('mkdir tmp/'+ts, function(err, stdin, stderr) {
				if (err) throw err;
				process.chdir('tmp/'+ts);
				exec('git init && touch README && git add . '
				+'&& git commit -m \'initial\' && echo \'bla\' > Makefile',
					function(err, stdin, stderr) {
						if (err) throw err;
						notSure.getDiff('git', function(err, diff) {
							if (err) throw err;
							console.log(diff);
							process.chdir(oldDir);
							done();
						});
				});
			});
		});
	});
	describe('findVcs()', function() {
		it('shouldn\'t find a Vcs', function(done) {
			notSure.findVcs(function(err, vcs) {
				console.log(err);
			});
		});
		it('should find a Vcs', function(done) {
			var oldDir = process.cwd();
			exec('mkdir tmp/'+ts, function(err, stdin, stderr) {
				if (err) throw err;
				process.chdir('tmp/'+ts);
				exec('git init', function(err, stdin, stderr) {
					if (err) throw err;
					notSure.findVcs(function(err, vcs) {
						if (err) throw err;
						console.log(vcs);
						process.chdir(oldDir);
						done();
					});
				});
			});
		});
	});
	describe('underline()', function() {
		it('should use a default char', function() {
			console.log(notSure.underline('teststring'));
		});
		it('should underline with the correct length', function() {
			console.log(notSure.underline('teststring'));
		});
		it('should underline with the correct char', function() {
			console.log(notSure.underline('teststring'));
		});
	});
});