define(function(require,exports,module){
    var $ =require("jquery")
    var api = require("store/api/store");
    var QueryResults = require("store/util/QueryResults")
    var QueryEngine = require("store/util/iNotesNamesQueryEngine")

    var NamesStore = $.extend(function(ops){
        $.extend(this,ops)
    },api)


    NamesStore.prototype.queryEngine=QueryEngine;
    NamesStore.prototype.get=function(shortname){
        var store = NamesStore.localstore;
        var items=store.query({shortname:shortname});
        if(items.length>0){
            return items[0];
        }else{
            return null;
        }
    }

    /**
     * 查询用户,query是一组数组,每一个元素是一个用户shortname or lastname字符串
     * @param query ,options
     * @return item对象
     */
    NamesStore.prototype.query=function(query,options){

        if(options&&options.querylength){
           var  charlength=function(str){
                var a=str.match(/[^\x00-\xff]/ig)
                return str.length+(a==null?0:a.length)
            }
            query=$.grep(query,function(q,i){
                return charlength(q)>=options.querylength;
            })
        }
        var result =  this.queryEngine(query.toString().replace(/,/gi,";").replace(/\s*;/,";").replace(/\s*$/,"").replace(/^\s*/,""),options)
        //使用NamesQueryEngine查询服务器信息
        return QueryResults(result)
    }
    module.exports = NamesStore
    //    return NamesStore;
})