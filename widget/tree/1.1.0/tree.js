//noinspection UnterminatedStatementJS
/**
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-3-20
 * Time: 上午10:15
 * Version:V1.1.0
 * 20120704 修复前段添加node后在展开时，刚添加到node显示两次的bug。
 */
define(
    [ "jquery", "css!widget/tree/1.0.0/theme/default/tree" ],
    function($) {

        //noinspection JSUnresolvedVariable
        /**
         * 定义样式
         */
        var isIE6 = ($.browser.msie && ($.browser.version == "6.0") || !$.support.boxModel);

        /**
         *创建树对象
         */
        var treeview = function (ops) {

            // 一个节点的UR（包含所有子节点）
            this.childPanelTemplate = "<ul style='display:none'></ul>";
            this.nodePanelTemplate = "<li></li>";
            this.rootPanel = $(this.childPanelTemplate);
            this.rootKey = "root";
            this.rootShow = false;
            this.rootLabel = "root";
            this.canRemoveFolder = undefined;
            this.rootNode = {
                tree:this,
                childPanel:$(this.childPanelTemplate)
            };

            this.nodeList = [];
            this.selectNode = this.rootNode;
            var initTree = function (tree) {
                // 将tree与el对象绑定
                $.extend(tree, $(ops.el));

                ops = $.extend({
                    label        :"label",
                    childproperty:"_children",
                    nodeIsExpandProerty:"isexpand"
                }, ops);
                $.extend(tree, ops);

                tree.addClass("treeview");
                // tree.append(tree.rootPanel);
                if (tree.rootShow) {
                    tree.selectNode = tree.rootNode = tree.addRootNode();
                } else {
                    tree._addChildNode();
                }

            };
            initTree(this);
            return this;

        };

        treeview.prototype = {
            addRootNode :function () {
                var item = {};
                if(typeof this.label == "object"){
                    for(var i in this.label){
                        item[this.label[i]] = this.rootLabel ;
                    }
                }else{
                    item[this.label] = this.rootLabel ;
                }

                item[this.childproperty] = this.rootKey;
                item[this.nodeIsExpandProerty] = true;
                // var node = new Node(item, this.rootPanel, 1)
                $.extend(this.rootPanel, {
                    tree      :this,
                    childPanel:$(this.childPanelTemplate),
                    isRoot    :true
                });

                this.append(this.rootPanel.childPanel);

                this.rootPanel.childPanel.show("fast");
                return this._addNode({
                    item  :item,
                    parent:this.rootPanel,
                    pos   :1,
                    isRoot:true,
                    isLast:true 
                })
            },
            _addChildNode:function (parentnode) {

                var rs;
                if (!parentnode) {
                    parentnode = this.rootNode;
                    this.append(this.rootNode.childPanel);
                    rs = this.store.load();
                } else {

                    rs = this.store.getChildren(parentnode.item).then(function(){
                        try{
                            parentnode.find(">ul>li").remove();
                        }catch(e){

                        }

                    });
                }

                var me = this;
                // rs.done(function(){
                   //  parentnode.find(">li").remove();
                     rs.each(function (i, item) {
                         me._addNode({
                             item  :item,
                             parent:parentnode,
                             pos   :i + 1,
                             isLast:(rs.total - i == 1)
                         })
                     });
               // })

                rs.done(function () {
                    if(parentnode.childrenList&&parentnode.childrenList.length>0){
                       parentnode.childPanel.data("resultset", rs);
                       parentnode.expand ? parentnode.expand() : parentnode.childPanel.show("fast")
                    }else{

                        parentnode.isFolder = false;
                        parentnode.refreshCss();
                    }
                })
            },
            insertNode :function(ops){
                ops.parent = this.selectNode.parentNode;
                ops.pos = this.selectNode.pos -1;
                ops.isLast = false;
                return this.addNode(ops,"before");
            },
            /**
             * 添加一个节点，
             * @param ops
             * @param method
             */

            addNode     :function (ops,method) {
                if(!ops.parent){
                    ops.parent=this.selectNode;
                }
                var node =  this. _addNode (ops,method)
                ops.parent.isFolder =true;
                ops.parent.status = "expand"
                ops.parent.refresh();
                if(this.onadd){
                    var _self = this ;
                    this.onadd.call(node);
                }
                return node
            },
            _addNode : function (ops,method) {
                if(!ops.parent){
                    ops.parent=this.selectNode;
                }
                if(!method)method="append";
                var node = new Node(ops);
                this.nodeList.push(node);
                switch(method){
                    case "before":
                        this.selectNode.before(node)
                        break;
                    default:
                        ops.parent.childPanel.append(node);

                        ops.parent.childPanel.show("fast");
                }
                return node;
            },
            removeNode  :function (node) {
                if(!node)node = this.selectNode
                if (node.isRoot)
                    return false;

                if (node.isFolder && !this.canRemoveFolder)
                    return false;

                if (this.onremove) {
                   if(! this.onremove.call(node))return false;
                }
                node.removeNode();
                node = null;
            },
            expand      :function (node) {
                if (node.childPanel.data("resultset")) {
                    if (node.childrenList.length > 0)
                         node.childPanel.show("fast");
                } else this._addChildNode(node);
                if(this.onexpand)this.onexpand.call(node)
            },
            collapse    :function (node) {
                node.childPanel.hide("fast");
                if(this.oncollapse)this.oncollapse.call(node)
            },
            selected    :function (node) {
                //noinspection JSUnresolvedVariable
                if (this.onselected) {
                    //noinspection JSUnresolvedVariable
                    if (!this.onselected.call(node, event))return false;
                }

                this.selectNode.ellabel && this.selectNode.ellabel.removeClass("selectedlabel");
                this.selectNode = node;
                this.selectNode.ellabel.addClass("selectedlabel");

            }
        };
        var Node;
        Node = function (ops) {
            this.id = ops.id || ((new Date()).getTime() + "" + ops.pos);
            this.item = ops.item;
            this.tree = ops.parent.tree;
            this.parentNode = ops.parent;
            this.isRoot = ops.isRoot || false;
            this.pos = ops.pos;
            this.isLast =  ops.isLast || false;
            this.icoUrl=ops.item[this.tree.icourlproperty]
            this.icoClass=ops.item[this.tree.icoclassproperty]

            this.isFolder = !((typeof this.item[this.tree.childproperty] == "string" && this.item[this.tree.childproperty] == "") || typeof this.item[this.tree.childproperty] == 'undefined');
            this.childrenList = [];
            this.status = "collapse";
            this.childPanel =  $(this.tree.childPanelTemplate) // null;

            this.isExpand = this.item[this.tree.nodeIsExpandProerty] || false;

            return ( function (node) {
                /**
                 * 创建节点,使用call调用
                 * @param node
                 * @return
                 */
                var createElNode;
                createElNode = function () {
                    $.extend(this, $(this.tree.nodePanelTemplate));
                    this.data("node", this);

                    createElHitarea.call(this);
                    createElLabel.call(this);
                    createElChild.call(this);
                    if (this.isExpand) this.expand();
                    return this;
                };
                /**
                 * 创建子节点列表,使用call调用
                 */
                var createElChild;
                createElChild = function () {
                    this.append(this.childPanel);
                    if (this.isFolder) {
                        this.addClass("expandable");
                        this.addClass("collapseed");
                       // this.childPanel = $(this.tree.childPanelTemplate);
                        return this.childPanel;
                    }
                };
                /**
                 * 获取点击区域,使用call调用
                 *
                 * @return
                 */
                var createElHitarea;
                createElHitarea = function () {
                    var el = $("<div class='hitarea'></div>");
                    this.elhitarea = el;
                  //  if (this.isFolder) {
                        var node = this;
                        el.on("click", function (event) {
                            if (node.status == "expand") {
                                node.collapse(event);
                            } else {
                                node.expand(event);
                            }
                        });
                        this.append(el);
                   // }
                    return el;
                };
                /**
                 * 获取标签区,使用call调用
                 *
                 * @return
                 */
                var createElLabel;
                createElLabel = function () {
                    var el = $("<span class='" + (this.isFolder ? "folder" : "file") + "' >" + this.label + "</span>");
                    //noinspection JSDuplicatedDeclaration
                    var node = this;
                    el.on("click", function (event) {

                        node.selected();
                        if (node.tree.onclick) {
                            node.tree.onclick.call(node, event);
                        }
                        return false
                    });
                    el.on("dblclick", function (event) {

                        node.selected();
                        if (node.tree.ondblclick) {
                            node.tree.ondblclick.call(node, event);
                        }
                        return false
                    });
                    el.on("contextmenu", function (event) {
                        //noinspection JSUnresolvedVariable
                        node.selected();
                        if (node.tree.oncontextmenu) { //noinspection JSUnresolvedVariable
                            return node.tree.oncontextmenu.call(node, event);
                        }
                        return false
                    });
                    this.ellabel = el;
                    this.append(el);
                    return el
                };
                this.parentNode.childrenList ||( this.parentNode.childrenList =[])
                this.parentNode.childrenList.push(this);
                createElNode.call(this);
                this.refreshCss();
                this.update();
                return this;
            }).call(this);
        };
        Node.prototype = {
            /**
             * 返回在同级列表内的节点位置
             */
            icoClass:undefined,
            icoUrl:undefined,
            getIndex:function(){
                return    $.inArray(this,this.parentNode.childrenList)
            },
            prevNode:function(){
                var thisIndex = this.getIndex();
                if(this.getIndex()>0){
                    return this.parentNode.childrenList[thisIndex-1]
                }else{
                    return undefined;
                }

            },
            nextNode:function(){
                var thisIndex = this.getIndex();
                if(this.getIndex()< this.parentNode.childrenList.length-1){
                    return this.parentNode.childrenList[thisIndex+1]
                }else{
                    return undefined;
                }
            },

            update:function(item){
                this.item=item||this.item;
                this.seticoclass();
                this.setlabel()
            },
            setico:function(url){
                this.icoUrl=url;
            },
            seticoclass:function(cn){
             //   this.ellabel.attr('class',(this.isFolder ? "folder" : "file"))
                if(this.icoUrl&&this.icoUrl!=""){
                    this.ellabel.attr("class", "");

                    this.ellabel.css({
                        "background":"url("+this.icoUrl+")",
                        "background-repeat":"no-repeat"
                    })

                    return
                }
                var classname = "file";
                this.icoClass = cn||this.icoClass;
                if(this.icoClass){
                    classname = this.icoClass
                }else if(this.isFolder ){
                    classname = this.status == "expand" ? "folderopen" : "folderclosed";
                }
                this.ellabel.attr("class", classname);
            },
            setlabel:function(){
                if(typeof this.tree.label == "object"){
                    for(var i in this.tree.label){
                        var label = this.item[this.tree.label[i]]
                        if (label){
                            this.label = label;
                            break;
                        }
                    }
                }else{
                   // console.log(this.item[this.tree.label])
                    this.label = this.item[this.tree.label];
                }
                this.ellabel.html(this.label)
            },
            selected  :function () {
                this.tree.selected(this);
            },
            expand    :function () {
                this.tree.expand(this);
                this.status = "expand";
                this.refreshCss();
            },
            collapse  :function () {
                this.tree.collapse(this);
                this.status = "collapse";
                this.refreshCss();
            },
            removeNode:function () {
                var node = this;
                this.tree.nodeList = $.grep(this.tree.nodeList, function (_node) {
                    return (node != _node);
                });
                if (this.parentNode.childrenList) {

                    this.parentNode.childrenList = $.grep(this.parentNode.childrenList, function (_node) {
                        return node != _node ;
                    });
                }

                $.each(this.childrenList, function (i, node) {
                    //noinspection JSUnresolvedFunction
                    if (!node)
                    node.reomveNode();
                });

                this.empty();
                this.remove();
                this.parentNode.refresh();
            },
            refreshCss:function () {
                if (this.isRoot) {
                    this.addClass("root");
                }
                var nodeindex = this.getIndex();
                var siblingslength = this.parentNode.childrenList.length;

                if (nodeindex==siblingslength-1) {
                    var prevNode = this.prevNode()
                        if(prevNode){
                            prevNode.removeClass("last");
                        }
                    this.addClass("last");
                } else if(nodeindex==siblingslength-2){
                    this.nextNode().addClass("last");
                }
                if (this.isFolder) {
                   this.seticoclass();
                   // this.ellabel.attr("class", this.status == "expand" ? "folderopen" : "folderclosed");
                    this.elhitarea.removeClass();
                    this.elhitarea.addClass("hitarea");
                    var hitareaClass = "hitarea_" + this.status + "ed";
                    hitareaClass += this.isRoot ? "_root" : this.isLast ? "_last" : "";
                    this.elhitarea.addClass(hitareaClass);
                } else {
                    this.elhitarea && this.elhitarea.removeClass();
                    this.ellabel.attr("class", "file");

                }
            },
            refresh   :function () {

                if (this.childrenList.length == 0) {
                    this.childPanel.hide();
                } else {
                    var lastChildren = this.childrenList[this.childrenList.length - 1];
                    lastChildren.isLast = true;

                    lastChildren.refreshCss();
                }
                this.refreshCss();

            }
        };

        return treeview;
    });