/**
 * \u56E0\u6240\u4EE5\u5F00\u53D1\u90FD\u8FD8\u4E0D\u662F\u6700\u7EC8\u7248\u672C\uFF0C\u5728\u4F7F\u7528\u8FC7\u7A0B\u4E2D\uFF0C\u8BF7\u5C06\u5F53\u524D\u7248\u672C\u7684\u76F8\u5173\u4EE3\u7801 copy\u5230\u76EE\u6807\u6570\u636E\u5E93\u5185\uFF0C\u5E76\u6309\u7167\u5C42\u6B21\u7ED3\u6784\u5B9A\u4E49
 */
    //\u9700\u8981\u5F15\u5165 r.js \u6587\u4EF6
    //\u914D\u7F6E require
    //    baseUrl \uFF1A\u6307\u5B9Ajs\u6587\u4EF6\u5939\u76EE\u5F55
    //    \u914D\u7F6E\u901A\u8FC7paths\u914D\u7F6E  tree \u548C contextmenu \u6240\u4F7F\u7528\u7684\u7248\u672C \uFF08\u4E5F\u53EF\u4EE5\u5728require\u7684\u65F6\u5019\u76F4\u63A5\u6307\u5B9A\u7248\u672C\uFF09
require.config({
    baseUrl:"/domjs",
    paths:{
        "widget/tree":"widget/tree/1.1.0/tree",
        "widget/contextmenu":"widget/contextmenu/1.0.0/contextmenu",
        "store/dxlstore":"store/dxlstore/1.0.0/dxlstore"
    }
})
//alert("222222222222");
/**
 * \u76F4\u63A5\u6307\u5B9A\u7248\u672C\u65B9\u5F0F
 * require( [ "store/dxlstore", "widget/tree/1.0.0/tree" ,"widget/contextmenu/1.0.0/contextmenu"], function(Store, Tree,Menu) {})
 */
/**
 * \u5F15\u5165\u7684 \u4E09\u4E2A\u6A21\u5757\u5206\u522B\u6620\u5C04\u5230 require\u7B2C\u4E8C\u4E2A\u53C2\u6570\u51FD\u6570\u7684\u4E09\u4E2A\u53C2\u6570
 */
require( [ "store/dxlstore", "widget/tree" ,"widget/contextmenu"], function(Store, Tree,Menu) {
    //\u5168\u5C40\u53D8\u91CF
    //alert("1111111111111");
    var dbPath = location.pathname.substring(0,location.pathname.indexOf(".nsf")+4);
    var curUser=$("#idCurUser").val();
    var idIsSupervisor=$("#idIsSupervisor").val();
    var rootCateKey=$("#idRootCateKey").val();
    var rootCateName=$("#idRootCateName").val();
    var cateKey;	//\u6307\u5B9A\u67D0\u4E2A\u5206\u7C7BKey
    var cateName;
    var pwind=$(parent.document)
    cateKey=pwind.find("#idCateKey").val();
    cateName=pwind.find("#idCateName").val();
    if(cateKey){
        rootCateKey=cateKey;
        rootCateName=cateName;
    }

    //\u91CD\u5199_addNode \u65B9\u6CD5\uFF0C\u6DFB\u52A0\u8282\u70B9\u6837\u5F0F\u63A7\u5236
    var old_addNode=Tree.prototype._addNode;
    Tree.prototype._addNode = function (ops,method) {
        var node=old_addNode.call(this,ops,method);
        if(this.isNodeAdmin(node.item.categoryadmin)){
            node.ellabel.css({"font-weight":"bolder"});
        }
        return node;
    }
    //\u5F02\u6B65\u5220\u9664tree\u7684\u8282\u70B9\u51FD\u6570
    Tree.prototype.delNodeAsync=function(node) {
        $.ajax({
            url: dbPath+'/DeleteCategoryDoc?openagent',
            type: "Get",	//http\u8BF7\u6C42\u65B9\u5F0F
            data: "unid="+node.item._unid,
            dataType:"xml",
            async: true,
            success: function(data) {
                var msgInfo="";
                var dataDom=$(data); //\u5C06xml\u5BF9\u8C61\u8F6C\u6362\u4E3Ajquery\u5BF9\u8C61
                var result=dataDom.find("result").text()
                if(result=="1"){
                    if(node.isFolder){
                        msgInfo="\u6210\u529F\u5220\u9664\u6B64\u76EE\u5F55\u4EE5\u53CA\u5176\u4E0B\u6240\u6709\u5B50\u76EE\u5F55\uFF01";
                    }else msgInfo="\u6210\u529F\u5220\u9664\u6B64\u76EE\u5F55\uFF01";
                    node.tree.removeNode(node);
                }else msgInfo="\u5220\u9664\u76EE\u5F55\u5931\u8D25\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\uFF01";

                alert(msgInfo);
            }
        });
    }

    //\u5728tree\u5BF9\u8C61\u8FFD\u52A0\u5224\u65AD\u5F53\u524D\u7528\u6237\u662F\u5426\u8282\u70B9\u7BA1\u7406 \u65B9\u6CD5
    Tree.prototype.isNodeAdmin=function(cateAdmin) {
        var checkFlag=false;
        if(idIsSupervisor==1){
            checkFlag=true;
        }else{
            if($.isArray(cateAdmin)){
                if($.inArray(curUser,cateAdmin)>=0){
                    checkFlag=true;
                }
            }else{
                if(cateAdmin==curUser) checkFlag=true
            }
        }
        return checkFlag;
    }

    /**
     * \u5B9A\u4E49 Store
     * dbpath:\u6570\u636E\u5E93\u8DEF\u5F84
     * view:\u8981\u5173\u8054\u7684\u89C6\u56FE
     * catename:\u6BCF\u4E00\u4E2Aentry\u8BB0\u5F55\u5185\uFF0C\u8868\u793A\u5206\u7C7Bid\u7684\u5B57\u6BB5name\uFF08\u6CE8\u610F\u662F\u89C6\u56FE\u5217name\u800C\u4E0D\u662F\u5217\u6807\u9898\uFF09\uFF0C\u6839\u636E\u6B21\u5217\u83B7\u53D6\u5B50\u8282\u70B9
     */
    var store = new Store( {
        dbpath :location.pathname.substring(0,location.pathname.indexOf(".nsf")+4) ,
        view : "CategoryManager",
        catename : "_children"
    })
    /**
     * \u5B9A\u4E49\u83DC\u5355\u5185\u5BB9\uFF0C\u6CA1\u4E2Aitem\u5FC5\u987B\u5305\u542B\u4E00\u4E2Atext\u5C5E\u6027\uFF0C\u76EE\u524D\u53EA\u652F\u6301 onclick\u65B9\u6CD5
     */
    var items = [{
        text:"\u6DFB\u52A0\u76EE\u5F55",
        onclick:function(){
            var categoryunid,categoryname,categorycode,categoryadmin;
            var adminArr,checFlag;
            var node = this.panel.targetItem;
            categoryname=node.item.categoryname;
            categoryadmin=node.item.categoryadmin;

            if(node.item._children=="root"){
                categoryunid=node.item._children;
                categorycode="01";
            }else{
                categoryunid=node.item.categoryunid;
                categorycode=node.item.categorycode;
            }
            var appendParams = {
                categoryunid : categoryunid,
                categoryname : categoryname,
                categorycode : categorycode
            }
            var orginfo = selectResource(dbPath+"/fmCategory?openform",appendParams,600,400)
            if(orginfo){
                tree["addNode"]({
                    item:{
                        "categoryunid":orginfo.categoryunid,
                        "categoryname":orginfo.categoryname,
                        "categorycode":orginfo.categorycode,
                        "_unid":orginfo._unid,
                        "categorystorefilepath":orginfo.categorystorefilepath
                    }
                });
            }
        }
    },{
        text:"\u67E5\u770B\u76EE\u5F55",
        onclick:function(){
            var node = this.panel.targetItem;
            var _unid = node.item._unid;
            if(!_unid){
                alert("\u5206\u7C7B\u6839\u76EE\u5F55\u65E0\u6CD5\u67E5\u770B");
                return false;
            }
            var orginfo = selectResource(dbPath+"/CategoryManagerByDocId/"+_unid+"?OpenDocument",null,600,400);
            if(orginfo){
                if(orginfo.categoryunid){
                    node.item.categoryname = orginfo.categoryname;
                    node.item.categoryunid = orginfo.categoryunid;
                    node.item.categorystorefilepath = orginfo.categorystorefilepath;
                    node.update();
                }
            }
        }
    },{
        text:"\u5220\u9664\u76EE\u5F55",
        onclick:function(){
            var node = this.panel.targetItem
            if(node.isFolder && !node.tree.canRemoveFolder){
                alert("\u4F60\u8981\u5220\u9664\u76EE\u5F55\u5305\u542B\u5B50\u76EE\u5F55\uFF0C\u4E0D\u80FD\u6267\u884C\u5220\u9664,\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\uFF01");
                return false;
            }
            if(confirm("\u4F60\u786E\u5B9A\u8981\u5220\u9664\u6B64\u76EE\u5F55\u548C\u8BE5\u76EE\u5F55\u4E0B\u7684\u5B50\u76EE\u5F55\uFF01")){
                node.tree.delNodeAsync(node);
            }

            /*
             require( [ "widget/jbox" ], function(jBox) {
             jBox.alert("\u662F\u5426\u786E\u8BA4\u5220\u9664" + node.item.label ,"\u5220\u9664\u786E\u8BA4",{
             submit : function(v) {
             if(v==1){
             jBox.tip("\u6B63\u5728\u5220\u9664\uFF0C\u8BF7\u7A0D\u5019","loading")
             //\u6B64\u5904\u53EF\u4EE5\u4F7F\u7528\u4E00\u4E2Aajax\u5904\u7406\uFF0C\u5B8C\u6210\u540E\u8C03\u7528\u5220\u9664\uFF0C\u4EE5\u4FDD\u8BC1\u4E0E\u540E\u53F0\u4E1A\u52A1\u6570\u636E\u7684\u4E00\u81F4\u6027\u3002
             setTimeout(function(){
             jBox.closeTip()
             node.tree.removeNode(node);
             },1000)
             return true
             }else{
             return true;
             }
             },
             buttons:{
             "\u786E\u8BA4":1,
             "\u53D6\u6D88":0
             }
             })

             })
             */
        }
    }]
    /**
     * \u521B\u5EFA\u4E00\u4E2A\u65B0\u7684\u83DC\u5355
     * items:\u83DC\u5355\u5185\u5BB9
     */
    var menu = new Menu({
        items:items
    })
    /**
     * \u5B9A\u4E49\u4E00\u4E2A\u6811\u5BF9\u8C61\uFF0C\u53C2\u6570
     * el:\u6811\u8981\u5C55\u793A\u5728\u90A3\u4E00\u4E2Adom\u5143\u7D20\u4E0A\uFF0C\u4F7F\u7528jquery \u7684CSS\u67E5\u8BE2\u8FD4\u56DE
     * store:\u6811\u8981\u7ED1\u5B9A\u7684\u6570\u636E\u6E90
     * childproperty\uFF1A\u6811\u5143\u7D20\u5B50\u8282\u70B9\u5C5E\u6027\u5BF9\u5E94\u7684store\u5143\u7D20\u7684\u8BB0\u5F55\u5C5E\u6027
     * labelproperty\uFF1A\u6811\u5143\u7D20\u8282\u70B9\u8981\u663E\u793A\u7684label\u540D\u79F0\u4E0Estore\u5143\u7D20\u8BB0\u5F55\u5C5E\u6027\u7684\u6620\u5C04\uFF0C\u9ED8\u8BA4label
     * rootShow\uFF1A\u662F\u5426\u663E\u793A\u6839\u8282\u70B9
     * rootLabel:\u6839\u8282\u70B9\u540D\u79F0
     * onclick:\u8282\u70B9\u70B9\u51FB\u4E8B\u4EF6\uFF0C\u65F6\u95F4\u5185 this\u5173\u952E\u5B57\u6307\u5411\u5F53\u524D\u8282\u70B9
     * onadd\uFF1A\u6DFB\u52A0\u8282\u70B9\u4E8B\u4EF6\uFF08\u6DFB\u52A0\u5B8C\u6210\u540E\u6267\u884C\uFF09
     * onremove\uFF1A\u5220\u9664\u8282\u70B9\u4E8B\u4EF6\uFF0C\u8282\u70B9\u5220\u9664\u540E\u6267\u884C
     * oncontextmenu\uFF1A\u53F3\u952E\u65F6\u95F4
     *canRemoveFolder\uFF1A\u662F\u5426\u5141\u8BB8\u5220\u9664\u6587\u4EF6\u5939
     */
    /**
     * \u65B9\u6CD5/\u5C5E\u6027
     * addNode,\u6DFB\u52A0\u8282\u70B9
     * addNode\u8981\u6C42\u9009\u62E9\u4E00\u4E2A\u8282\u70B9\uFF0C\u7136\u540E\u6267\u884CaddNode\uFF0C\u53C2\u6570 items\u5BF9\u5E94\u4E00\u4E2Aobj\u8BB0\u5F55\uFF0C\u5305\u542B\u4E00\u7EC4\u4E0E\u4E8B\u524D\u5B9A\u4E49\u76F8\u7B26\u7684\u5C5E\u6027
     * removeNode\uFF0C\u5220\u9664\u8282\u70B9,\u53C2\u6570 \u662Fnode\uFF0C\u5982\u679C\u65E0\u53C2\u6570\uFF0C\u5219\u4E3A\u9009\u62E9\u7684\u8282\u70B9
     */
        // alert(rootCateKey);
    var tree = new Tree( {
        el : $("#treepanel"),
        store : store,
        childproperty : "_children",
        rootLabel :rootCateName,
        rootShow : true,
        rootKey:rootCateKey,
        label:"categoryname",
        canRemoveFolder:true,
        onclick : function(event) {
            /**
             * this\u5173\u952E\u5B57\u8FD4\u56DE\u5F53\u524D\u8282\u70B9\uFF0C\u8282\u70B9\u5C5E\u6027item\u4E3A\u5BF9\u5E94\u7684store\u5BF9\u8C61\u7684item
             */
                //console.dir(this.item);
            var url="";
            if(this.item.categorycreateway=="3"){
                url=this.item.categorystorefilepath;
                window.open(url);
            }else{
                //url="/"+ this.item.categorystorefilepath+"/$$ViewTemplate for DocBySerial?openform&categoryunid="+this.item.categoryunid+"&categoryname="+escape(this.item.categoryname);
                var tgFilePath=this.item.categorystorefilepath;
                var fullCateName=this.item.categoryfullname;
                url="/xxx/Knowledge/KnowlIndex.nsf/$$ViewTemplate for ShowDocByCateUnid?openform&cateUnid="+this.item.categoryunid+"&cateName="+escape(this.item.categoryname)+"&fullCateName="+escape(fullCateName)+"&tgFilePath="+tgFilePath;
                parent.business.location.href=url;
                //showTreeGridforcat("/xxx/Knowledge/KnowlIndex.nsf/vwIndexByCategoryUnid",this.item.categoryunid,1,"bottomiframe");
            }
        },
        /**
         * \u53F3\u952E\u4E8B\u4EF6\uFF0Cthis\u5173\u952E\u5B57\u8FD4\u56DE\u5F53\u524D\u8282\u70B9\uFF0C\u8282\u70B9\u5C5E\u6027item\u4E3A\u5BF9\u5E94\u7684store\u5BF9\u8C61\u7684iteme
         */
        oncontextmenu : function(e){
            //\u8BBE\u7F6E\u83DC\u5355\u76EE\u6807\u5BF9\u8C61\uFF08\u65E2\u83DC\u5355\u6240\u5C5E\u7684\u4E3B\u4F53\uFF09
            var checkFlag=false;
            if(this.tree.isNodeAdmin(this.item.categoryadmin)){
                menu.setTarget(this);
                menu.show(e);
            }else{
                return false;
            }
            return false;
        },
        /**
         * \u6DFB\u52A0\u548C\u5220\u9664\u53C2\u6570\u4E3A\u975E\u9F20\u6807\u4E8B\u4EF6,this\u8FD4\u56DE\u5F53\u524D\u6DFB\u52A0\u540E\u7684\u8282\u70B9
         */
        onadd:function(){

        },
        /**
         * \u5220\u9664\u8282\u70B9\u540E\u4E8B\u4EF6\uFF0Cthis\u8FD4\u56DE\u5F53\u524D\u8282\u70B9,onremove \u5B58\u5728\uFF0Creturn true\u624D\u4F1A\u88AB\u5220\u9664\uFF0C\u5426\u5219\u4E0D\u88AB\u5220\u9664
         */
        onremove : function() {
            var isFolder=this.isFolder;
            return true;
            //if(this.isFolder)
            // require(["widget/jbox"],function(jbox){
            //    jbox.alert("\u4E0D\u80FD\u5220\u9664\u5206\u7C7B")
            // })
            //else
        }
    });
    var addNode = function(method){

        require(["widget/jbox"],function(jbox){
            var strhtml ="<div>" +
                "<div><span>Label:</span><input name='label'/></div>" +
                "<div><span>child</span><input name='child'></div>"+
                "</div>"
            jbox.info(strhtml,"\u63D2\u5165\u8282\u70B9",{
                submit:function(v,h,d){
                    if(v==0)return true;
                    tree[method]({
                        item:d
                    });
                    jbox.tip("\u6DFB\u52A0\u6210\u529F","success")
                    return true;
                },
                buttons:{
                    "\u786E\u8BA4":1,
                    "\u53D6\u6D88":0
                }
            })
        })
    }
    $("#add").on("click",function(){
        addNode("addNode");
    })
    $("#insert").on("click",function(){
        addNode("insertNode");
    })


})