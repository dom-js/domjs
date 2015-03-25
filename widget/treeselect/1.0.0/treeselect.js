define(
    [ "jquery","base/objectj","m!widget/tree:2.0.0","widget/jbox","i18n!nls/system","base/util"],
    function($,obj,tree,jbox,i18n,util) {
        var selpane = obj.sub();
        selpane.fn.extend({
            main:function(){
                this.__init()
            },
            options:{
                idProperty:"label",
                label:"label",
                pathfield:"_item_path",
                labeltype:0
            },
            doms:{},
            items:[],
            __init:function(){
                this.__initWidget()
                this.__initEvent()
                this.trigger("init")
            },
            __initWidget:function(){
               var doms = this. doms = {
                   panel : $("<ul style='padding: 0px; margin: 0px; list-style: none;'></ul>")
               }
                this.css({
                    "overflow-y":"auto"
                })
               this.append(doms.panel)
            },
            __customEvent:"init add remove",
            __initEvent:function(){
                var _self = this;
                this.doms.panel.on("mouseenter","li",function(){
                    $(this).css({
                        "background-color":"#ccffff"
                    })
                }).on("mouseleave","li",function(){
                        $(this).css({
                            "background-color":""
                        })
                }).on("select","li",function(){
                        return false
                    }).on("dblclick","li",function(){
                        var item = $(this).data("item")
                        _self.__remove(item)
                    })
               this.on("selectstart",function(){return false})
            },
            __initNode:function(item){
               // var key = item[]
                var label = this.__getLabelText(item)
                var dom = $("<li style='border-bottom: 1px dotted #CFCFCF;cursor: pointer;padding: 0px 5px;' data-key="+this.__getItemKey(item)+">"+label+"</li>")
                dom.data("item",item)
                return dom
            },
            __getNode:function(item){

                 return this.doms.panel.find("li[data-key="+this.__getItemKey(item)+"]")
            },
            __getItemKey:function(item){
                var key
                key=item[this.options.idProperty]

               return util.strToKey(key)
            },
            __getLabelText:function(item){
                var _self=this,label


                    var pathfield = this.options.pathfield
                    var labelkey = this.options.label
                    if(this.options.labeltype>0){
                        if($.isArray(item[pathfield])){
                            var _val = []
                            $.each(item[pathfield],function(i,pathitem){

                                if(typeof pathitem =="string"){
                                    _val.push(pathitem);
                                }else{
                                    _val.push(pathitem[labelkey])
                                }
                            })
                            if(_self.options.labeltype==1){
                                _val.shift()

                            }
                            _val.push(item[labelkey])
                            label = _val.join("\\")
                        }else{
                            label = item[pathfield]||item[labelkey]
                        }
                    }else{
                        label=item[this.options.label]
                    }

                return label
            },

            isSel:function(item){
                return (this.__getNode(item).length>0)
            },
            replaceItem:function(olditem,newitem){
                var _self = this
                this.items = $.map(this.items,function(item,i){
                    if(olditem==item){
                        var dom = _self.__getNode(olditem)
                        dom.attr("data-key",_self.__getItemKey(newitem))
                        dom.data("item",newitem)
                        return newitem
                    }else{
                        return item
                    }
                })

            },
            add:function(item){

                this.items.push(item)
                var node = this.__initNode(item)
                this.doms.panel.append(node)

                return node
            },

            put:function(item){
               return   this.add(item)
            },
            __remove:function(item){
                this.remove(item)
                this.trigger("remove",[item])
            },
            remove:function(item){
                this.items=$.grep(this.items,function(_item,i){
                    return item!=_item
                })
                var node = this.__getNode(item)
                node.remove()
            },
            empty:function(){
                var _self = this;

                this.items=$.grep(this.items,function(_item,i){
                    _self. __remove(_item)
                    return false
                });
            }

        })
        var select = obj.sub();
        select.fn.extend({
            main:function(){
                if(this.length>1){
                    this.each(function(i,el){
                        select(el)
                    })
                }else{
                    if(!this.data("this"))this.data("this",this)
                    this.__init()
                }
            },
            options:{
                depend:null,
                multi:false,
                width:600,
                height:400,
                labeltype:0,//0，无路径，1，不包含跟路径，2，包含跟路径
                valuefield:"label",
                valuetype:0,//0，无路径，1，不包含跟路径，2，包含跟路径
                valuesplit:",",
                pathsplit:"\\",
                pathfield:"_item_path",
                cachestore:true
            },
            doms:{},
            tree:null,
            sel:null,
            selectNode:undefined,
            selectItems:[],
            __init:function(){
                this.__initWidget()
                this.__initEvent()
                this.__initValue()
            },
            __initWidget:function(){
                this.options.depend = this.parent()
                this.options.depend.append()
                this.__initDoms()
            },
            __initDoms:function(){
                var boxbuttons={};
                boxbuttons[i18n["OK"]]=1
                boxbuttons[i18n["Cancel"]]=0
                boxbuttons[i18n["Empty"]]=2
                var boxOptions={
                    buttons:boxbuttons,
                    top:100,
                    width:this.options.width,
                    height:this.options.height,
                    submit:function(){
                        return false
                    }
                }
                var box = jbox("",boxOptions).hide()
                if(util.isIE6)
                    $('select').css('visibility', 'visible')
                var doms = this.doms = {
                    basePanel:box,
                    contentPanel:box.find(".jbox-content"),
                    treePanel:$("<div style='margin: 5px 0px 5px 5px;border:1px solid #2F6FAB;float: left;overflow: hidden;' ></div>"),
                    infoPanel:$("<div></div>"),
                    selPanel:$("<div  style='margin: 5px 5px 5px 0px;border:1px solid #2F6FAB;float: right;' ></div>"),
                    btDom:$("<button></button>")
                }
                doms.basePanel.find(".jbox-button-panel button").each(function(i,bt){
                    bt = $(bt)
                    switch(bt.val()){
                        case "0":
                            bt.attr("data-type","cancel")
                            break
                        case "1":
                            bt.attr("data-type","ok")
                            break;
                        case "2":
                            bt.attr("data-type","empty")
                            break
                    }
                })

                doms.contentPanel.append(doms.treePanel)

                var h = this.options.height-100
                doms.treePanel.height(h)
                doms.treePanel.width(this.options.width-12)
                if(this.options.multi){
                    var w = (this.options.width-20)/2;
                    this.sel = selpane(doms.selPanel,{
                        idProperty:this.options.store.idProperty,
                        label:this.options.label,
                        labeltype:this.options.labeltype,
                        pathfield:this.options.pathfield
                    })
                    doms.contentPanel.append(this.sel);
                    doms.selPanel.width(w);
                    doms.selPanel.height(h);
                    doms.treePanel.width(w);

                }
                this.__initTree()
               // doms. btDom.text(i18n["Select"]);
              //  this.after(doms.btDom);
                this.after(doms.basePanel);
            },
            __initTree:function(){
                var _treeRootPanel =
                    $("<div  style='margin-left:0px;font-size:12px;height:100%;width: inherit;overflow-y:auto; '" +
                        "  class='treeview'></div>")

                this.doms.treePanel.append(_treeRootPanel)

                this.tree = tree(_treeRootPanel,{
                    store:this.options.store,
                    root:this.options.root,
                    rootlabel:this.options.rootlabel,
                    label:this.options.label,
                    pathfield:this.options.pathfield,
                    width:"inherit",
                    preload:this.options.preload,
                    filter:this.options.filter,
                    map:this.options.map,
                    expandone:this.options.expandone, //一个层级内只展开一个节点,
                    multi:this.options.multi,
                    autoexpand:true //不自动展开Tree，自动展开tree会导致跟节点的expand无法展开
                })

                if(this.filter){
                      this.tree.filter=this.filter
                }
                if(this.map){
                   //this.tree.map=this.map
                }
            },
            __getSelNode:function(TreeNode){

            },
            __getTreeNode:function(SelNode){

            },
            __customEvent:"select show close selected",
            __initEvent:function(){
                var _self = this
               // this.on("dblclick",function(){
                  //  _self.showDialog()
            //    })
              //  this.doms. btDom.on("click",function(){
               //     _self.showDialog()
              //  })
                this.doms.basePanel.find(".jbox-close").off("click").on("click",function(){
                    _self.close();
                })
                this.doms.basePanel.find(".jbox-button-panel ").on("click","[data-type=ok]",function(){
                    _self.selected();
                    return false;
                }).on("click","[data-type=cancel]",function(){
                        _self.close();
                        return false;
                    }).on("click","[data-type=empty]",function(){
                        _self.empty();
                        return false;
                    })
                this.tree.on("selected",function(e,tree,node){
                    _self.select(node);
                })
                if(!_self.options.multi)
                this.tree.on("dblclick",function(e){

                        var node = $(this).data("this")
                        _self.tree.select(node,1,false)
                        _self.selected();
                 })
                 this.tree.on("nodeloaded",function(e,tree,node){
                     _self.initNode(node)
                 })
                 if(this.sel)
                this.sel.on("remove",function(e,item){
                    _self.__removeTreeSelect(item)
                })
            },
            __initvalueitems:[],
            __initValue:function(){
                    if(this.options.valueitems==null){
                        if($.trim(this.val())!="")
                        this.options.valueitems=$.trim(this.val()).split(this.options.valuesplit)
                        else
                            this.options.valueitems=[]

                    }
                    var _self = this
                    $.each(this.options.valueitems,function(i,item){
                        if(typeof item=="string"){
                            var label = item
                            item={}
                            item[_self.options.store.idProperty] = label
                            item[_self.options.label]=label
                        }
                       if(_self.options.multi){
                           _self.sel.add(item)
                       }
                        _self.selectItems.push(item)

                    })
                  this.__initvalueitems = this.selectItems
            },

            __removeTreeSelect:function(item){
                var key = this.sel.__getItemKey(item)
                var node = this.tree.getNodeByKey(key)
                    if(node)node.select(2,true)
            },
            initNode:function(node){
                var _self = this;
                var idProperty = this.options.store.idProperty,label = this.options.label
                this.__initvalueitems =  $.grep( this.__initvalueitems,function(item,i){
                     if(item[idProperty]==node.options.item[idProperty]||_self.__getvalue(item)==_self.__getvalue(node.options.item)){
                         if(_self.options.multi){
                           node.select(3,true)
                           _self.sel.replaceItem(item,node.options.item)
                         }else{
                           _self.tree.select(node,1,false)
                        }
                          return false
                   }
                    return true
                })
            },
            __getvalue:function(item){
                var val;
                var pathfile = this.tree.options.pathfield;
                var field = this.options.valuefield
                var label = this.options.label
                var _self = this;
                if(this.options.valuetype>0){
                    if($.isArray(item[pathfile])){
                        var _val = []
                        $.each(item[pathfile],function(i,pathitem){
                            if(typeof pathitem =="string"){
                                _val.push(pathitem);
                            }else{
                                _val.push(pathitem[field]||pathitem[label])
                            }

                        })
                        if(_self.options.valuetype==1){
                            _val.shift()
                        }
                        _val.push(item[field]||item[label])
                        val = _val.join(_self.options.pathsplit)

                    }else{

                        val = item[pathfile]||item[label]
                    }
                }else{
                    val = item[undefined]||item[label]
                }
                return val;
            },
            selected:function(){
                if(this.options.multi){
                    this.selectItems = this.sel.items
                }

                var field = this.options.valuefield
                 var label = this.options.label
                var _self = this;
                var vals = []
                 $.each(this.selectItems,function(i,item){
                     var val = _self.__getvalue(item);

                     vals.push(val)
                 })
                _self.val(vals.join(this.options.valuesplit))
                this.close()
                this.trigger("selected",[this,this.selectItems])
                    return false
            },
            select:function(node){
                var item = node.options.item
               if(this.options.multi){
                   if(!this.sel.isSel(item)&&node.options.select){
                       this.sel.add(item)

                   }else if(!node.options.select&&this.sel.isSel(item)){
                       this.sel.remove(item)
                   }
                   this.selectItems = this.sel.items
               } else{
                   if(this.selectNode){
                       this.selectNode.refresh({
                           select:false
                       })
                   }
                   this.selectNode=node

                   this.selectNode.refresh({
                       select:true
                   })
                   this.selectItems=[item]
               }
              //  this.triggerHandler()
                this.triggerHandler("select",[item])
            },
            empty:function(){
               if(this.options.multi){
                   this.sel.empty()
               }else{
                if(this.selectNode)
                   this.selectNode.refresh({
                       select:false
                   })
                   this.selectItems=[]
               }
            },
            showDialog:function(){
                this.tree.expand()
                if(util.isIE6)
                $('select').css('visibility', 'hidden')
                //如果不缓存store，则更新选择
                !this.options.cachestore &&  this.tree.refresh()
                this.doms.basePanel.show()
                this.trigger("show",[this])
            },
            close:function(){
                if(util.isIE6)
                $('select').css('visibility', 'visible')
                this.doms.basePanel.hide()
                this.trigger("close",[this])
            },
            map:false,
            filter:false

        })

            return select;
    })