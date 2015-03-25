define(function(require,exports,module){
    var Store = require("store/namesstore/1.0.0/namesstore");
    var Memory = require("store/memory");
    var util = require("base/util");
    var QueryResults = require("store/util/QueryResults")

    var model = function(opts){
        this.options ={
            cachetype:"session",
            keyname:"localcache_namecache",
            count:30
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
        searchCache:function(query){
            //使用基础搜索作为本地一个缓存约束条件
            var memory = this.getMemory()  ;
            return memory.query(this.getCacheQuery(query))
        },
        /**
         * 本地缓存查询处理
         */
        getCacheQuery:function(query){


            var _self =this;
            var opts =this.options;
            var queryGroup = {}
            var reg = new RegExp("^"+query)
            return function(item,i){
                //console.log(item)
                var flag = true
                flag =   reg.test(item.lastname)||reg.test(item.mail)
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

            var _self = this;

            var res =   this.searchCache(query).pipe(function(data){

                if(data.length>=_self.options.count){
                    return data;
                }
                var cacheKey = "remotecache_"+query

                //如果本地查询的结果集合不满足要求查询的最少记录数，则使用服务器查询，并返回查询结果,同时将查询结果更新到本地内存
                //本地查询按照查询字符串 进行缓存，一旦缓存过多，也将不进行服务器查询，解决查询结果少于30时的重复查询
                if(!model.cacheObject[cacheKey]){
                    model.cacheObject[cacheKey] = _self.store.query(query,opts).pipe(function(data){
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
                    return _self.searchCache(query);
                });

            },function(e){
                return e
            });
            return QueryResults(res);
        }
    };

    return model
})