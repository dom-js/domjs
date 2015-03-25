define(function(require,exports,module){
    var Store = require("./RemoteStore");
    var Memory = require("store/memory");
    var util = require("base/util");
    var QueryResults = require("store/util/QueryResults")

    var model = function(opts){
        this.options ={
            cachetype:"session",
            keyname:"localcache_namecache",
            count:30,
            type:"P" //人员||G群组||人员和群众
        };
        $.extend(this.options,opts);
        opts = this.options;
        this.store =new Store({
            count:opts.count
        });
    };
    model.isMatch = function(item){

        var getMatchString = function(str){
            return str.replace(/\s/gi,"").toLowerCase();
        }
        var abbreviate = getMatchString(item.abbreviate)
        var originalname =getMatchString(item.originalname)
        var lastname = getMatchString(item.lastname)
        var shortname=  getMatchString(item.shortname)
        return abbreviate==originalname||lastname==originalname||shortname==originalname
        //return item.abbreviate.replace(/\s/gi,"")==item.originalname.replace(/\s/gi,"")||item.lastname.replace(/\s/gi,"")==item.originalname.replace(/\s/gi,"")||item.shortname.replace(/\s/gi,"")==item.originalname.replace(/\s/gi,"")
    } ;
    model.cacheObject={};
    model.prototype = {
        options:null,
        store:null,
        /**
         * 获取本地存储对象
         */
        getLocalData:function(key){
            try{
                if(typeof window[this.options.cachetype+"Storage"]=="undefiend")return [];
                var Storage = window[this.options.cachetype+"Storage"];
                return (new Function("return "+ Storage.getItem(key) ))()||[];
            }catch(e){
                return [];
            }
        },
        /**
         * 将数据保存到本地缓存内
         */
        setLocalData:function(key,data){
            try{
                if(typeof window[this.options.cachetype+"Storage"]=="undefiend"){
                    return false
                };
                var localdata = util.toJSON(data)
                var Storage = window[this.options.cachetype+"Storage"];
                Storage.setItem(key,localdata);
            }catch(e){
                return false;
            }

        },

        /**
         * 获取内存对象
         */
        getMemory:function(){
            var _self = this,key=this.options.keyname;

            if(!model.cacheObject[key]){
                var data = this.getLocalData(key);
                model.cacheObject[key] = new Memory({data:data,idProperty:this.options.idproperty});
            }
            return  model.cacheObject[key]  ;
        },
        /**
         * 将内存数据持久好到本地存储上
         * @return
         */
        saveMemory:function(){
            var key=this.options.keyname;
            this.setLocalData(key,this.getMemory().data)
        },
        /**
         * 进行缓存搜索
         */
        searchCache:function(query,opts){
            //使用基础搜索作为本地一个缓存约束条件
            var memory = this.getMemory()  ;
            return memory.query(this.getCacheQuery(query,opts))
        },
        /**
         * 本地缓存查询处理
         */
        getCacheQuery:function(query,opts){


            var _self =this;
            var opts = $.extend({fullmatch:false},this.options,opts);
            var queryGroup = {}

            var regs = $.map(query,function(q){
                q = $.trim(q);

                if( opts.fullmatch){

                    return new RegExp("^"+q+"$","i")
                }else{
                    if(q=="")return /^.*/;
                    return new RegExp("^"+q,"i")
                }

            })

            return function(item,i){
                if(opts.type.toString().toUpperCase()=="P"){
                    if(item.type.toString().toUpperCase()!="PERSON")return false
                }
                if(opts.type.toString().toUpperCase()=="G"){
                    if(item.type.toString().toUpperCase()!="GROUP")return false
                }


                //console.log(item)
                var flag = false
                $.each(regs,function(i,reg){
                    if(  reg.test(item.lastname)||reg.test(item.shortname)){

                        flag = true
                        return false
                    }
                })

                return flag
            }
        },
        /**
         * 初始化根据基本条件进行数据的加载
         * @param opts
         * @return
         */
        load:function(){
            return $.when([])
        },

        cache:function(){
            return this.load();
        },
        /**
         * 执行模型的查询操作
         * @param 查询参数
         * @param 扩展参数
         * @return 查询结果
         */
        query:function(query,opts){
            var query = query.toString().split(/[,;]/gi);

            var _self = this;
            opts =  $.extend({},this.options,opts)
            var res =   this.searchCache(query,opts).pipe(function(data){

                if(data.length>=_self.options.count){
                    return data;
                }
                if(query[0]=="")return data;
                var cacheKey = "remotecache_"+query.toString();

                //如果本地查询的结果集合不满足要求查询的最少记录数，则使用服务器查询，并返回查询结果,同时将查询结果更新到本地内存
                //本地查询按照查询字符串 进行缓存，一旦缓存过多，也将不进行服务器查询，解决查询结果少于30时的重复查询
                if(!model.cacheObject[cacheKey]){


                    model.cacheObject[cacheKey] = _self.store.query(query.join(","),opts).pipe(function(data){
                        var memory = _self.getMemory();
                        $.each(data,function(i,item){
                            memory.put(item);
                        });
                        //util.toJSON(memory.data)
                        _self.saveMemory();

                        return data;
                    }) ;

                }
                return model.cacheObject[cacheKey].pipe(function(){
                    return _self.searchCache(query,opts);
                });

            },function(e){
                return e
            });
            return QueryResults(res);
        }
    };

    return model
})