//noinspection UnterminatedStatementJS
/**
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-7-3
 * Time: 上午10:15
 * Version:V2.0.0
 */
define(
    [ "jquery","base/objectj","i18n!nls/system" ,"plugin/util"],
    function($,obj,i18n,util) {

        /**
         * 定义样式
         */
        var isIE6 = ($.browser.msie && ($.browser.version == "6.0") || !$.support.boxModel);

        var Tree=obj.sub(),Node=obj.sub(),SelBox=obj.sub();
        Node.extend({

        })
        Tree.extend({
            Node:Node
        })
        SelBox.fn.extend({
            main:function(){
                if( this.data("this"))return  this.data("this")
                this.data("this",this)
            },
            options:{

            },
            select:function(type){

                switch(type){
                    case 1:
                        this.removeClass("sel0 sel2").addClass("sel1")
                        break;
                    case 2:
                        this.removeClass("sel0 sel1").addClass("sel2")
                        break;
                    default:
                        this.removeClass("sel1 sel2").addClass("sel0")
                }
            },
            refresh:function(){
            }
        })
        //node 对象
        Node.fn.extend({
            main:function(){
                if( this.data("this"))return  this.data("this")
                this.data("this",this)
                var _self = this;
                this.__init()
            },
            isload:false,
            expendnode:null,
            children:[],
            selectItems:[],
            doms:{
                nodepanel:null,
                hitarea:null,//单击区域
                selarea:null,//选择区域
                label:null,//标签区域
                ico:null,//ico标签
                exp:null, //预留扩展区域
                childpanel:null
            },

            options:{
                idProperty:"label",
                label:"label",//显示的标签
                ico:"",//label的前图标，如果为空不显示，字符串表示一个样式,gif/png/jpg地址字符串表示一个图片地址
                exp:"",//label 后的扩展，为空不显示，字符串表示一个item的key
                index:false,//Node 在list列表内的索引
                type:"normal", //root/normal/first/last
                expandable:true, //是否可以展开
                status:"collapseed",
                parent:null,
                seltype:0,
                preload:false //预加载//设置为true是，节点下级内容会提前加载。
            },
            __init:function(){
                this.data("this",this)
                this.index=this.options.index>-1?this.options.index:0;
                this.parent=this.options.parent;
                this.item = this.options.item;
                this.type= this.options.type
                this.__initDoms()
            },
            __initDoms:function(){
                var  doms= this.doms = {
                    nodepanel: $("<div class='nodearea'></div>"),
                    hitarea:$("<span class='hitarea'></span>"),//单击区域
                    selarea:$("<span class='selarea'></span>"),//选择区域
                    label:$("<span class='label'></span>"),//标签区域
                    ico:$("<span class='ico'></span>"),//ico标签
                    exp:$("<span class='exp'></span>"), //预留扩展区域
                    childpanel:$("<ul ></ul>")
                }
                doms.hitarea.data("this",this)
                doms.label.data("this",this)
                doms.ico.data("this",this)
                doms.selarea.data("this",this)
                doms.exp.data("this",this)
                doms.childpanel.data("this",this)
                if(this.options.multi){
                    doms.selbox = SelBox("<div class='selbox'></div> ")
                    doms.selarea.append(doms.selbox)
                    doms.selbox.data("this",this)
                    doms.selarea.show()
                }else{
                    doms.selarea.hide()
                }
                var panel =  doms.nodepanel
                panel.append(doms.hitarea)
                panel.append(doms.selarea)
                panel.append(doms.ico)
                panel.append(doms.label)
                panel.append(doms.exp)
                this.append(panel)
                var child = $("<div class='childpanel' style='clear: both;' ></div>")
                child.append(this.doms.childpanel)
                this.append(child)
                this.attr("data-key",this.__getItemKey(this.options.item))
                this.refresh()

            },
            __updateSelect:function(node,isSel){
                if(isSel){//添加
                    if($.inArray(node.options.item,this.selectItems)==-1){
                        this.selectItems.push(node.options.item)
                    }
                }else{//删除
                    this.selectItems = $.grep(this.selectItems,function(item,i){
                        return item!=node.options.item
                    })
                }
            },

            __getItemKey:function(item){
                var key

                if(typeof item =="string"){
                    key=item
                }else{
                    key=item[this.options.idProperty]
                }

                return util.strToKey(key)
            },
            __getLabelText:function(item){
                var label
                if(typeof item =="string"){
                    label=item
                }else{
                    label=item[this.options.label]
                }
                return label
            },
            addChild:function(node){
                this.children.push(node);
                this.doms.childpanel.append(node)

                return node
            },
            remove:function(){
                this.empty();
                this.remove();
                delete this
            },
            refresh:function(ops){
                var deferred = new $.Deferred()
                var _self = this
                //处理参数
                var _ordOps = $.extend({},ops||this.options)
                ops = $.extend(this.options,ops)
                delete this.options._seltype
                //刷新复选框 1,全选，2部分选择，0 不选择
                var _type = this.options.seltype
                if(this.options.expandable===false){
                    _type=this.options.select?1:0
                    deferred.resolve()
                }else{
                    if(this.data("result")){
                        this.data("result").then(function(data){
                            if(data.length==0){
                                _type=_self.options.select?1:0
                            }else  if(_self.selectItems.length==0){
                                _type=_self.options.select?2:_ordOps._seltype>0?2:0
                            }else if(data.length==_self.selectItems.length){
                                var flag=true
                                $.each(_self.children,function(i,node){
                                    if(  node.options.seltype!=1){
                                        flag = false
                                        return flag
                                    }
                                })
                                _type=_self.options.select&&flag?1:2
                            }else{
                                _type=2
                            }
                            deferred.resolve()
                        })
                    }else{
                        _type = 0
                        deferred.resolve()
                    }
                }
                deferred.then(function(){
                    _self.__refreshStyle(_ordOps,_type)
                })

                return deferred
            },

            __refreshStyle:function(ops,_type){
                var _ordOps = $.extend({},ops||this.options)
                ops = $.extend(this.options,ops)
                if(this.doms.selbox!=null){
                    this.doms.selbox.select(_type)
                }
                var doms = this.doms,item = ops.item, label = item[this.options.label]

                if( typeof _ordOps.expandable!="undefined" ||_ordOps.status)
                    doms.ico.removeClass("ico_expanded ico_collapseed normal").addClass("ico_"+(ops.expandable?ops.status:"nurmal"));
                //if(_ordOps.type  )
                switch (ops.type)
                {
                    case "root":
                        this.addClass("root")
                        doms.hitarea.removeClass("hitarea_expanded_root hitarea_collapseed_root")
                        if(ops.expandable)    doms.hitarea .addClass("hitarea_"+ops.status+"_root");
                        break
                    case "last":
                        this.addClass("last")
                        doms.hitarea.removeClass("hitarea_expanded_last hitarea_collapseed_last")
                        if(ops.expandable) doms.hitarea.addClass("hitarea_"+ops.status+"_last");
                        break;
                    default:
                        doms.hitarea.removeClass("hitarea_expanded hitarea_collapseed")
                        if(ops.expandable)  doms.hitarea.addClass("hitarea_"+ops.status);
                }

                if(ops.select){
                    doms.label.css({
                        "font-weight":"bold"
                    })
                }else{
                    doms.label.css({
                        "font-weight":""
                    })
                }
                var _self = this;
                if(_ordOps.label  )
                    if(item[this.options.label]==""){
                        doms.nodepanel.hide()
                        if(this.options.type=="root"){
                            this.doms.childpanel.removeClass("rootnolabel").addClass("rootnolabel")
                        }
                        return ;
                    }else{
                        _ordOps.label && doms.label.text(label)
                    }

                setTimeout(function(){
                    var width
                    if(doms.label.width()==0){
                        width="initial"
                    }else{
                        width= doms.hitarea.width()+doms.selarea.width()+doms.ico.width()+doms.label.width()+doms.exp.width()
                    }
                    doms.nodepanel.width(width)
                },0)
                if(this.options.refreshParent){
                    // if(_type!=2)
                    _self.options.seltype=_type
                    if( this.options.parent) this.options.parent.refresh({
                        _seltype:_type,
                        refreshParent:true
                    })
                }
            },
            empty:function(){
                this.doms.childpanel.empty();
                this.doms.childpanel.hide()
            },
            expand:function(){
                if(this.options.expandone){
                    var expandnode = this.options.parent.expendnode
                    if(expandnode){
                        expandnode.doms.childpanel.hide()
                        expandnode.refresh({
                            expandable:true,
                            status:"collapseed"
                        })
                    }
                    this.options.parent.expendnode = this
                }
                this.doms.childpanel.show()
                this.refresh({
                    expandable:true,
                    status:"expanded"
                })
            },
            collapse:function(){
                if(this.options.expandone){
                    // return
                }
                this.doms.childpanel.hide()
                this.refresh({
                    expandable:true,
                    status:"collapseed"
                })
            },
            select:function(seltype,ref){
                //0.取消选择，1.全部选择，2.取消当前节点选择，3选择当前节点
                if(!this.options.multi){
                    return this.options.seltype=1
                }

                if(typeof seltype=="undefined"){
                    var _stype =this.options.seltype
                    seltype = _stype==0?1:_stype==1?0:_stype==2?3:_stype==3?2:0
                }

                this.options.seltype = seltype

                this.options.select =  seltype==1||seltype==3

                this.options.parent.__updateSelect(this,this.options.select)


                this.refresh({
                    refreshParent:ref
                })

                //  return this.options.seltype
            }

        })
        //tree 对象

        Tree.fn.extend({
            main:function(){
                if(this.length>1){
                    Tree.each(function(i,el){
                        Tree(el)
                    })
                }else{
                    var _self = this
                    if( this.data("this"))return  this.data("this")
                    this.data("this",this)
                    this.store=this.options.store;
                    require(["css!"+this.options.cssurl],function(){

                        _self.__init()
                    })
                }

            },
            options:{
                cssurl:"widget/tree/2.0.0/theme/default/tree",
                root:"root",
                rootlabel:i18n["Root"],
                width:"inherit",
                expandone:false, //一个层级内只展开一个节点,
                multi:false,
                pathfield:"_item_path",
                // pathkeyfield:"_key_path",
                // pathlabelfield:"_label_path",
                itemformats:undefined,
                autoexpand:true//是否自动展开树（跟节点）
            },
            selectItems:[],
            RootPanel:null,
            RootNode:null,
            __init:function(){
                this.__initPanel();
                this.__initEvent();
                this.__initRoot();
            },
            __initPanel:function(){
                this.RootPanel = $("<ul></ul>")
                this.append(this.RootPanel)
                if(this.width()<100){
                    this.width(this.options.width)
                }
            },
            __customEvent:"selectstart nodeloaded add remove __select  selectall select selected expand collapse", //nodeloaded 节点加载完成
            __initEvent:function(){
                var _self = this;
                this.on("selectstart",function(){return false})
                this.on("click",".hitarea",function(){
                    var node = $(this).data("this");
                    if(node.options.status=="collapseed"){
                        _self.expand(node)
                    }else{
                        _self.collapse(node)
                    }
                })
                this.on("contextmenu","ul",function(e){
                    return false
                })
                this.on("click",".ico",function(){
                    var node = $(this).data("this");
                    if(node.options.expandable){
                        node.isload = false;
                        _self.expand(node)
                    }

                })
                this.on("click",".selarea",function(e){
                    var node = $(this).data("this");
                    _self.selectall(node,node.options.seltype!=1?1:0).then(function(){
                        node.options.parent.refresh({
                            refreshParent:true
                        })
                    })

                })
                this.on("click",".label",function(e){
                    var node = $(this).data("this");
                    _self.select(node,node.options.select?2:3,true)

                })
                this.on("__select",function(e,tree,node,seltype){
                    tree.updateItems(node,!node.options.select)
                    e.stopPropagation()
                    return false;
                })
            },
            on:function(){
                if($.inArray(arguments[0],this.__customEvent.split(/\s/))>-1){
                    $(this[0]).on.apply(this,arguments)

                }else
                    switch(arguments[0]){
                        default:
                            if(arguments.length==2){
                                var _argsfun = arguments[1]
                                var _fun = function(){
                                    var node = $(this).data("this");
                                    return _argsfun.apply(node,arguments)
                                }
                                this.on(arguments[0],".label",_fun)
                            }else{
                                $(this[0]).on.apply(this,arguments)
                            }
                    }
            },
            __initRoot:function(){
                var rootItem = {};
                rootItem[this.store.idProperty]=this.options.root
                var RootNode
                rootItem[this.options.label]=this.options.rootlabel
                rootItem[this.options.store.idProperty]=this.options.root
                RootNode = this.__createdNode({
                    index:0,
                    type:"root",
                    item:rootItem,
                    status:"expanded",
                    expandable:"true",
                    idProperty:this.options.store.idProperty
                })

                this.RootPanel.append(RootNode)

                this.RootNode= RootNode
                if(this.options.autoexpand)
                    this.expand(RootNode)
            },
            __initChildrenList:function(result,parentnode){
                var _self = this;
                return  result.pipe(function(data){
                    parentnode.isload=true
                    if(data.length==0){
                        parentnode.refresh({
                            expandable:false
                        })
                        return data
                    }
                    parentnode.empty()
                    $.each(data,function(i,item){
                        var type = i==data.length-1?"last":i==0?"first":"normal"
                        var expandable=item[_self.store.options.childrenproperty||_self.store.idProperty]!=""

                        var ops =_self.__getNodeOptions({
                            index:i,
                            type:type,
                            item:item,
                            expandable:expandable,
                            parent:parentnode
                        })
                        var node = _self.__addNode(ops)
                        _self.trigger("nodeloaded",[_self,node])
                    })
                    return data;
                })
            },

            __getNodeOptions:function(ops){
                var expandable = ops.item[this.store.options.childrenproperty||this.store.idProperty]!="",
                    parent = ops.parent||undefined,
                    index = typeof index=="number"?ops.index:parent?parent.children.length:0,
                    type =ops.type ?ops.type: parent?index<parent.children.length?"normal":"last":"last";
                var item = ops.item
                return {
                    index:index,
                    type:type,
                    item:item,
                    expandable:expandable,
                    parent:parent,
                    expandone:this.options.expandone,
                    idProperty:this.options.store.idProperty,
                    tree:this,
                    multi:this.options.multi,
                    select:false
                }
            },
            __addNode:function(ops){
                var parent = ops.parent

                if(!parent)parent=this.RootNode;
                return parent.addChild(this.__createdNode(ops))
                //nodeDom.doms.childpanel.append(this.__createdNode(ops))
            },

            __createdNode:function(ops){
                ops.label=this.options.label
                var node = Tree.Node("<li></li>",ops)

                if(this.options.preload){
                    this.loadclidresult(node)
                    node.data("result").pipe(function(data){
                        if(data.length==0){
                            node.refresh({
                                expandable:false
                            })
                        }
                    })
                }

                return node
            },
            addNode:function(ops){
                var node = this.__addNode(ops)
                this.trigger("add",[this,node])
            },
            removeNode:function(node){
                this.trigger("remove",[this,node])
                node.remove()
            },
            updateItems:function(node,isSel){
                if(isSel){//添加
                    if($.inArray(node.options.item,this.selectItems)==-1){
                        this.selectItems.push(node.options.item)
                    }
                }else{//删除
                    this.selectItems = $.grep(this.selectItems,function(item,i){
                        return item!=node.options.item
                    })
                }
            },
            getNodeByKey:function(key){
                // console.log(this.find("li[data-key="+key+"]").data("this"))
                return this.find("li[data-key="+key+"]").data("this")
            },
            select:function(node,seltype,ref){
                node.options.seltype = seltype || node.options.seltype
                //节点选择状态变化执行select事件（选择或取消选择都会被执行），此时可以改变 type 控制是否选择
                this.trigger("__select",[this,node,seltype])
                this.trigger("select",[this,node,seltype])

                node.select(seltype,ref)

                this.trigger("selected",[this,node,seltype])


            },
            selectall:function(node,seltype){
                var deferred = new $.Deferred()
                this.trigger("selectall",[this,node]);
                var _self = this;
                var __resolve = function(){
                    var _c=0
                    if(node.children.length>0){
                        $.each(node.children,function(i,n){
                            _self.selectall(n,seltype,false).then(function(){
                                _c++
                                if(node.children.length==_c){
                                    deferred.resolve()
                                }

                            })
                        })
                    }
                    else{
                        deferred.resolve()
                    }
                }
                if(!node.isload){
                    this.__initChildrenList(this.loadclidresult(node),node).then(function(){
                        __resolve()
                    })
                }else{
                    __resolve()
                }
                deferred.then(function(){
                    _self.select(node,seltype,false)
                })
                return deferred
            },
            expand:function(node){
                if(typeof node =="undefined"){
                    node=this.RootNode
                }
                var deferred= new $.Deferred()
                if(!node.isload){
                    this.__initChildrenList(this.loadclidresult(node),node).then(function(nodes){
                        deferred.resolve(node)
                        node.expand()

                    })
                } else{
                    node.expand()
                    deferred.resolve(node)
                }
                this.trigger("expand",[this,node])
                return deferred;
            },
            collapse:function(node){
                node.collapse()
                this.trigger("collapse",[this,node])
            },
            __computerFieldPath:function(parentitem,item){
                var _computer = function(pathfield,field){
                    if(!item[pathfield]){
                        var pathfieldPath
                        if(field){
                            pathfieldPath =  parentitem[pathfield]?parentitem[pathfield].concat(parentitem[field]):[parentitem[field]]
                        }else{
                            pathfieldPath =parentitem[pathfield]?parentitem[pathfield].concat(parentitem):[parentitem]
                        }
                        item[pathfield]=pathfieldPath
                    }
                }
                _computer(this.options.pathfield)
                // _computer(this.options.pathkeyfield,this.store.idProperty)
                // _computer(this.options.pathlabelfield,this.options.label)

            },
            loadclidresult:function(node){
                /*加载节点数据，并进行预处理*/
                var _self = this;
                if(!node.data("result")||!node.isload){
                    var result = this.store.getChildren(node.options.item).map(function(item,i){
                        _self.__computerFieldPath(node.options.item,item)
                        if( _self.options.itemformats){
                            if($.isArray(_self.options.itemformats)){
                                for(var i in _self.options.itemformats){
                                    if(item[i])
                                        item[i] = _self.options.itemformats[i](item[i],item)
                                }
                            }else{
                                alert("可以通过map方法对item内容继续修改，map返回null时，item将被过滤，也可通过filter方法对内容进行过滤")
                            }
                        }
                        if(_self.filter(item)){
                            return _self.map(item)
                        }else{
                            return null
                        }
                    })
                    node.data("result",result)
                }
                return node.data("result")
            },
            filter:function(item){
                if(typeof this.options.filter=="function"){
                    return this.options.filter.call(this,item)
                }
                return true;
            },
            map:function(item){
                if(typeof this.options.map=="function"){
                    return this.options.map.call(this,item)
                }
                return item
            },
            refresh:function(){
                this.RootPanel.empty();
                this.__initRoot()
            }
        })

        return Tree;
    });