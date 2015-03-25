/**
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-5-25
 * Time: 上午10:55
 * To change this template use File | Settings | File Templates.
 * 20121019 修改 this.__query,this.options,this.queryEngine 在构造函数内进行初始化，防止产生指针引用。
 */
define(["jquery","store/api/store","store/util/QueryResults"],function($,Store,QueryResults){

    var ViewStore = $.extend(function(ops){
            this. __query={}
            this.options={}
            this.__createdOptions(ops);
            this.queryEngine=null
    },Store)
    ViewStore.prototype={
        __createdOptions:function(ops){
            this.options.idproperty="_unid"
            $.extend(true,this.options,ops)
            this.idProperty = this.options.idProperty||this.options.idproperty
            return  this.options
        },
        idProperty:"_unid",
        //计算QueryEngine名称实现按需载入
        getQueryEngineName:function(){
            var queryengine = ""
            var qe = this.options.queryEngine||this.options.queryengine

            switch(qe){
                case "open":
                    queryengine = "store/util/openviewqueryengine"
                    break;
                case "search":
                    queryengine = "store/util/readviewentiresqueryengine"
                    break;
                case "readviewentries":
                case "undefined":
                case undefined:
                    queryengine = "store/util/readviewentiresqueryengine"
                    break;
                default:
                    queryengine = qe
            }
            return queryengine
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
            var deferred = new $.Deferred()
            if($.isPlainObject(id)){
                var unid = id["_unid"].toUpperCase()
                  if(!unid){
                      deferred.reject()
                  }else{
                      var _url = "//"+this.options.host+"/"+this.options.db+"/(all)/"+unid+"?opendocument&form=SysOpenDocByJSON"
                      $.getScript( _url ).done(function(){
                          require([unid],function(item){
                              deferred.resolve(item)
                          })
                      },function(err){
                          deferred.reject(err)
                      })
                  }
            }else{
                for(i in this._allitems){
                    if(this._allitems[i][this.idProperty]==id){
                        item = this._allitems[i];
                        break;
                    }
                }
                deferred.resolve(item)
            }
            return deferred;
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

            var _self = this;
            $.extend(this.__query,query)
            $.extend(this.options,options);
            query = $.extend({},this.__query,query)
            options = $.extend({},this.options,options)
            var _result=new $.Deferred();

            require([this.getQueryEngineName()],function(QueryEngine){
                _self.queryEngine = QueryEngine;
                return  QueryEngine(query,options).done(function(data){
                    _self._allitems=data;
                    _result.resolve(data)
                }).fail(function(err){
                    _result.reject(err)
                 })
            })

          return  QueryResults(_result)
        },
        getChildren:function(parent,options){
            var _parent={}
            options=$.extend({},options)

                var _key =  options.childrenproperty || this.options.childrenproperty || this.idProperty
                _parent[_key] = "root" //_options.cateroot
                _parent=$.extend(_parent,parent);

                if(typeof(_parent[_key])=="string" || typeof(_parent[_key])=="number"){
                    var query = {}
                    if(_key.toLowerCase()=="_position") {
                        options.expand =   _parent[_key]
                    }else{
                       query.RestrictToCategory=  _parent[_key]
                    }

                    query = $.extend({},this.__query,query)
                    $.extend(this.options,options)
                    options = $.extend({},this.options,options)
                    var store = options.store||this;

                    return store.query(query,options)
                }else{
                    var _result=new $.Deferred()
                    _result.resolve(_parent[_key])
                    return  QueryResults(_result);
                }

        }
    }

    return  ViewStore;
})