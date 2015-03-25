define(function(require,exports,mudule){
    var store , baseQuery = [],queryCollection=[],memoryCollection=[];


    var model = function(opts){
        this.options ={
            cachetype:"session",
            idproperty:"",
            count:30,
            defaultquery:{},
            basequery:{}
        };
        $.extend(this.options,opts);
        opts = this.options;
        this.store = this.options.store
    };
    model.cacheObject={};
    model.prototype = {
       
        /**
         * 获取基础过滤条件（此条件可以通过代码进行更新）
         */
        getBaseQuery:function(){
            var opts = this.options;
            var qstr = $(opts.__element).attr("data-baseQuery");
            qstr =(typeof qstr =="undefined"?"{}":qstr);
            var basequery = (new Function("return "+ qstr ))();
            var q = $.extend({},opts.basequery,basequery) ||{} ;
            return this.transQuery(q);
        },
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
            var _self = this;
            var key =  this.getBaseQuery();
            key = "localcache_"+ _self.options.db +"_"+ _self.options.view +"_"+key
            key = util.strToKey(key)

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
            var key =  this.getBaseQuery();
            key = "localcache_"+ this.options.db +"_"+ this.options.view +"_"+key
            key = util.strToKey(key)
            this.setLocalData(key,this.getMemory().data)
        },
        /**
         * 进行缓存搜索
         */
        searchCache:function(q){
            //使用基础搜索作为本地一个缓存约束条件
            var _self = this;


            var memory = this.getMemory()  ;
            var query = $.extend({},q);

            return memory.query(this.getCacheQuery(query)).pipe(function(data){
                return data;
            });
        },
        transRegVal:function(value){
            if($.isArray(value)){
                var _self = this;
                return $.map(value,function(val){return _self.transRegVal(val)});
            }else{
                value = value.replace(/([\(\)\.\*])/g,"\\$1")
                return new RegExp(value,"i")
            }

        },
        /**
         * 本地缓存查询处理
         */
        getCacheQuery:function(query){
            var _self =this;
            var opts =this.options;
            var queryGroup = {}
            $.each(query,function(key,obj){
                var value = obj;

                var q = {};
                queryGroup[key] = q;
                //如果存在key为query的查询项目也是query,则做全局查询处理，按照layout进行查询
                if(key=="query"&&obj[key]){

                    $.each(opts.layout,function(i,item){
                        value = obj[item.field]

                        if(value!="")
                            q[item.field]=_self.transRegVal(value) ;
                    }) ;

                }else{

                    $.each(obj,function(k,value){
                        if(value!="")
                            q[k]=_self.transRegVal(value);
                    })

                }
            });
            return function(item,i){
                var flag = true
                $.each(queryGroup,function(_,query){
                    var f = true
                    var j = 0
                    $.each(query,function(k,reg){
                        if(j==0)f = false
                        j++

                        if(reg.test){
                            f  = f || reg.test(item[k]) ;
                        }else if($.isArray(reg)){
                            $.each(reg,function(i,r){
                                f  = f || r.test(item[k]) ;
                            })

                        }else{

                            f = item[k] = reg.test;
                        }
                    })
                    flag = flag && f
                })
                return flag
            }
        },
        /**
         * 初始化根据基本条件进行数据的加载
         * @param opts
         * @return
         */
        load:function(opts){
            var _self =this
            var q = $.extend({},this.options.defaultquery)
            return this.query(q, opts);
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
            var querystr= this.getBaseQuery();
            var q = this.transQuery(query);
            var sqtr = querystr  + (q =="" ||querystr=="" ?q:" AND " + q);
            opts = $.extend({
                SearchMax:30,
                Scope:1
            },opts) ;
            var key = this.getBaseQuery();
            var _self = this;

            return  this.searchCache(query).pipe(function(data){

                if(data.length>=_self.options.count){
                    return data;
                }
                var cacheKey = "remotecache_"+_self.options.db+"_"+_self.options.view+"_"+sqtr
                cacheKey = util.strToKey(cacheKey);

                //如果本地查询的结果集合不满足要求查询的最少记录数，则使用服务器查询，并返回查询结果,同时将查询结果更新到本地内存
                //本地查询按照查询字符串 进行缓存，一旦缓存过多，也将不进行服务器查询，解决查询结果少于30时的重复查询
                if(!model.cacheObject[cacheKey]){

                    model.cacheObject[cacheKey] = _self.store.query({query:sqtr},opts).pipe(function(data){

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

        }
    };
})