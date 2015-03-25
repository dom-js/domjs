define(function(require,exports,module){
    exports = module.exports = function(dbpath,nocache){
        this.path = dbpath;
        this.cache = !nocache;
    }
    exports.property = {
        getView:function(viewname){
            var def = $.Deferred();
            var _self = this;
            require(["notes/view"],function(view){
                def.resolve( new view(_self.dbpath,viewname,nocache));
            })
            return def;
        },
        getDocument:function(unid){
            var def = $.Deferred();
            var _self = this;
            require(["notes/document"],function(document){
                def.resolve( new document(_self.dbpath,unid));
            })
            return def;
        }
    }
})