;(function() {
	var fs = require('fs')
	  , exec = require('child_process').exec
	  , stream = require('stream');
	
	fs.readdir('.', function(err, files) {
		if (files.indexOf('.git') !== -1) {
			exec('git diff', function(err, stdin, stdout) {
				console.log(stdin.length);
			});
		};
	})
	
	
})();