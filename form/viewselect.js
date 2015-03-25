/*!
 * 20120406 通过objectj 对代码进行重构
 */

define(
    [ "jquery", "base/objectj", "appinfo", "store/dxlstore" ,"docinfo","plugin/subscribe"],
    function($, obj, appinfo, Store,docinfo) {

        var viewselect = obj.sub();
        var o = {
            options : {
                db : appinfo.dbpath,
                view : "SysDictionaryMulti",
                key : undefined,
                option : {
                    count : 100,
                    start : 1
                },
                empty:true,
                //value : "",
                colval : 0,
                coltext : 0
            },
            main : function() {
                $.extend(this, new $.Deferred())
                //兼容性chuli

                this.options.value = this.options.value? this.options.value  : this.options.defalutvalue?this.options.defalutvalue:this.options.defval
                this.options.empty = this.options.empty!=undefined? this.options.empty : this.options.emptyable!=undefined?this.options.emptyable:true
                this.name = this.options.name||this.attr("name")

                if (this.data("this"))
                    return this.data("this")
                else
                    this.data("this", this);

                if (!this.options.url) {
                    this.options.url = this.options.db
                        + "/"
                        + this.options.view
                        + "?readviewentries&outputformat=json"
                        + (this.options.key ? ("&RestrictToCategory=" + this.options.key)
                        : "");

                }
                this.initList()
                this.initEvent();

            },
            name:"",
            store : null,
            results : null,
            initList:function(){
                this.store = new Store( {
                    dbpath : this.options.db,
                    view : this.options.view
                })
                this[0].getSelectItem = this.getSelectItem
                this.load();
            },
            load : function() {
                var _self = this;
                this.empty();
                if(this.options.empty){
                    this.__addOption("", "", false).data("data",{})
                }

                this.results = this.store.getChildren( {
                    _children : this.options.key
                }, this.options.option);

                if(docinfo.langpack!="")
                    require(["di18n!"+docinfo.langpack],function(i18n){
                        _self.results.each( function(i, item) {
                            _self.addOption(item,i18n)
                        })
                    })
                else{
                    this.results.each( function(i, item) {
                        _self.addOption(item)
                    })
                }

                this.results.done( function() {
                    _self.resolve();
                    _self.change();
                    _self.onload();
                })
            },
            onload : function() {
                //console.log(this.options)
            },
            addOption : function(item,i18n) {
                //将item 转换成一个数组,并将列添加到数组内。
                //console.log(item)
                var item = $.extend([],item) //this.markArray(item);
                for ( var i in item._columns) {
                    item.push(item[item._columns[i]])
                }
                var text = isNaN(this.options.coltext) ? item[this.options.coltext]
                    : item[item._columns[this.options.coltext]]
                var value = isNaN(this.options.colval) ? item[this.options.colval]
                    : item[item._columns[this.options.colval]]
                //过滤只
                if(this.options.filter){
                    if($.isFunction(this.options.filter)&&!this.options.filter.call(this,item)){
                        return false;
                    }else if(this.options.filter.test&&!this.options.filter.test(value)) {
                        return false
                    }

                }
                if(i18n&&i18n[text]){
                    text =i18n[text]
                }
                //alert(this.options.value)

                var _option =this.__addOption(value,text,$.trim(value) == $.trim(this.options.value))
                _option.data("data", item)


                // item._columns
                // console.log(text)
            },
            __addOption :function(value,text,selected){

                var _option =  $("<option value='" + value + "' "+ (selected?"selected":"") +">" + text
                    + "</option>");
                this.append(_option);
                return _option;
            },
            getSelectItem : function() {
                var item = $(this).find(":selected").data("data");
                // var _item =$(this).find(":selected").data("data")
                return item
            },
            initEvent:function(){
                var _self = this;
                this.on("change",function(){
                    _self.publish("viewselect/"+_self.name, [ _self.getSelectItem(),_self.val() ])
                })
                if(_self.options.linked&&_self.options.linked!="")
                    _self.subscribe("viewselect/"+_self.options.linked,function(item,key){
                        var _this = $(this).data("this");
                        _this.options.key = key
                        var _options = {};

                        for(var k in _this.options['linked-options']){
                            _this.options[k] = item[_this.options['linked-options'][k]]
                        }
                        // console.dir(_this.options['linked-options'])
                        _this.options=$.extend(_this.options,_options)

                        _self.initList();
                    })
            }

        }
        viewselect.fn.extend(true, o)
        return viewselect;

    })