define(["jquery","store/api/store","store/util/QueryResults","store/util/SimpleQueryEngine"],
    function($,Store,QueryResults,SimpleQueryEngine){
        var Memory = function(options){
            $.extend(this,Store)
            for(var i in options){
                this[i] = options[i];
            }
            this.setData(this.data||[]);

        };

        Memory.prototype={
            idProperty:"id",
            //查询引擎
            queryEngine:SimpleQueryEngine,
            //Summary：
            //Array：对象内容的数组集和
            data:null,
            //summary:object
            //一个id所指向的data的索引位置
            //	如  {187:1},idProperty 为187的对象的索引位置
            index:null,
            setData:function(data){
                //Summary:
                //
                if(data.items){
                    this.idProperty = data.identifier;
                    data = this.data = data.items;
                }else{
                    this.data = data;
                }
                this.index = {};
                for(var i = 0, l = data.length; i < l; i++){
                    this.index[data[i][this.idProperty]] = i;
                }
            },
            get:function(id){
                return this.data[this.index[id]]
            },
            getIdentity:function(object){
                return object[this.idProperty]
            },
            put:function(object,options){
                var data = this.data,
                    index = this.index,
                    idProperty = this.idProperty;
                var id = (options && "id" in options) ? options.id : idProperty in object ? object[idProperty] : Math.random();
                if(id in index){
                    // 对象存在
                    if(options && options.overwrite === false){
                        //对象存在返回false;
                        //return false;
                        throw new Error("Object already exists");
                    }
                    // 退回对象
                    data[index[id]] = object;
                }else{
                    // 添加新对象
                    index[id] = data.push(object) - 1;
                }
                return id;
            },
            add:function(object,options){
                (options = options || {}).overwrite = false;
                // call put with overwrite being false
                return this.put(object, options);
            },
            remove:function(id){
                delete this.index[id];
                var data = this.data, idProperty = this.idProperty;
                for(var i = 0, l = data.length; i < l; i++){
                    if(data[i][idProperty] == id){
                        data.splice(i, 1);
                        return;
                    }
                }
            },
            query:function(query,options){
                //summary:
                //	执行一个查询
                //query:String|Object|Function
                //	查询条件
                //options:Store.QueryOptions
                //	包含一系列查询条件
                //return:Store.QueryResults;
                return QueryResults(this.queryEngine(query,options)(this.data));
            }

        } ;
        return Memory;
    }
);