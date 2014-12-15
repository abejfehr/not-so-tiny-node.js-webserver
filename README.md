# not-so-tiny-node.js-webserver

## What is it?

not-so-tiny-node.js-webserver is a simple webserver that's been expanded to be a slightly larger and more comprehensive web server than the [tiny-node.js-webserver](https://github.com/rodw/tiny-node.js-webserver) by Ron Waldhoff.

It requires the fs and querystring libraries to be installed for use, which you can install by typing the following:

    npm install -g fs
    npm install -g querystring

## How do I use it?

This webserver is configurable to work with multiple projects in your environment.

To serve a single file, all you need to do is put the `projects.json` file into the same directory as the web server(`ntws.js`)

To use the server for multiple projects, you can configure the server by modifying `projects.json`.

For the best results, add the directory containing `ntws.js` to the PATH environment variable of your system. Once you've done that, all you need to do to start the server is type the following:

    serve <projectname>

### Configuration

The not-so-tiny-node.js-web-server is configurable per-project, by modifying the` projects.json` file that's included with the web server and passing the project name as a command-line argument after the web server.

For example, I can specify my project like this:
    node ntws.js projectname

Custom pages can also be served for status codes other than 200 by placing a file with the appropriate name(`<status_code>.html`) in the `status_pages` directory.

## Licensing

This program is distributed under the [MIT License](http://www.opensource.org/licenses/mit-license.php), as specified in [`LICENSE.txt`](https://raw.github.com/abejfehr/not-so-tiny-node.js-webserver/master/LICENSE.txt) and in the [`ntws.js`](https://raw.github.com/abejfehr/not-so-tiny-node.js-webserver/master/ntws.js) file itself.
