define(["jquery","base/util","widget/_base/widget","plugin/tmpl","widget/jbox","view/view","i18n!nls/system","css!"+require.toUrl("view/source/css/select.css")],
    function($,util,Widget,tmpl,jBox,View,i18n){

        var select = Widget.sub()
        select.fn.extend({
            options:{
                width:600,
                height:400,
                valuesplit:",",
                multi:false,
                autofields:[]
            },
            __initWidget:function(){
                this.doms={}
                this.wrap("<div style='float: left;'></div>")
                this.doms.depend = this.parent()

                this.__initBt()
            } ,

            __initDialog:function(){
                var _self =  this, opts = this.options, bts = {

                }
                bts[i18n["OK"]]="ok"
                bts[i18n["Cancel"]]="cancel"
                bts[i18n["Clear"]]="clear"

                var jbox = this.doms.dialog =  jBox("",{
                    title:i18n["Select"],
                    width:opts.width,
                    height:opts.height,
                    buttons:bts ,
                    submit:function(v,h,f){
                        _self.dialogSubmit(v,h,f)
                        return false
                    }
                }).hide()
                var btClose =  jbox.find(".jbox-close")
                btClose.attr("title",i18n["Close"])
                //console.log(btClose.click)
                btClose.off("click")
                btClose.on("click",function(){
                    _self.close()
                })
                var bts =this.doms.btsDialog = jbox.find(".jbox-button-panel button")
                this.doms.viewpanel=$("<div></div>");
                // var btCancel = this.doms.btCancel = bts.filter("[value=cancel]")
            },
            __initView:function(){
                var box = this.doms.dialog.find("#jbox-content")
                var width = this.doms.viewpanel.width()

                var view = this.doms.view = View("<div class='viewgrid' style='margin-left:5px;width:"+(width)+"px'></div>", {
                    scrollBar:box ,
                    queryengine:"open",
                    celltype:"text",
                    host:this.options.host,
                    db:this.options.db,
                    view:this.options.view,
                    cate:this.options.cate,
                    querystr:this.options.querystr,
                    layout:this.options.layout,
                    seltype:this.options.multi?"multi":"signal"
                })

                var panel=this.doms.viewpanel ;
                box.append(panel);
                panel.append(view);
                //box.append(view)
            },
            __initSelectPanel:function(){

                var panel=$("<div style='margin-top:5px;float:right;width:200px;overflow-y:auto;border: 1px solid #C0C0C0;height:"+(this.options.height-70)+"px; ' ></div>");
                var listpane = this.doms.selecetpanel=$("<ul style='margin: 5px;padding: 0px;list-style: none;'></ul>"),valuefield=this.options.valuefield
                panel.append(this.doms.selecetpanel)
                var box = this.doms.dialog.find("#jbox-content");
                box.append(panel);
                var tmplstr="<script type='text/x-domjs-tmpl'><li data-key='${__key__}'><input type='checkbox' name='viewGridMultiSelectBox'/>${"+valuefield+"}</li></script>"

                var viewpanel = this.doms.viewpanel

                //初始化值
                var split = this.options.valuesplit
                var values= $.trim(this.val()).split(split)
                var items =[]
                $.each(values,function(i,v){
                    if($.trim(v)!=""){
                        var item ={}
                        item[valuefield] = v
                        item.__key__=util.getKeyCode(v);
                        items.push(item)
                    }

                })
                if(values.length>0){
                    var els = $(tmplstr).tmpl(items)
                    listpane.append(els)
                }


                var selectItem = function(el){
                    var item = $(el).tmplItem().data;

                    item.__key__=util.getKeyCode(item[valuefield]);
                    var $el = listpane.find("[data-key="+ item.__key__+"]")
                    $(el).attr("data-key",item.__key__)
                    if(el.checked){
                        if($el.length==0){
                            var el = $(tmplstr).tmpl(item)
                            listpane.append(el)
                        }
                    }else{
                        $el.remove()
                    }

                }
                this.doms.viewpanel.on("click","input[name=viewGridselectAllBox]:checkbox",function(){
                    viewpanel.find("input[name=viewGridSelectBox]:checkbox").each(function(i,el){
                        selectItem(this)
                    })

                })
                this.doms.viewpanel.on("change","input[name=viewGridSelectBox]:checkbox",function(){
                    selectItem(this)
                })
                listpane.on("click","input[name=viewGridMultiSelectBox]:checkbox",function(){
                    var $el =  $([]).pushStack($(this).tmplItem().nodes)

                    var key =  $el.attr("data-key")
                    viewpanel.find("[data-key="+ key +"]").removeAttr("checked")
                    $el.remove()
                })
            },

            __initBt:function(){
                var bt = this.doms.btSelect  = $("<input style='visibility:hidden;' type='button' value='"+i18n["Select"]+"'>")
                this.after(bt)
            },
            __initEvent:function(){
                var _self = this
                this.doms.depend.on("mouseenter",function(){
                    _self.doms.btSelect.css({
                        "visibility":"visible"
                    })
                })
                this.doms.depend.on("mouseleave",function(){
                    _self.doms.btSelect.css({
                        "visibility":"hidden"
                    })
                })
                this.doms.btSelect.on("click",function(){
                    _self.open()
                })
            },
            getSelectItem:function(){
                var view =   this.doms.view
                if(this.options.multi){
                    var items=[]

                    this.doms.selecetpanel.find("input[type=checkbox]").each(function(i,el){
                        var item = $(el).tmplItem().data;
                        items.push(item)
                    })
                    return items;

                }else
                    return   view.getSelectItem()
            },
            select:function(){
                var split = this.options.valuesplit
                var _self = this   ,view =   this.doms.view
                var items =  this.getSelectItem()

                var fieldname = $.isNumeric(_self.options.valuefield)?view.__orgLayout[_self.options.valuefield].name:_self.options.valuefield
                var vals = $.map(items,function(item){
                    return item[fieldname]
                })
                $.each(this.options.autofields,function(v,f){
                    var fieldname = $.isNumeric(v)?view.__orgLayout[v].name:v
                    $("[name="+f+"]").val( $.map(items,function(item){
                        return item[fieldname]
                    }).join(split))
                })
                this.val(vals.join(split))
                this.triggerHandler("selected",[items])
            },
            clear:function(){
                if(this.options.multi){
                    this.doms.selecetpanel.empty()
                }
                this.doms.view.clearSelect()
            },
            dialogSubmit:function(v,h,f){
                switch(v){
                    case "ok":
                        this.select()
                        this.close()
                        break;
                    case "clear":
                        this.clear()
                        break;
                    case "cancel":
                    default :
                        this.close()
                }
            },
            open:function(){
                if(!this.doms.dialog){
                    this.__initDialog()

                    if(this.options.multi){
                        //alert(1)
                        this.__initSelectPanel();
                        this.doms.viewpanel.css("float","left").width( this.options.width-210);

                    }else{
                        this.doms.viewpanel.width( this.options.width-10);

                    }
                    this.__initView()
                }
                this.doms.dialog.show();
                this.doms.view.refreshHeadSize()
            },
            close:function(){
                this.doms.dialog.hide()
            }
        })
        return select
    })