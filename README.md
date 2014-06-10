fe static resource compress
==========

festaticcompress 是一个压缩javascript, css，image的工具。


Install
-------


First make sure you have installed the latest version of [node.js](http://nodejs.org/)
(You may need to restart your computer after this step).

From NPM for use as a command line app:
	npm install festaticcompress -g

From NPM for programmatic use:
	npm install festaticcompress

From Git:

    git clone git://github.com/festaticcompress/festaticcompress.git
    cd festaticcompress
    npm link .

Usage
-----

  Usage: festaticcompress <command> <Options>

  Commands:
    "all"  递归压缩图片，js，css
  Options:
    -p, --path  资源路径
    -h, --help  help

For example:
	festaticcompress all -p ./	压缩当前目录下的所有静态资源

	festaticcompress all -p "/path" 压缩"path"路径下的所有静态资源

