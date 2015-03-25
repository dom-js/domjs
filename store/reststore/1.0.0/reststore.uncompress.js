/**
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-6-20
 * Time: 下午3:38
 * To change this template use File | Settings | File Templates.
 */
/**
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-5-25
 * Time: 上午10:55
 * To change this template use File | Settings | File Templates.
 */
define(["jquery","store/api/store","store/util/QueryResults","base/util"],function($,StoreAPI,QueryResults,util){

    var Store = $.extend(function(ops){
        this.__query={}
        this.options={}
        this.__createdOptions(ops);
    },StoreAPI)

    Store.prototype={
        __createdOptions:function(ops){
            this.options.idProperty="_unid"
            $.extend(true,this.options,ops)
            if(this.options.idproperty)this.options.idProperty=this.options.idproperty
            this.idProperty = this.options.idProperty
            return  this.options
        },
        idProperty:"_unid",
        queryEngine:function(query,option){
            var modulename = "RESTSTORE/" + (new Date()).getTime()+"/R"+Math.random().toString().substr(2);
            var deferred = new $.Deferred()
            $.ajax(
                option.url,
                {
                    dataType:"script",
                    data:$.extend(query,{
                        module:modulename
                    })
                }).then(function(){
                    require([modulename],function(module){
                        deferred.resolve(module)
                    })
                })
            return deferred
        },

        add:function(){
            throw "ViewStore 不支持 add 方法"
            return false
        },
        put:function(){
            throw "ViewStore 不支持 put 方法"
            return false
        },
        remove:function(){
            throw "ViewStore 不支持 remove 方法"
            return false
        },
        load:function(options){
            return this.query({},options)
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
        setQuery:function(q){
            $.extend(true,this.__query,q)
        },
        clearQuery:function(){
            this.__query={}
        },

        /**
         * 查询
         *
         * @param query
         *            String
         * @param options
         * @return
         */
        query : function(query,options){
            query = $.extend(true,this.__query,query)
            options = $.extend(true,this.options,options)
            return  QueryResults(this.queryEngine(query,options))
        },
        getChildren:function(parent,options){

        }
    }
    return Store;
})