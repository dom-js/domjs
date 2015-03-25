define( function(require,exports,module) {
    //  module:
    //    store/util/iNamesQueryEngine
    //  summary:
    //    定义DWA Names 查询引擎，该查询通过 动态更新 js文件获取返回结果
    var $ = require("jquery"), global = require("global!");
    var und;
    store = {a:1}
    var store = store==und?{}:store;
    store.util = store.util ==und?{}:store.util ;
    jQuery.jStore = store;

    var queryEngine=function(data){

        queryEngine.complete=true;
        var  originalname, results=[];

        $.each(data.viewentry.entrydata[1].viewentries.viewentry,function(_i,entry){
            //查询字符串
            originalname = entry.entrydata[0].text[0]
            //所有查询结果
            if(entry.entrydata[1].viewentries.viewentry)
                $.each(entry.entrydata[1].viewentries.viewentry,function(_i,entry){

                    var _j;
                    var item={
                        unid:entry["@unid"],
                        originalname:originalname
                    };
                    for(_j in entry.entrydata){
                        item[entry.entrydata[_j]["@name"].toLowerCase()]=entry.entrydata[_j].text[0].replace(/[\n\r\t]/,"")
                    }
                    item.mail = item.internetaddress;
                    item.shortname=item.mail.substr(0,item.mail.indexOf("@"))
                    item.abbreviate=item.fullname.replace(/cn=|ou=|o=/gi,"");
                    item.lastname=item.abbreviate.replace(/([^\/]+)\/.*/m,"$1");
                    results.push(item);
                })

        })


        queryEngine.deferreds[queryEngine.Pointer].resolve(results)
        queryEngine.deferred.resolve(results)
    }
    store.util.iNamesQueryEngine=queryEngine;
    window.iNamesQueryEngine=queryEngine;
//定义查询计数器，记录查询次数
    queryEngine.complete=false;
    queryEngine.Pointer=0
    queryEngine.deferreds = [new  $.Deferred()];
    queryEngine.deferreds[0].resolve([])
    queryEngine.deferred =new  $.Deferred();
    iNamesQueryEngineConfig={
        queryserver:global.namespath,
        querypath:"/inotes/forms8.nsf/iNotes/Proxy/?Open&Form=s_ValidationJSONP&charset=utf-8",
        queryEngin:  "iNamesQueryEngine"//"jQuery.jStore.util.iNamesQueryEngine"
        //queryEngin:  "jQuery.jStore.util.iNamesQueryEngine"
    }
    return exports = module.exports = function(query, options){
        queryEngine.deferred =new  $.Deferred();
        queryEngine.deferreds[queryEngine.Pointer].done(function(){
            queryEngine.deferreds[++queryEngine.Pointer]=new  $.Deferred();
            query = $.map(query.toString().split(/[,;]/),function(v){
                return escape($.trim(v))
            }).join(";")
            var queryURL = iNamesQueryEngineConfig.queryserver+iNamesQueryEngineConfig.querypath+"&names="+(query);
            jQuery.ajax({
                type: "GET"
                ,url: queryURL
                ,dataType: 'jsonp'
                ,jsonpCallback:iNamesQueryEngineConfig.queryEngin
                ,scriptCharset:"UTF-8"
                ,complete:function(data){
                    if(queryEngine.complete==false){
                        jQuery.jStore.util.iNamesQueryEngine = queryEngine
                    }
                }
            });
        })
        //return queryEngine.deferred;

        return queryEngine.deferreds[queryEngine.Pointer]
    };
});
