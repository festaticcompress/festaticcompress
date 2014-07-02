/*
 * author: wangliming@58.com
 **/

'use strict';

var uglifyJS = require('uglify-js'),
  cleanCss = require('clean-css'),
  imageSmushIt = require('node-smushit'),
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
    var arr = /\.([\w\d]*)$/.exec(path);
    return arr ? arr[1] : false;
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
      return content ? JSON.parse(content) : {};
    }
  },
  _newCacheMap : {},
  _cacheMap : {}
  
};
_._cacheMap = _.getCacheMap();

var compress = module.exports = function doCompress(path){
  var type = _.getFileType(path);
  if(type && _.isExists(type, TEXT_TYPE_EXISTS) ){
    var content = fs.readFileSync(path, 'utf8'),
      _md5 = _.md5(content);
    if(_._cacheMap[_md5]){
      _._newCacheMap[_md5] = true;
      return false;
    }
    if(type == "js"){
      var jsSource = uglifyJS.minify(content, {fromString: true});
      var _newMd5Js = _.md5(jsSource.code);
      _._newCacheMap[_newMd5Js] = true;
      fs.writeFile(path, jsSource.code, 'utf-8');
    }else if(type == "css"){
      var minimized = new cleanCss().minify(content);
      var _newMd5Css = _.md5(minimized);
      _._newCacheMap[_newMd5Css] = true;
      fs.writeFile(path, minimized, 'utf-8');
    }
  }else if(type && _.isExists(type, IMAGE_TYPE_EXISTS)){
    var original_data = fs.readFileSync(path),
        base64Image = new Buffer(original_data, 'binary').toString('base64'),
        _md5Img = _.md5(base64Image);
    if(_._cacheMap[_md5Img]){
      _._newCacheMap[_md5Img] = true;
      return false;
    }
    imageSmushIt.smushit(path, {});
    _._newCacheMap[_md5Img] = true;
  }
};
compress.setCacheMap = function(){
  fs.writeFileSync(cachePath, JSON.stringify(_._newCacheMap), "utf-8");  
};

