/*!
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-5-22
 * Time: 下午2:02
 * 2013-08-08 10:20
 * 1.优化getdoc方式，支持通过递归方式分段加载文档，解决文档字段过长导致无法正常加载的问题
 * 2.添加文档缓存支持，保证一个文档在多次getdoc时只被加载一次
 * 2013-09-27
 * 添加dicLookUp，dicDoc方法，优化数据字典查询。
 */
(function(){
    var dbpath;
    try{ dbpath = window.location.href.match(/https?:\/\/[^/]*(\/.[^?]*\.nsf)/)[1];}catch (e){}
    if (!dbpath) {
        dbpath = "res/index.nsf";
        // throw new Error("当前应用不是domino数据库应用")
    }

    define(["jquery", dbpath + "/appinfo.js","require","exports","module"], function ($, appinfo,require,exports,module) {
        var filesagentpath,
            mailpath,
            appname = document.title,
            locale = typeof navigator === "undefined" ? "en" : (navigator.language || navigator.userLanguage || "en").toLowerCase() ,//root 缺省语言
            getcookie = function (cookiename) {
                try {
                    var _reg = new RegExp(cookiename + "=([^=]*)(;|$)", "i")
                    var _info = _reg.exec(document.cookie);
                    return _info && _info[1];
                } catch (e) {
                    return undefined;
                }
            },
            username = getcookie("LastVisitUserName"),
        /*！
         * 执行服务器公式
         *formula  公式
         *type     执行公司类型返回结果，json,text
         * module  自定义模块名称（如果在启用缓存的情况下，使用自定义模块名称执行查询，多次查询会使用缓存数据）
         * dbpath  执行公式所在数据库，如果未指定数据库，则在当前数据库进行查询
         * unid    执行公式所对于的主文档，如果未指定unid，则不关联任何文档
         */
            formula = function (formula, type, module, dbpath, unid) {
                var dbpath = dbpath || this.dbpath
                if (typeof formula == "string") {
                    formula = formula
                } else {
                    var arr = [];
                    for (i in formula) {
                        arr.push(i + "=" + encodeURIComponent(formula[i]))
                    }
                    formula = arr.join(",")
                }
                var deferred = new $.Deferred()
                //var url = dbpath+"/(all)/"+this.unid+"?opendocument&form=SysComputerFormula&formula="+formula
                var url = dbpath;

                if (unid) {
                    url += "/(all)/" + unid + "?opendocument&form=SysComputerFormula&formula=" + formula
                } else {
                    url += "/SysComputerFormula?readForm&formula=" + formula
                }
                //  var url = dbpath+"/SysComputerFormula?readForm&formula="+formula
                if (type) {
                    url += "&type=" + type
                }
                if (module) {
                    url += "&module=" + module
                } else {
                    module = "FORMULA/T" + (new Date()).getTime() + "/R" + Math.random().toString().substr(2);
                    url += "&module=" + module
                }

                $.getScript(url).then(function () {
                    require([module], function (data) {

                        if (data.error == 0) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(data);
                        }
                    }, function (e) {

                        deferred.reject(e);
                    });
                }).fail(function (e) {
                    deferred.reject(e)
                });
                //ype=@dblookup("";"";"SysDictionary";"SMT";2),a=23,b="asdewr",@Username&module=number
                return deferred;
            },

            docCache = {
                /**
                 *20130808,添加getdoc缓存机制
                 *文档缓存集合
                 */
            },
            /**
             *以分段方式通过递归加载文档
             */
            getdocaspart = function (url, key, start, limit) {
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
                var nocache;
                if(arguments.length>1 && typeof arguments[arguments.length-1] == "boolean" ){
                    nocache = arguments[arguments.length-1];
                }else{
                    nocache = false;
                }
                nocache = nocache==false?!docCache[cacheKey]:true;
                if(nocache){
                    key+=Math.random().toString().substring(2)
                    docCache[cacheKey] =getdocaspart(_url,key);
                }
                return  docCache[cacheKey] ;
            },
            uid = function () {
                var randomuid
                randomuid    = parseInt((new Date()).getTime()).toString(16) + random(11) + random(10);
                return randomuid.toUpperCase();
            },
            random = function (i) {
                i = i ? i > 14 ? 14 : i : 14
                r = String(Math.random() * Math.random()).substr(2);
                r = parseInt(r).toString(16);
                return r.length >= i ? r.substr(0, i) : random()
            },

            /**
             * 配合应用的配置获取数据源配置
             * name,数据源名称
             */
            getstore = function (name, options) {
                var res = new $.Deferred() , Module = "S" + uid(),
                    url = this.dbpath + "/vwJSStore/" + name + "?opendocument",
                    paramslist = [];

                if (options) {
                    $.each(options, function (name, value) {
                        paramslist.push(name);
                    });
                }
                $.ajax({
                    dataType: "script",
                    url: url,
                    data: $.extend({
                        params: paramslist.join(";")
                    }, options, {
                        Module: Module,
                        form: "SysStoreJSONP"
                    })
                }).pipe(function (script) {

                    require([Module], function (data) {
                        $.when(data).then(function (d) {
                            res.resolve(d);
                        });
                    });
                });
                return res;
            },
            /**
             * 配合应用的规则配置，用于执行一个规则
             * code，规则编号
             * data,要传递给规则运行文档大数据（会自动初修改规则文档对于的字段）
             */
            runrule = function (code, data, unid,dbpath,issign) {
                var url = (dbpath|| this.dbpath )+ "/agRunRules"+(issign?"SG":"")+"?openagent&_=" + (new Date()).getTime();
                var fields = [];
                if (arguments.lenght == 2 && typeof data == "string" && data.length == 32) {
                    data = {};
                    unid = data;
                }
                data = $.extend({}, data);
                $.each(data, function (field, value) {
                    fields.push(field);
                });
                return  $.ajax({
                    url: url,
                    type: "post",
                    data: $.extend({}, data, {__RuleCode: code, __Fields: fields, __Unid: unid || ""})
                });
            },
            /**
             * 数据字典查询
             * key:数据字典关键字
             * field:字段列表
             * multi:是否多值，默认false，如果为true，则会返回一个多值映射
             */
            dicLookUp=function(key,field,multi){
                var fs = {} ,view =multi?"SysDictionaryMulti":"SysDictionary"
                if(typeof key!="string"){
                    fields=[]
                    if(!$.isArray(field)){
                        fields[0] = typeof field == "string" ?"\"" +field +"\"" :field
                    }else{
                        fields = field
                    }
                    if(key){
                        for(i=0;i<key.length;i++){
                            if(!fields[i])fields[i]=fields[fields.length-1]
                            var f =     fields[i]
                            f = (typeof f == "string" )?"\"" +f +"\"" :f
                            fs[key[i]]="@dblookup(\"\";\"\";\""+view+"\";\""+key[i]+"\";"+f+")"
                        }
                    }

                }else{
                    if($.isArray(field)){
                        var fields = []
                        for(i=0;i<field.length;i++){
                            fields[i] = typeof field[i] == "string" ?"\"" +field[i] +"\"" :field[i]
                            fs[field[i]]=("@dblookup(\"\";\"\";\""+view+"\";\""+key+"\";"+fields[i]+")")
                        }

                    }else{
                        field = typeof field == "string" ?"\"" +field +"\"" :field
                        fs[key]="@dblookup(\"\";\"\";\""+view+"\";\""+key+"\";"+field+")"
                    }
                }
                return this.formula(fs)
            },
            /**
             * 根据key获取数据字典文档（一个key对应多个文档时，只获取第一个文档）
             */
            dicDoc=function(key){
                return this.getdoc("SysDictionary"+key)
            };
        /*!
         *
         * @type {{dbpath: 数据库路径, filesagentpath: 附件代理服务路径, hrwspath: string hrWS路径, mailpath:邮件路径, username:当前用户名, appname: 当前应用名称, locale: string 本地语言, hasi18n: boolean 是否启用国际化, getcookie: Function, formula: Function, getdoc: Function, getstore: Function, runrule: Function}}
         * @private
         */
        var _appinfo = {
            dbpath: dbpath,
            filesagentpath: filesagentpath,
            hrwspath: "//192.0.0.79:8088/notesService/",
            mailpath: mailpath,
            username: username,
            appname: appname,
            locale: locale,
            hasi18n: true,
            getcookie: getcookie,
            formula: formula,
            getdoc: getdoc,
            dicLookUp:dicLookUp,
            dicDoc:dicDoc,
            getstore: getstore,
            runrule: runrule
        };
        $.extend(exports,_appinfo, appinfo)
    });
})();