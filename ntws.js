//
// A modification of Rod Waldhoff's tiny node.js webserver originally written in
// coffeescript. Converted to JavaScript and later modified by Anil Somayaji and
// Abe Fehr.
//
// For more information, visit <https://github.com/abejfehr/tinywebserver>
//
// Original headers of coffeescript version:
//
// A simple static-file web server implemented as a stand-alone
// Node.js/CoffeeScript app.
//---------------------------------------------------------------------
// For more information, see:
// <https://github.com/rodw/tiny-node.js-webserver>
//---------------------------------------------------------------------
// This program is distributed under the "MIT License".
// (See <http://www.opensource.org/licenses/mit-license.php>.)
//---------------------------------------------------------------------
// Copyright (c) 2012 Rodney Waldhoff
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
// BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//---------------------------------------------------------------------

// Import the Node.js modules we'll need
var path = require('path');
var http = require('http');
var fs = require('fs');
var jade = require('jade');
var qs = require('querystring');

// Setup MIME support
var MIME_TYPES = {
  'css': 'text/css',
  'gif': 'image/gif',
  'htm': 'text/html',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'js': 'text/javascript',
  'json': 'application/json',
  'png': 'image/png',
  'txt': 'text/text'
};

// Set defaults, if not otherwise specified
var options = {
  indices: ['index.html', 'index.jade'],
  statroot: 'status_pages/'
}

// Set the document root
var config_path = __dirname + '/projects.json';
var project = JSON.parse(fs.readFileSync(config_path))[process.argv[2]];
options.host = project.host || 'localhost';
options.port = project.port || 3000;
options.docroot = project.docroot || __dirname;

// Takes a filename and returns the MIME type
var get_mime_type = function(filename) {
  var ext, type;
  for (ext in MIME_TYPES) {
    type = MIME_TYPES[ext];
    if (filename.indexOf(ext, filename.length - ext.length) !== -1)
      return type;
  }
  return null;
};

// Responds to a request
var respond = function(request, response, status, content, content_type) {
  if (!status)
      status = 200;
  else if(status != 200) {
    //serve the custom page for that error code if it exists
    if(fs.existsSync(__dirname + '/' + options.statroot + status+'.html')) {
      content = fs.readFileSync(__dirname + '/' + options.statroot + status+'.html');
      content_type = 'text/html';
    }
  }

  if (!content_type)
    content_type = 'text/plain';
  console.log("" + status + "\t" + request.method + "\t" + request.url);
  response.writeHead(status, { "Content-Type": content_type });
  if (content) {
    response.write(content);
  }
  return response.end();
};

// Serves a file
var serve_file = function(request, response, requestpath, params) {

  return fs.readFile(requestpath, function(error, content) {
    if (error != null) {
      console.error("ERROR: Encountered error while processing " +
                    request.method + " of \"" + request.url + "\".", error);
      return respond(request, response, 500);
    }
    else {
      if(requestpath.indexOf(".jade") > 0) {
        jade.render(content, params, function(err, html) {
          if(err) throw err;
          return respond(request, response, 200, html, "text/html");
        });
      }
      return respond(request, response, 200,
       content, get_mime_type(requestpath));
    }
  });
};


// Sends a response with the index file for a particular path
var return_index = function(request, response, filepath, params)  {

  if (filepath.substr(-1) !== '/')
      filepath += "/";
  var dirpath = filepath;
  for(var i=0;i<options.indices.length;++i) {
    filepath = dirpath + options.indices[i];
    if(fs.existsSync(filepath))
      return serve_file(request, response, filepath, params);
  }
  return respond(request, response, 404);
}


// Parses the request and responds
var request_handler = function(request, response) {
  var requestpath;

  if (request.url.match(/((\.|%2E|%2e)(\.|%2E|%2e))|(~|%7E|%7e)/) != null) {
    console.warn("WARNING: " + request.method + " of \"" + request.url +
                 "\" rejected as insecure.");
    return respond(request, response, 403);
  } else {
    requestpath = path.normalize(path.join(options.docroot, request.url));

    // Break the request path into the actual file path and the querystring
    var filepath = requestpath.split('?')[0];
    var querystring = requestpath.split('?')[1];
    var params = qs.parse(querystring);

    return fs.exists(filepath, function(file_exists) {
      if (file_exists) {
        return fs.stat(filepath, function(err, stat) {
            if (err != null) {
                console.error("ERROR: Encountered error calling" +
                              "fs.stat on \"" + filepath +
                              "\" while processing " + request.method +
                              " of \"" + request.url + "\".", err);
                return respond(request, response, 500);
            }
            else {
              if ((stat != null) && stat.isDirectory())
                return return_index(request, response, filepath, params);
              else
                return serve_file(request, response, filepath, params);
            }
        });
      }
      else
        return respond(request, response, 404);
    });
  }
};

// Creates the HTTP server object and listens for requests
var server = http.createServer(request_handler);

server.listen(options.port, options.host, function() {
  return console.log("Hosting " + options.docroot +
                     "\n\nServer listening at http://" +
                     options.host + ":" + options.port + "/");
});
