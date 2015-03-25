!function(){
    var configdb="/res/index.nsf",docCache={};
    var  getdocaspart = function (url, key, start, limit) {
            var deferred = new $.Deferred();
            var start = start || 1, limit = limit || 800, _key = key + start, _url = url + "&module=" + _key + "&start=" + start + "&limit=" + limit;
            $.getScript(_url).done(function () {
                require([_key], function (doc) {
                    if (doc["$$max"] && doc["$$length"] && doc["$$length"] < doc["$$max"]) {
                        getdocaspart(url, key, start + limit, limit).then(function (_doc) {
                            deferred.resolve($.extend(doc, _doc));
                        })
                    } else {
                        deferred.resolve(doc);
                    }
                }, function (err) {
                    deferred.reject(err);
                });
            }).fail(function (err) {
                deferred.reject(err)
            });
            return deferred;
        },
        /**
         * 获取文档
         * key为关键字，
         * dbpath为数据库，默认当前数据库，
         * view为视图，默认all视图
         */
        getdoc = function (key, dbpath, view) {
            key = key.toUpperCase()
            var dbpath = typeof dbpath=="string"?(dbpath==""?this.dbpath:dbpath):this.dbpath;
            var view = typeof view=="string"?(view==""?"(all)":view):"(all)";
            var _url = dbpath+"/"+view+"/"+key+"?opendocument&form=SysOpenDocByJSON"
            var cacheKey = encodeURIComponent(_url).replace(/%/g,"_").toUpperCase();
            nocache = typeof nocache=="undefined"||nocache==false?!docCache[cacheKey]:true;
            if(nocache){
                key+=Math.random().toString().substring(2)
                docCache[cacheKey] =getdocaspart(_url,key);
            }
            return  docCache[cacheKey] ;
        };
    var modulename  ="GLOBALDOC"; //+jQuery.expando;
    var modulepath = configdb+"/(all)/fmGlobalServiceGlobal?opendocument&form=SysOpenDocByJSON"+"&module="+modulename
    define([modulepath,"require","exports","module"],function(doc,require,exports,module){
        //C1.全局服务 | fmGlobalServiceGlobal
        var config = require(modulename);
        $.extend(exports,{
            swfuploadpath:config.fdServiceAddr1
            ,hrwspath:config.fdServiceAddr3
            ,jspath:config.fdServiceAddr4
            ,namespath:config.fdServiceAddr5
            ,dbpath:configdb
            ,getdoc:getdoc
        });
    });
}()