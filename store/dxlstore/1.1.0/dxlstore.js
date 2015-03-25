/**
 * 解析domino服务器视图返回的json格式数据（需要domino8.0.1 +支持）。解析后的格式如下，实现store 操作API
 * {idProperty:"id", label:"name", entries:[ 1:{ id:"1", subject:"张三的记录",
 * name:"张三" } ] }
 * Version 1.1.0
 */
define(["jquery","./api/store","./Memory","./util/QueryResults","./util/DXLQueryEngine"],function($,Store,Memory,QueryResults,QueryEngine){
    var DXLStore = $.extend(function(ops){
        $.extend(this,ops)
        this.localstore = new Memory({idProperty:this.idProperty,label:this.label});
        this.url = this.dbpath+"/" + this.view
    },Store)


    DXLStore.prototype={
        catename:"_children",
        cateroot:"root",
        queryEngine:QueryEngine,
        add:function(){
            throw "DXLStore 不支持 add 方法"
            return false
        },
        put:function(){
            throw "DXLStore 不支持 put 方法"
            return false
        },
        remove:function(){
            throw "DXLStore 不支持 remove 方法"
            return false
        },
        load:function(options){
            return   QueryResults(this.queryEngine({},options,this.url))
        },
        /**
         * 获取指定id的一条记录
         *
         * @param id
         * @return item对象
         */
        get:function(id){
            var i,item=null;
            for(i in this._allitems){
                if(this._allitems[i][this.idProperty]==id){
                    item = this._allitems[i];
                    break;
                }
            }
            return item;
            // return this._allitems.
        } ,
        /**
         * 查询
         *
         * @param query
         *            String
         * @param options
         * @return
         */
        query : function(query,options){
            _query={}
            options=$.extend({catetype:"none",cache:this.cache||false},options)

            if(options.querybase){

                query["startkey"] = new String(options.querybase) + query["startkey"]

                delete options.querybase;
            }
            if(options.cache){
                delete options.cache;
                if(query["startkey"]){
                    try{
                        _query[this.label] = new RegExp("^"+query["startkey"].replace(/([\(\)\[\]\.\+\*\?\$\^\!])/gi,"\\$1"),"i")
                    }catch(e){
                        _query[this.label] = query["startkey"]
                    }
                }
                return QueryResults(this.queryEngine(query,options,this.url));
                var store=this.localstore, _result=store.query(_query,options),i=0,maxlength=options&&options.count||10
                _result.each(function(index,item){
                    i++;
                })
                if(i< maxlength){

                    var deferred = new $.Deferred();

                    _qr = QueryResults(this.queryEngine(query,options,this.url)).each(function(index,item){
                        i++;
                        store.put(item)
                    })
                    _qr.done(function(){
                         _result = store.query(_query,options);
                        deferred .resolve(_result)
                    })


                    return  _result

                }else{
                    return  _result

                }
            }else{
                delete options.cache;
                return   QueryResults(this.queryEngine(query,options,this.url))
            }
        },
        getChildren:function(parent,options){

            var options = $.extend({
                catetype:this.catetype||"single"
            },options);
            var query ={}

            switch(options.catetype){
                case "single":
                    var _parent={}
                    _parent[options.catename||this.catename] = this.cateroot
                    _parent=$.extend(_parent,parent)
                    query.RestrictToCategory = _parent[this.catename]
                    break;
                case "multi":

                    query.expand = parent._children||0
                    break;
                default:

            }
            delete options.catetype;

            return  QueryResults(this.queryEngine(query,options,this.url));
            // RestrictToCategory
        }
    }

    return  DXLStore;
})