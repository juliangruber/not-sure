var notSure = require('../not-sure');
var exec = require('child_process').exec
var should = require('should');
var oldDir = process.cwd();
var ts = Date.now();

var createDirtyRepo = function(cb) {
	exec('git init && touch README && git add . && git commit -m \'initial\''
			+'&& echo \'bla\' > README', function(err) {
		cb(err);
	});
}

describe('notSure', function() {
	beforeEach(function(done) {
		exec('mkdir -p tmp/'+ts, function(err) {
			if (err) throw err;
			process.chdir('tmp/'+ts);
			done();
		});
	})
	
	afterEach(function(done) {
		process.chdir(oldDir);
		exec('rm -Rf tmp', done);
	});
	
	describe('getDiff()', function() {
		it('shouldn\'t be a working directory', function(done) {
			process.chdir('/');
			notSure.getDiff('git', function(err, diff) {
				should.exist(err);
				notSure.getDiff('svn', function(err, diff) {
					should.exist(err);
					done();
				})
			})
		});
		it('should get a diff', function(done) {
			createDirtyRepo(function(err) {
				if (err) throw err;
				notSure.getDiff('git', function(err, diff) {
					should.exist(diff);
					done(err);
				});
			});
		});
	});
	describe('findVcs()', function() {
		it('shouldn\'t find a Vcs', function(done) {
			process.chdir('/');
			notSure.findVcs(function(err, vcs) {
				should.exist(err);
				done();
			});
		});
		it('should find a Vcs', function(done) {
			exec('git init', function(err) {
				if (err) throw err;
				notSure.findVcs(function(err, vcs) {
					should.exist(vcs);
					done(err);
				});
			});
		});
	});
	describe('underline()', function() {
		it('should be formatted correctly', function() {
			notSure.underline('teststring')
			.should.equal('teststring\n----------');
		});
		it('should underline with the correct char', function() {
			notSure.underline('teststring', '=')
			.should.equal('teststring\n==========');
		});
	});
});