/**
 * 解析domino服务器视图返回的json格式数据（需要domino8.0.1 +支持）。解析后的格式如下，实现store 操作API
 * {idProperty:"id", label:"name", entries:[ 1:{ id:"1", subject:"张三的记录",
	 * name:"张三" } ] }
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
            return QueryResults(this.query({},options))
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
            options=$.extend({catetype:"none"},options)

            switch (options.catetype){
                case "":
                    break;
                case "":
                    break;
                case "none":
                default :

                    break;
            }
            if(options.querybase){

                query["startkey"] = new String(options.querybase) + query["startkey"]

                delete options.querybase;
            }
            if(query["startkey"]){
                try{
                    _query[this.label] = new RegExp("^"+query["startkey"].replace(/([\(\)\[\]\.\+\*\?\$\^\!])/gi,"\\$1"),"i")
                }catch(e){
                    _query[this.label] = query["startkey"]
                    // alert("非法输入,如确实存在特殊字符请与相关人员联系!")
                }
            }


            var store=this.localstore, _result=store.query(_query,options),i=0,maxlength=options&&options.count||10
            _result.each(function(index,item){
                i++;
            })
            if(i< maxlength){
                var _result = new $.Deferred();
                _qr = QueryResults(this.queryEngine(query,options,this.url)).each(function(index,item){
                    i++;

                    store.put(item)
                })
                _qr.done(function(){
                    _result.resolve(store.query(_query,options) )
                })
                return  QueryResults(_result)

            }else{
                return _result;
                var deferred = new $.Deferred();
                deferred .resolve(_result)
                return  QueryResults(deferred )
            }
        },
        getChildren:function(parent,options){
            var _parent={}
            _parent[this.catename] = this.cateroot
            var me = this;
            _parent=$.extend(_parent,parent)
            return QueryResults(this.queryEngine({RestrictToCategory:_parent[this.catename]},options,this.url))
            // RestrictToCategory
        }
    }

    return  DXLStore;
})