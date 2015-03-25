/**
 * Created with JetBrains WebStorm.
 * User: yinkehao
 * Date: 13-12-26
 * Time: 上午9:59
 * To change this template use File | Settings | File Templates.
 */
define(function(require,exports,module){
    var $ = require("jquery");
    var global = require("global");
    exports = module.exports = function(unid,dbpath){
        this.UniversalID = unid;
        this.dbpath = dbpath;
        this.document = {};
        this.set(unid)
    }
    exports.property={
        set:function(objectDoc,flag){
            var _self = this;
            var doc = this.document;
            if(typeof objectDoc=="object"){
                if(this.UniversalID == objectDoc.UniversalID&&!flag){
                    return $.when(doc);
                }else{
                    $.each(doc,function(f,k){
                        doc[f] = undefined ;
                        delete doc[f];
                    })
                    $.extend(doc,objectDoc);
                    return $.when(doc);
                }
            }else if(typeof objectDoc =="string"){
                return this.read(true).pipe(function(doc){
                   return  _self.set(doc,true);
                });
            }
        },
        save:function(){

        },
        cache:function(){

        },
        read:function(nocache){
            if(nocache ||!this.document.UniversalID){
                return global.getdoc(unid,this.dbpath,flase,true).then(function(doc){
                    return doc;
                })
            }
            return $.when(this.document)
        },
        update:function(ObjectFields){

        },
        delete:function(){

        }
    }
})
