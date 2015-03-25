/**
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-5-25
 * Time: 上午11:36
 * To change this template use File | Settings | File Templates.
 */
define(
    [ "jquery" ,"./readviewentriesadapter"],
    function($,adapter) {
        /**
         * 格式化readviewentries返回的数据结构
         */
        var parseError = function(data){

            switch(data.status){
                case 200:
                    var action=data.responseText.match(/\saction="(\/names\.nsf\?login)"\s/i)
                    if(!!action){
                        //  alert("你访问的地址需要进行身份验证\n"+this.url);
                        window.open("/names.nsf?login&RedirectTo="+window.top.location.href,"_top")
                    }
                    break;
                case 400:
                    alert($(data.responseText).text() + data.status + ":" + data.statusText +"\n" + this.url)
                    break;
                case 404:
                    alert($(data.responseText).text() + "\n" + data.status + ":" + data.statusText +"\n" + this.url)
                    break;
                case 500:
                    alert("服务器异常错误\n" + data.status + ":" + data.statusText +"\n" + this.url)
                    break;
                default:
                    alert("未知错误\n" + data.status + ":" + data.statusText +"\n" + this.url)
            }
            return [{label:"Error"}]

        };

        var ajaxResult = {};

        /**
         * query,查询参数
         * options,查询选项
         *  db:数据库路径，为空则自动检测当前应用的路径，如果当前不是domino数据库，抛出一个错误
         *  view:要查询的视图，必填
         *  protocol：协议，默认自动匹配（https/http）
         *  port:端口，默认当前请求地址端口
         *  host:主机，默认当前域名，如果指定域名与当前域名不一致，则自动采用跨域方式处理，注意跨域处理必须知道数据库db
         */
        return function(query, options,callback) {
           var opts={},params ="start count expand expandview  collapse collapseview endview keytype navigatereverse preformat restricttocategory resortdescendingpn resortascendingpn startkey untilkey sort".split(" ")
            $.each(options,function(key,val){

                if(typeof val !="undefined" && $.inArray(key.toLowerCase(),params)>-1){

                    if(key=="sort"){

                        if( val.descending){
                            if(val.name){
                                opts.resortdescendingpn=val.name
                            }else{
                                opts.resortdescending=val.column||1
                            }


                        }else if(val.ascending){
                            if(val.name){
                                opts.resortascendingpn=val.name
                            }else{
                                opts.resortascending=val.column||1
                            }

                        }
                    }else if(key=="restricttocategory"){
                        if(val!=""&&val!="*")
                            opts[key]=val
                    }else{
                        opts[key]=val
                    }
                }

            })

            var _l = window.location;
            var _db ="";
           try{
               _db = _l.pathname.match(/[^(?)]*.nsf/)[0]
           }catch(e){

           }
            if(!options||!options.view){
                new Error("需要指定视图地址")
                return false
            }


            var options=$.extend({
                protocol:"",
                host:_l.host,
                db:_db,
                view:""
            },options)

           var _q =$.extend({
               expand:0,
               start:options.start||1,
               count:options.count||30
           },opts,query)

            _q.start=_q.start<1?1:_q.start
            _q.isExpand = (_q.expand-0)!=0*0x1
            if(_q.isExpand){
                _q.start =  _q.expand+"."+_q.start
            }
            var _callback=function(data){

                    data = adapter(data,_q)
                 //   data.fristpage=_q.start==1;
                //    data.lastpage=data.length<_q.count||_q.start+_q.count>data.total
                //    data.total = data.lastpage?_q.start +data.length-1:data.total
                if(callback){
                    callback(data)
                }
                return data
            }
            var deferred = new $.Deferred()
             if(options.host!=_l.host||options.inotesquery)
             {
                var _url =options.protocol+"//"+options.host+"/iNotes/forms8.nsf/iNotes/Proxy/?OpenDocument"
                _url+="&Form=s_JSONPViewList&"+options.view
                //return
                _url+="&PresetFields=DBName;"+options.db
                _url+=",FolderName;"+options.view
                _url+=",UnreadOnly;"+(options.unreadonly||0)
                var modulename =options.view+"/"+ (new Date()).getTime()+"/"+Math.random().toString().substr(2);
                var _q = $.extend(_q,{
                    module:modulename
                })
                 //    _url+="&"+$.param(_q)
             try{
                    $.ajax({
                        url:_url,
                        dataType:"script",
                        data:_q
                    }).pipe(function(){
                            require([modulename],function(module){
                                deferred.resolve(_callback(module))
                            },function(err){
                                deferred.reject(err)
                            })
                    },function(err){

                            deferred.reject(err)
                   })
             }catch(err){
                    deferred.reject( err)
                }
            }
             else
             {
                var _url =options.protocol+"//"+options.host+options.db+"/"+options.view+"?readviewentries&outputformat=json&"+(new Date()).getTime()
                 $.get(_url,_q).pipe(function(data){

                   deferred.resolve(_callback(data))
                 },function(err){
                    // parseError.(err)

                     deferred.reject( err)
                 })
            }
            return deferred

        };
    });
