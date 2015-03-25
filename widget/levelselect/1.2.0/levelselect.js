/*!
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-5-29
 * Time: 下午4:03
 * LevelSelect *
 * 20120702
 *  1.添加对滚动条位置的记忆，在level隐藏后再次显示的时候，滚动条位置与隐藏前相同
 *  2.添加了cacheresult 参数，默认为true。可以缓存本次使用的查询，如果设置为false则每次展开/显示都会进行数据的更新
 * 20120717
 *  1.修正在IE怪异模式下li背景样式导致的跳动问题
 *  2.修正IE6下select 表单控件 在jbox弹出时的的隐藏bug
 */
define(["base/objectj","widget/jbox","i18n!nls/system","base/util"],function(obj,jbox,i18n,util){var levelselect=obj.sub();levelselect.fn.extend({main:function(selector,context){$.extend(true,this.options,context);if(!this.options.store){alert("请指定数据源");}this.options.id+="_"+(Math.random().toString().substr(2));this.store=this.options.store;},options:{id:"levelselect",store:null,width:500,height:300,title:i18n["Please Select"],showpath:true,infolayout:null,showcols:3,leveldepth:0,selectend:true,label:"label",root:"root",rootlabel:i18n.Root,cacheresult:true,multi:false,selectcate:false,pathfieldlabel:"",pathfield:"_item_path",autofields:{},itemformats:{},valuefield:"_item_path",valuesplit:",",pathsplit:"/",valueitems:null},store:null,panel:{path:null,lists:null,info:null,select:null},firstLevel:0,lastLevel:0,focusLevel:0,focusItemQueue:[],selectQueue:[],levelQueue:[],columnQueue:{},resultQueue:{},dialog:null,_columns:3,_columnwidth:0,_textwidth:0,_locked:false,_currentResult:null,showDialog:function(){if(this.dialog){var result=this._initResult();this._expendResult(result,0,this.options.root);this.dialog.show();if(util.isIE6){$("select").css("visibility","hidden");}return this.dialog;}var _self=this;var _opts=this.options;var buttons={};buttons[i18n.OK]="ok";buttons[i18n.Cancel]="cancel";if(this.options.multi){buttons[i18n.Empty]="empty";}jbox("",{buttons:buttons,id:_opts.id,top:50,width:_opts.width,title:_opts.title,loaded:function(h){_self._initPanel(h);_self._initEvent();_self._initSelected();var result=_self._initResult();_self._expendResult(result,0,_self.options.root);_self.dialog=$("#"+_opts.id);},submit:function(v,h,f){if(v=="ok"){_self._selected();}else{if(v=="empty"){_self._empty();}else{_self.close();}}return false;},showClose:false});if(util.isIE6){$("select").css("visibility","hidden");}},_initResult:function(){var result,_self=this;if($.isArray(this.options.roots)){result=this._initResultMultiRoot();}else{result=this._initResultSigleRoot();}this.resultQueue[this.options.root]=result;result.done(function(data){if(typeof _self.options.onload=="function"){_self.options.onload(result);}});return result;},_initResultSigleRoot:function(){var rootItem={};rootItem[this.store.idProperty]=this.options.root;var itemDom=$("<li></li>");itemDom.data("item",rootItem);var result=this._getResult(itemDom);return result;},_initResultMultiRoot:function(){var deferred=new $.Deferred();var result=this.options.roots;require(["store/util/QueryResults"],function(QueryResults){result.total=2;deferred.resolve(QueryResults(result));});return deferred;},_initPanel:function(dialog){dialog.css({"overflow-y":"hidden"});if(this.options.leveldepth>0&&this.options.leveldepth<this.options.showcols){this.options.showcols=this.options.leveldepth;}if(this.options.multi){if(this.options.leveldepth==1){this._columns=2;this.options.showcols=1;}else{if(this.options.showcols<3){this._columns=3;this.options.showcols=2;}else{this._columns=this.options.showcols;this.options.showcols--;}}}else{this._columns=this.options.showcols;}var listheight=this.options.height-15;var _opts=this.options;if(_opts.showpath){this.panel.path=$("<div style='padding: 3px 5px 0px;height: 25px'></div>");this.panel.path.attr("title",i18n["Click the path selection"]);dialog.append(this.panel.path);listheight-=this.panel.path.height();}var _contentPanel=$("<div></div>");dialog.append(_contentPanel);if(_opts.infolayout){this.panel.info=$("<div style='margin: 5px'></div>");_infoPanel=this.panel.info;dialog.append(this.panel.info);if(_opts.infolayout){var layout=_opts.infolayout;var _createLine=function(layout){var _tr=$("<div style='height: 25px;clear: both;'></div>");var _len=layout.length;var _w=(_opts.width-10)/(_len);for(var i in layout){if($.isArray(layout[i])){_createLine(layout[i]);}if($.isPlainObject(layout[i])){var _col=$("<div style='height: 25px;float:left;' ></div>").width(_w);var lable=$("<span style='float:left;font-weight: bold;'></span>").text(layout[i].label+":");var field=$("<span style='float:left;' data-type='_iteminfo_' >---</span>");field.data("layout",layout[i]);_col.append(lable).append(field);_tr.append(_col);}}if(_tr.find("*").length>0){_infoPanel.append(_tr);}};_createLine(layout);}listheight-=_infoPanel.height();}_contentPanel.height(listheight);_contentPanelList=$("<div style='float: left;margin-left: 3px'></div>");this.panel.lists=$("<ul style='list-style: none;margin: 0px;padding:0px 0px 0px; overflow: hidden;'></ul>");this.panel.lists.height(listheight);_contentPanel.height(listheight);_contentPanel.width(this.options.width);var panelListwidth=this.options.width*(this.options.showcols/this._columns)-10;this.panel.lists.width(panelListwidth);this._columnwidth=panelListwidth/this.options.showcols-2;this._textwidth=this._columnwidth-40;_contentPanelList.width(panelListwidth);_contentPanelList.append(this.panel.lists);_contentPanel.append(_contentPanelList);for(var i=0;i<this.options.showcols;i++){this._getLevelDom(i);}if(this.options.multi){this._textwidth-=20;var _contentPanelSelect=$("<div style='float: right; border: 1px solid #66ccff ;overflow: auto;margin: 0px;padding:0px;margin-right: 3px'></div>");this.panel.select=$("<ul style='list-style: none;margin: 0px;padding:0px 0px 0px;'></ul>");_contentPanelSelect.append(this.panel.select);_contentPanelSelect.width(this.options.width*(1/this._columns)-10);_contentPanel.append(_contentPanelSelect);_contentPanelSelect.height(listheight-10);}},_initEvent:function(){var _self=this;if(typeof this.options.onselect=="function"){this.onselect=this.options.onselect;}var list=this.panel.lists;var li="li[class=levellistitem]";var _click=function(_this,currlevel,isSelect){if(_self.focusItemQueue[currlevel]){_self.focusItemQueue[currlevel].data("focus",false);_self._refreshItemCss(_self.focusItemQueue[currlevel]);}_self.focusItemQueue[currlevel]=$(_this);_self.focusItemQueue[currlevel].data("focus",true);_self.focusLevel=currlevel;var nextlevel=currlevel-0+1;if(!isSelect){_self._showItemInfo($(_this).data("item"));}_self._getResult($(_this)).then(function(data){var expendable=_self.options.leveldepth>0?currlevel<_self.options.leveldepth-1:data.length>0;var selectable;if(_self.options.selectend){selectable=(_self.options.selectcate||!expendable||data.length==0);}else{selectable=_self.options.leveldepth==currlevel+1;}if(selectable&&isSelect){_self._onselect($(_this));}if(expendable&&(!isSelect)){_self._expendItemDom($(_this),nextlevel);}if(!_self.options.multi){_self.selectQueue=[$(_this).data("item")];}if(data.length>0&&expendable){$(_this).data("iscategory",true);var itemextDom=$(_this).find("span.levellistitemext");if(itemextDom.html()==""){if(_self.options.multi){var checkbox=$("<input   style='width: 16px;height: 16px;line-height: 25px;' type='checkbox' title='"+i18n["Select All"]+"' name='levellistselectallcheckbox' style='margin-top: 3px'/>  ");checkbox.attr("data-columnkey",$(_this).data("item")[_self.store.idProperty]);checkbox.data("itemdom",$(_this));itemextDom.append(checkbox);itemextDom.append(">");}else{itemextDom.text(">");}}}else{$(_this).data("iscategory",false);}});};list.on("click",li,function(){var _this=this;var currlevel=$(_this).data("levelkey");_click(_this,currlevel,false);_self._refreshItemCss($(_this));});list.on("selectstart",li,function(e){e.stopPropagation();return false;});list.on("dblclick",li,function(e){var _this=this;var currlevel=$(_this).data("levelkey");_click(_this,currlevel,true);e.stopPropagation();return;});list.on("mouseenter",li,function(){if($.support.boxModel){$(this).css({"background-color":"#ccffff"});}});list.on("mouseleave",li,function(){_self._refreshItemCss($(this));});if(this.panel.select){var _clickSelect=function(itemDom,selectDom){if(!itemDom){var _item=selectDom.data("item");_self.options.valueitems=$.grep(_self.options.valueitems,function(item,i){return(item!=_item);});selectDom.remove();}else{_self._onselect(itemDom);}};this.panel.select.on("click","li[class=levellistitem] input[name=levellistitemcheckbox]",function(){_clickSelect($(this).data("itemdom"),$(this).data("selectdom"));});this.panel.select.on("dblclick","li[class=levellistitem]",function(){_clickSelect($(this).find("input[name=levellistitemcheckbox]").data("itemdom"),$(this));});list.on("click","li span>input[name=levellistselectallcheckbox]",function(e){var itemDom=$(this).data("itemdom");var isChecked=this.checked;_self.focusLevel=itemDom.data("levelkey");var _this=this;_click(itemDom[0],itemDom.data("levelkey"),false);_self._getResult(itemDom).then(function(data){if(_self.columnQueue[$(_this).attr("data-columnkey")]){_self.columnQueue[$(_this).attr("data-columnkey")].find("li").each(function(){var iscategory=$(this).data("iscategory");if(!iscategory||_self.options.selectcate){$(this).data("select",!isChecked);var currlevel=$(this).data("levelkey");_click(this,currlevel,true);}});}});e.stopPropagation();});list.on("click","li div.levellistselecthalfcheckbox",function(){list.find("li span>input[name=levellistselectallcheckbox]").click();});}if(this.panel.path){var _self=this;var path=this.panel.path;path.on("click","span",function(){var levelkey=$(this).data("levelkey");var columnkey=$(this).data("columnkey")||_self.options.root;_self.focusLevel=levelkey-1<0?0:levelkey-1;this.firstLevel=_self.focusLevel;_self._expendResult(_self.resultQueue[columnkey],levelkey,columnkey);});}},_initSelected:function(){if(!this.panel.select){return;}var item,obj,items=this.options.valueitems;if(!this.options.valueitems){this.options.valueitems=[];items=this.val().split(this.options.valuesplit);}else{this.options.valueitems=[];}for(var i in items){item=null;obj=items[i];if($.isPlainObject(obj)){item=obj;}else{if(typeof obj=="string"){if($.trim(obj)!=""){item={};if(this.options.valuefield==this.options.pathfield){var _obj=obj.split(this.options.pathsplit);item[this.options.valuefield]=_obj;item[this.options.label]=_obj[_obj.length-1];}else{item[this.options.valuefield]=obj;item[this.options.label]=obj;}var fs=this.options.autofields;for(var field in fs){item[field]=$("[name="+fs[field]+"]").val().split(this.options.valuesplit)[i]||"";}this.options.valueitems.push(item);}}}if(item){this.panel.select.append(this._getSelectDom(item));}}},_refreshPath:function(){if(!this.panel.path){return true;}var _self=this;var pathDoms=this.panel.path.find("span");var root;if(pathDoms.length==0){root=$("<span  style='cursor: pointer'>"+this.options.rootlabel+"</span>");root.append(">");root.data("levelkey",0);root.data("columnkey",this.options.root);this.panel.path.append(root);}else{root=pathDoms.filter(":first");root.text(this.options.rootlabel);root.append(">");}var focusLevel=this.focusLevel,itemDom=this.focusItemQueue[focusLevel];pathDoms.css({"font-weight":"normal"});if(itemDom&&itemDom.data("item")&&itemDom.data("item")[this.options.label]){var node=pathDoms.filter("span:eq("+(focusLevel+1)+")");var currcolkey=node.data("columnkey")||"";var newcolkey=itemDom.data("item")[this.store.idProperty];if(node.length==0){node=$("<span style='cursor: pointer'></span>");this.panel.path.append(node);}node.data("levelkey",focusLevel+1);if(itemDom.data("item")){node.data("columnkey",newcolkey);}node.text(itemDom.data("item")[this.options.label]+">");node.css({color:"#000000","font-weight":"bold"});node.show();if(currcolkey!=newcolkey){pathDoms.filter("span:gt("+(focusLevel+1)+")").hide();}else{pathDoms.filter("span:gt("+(focusLevel+1)+")").css({color:"#999999","font-weight":"normal"});}}},_refreshItemCss:function(itemDom){var css={"background-color":"","font-weight":""};if(itemDom.data("focus")){$.extend(css,{"background-color":"#cceeff","font-weight":"bolder"});}if(itemDom.data("select")){$.extend(css,{"background-color":"#ccffff"});}else{var type=itemDom.data("selectstatus")||0;$.extend(css,{"background-color":type==1?"#eeffff":type==2?"#cceeff":""});}itemDom.css(css);},_refreshParentCss:function(itemDom){if(!this.options.multi){return;}var levelkey=itemDom.data("levelkey")-1;var columnkey=itemDom.data("columnkey");if(levelkey<0){return false;}var selType=0;var nodesDom,nodesCount;if(this.columnQueue[columnkey]){nodesDom=this.columnQueue[columnkey].find("li"),nodesCount=nodesDom.length;}else{nodesDom=this.panel.lists.find("ul[data-columnkey="+columnkey+"] li"),nodesCount=nodesDom.length;}var selectedDom=nodesDom.filter("[data-selected=true]"),selCount=selectedDom.length;selType=nodesCount-selCount==0?2:nodesCount-selCount==nodesCount?0:1;var nodeDom=this.panel.lists.find("[data-itemkey="+columnkey+"]");var checkBox=nodeDom.find("[name=levellistselectallcheckbox]");var halfBox=nodeDom.find("div.levellistselecthalfcheckbox");halfBox.remove();nodeDom.data("selectstatus",selType);if(selType==0){checkBox.attr("checked",false);}else{if(selType==2){checkBox.attr("checked",true);}else{checkBox.attr("checked",true);}}this._refreshItemCss(nodeDom);},_createItemDom:function(item){var li=$('<li class="levellistitem" style="padding:0px 5px;margin:0px;clear: both; cursor: pointer;"></li>');var label=$("<span class='levellistitemlabel' style='float: left;overflow: hidden;'></span>");var text=item[this.options.label]||item[0]||(item._columns&&item[item._columns[0]])||"undefined label";label.text(text);label.attr("title",text);label.width(this._textwidth);label.height(25);$.support.cssFloat&&li.height(25);var ico=$("<span class='levellistitemico' style='float: left;'></span>"),ext=$("<span class='levellistitemext' style='float:right;height: 25px;line-height: 25px;'></span>");li.append(ico);li.append(label);li.append(ext);return li;},_showItemInfo:function(item){if(!this.panel.info){return false;}var _self=this;this.panel.info.find("span[data-type=_iteminfo_]").each(function(i,el){var layout=$(el).data("layout");var val=item[layout.field]||"";if(typeof layout.format=="function"){val=layout.format.call(_self,val,item);}$(el).text(val);});},_getLevelDom:function(levelkey){var leveldom=this.panel.lists.find(">li[data-levelkey="+levelkey+"]");if(leveldom.length==0){leveldom=$("<li  style='overflow-y:scroll;float:left;padding: 0px;margin: 0px ;border: 1px solid #e9e9e9' data-levelkey='"+levelkey+"'></li>");leveldom.width(this._columnwidth);leveldom.height(this.panel.lists.height()-10);this.panel.lists.append(leveldom);}return leveldom;},_getColumnDom:function(data,levelkey,columnkey){var _self=this;var leveldom=this.levelQueue[levelkey];if(!leveldom){leveldom=this.levelQueue[levelkey]=this._getLevelDom(levelkey);}var columndom=leveldom.find(">ul[data-columnkey='"+columnkey+"']");var _path=[];var _hasdom=columndom.length>0&&columndom.data("data")!=undefined;if(_hasdom){for(var i in columndom.data("data")){if(columndom.data("data")[i][this.store.idProperty]!=data[i][this.store.idProperty]){_hasdom=false;}}}if(!_hasdom){leveldom.empty();columndom=$("<ul style='list-style: none;padding: 0px;margin: 0px;'  data-columnkey='"+columnkey+"'></ul>");columndom.data("data",data);leveldom.append(columndom);var _path=[];if(levelkey>0){_path=this.focusItemQueue[levelkey-1].data("item")[_self.options.pathfield];}var emptySelect=[];if(_self.options.multi){emptySelect=_self.panel.select.find("li[data-nomatch=true]");}$.each(data,function(i,item){if(!item[_self.options.pathfield]){var _label=_self.options.pathfieldlabel==""?_self.options.label:_self.options.pathfieldlabel;item[_self.options.pathfield]=_path.concat(item[_label]);}var label=_self._getItemDom(item,levelkey,columnkey);label.data("item",item);label.attr("data-itemkey",item[_self.store.idProperty]);label.data("levelkey",levelkey);label.data("columnkey",columnkey);columndom.append(label);emptySelect.length>0&&_self._matchSelect(label,emptySelect);});columndom.hide();}_self.columnQueue[columnkey]=columndom;return columndom;},_getItemDom:function(item,levelkey,columnkey){return this._createItemDom(item);},_getSelectDom:function(itemDom){var checkbox=$("<input type='checkbox' style='float: left;' checked name='levellistitemcheckbox'/>");var item,_dom;var li;if($.isPlainObject(itemDom)){item=itemDom;_dom=null;}else{item=itemDom.data("item");_dom=itemDom;}li=this._createItemDom(item);if(item[this.store.idProperty]){li.attr("data-itemkey",item[this.store.idProperty]);}else{li.attr("data-nomatch",true);}if(item[this.options.pathfield]){li.attr("title",item[this.options.pathfield].join(this.options.pathsplit));}checkbox.data("selectdom",li);checkbox.data("itemdom",_dom);li.prepend(checkbox);li.data("item",item);return li;},_showSelectDom:function(dom){dom.css({"background-color":"#ffffcc",opacity:"0.3"});dom.fadeTo(350,1,function(){dom.css({"background-color":""});});},_hideSelectDom:function(dom){dom.css({"background-color":"#ccffff"});dom.fadeTo(450,0.25,function(){dom.remove();});},_expendResult:function(result,levelkey,columnkey){this._currentResult=result;var _self=this;var levelkey=levelkey||0;result.then(function(data){_self._showLevel(data.length==0);var column=_self._showColumn(data,levelkey,columnkey);_self._refreshPath();return;});},_showLevel:function(flag){var _self=this;var interval=this.options.showcols-2;if(this.focusLevel-this.firstLevel>=interval){if(flag&&this.focusLevel>0){this.focusLevel;}this.firstLevel=this.focusLevel-interval;}else{if(this.focusLevel<=this.firstLevel&&this.focusLevel>0){this.firstLevel=this.focusLevel-1;}else{if(this.focusLevel==0){this.firstLevel=this.focusLevel;}}}if(this.firstLevel<0){this.firstLevel=0;}this.lastLevel=this.firstLevel+interval+1;for(var i in this.levelQueue){if((i<this.firstLevel||i>this.lastLevel)&&i!=this.focusLevel){var _levelpanel=this.levelQueue[i];_levelpanel.data("scrollTop",_levelpanel.scrollTop());_levelpanel.filter(":visible").hide("fast");}else{this.levelQueue[i].filter(":hidden").show(0,function(){var _levelpanel=$(this);var _focusItemDom=_self.focusItemQueue[_levelpanel.data("levelkey")];if(_levelpanel.data("scrollTop")){_levelpanel.scrollTop(_levelpanel.data("scrollTop"));}else{if(_focusItemDom){_levelpanel.scrollTop(_focusItemDom.position().top-_levelpanel.height());}}});if(this.focusItemQueue[i]&&this.focusItemQueue[i].data("columnkey")){if(i>this.focusLevel+1){this.levelQueue[i].find(">ul:visible").hide();this.columnQueue[this.focusItemQueue[i].data("columnkey")].hide();}else{this.columnQueue[this.focusItemQueue[i].data("columnkey")].filter(":hidden").show();}}else{if(flag){if((i>this.firstLevel)){this.levelQueue[i].find(">ul:visible").hide();}}else{if(i>this.focusLevel+1){this.levelQueue[i].find(">ul:visible").hide();}}}}}},_showColumn:function(data,levelkey,columnkey){if(levelkey>this.lastLevel){return;}var currentcolumn;if(this.levelQueue[levelkey]){currentcolumn=this.levelQueue[levelkey].find(">ul:visible");if(data.length==0){currentcolumn.hide();return;}else{currentcolumn.filter("[data-columnkey!="+columnkey+"]").hide();currentcolumn=currentcolumn.filter("[data-columnkey="+columnkey+"]");if(currentcolumn.length>0&&this.options.cacheresult){return currentcolumn;}}}var column=this._getColumnDom(data,levelkey,columnkey);if(column[0].style.display=="none"){column.slideDown();}return column;},_getResult:function(itemDom){var _self=this,result;var resultkey=itemDom.data("item")[this.store.idProperty];var result=_self.options.cacheresult?this.resultQueue[resultkey]:false;if(!result){result=this.resultQueue[resultkey]=this.store.getChildren(itemDom.data("item")).map(function(item){if(_self.options.itemformats){for(var i in _self.options.itemformats){if(item[i]){item[i]=_self.options.itemformats[i](item[i],item);}}}if(_self.filter(item)){return _self.map(item);}else{return null;}});}return result;},_expendItemDom:function(itemDom,levelkey){var _self=this;var result=this._getResult(itemDom);this._expendResult(result,levelkey,itemDom.data("item")[this.store.idProperty]);},_onselect:function(itemDom){var item=itemDom.data("item");var _self=this;if(this.options.multi){itemDom.data("select",!itemDom.data("select"));itemDom.attr("data-selected",itemDom.data("select"));this._refreshItemCss(itemDom);var itemkey=item[this.store.idProperty];var selectDom=this.panel.select.find("li[data-itemkey="+itemkey+"]");if(itemDom.data("select")){if(selectDom.length==0){selectDom=this._getSelectDom(itemDom);this.panel.select.append(selectDom);}this.panel.select.parent().scrollTop(this.panel.select.height());this._showSelectDom(selectDom);}else{if(selectDom.length>0){var _top=selectDom.position().top;if(_top<0){_top=this.panel.select.parent().scrollTop()+_top-this.panel.select.height();this.panel.select.parent().scrollTop(_top);}else{if(_top+selectDom.height()>this.panel.select.parent().scrollTop()){_top=_top+selectDom.height();this.panel.select.parent().scrollTop(_top);}}}this._hideSelectDom(selectDom);}this._refreshParentCss(itemDom);}else{_self.selectQueue=[item];_self._selected();}},_selected:function(){var _self=this;if(this.options.multi&&this.panel.select){_self.selectQueue=[];this.panel.select.find(">li[data-itemkey]:visible").each(function(i,selectDom){_self.selectQueue.push($(selectDom).data("item"));});}else{var itemDom=this.focusItemQueue[_self.focusLevel];if(itemDom){if(!this.options.selectcate&&itemDom.data("iscategory")){return false;}if(!this.options.selectend){if(this.focusLevel+1!=this.options.leveldepth&&this.options.leveldepth>0){return false;}}}else{return false;}}var items=[].concat(this.selectQueue);if(this.options.valueitems){for(var i in this.options.valueitems){items.push(this.options.valueitems[i]);}}if(typeof this.onselect=="function"){if(this.onselect(items)){if(this.options.autofields){var fields=this.options.autofields;var items,vals=[];if($.isPlainObject(fields)){for(var i in fields){vals=[];items=this.selectQueue;for(var j in items){vals.push(items[j][i]||"");}$("[name="+fields[i]+"]").val(vals.join(this.options.valuesplit));}}}this.close();}}this.trigger("selected",[this,items]);},close:function(){if(util.isIE6){$("select").css("visibility","visible");}this.dialog.hide();},onselect:function(items){var val=[];var _self=this;$.each(items,function(i,item){if(_self.options.valuefield==_self.options.pathfield){val.push(item[_self.options.valuefield].join(_self.options.pathsplit));}else{val.push(item[_self.options.valuefield]);}});this.val(val.join(_self.options.valuesplit));return true;},_empty:function(){var _self=this;if(this.options.multi){this.panel.select.find("input[name=levellistitemcheckbox]").each(function(i,checkbox){var itemDom=$(checkbox).data("itemdom");if(itemDom){itemDom.data("select",false);_self._refreshItemCss(itemDom);}});this.panel.select.empty();}this.selectQueue=[];this.options.valueitems=[];},_matchSelect:function(itemDom,selectDoms){var item=itemDom.data("item");var _self=this;selectDoms.filter("[data-nomatch=true]").each(function(i,el){if(_self.matchSelect(item,$(el).data("item"))){_self.options.valueitems=$.grep(_self.options.valueitems,function(item,i){return(item!=$(el).data("item"));});$(el).attr("data-nomatch",false);$(el).attr("data-itemkey",item[_self.store.idProperty]);$(el).find("input[name=levellistitemcheckbox]").data("itemdom",itemDom);$(el).data("item",item);_self._onselect(itemDom);}});},matchSelect:function(itemOrg,itemSel){if(itemSel[this.store.idProperty]){return itemSel[this.store.idProperty]==itemOrg[this.store.idProperty];}else{if(itemSel[this.options.pathfield]){var a=$.trim(itemSel[this.options.pathfield].join(""));var b=$.trim(itemOrg[this.options.pathfield].join(""));return a==b;}else{if(itemSel[this.options.label]){return $.trim(itemSel[this.options.label])==$.trim(itemOrg[this.options.label]);}}}},map:function(item){if(typeof this.options.map=="function"){return this.options.map(item);}else{return item;}return item;},filter:function(item){if(typeof this.options.filter=="function"){return this.options.filter(item);}else{return true;}}});return levelselect;});