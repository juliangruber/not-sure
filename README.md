not-sure
========

not-sure is a bundle of shellscript and library that helps with asking for code reviews.

The shellscript is intended for environments where you don't already have a code review tool in place and just a little command line application to gather all the information connected with your changes is necessary. not-sure works in dirty but uncommited git/svn repositories so you don't have to commit anything to share with fellow developers.

The library can be used for building other code review tools.

Installation
------------

Install the executable:

```
sudo npm install -g not-sure
```

Or the library, to use programmatically:

```
npm install not-sure
```

Usage
-----

Invoke the shellscript inside a code repository that you have changed and want
to request review for:

```
$ notsure

Title of issue: Ugly nested callbacks

Description: Already using Seq...is there a better option?

Developers to ask: brendan, tj
```

Then your answers and a diff (including not yet tracked files) are printed out, ready to be sent to your reviewers per mail or whatever else you like to do with them.

API
---

### notSure.getDiff(cmd, cb)
Executes a git/svn diff and passes the results to `cb()`
### notSure.findVcs(cb)
Checks the filesystem for a `.git`/`.svn` folder in the cwd and passes the first found VCS to `cb()`
### notSure.askQuestions(cb)
Asks for the issue's `title` and `description` and which developers to ask
### notSure.underline(string, char)
Helper function that underlines a string

Usage:

```
notSure.underline('title-ish', '-');
>> title-ish
   ---------
```
### notSure.clearTerminal()
Helper function that prints some blank lines and then clears the terminal

Development
-----------

Run the tests and add new ones for each feature you add.

```
npm install
mocha
```

License
-------

(The MIT License)

Copyright (c) 2012 Julian Gruber <julian@juliangruber.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.