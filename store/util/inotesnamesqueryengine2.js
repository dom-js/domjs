define(["jquery"], function($) {


    var queryEngine=function(data){

        queryEngine.complete=true;
        var  originalname, results=[];
        if(!data.viewentry.entrydata[1].viewentries.viewentry)return[]
        $.each(data.viewentry.entrydata[1].viewentries.viewentry,function(_i,entry){
            originalname = entry.entrydata[0].text[0]
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
        return results
    }
    return function(query, options){
        var opts = $.extend({
                host:"mail.xxx.com.cn",
                path:"/inotes/forms8.nsf/iNotes/Proxy/?Open&Form=s_ValidationJSONP"
            },options)
            , queryURL = "//"+opts.host+opts.path+"&names="+escape(query)
            ,module = "module_"+(new Date()).getTime()+"_"+Math.random().toString().substr(2);

        return jQuery.ajax({
            type: "GET",
            url: queryURL+"&callback="+module,
            dataType: 'script',
            scriptCharset:"UTF-8"
        }).pipe(function(){
                require([module])
                var data = require(module)
                return queryEngine(data)
            });
    };
});
