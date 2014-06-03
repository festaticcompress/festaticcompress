/*
 * author: wangliming@58.com
 **/

'use strict';

var uglifyJS = require('uglify-js'),
	cleanCss = require('clean-css'),
	imageSmushIt = require('node-smushit'),
	program = require('commander'),
	fileWalk = require('nodejs-walker'),
  TEXT_TYPE_EXISTS = ['js', 'css'],
  IMAGE_TYPE_EXISTS = ['png', 'jpg', 'gif'],
  fs = require('fs'),
  path = require('path'),
  cachePath = path.join(__dirname, "cacheMap.json"),
  crypto = require('crypto');

var _ = {
  isExists: function(type, arrTypes){
    return new RegExp(''+type+'', 'i').test(arrTypes.join('|'));
  },
  getFileType: function(path){
    var arr = /\.(.*)$/.exec(path);
    return arr ? arr[1] : "";
  },
  md5: function(data, len){
    var md5sum = crypto.createHash('md5'),
        encoding = typeof data === 'string' ? 'utf8' : 'binary';
    md5sum.update(data, encoding);
    len = len || 7;
    return md5sum.digest('hex').substring(0, len);
  },
  getCacheMap: function(){
    var _isExists = fs.existsSync(cachePath);
    if(!_isExists){
      return {};
    }else{
      var content = fs.readFileSync(cachePath, "utf-8");
      return JSON.parse(content);
    }
  },
  setCacheMap: function(cacheMap){
    fs.writeFileSync(cachePath, JSON.stringify(cacheMap), "utf-8");
  }
};

var _cacheMap = _.getCacheMap(),
    _newCacheMap = {};
function doCompress(path){
  var type = _.getFileType(path);
  if(type && _.isExists(type, TEXT_TYPE_EXISTS) ){
    var content = fs.readFileSync(path, 'utf8'),
      _md5 = _.md5(content);
    if(_cacheMap[_md5]){
      _newCacheMap[_md5] = true;
      return false;
    }
    if(type == "js"){
      var jsSource = uglifyJS.minify(content, {fromString: true});
      var _newMd5Js = _.md5(jsSource.code);
      _newCacheMap[_newMd5Js] = true;
      fs.writeFile(path, jsSource.code, 'utf-8');
    }else if(type == "css"){
      var minimized = new cleanCss().minify(content);
      var _newMd5Css = _.md5(minimized);
      _newCacheMap[_newMd5Css] = true;
      fs.writeFile(path, minimized, 'utf-8');
    }
  }else if(type && _.isExists(type, IMAGE_TYPE_EXISTS)){
    var original_data = fs.readFileSync(path),
        base64Image = new Buffer(original_data, 'binary').toString('base64'),
        _md5Img = _.md5(base64Image);
    if(_cacheMap[_md5Img]){
      _newCacheMap[_md5Img] = true;
      return false;
    }
    imageSmushIt.smushit(path, {});
    _newCacheMap[_md5Img] = true;
  }
}

program.version('0.0.1').option('-p, --path', 'compress path');

program.command('all').description('static resource compress').action(function(){

  var args = Array.prototype.slice.call(arguments);
  var options = args.pop();
  var names = args.shift();
  var path = args.shift();
  if(!path){
    console.log('error');
    return false;
  }

  fileWalk(path).filterDir(function(dir, stat) {
        // if (dir === '/etc/pam.d') {
        //   console.warn('Skipping /etc/pam.d and children')
        //   return false
        // }

        return true;
      })
      .on('entry', function(entry, stat) {
        // console.log('Got entry: ' + entry)
      })
      .on('dir', function(dir, stat) {
        // console.log('Got directory: ' + dir)
      })
      .on('file', function(file, stat) {
        doCompress(file);
      })
      .on('symlink', function(symlink, stat) {
        // console.log('Got symlink: ' + symlink)
      })
      .on('blockDevice', function(blockDevice, stat) {
        // console.log('Got blockDevice: ' + blockDevice)
      })
      .on('fifo', function(fifo, stat) {
        // console.log('Got fifo: ' + fifo)
      })
      .on('socket', function(socket, stat) {
        // console.log('Got socket: ' + socket)
      })
      .on('characterDevice', function(characterDevice, stat) {
        // console.log('Got characterDevice: ' + characterDevice)
      })
      .on('error', function(er, entry, stat) {
        // console.log('Got error ' + er + ' on entry ' + entry)
      })
      .on('end', function() {
          _.setCacheMap(_newCacheMap);
      });
});

program.parse(process.argv);