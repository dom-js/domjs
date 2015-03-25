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

    exports = module.exports = function(){
        if(!global.islogin){
            throw new Error("获取会话失败，用户未登录")
        }
        this.username = global.username;
    }
    exports.prototype={
        getDatabase:function(){
            var dbpath = "",nocache=false;
            var l = arguments.length;
            switch(l){
                case 0:
                    throw new Error("参数错误");
                    break;
                case 1:
                    dbpath = arguments[0];
                    break;
                case 2:
                    if(typeof arguments[1]=="boolean"){
                        dbpath = arguments[0];
                        nocache = arguments[1];
                    }else{
                        dbpath = "//"+arguments[0]+"/"+  arguments[1].replace(/\\/g,"/");
                    }
                    break;
                default :
                    dbpath = "//"+arguments[0]+"/"+  arguments[1].replace(/\\/g,"/");
                    nocache = arguments[2];
            }
            var def = $.Deferred();
            require(["notes/database"],function(database){
                def.resolve(new database(dbpath,nocache));
            })
            return def;
        }
        ,Evaluate:function(fs,unid){

        }

    }
});
