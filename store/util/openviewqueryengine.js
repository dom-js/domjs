/**
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-5-25
 * Time: 上午11:36
 * To change this template use File | Settings | File Templates.
 */
define(
    [ "jquery" ,"./openviewadapter"],
    function($,adapter) {
        var xhr=function(opts){
            var isCors = (XMLHttpRequest &&  "withCredentials" in new XMLHttpRequest());
            if(window.ActiveXObject&&(!isCors)){
                opts.crossDomain = false ;
                opts.xhr =  function(){ return new window.ActiveXObject("Microsoft.XMLHTTP");}
            }else{
                opts.crossDomain = true;
            }
            return  $.ajax(opts);
        }
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
        var createdQuery = function(query){
            if(!query )return "";

            var getValue= function(v,flag){
                v = $.trim(v)
                 if(!flag)v=v.replace(/([\(\)])/g,"\"$1\"");
                if(v=="")return null;
                return /^[A-z0-9\.]*$/.test(v)?"*"+v+"*":v;
            };
            var qstr = "";
            $.each(query,function(field,obj){
                var _str = "",_condition = " AND ";
                var f ="";
                if( $.isPlainObject(obj)){
                    f =[];
                    f = $.map(obj,function(v,key){
                        v = getValue(v);
                        if(key=="query"){
                            return v;
                        }else  if(!v||v =="")
                            return null;
                        else{
                            return  "([" + key +"] CONTAINS (" + v +"))";
                        }
                    });
                    if(f.length==0)return true;

                    _str = f.join(" OR ");

                }else if($.isArray(obj)){
                    if(field!="query"){
                        f = "([" + field +"] CONTAINS ";
                    }
                    var vals = $.map(obj,getValue);
                    _str = f +" (" ;
                    _str += vals.join(" OR ");
                    _str +="))";
                }else {
                    var v
                    if(field!="query"){
                         v = getValue(obj);
                        _str = "([" + field +"] contact (" + v +"))";
                    }else{
                        v = getValue(obj,true);
                        _str = v;
                    }
                    if(!v||v=="")return true;
                } ;
                _str = _str==""?_str:("("+_str+")");
                if(qstr=="")
                    qstr=_str;
                else
                    qstr+=_condition + _str;
                return true;
            }); 

            return qstr;
        }
        var createdParams = function(query,options){
            //初始化查询参数
            var _q ={
                expand:options.expand||0,
                start:options.start,
                count:options.count||30,
                query: createdQuery(query)
            }

            if(options.isExpand){
                _q.start =  _q.expand+"."+_q.start
            }
            var opts ={}  ,params ="start count expand expandview  collapse collapseview endview keytype navigatereverse preformat restricttocategory startkey untilkey sort".split(" ")
            params =   params.concat("SearchMax SearchWv SearchOrder SearchThesaurus SearchFuzzy SearchEntry Scope".toLowerCase().split(" "))
            //resortascending    //

            $.each(options,function(key,val){

                if(typeof val !="undefined" && $.inArray(key.toLowerCase(),params)>-1){

                    if(key=="sort"){
                        if( val.descending){
                            opts.resortdescending=val.column
                        }else if(val.ascending){
                            opts.resortascending=val.column
                        }
                    }else if(key=="restricttocategory"){
                        if(val!=""&&val!="*")
                            opts[key]=val
                    }else{
                        opts[key]=val
                    }
                }

            })
            return $.extend(opts,_q)
        }
        var createdOptions = function(query,options){
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
            var isQuery =false
            isQuery = query.query?true:false
            //初始化options
            options =  $.extend({
                protocol:"",
                host:_l.host,
                db:_db,
                view:"",
                comand: isQuery?"searchview":"openview",
                SearchMax:isQuery?0:undefined,
                start:"1",
                expand:0,
                isQuery:isQuery,
                isExpand:false,
                depth:0
            },options)
            //需要计算部分处理
            options.isExpand = options.expand!=0
            if( options.isExpand )
                options.depth = options.expand.toString().split(".").length
            options.start=options.start<1?1:options.start
            return options
        }

        var getLayout = function(options){
            var module = (options.host+options.db+options.view).replace(/[\.\/]/g,"") ,deferred = new $.Deferred()
            var depend = ["jquery"]
            if(!options.layout){
                depend.push("store/util/readviewdesign")
            }

            // console.log(options)
            require(depend,function($,design){
                if(design){
                    design({
                        host:options.host,
                        db:options.db,
                        view:options.view,
                        cate:options.restricttocategory&&options.restricttocategory!=""&&options.restricttocategory!="*"?true:false
                    }).then(function(layout){
                            deferred.resolve(layout)
                        })
                }else{
                    deferred.resolve(options.layout)
                }
            })
            return deferred;
        }

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

            options= createdOptions(query,options)
            if(!options)return false

            query  = createdParams(query,options)
            var isQuery = query.query&&query.query!=""
            var  comand = isQuery?"searchview":"openview"
            options.isQuery = isQuery;
            var __time__=(new Date()).getTime()
            var _url =options.protocol+"//"+options.host+options.db+"/"+options.view+"?"+(comand)

            return  xhr({
                url:_url,
                data:query,
                type:isQuery?"GET":"GET"
            }).pipe(function(data){
                //if(typeof console!="undefined"&&console.log)   console.log("query:",(new Date()).getTime()-__time__,"ms")
                return  getLayout(options).pipe(function(layout){
                    options.layout = layout
                    return   adapter(data,{
                        isQuery:options.isQuery,
                        isExpand:options.isExpand,
                        depth:options.depth,
                        layout:layout
                    })
                })
            }).fail(function(data){
                    debugger
                })
        };
    });
