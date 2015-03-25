/**
 * Created with JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-8-27
 * Time: 上午10:54
 * 封装弹出窗口插件，基于jbox和_base/widget
 */
define(
    ["widget/jbox","i18n!nls/system"],
    function(_jbox,i18n) {
        var options={

        }
        var dialog = function(selector,options){
             $.extend(this.options,options)
             this._box = jbox("",{})
             this._contentBox = this._box.find("")
             this.set("content",selector)
        };
        dialog.prototype={
            set:function(name,val){
                if(typeof this["__set"+this[name] ] ){
                    this["__set"+this[name]](val)
                }else{
                    this[name] = val
                }
            },
            __setcontent:function(val){
                this._contentBox.empty().append(val)
            }
        }
        return dialog;
    })