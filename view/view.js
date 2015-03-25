/*!
 * Created with JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-8-16
 * Time: 上午10:11
 * 扩展基本视图实现带有搜索栏和工具条的视图
 */
/**
 * 2012-5-8 修改允许分类视图单个分类下显示搜素框
 */
define(["jquery","widget/_base/widget","./_base/view","plugin/tmpl","i18n!nls/system"],function($,widget,baseView,tmpl,i18n){
    var view =baseView.sub(), Toolbar = baseView.Toolbar.sub() , Searchbar = widget.sub();
    view.extend({
        Searchbar:Searchbar
    });
    /*！
     *搜素栏扩展
     */
    Searchbar.fn.extend({
        options:{
            "float":"right"
        },
        __initWidget:function(){
            this.addClass("searchbar")
            this.css("float",this.options["float"])
            this.css("background-color","rgba(255, 255, 255, 0)");
            this.filterItem = {
                label:"Search" ,
                icon:"search" ,
                iconurl:this.__getIconUrl("search")
            };
            this.__initBaseFilterList();

            this.__initSearchBar();
            this.options.view.__runHitchs("search.inited",this);
        },
        __initBaseFilterList:function(){
            var _self = this;
            this.basefilter = $.map((this.options.view.options.basefilter||[]),function(item,i){
                if(!item.iconurl||item.iconurl==""){
                    var icon =   item.icon;
                    if(!icon||icon==""){
                        icon="search"
                    };
                    item.iconurl =  _self.__getIconUrl(icon)
                };
                if(item["default"]) _self.filterItem = item;
                return item
            });

        },
        __getIconUrl:function(icon){
            return require.toUrl("view/source/"+icon+".png");
        },
        __initSearchBar:function(){
            var _self = this  ,
                querybox=$("<div style='background-color:#FFFFFF;float: left;border: 1px solid #e1e2eb;height: 22px; -webkit-border-radius:5px; -moz-border-radius:5px;border-radius:5px;'></div>");


            this.__initBoxBt();
            this.__initInputBox();

            this.__initDrop();
            querybox.append(this.doms.btnsPanel,this.doms.boxPane,this.doms.quikerDrop);
            this.append(querybox);
        } ,
        __initBoxBt:function(){
            var   sbtn =this.doms.icoBtn=$("<img style='cursor: pointer;margin-right: 3px;' name=search src=\""+
                    this.filterItem.iconurl+ "\" alt=\""+this.filterItem.label+"\" title=\"this.filterItem.label\" >"),
                fbox =   this.doms.labelBtn =$("<div style='display: none;padding-right: 5px'></div>")  ,
                sbtnbox = this.doms.basefilterBox =  $("<div style='float: left;padding-top: 3px;font-size: 12px;'></div>").append(sbtn,fbox)     ,
                btbox = this.doms.btnsPanel =$("<div style='float: left;padding-right: 3px;padding-left: 3px;margin-left: 3px;'></div>");
            btbox.append(sbtnbox)

        },
        __initInputBox:function(){

            var boxPane = this.doms.boxPane  = $("<div style='float: left;height: 20px;padding: 0px;width: 220px'></div>");
            var textbox = this.doms.textBox =$( "<input name='query' type='text' style='float: left;;padding:0px;margin0px;height: 18px;line-height:18px;width: 200px;border: 0px solid #87ceeb;vertical-align: middle;'/>");
            var cbtn=this.doms.clearBtn=$("<img style='float: left;cursor: pointer;display: none;padding: 0px;margin-top: 3px' name=search src=\""+require.toUrl("view/source/clear.png")+"\" alt=\""+i18n["Search"]+"\">");

            boxPane.append(textbox,cbtn);
            // this.append(boxPane)
        },
        __initDrop:function(){
            if(this.basefilter.length==0) return;
            var temlstr="<script type='text/x-domjs-tmpl'>" +
                "<li style='height: 20px;line-height: 20px;'>" +
                "<span style='padding:2px;margin-top:2px;margin-right: 5px; '><img src=\"${iconurl}\" style='width: 12px;height: 12px' alt=\"\"></span>" +
                "<span>${label}</span>" +
                "</li></script>";
            var droplist = tmpl(temlstr).tmpl(this.basefilter);
            var boxdropbtn=  this.doms.dropBtn =  $( "<img  style='cursor: pointer' src=\""+require.toUrl("view/source/showdrop.gif")+"\" >" )  ,
                dropbtnbox   = $("<div style='float: left;'></div>") ;
            if(!$.support.cssFloat)
                dropbtnbox.css({
                    "padding-top":"6px"
                })
            if(this.basefilter.length>0){
                dropbtnbox.append(boxdropbtn)
            }

            this.doms.btnsPanel.append(dropbtnbox);

            var qdrop  = $("<ul class='quikerdrop-basefilter' style='cursor:pointer;list-style-type: none;font-size: 12px;margin:0px;padding: 0px;z-index:9999;'></ul>").append(droplist);
            this.doms.quikerDrop =$("<div  style='background-color:#FffFFF;display: none;clear:both;text-align:left;width: 150px;position:relative;z-index:9999;border: 1px solid #CCCCCC;'></div>").append(qdrop);
            //alert($.support.boxModel)
            if( !$.support.boxModel||($.browser.msie && parseInt($.browser.version) < 0x7)||document.compatMode=="BackCompat"){
                this.doms.quikerDrop.css({
                    "position":"absolute"
                });
            }
            this.doms.quikerDrop.css({
                "text-align":"left"
            });
        },
        __initDropExt:function(){

        },
        __initEvent:function(){
            this.__initSearchEvent();
        },
        __initSearchEvent:function(){
            var _self = this
            this.doms.textBox.on("keydown",function(e){
                if(e.keyCode==13){
                    return false
                }
            });
            this.doms.textBox.on("keyup",function(e){

                if(e.keyCode==13){
                    _self.__search()
                }
            });
            this.doms.icoBtn.on("click",function(e){

                _self.__search()
            });
            this.doms.labelBtn.on("click",function(e){

                _self.__search()
            });
            this.doms.clearBtn .on("click",function(e){
                _self.__clear()
            });

            this.doms.dropBtn && this.doms.dropBtn.on("click",function(){
                if(_self.doms.quikerDrop.filter(":hidden").length>0)
                    _self.doms.quikerDrop.slideDown()
                else
                    _self.doms.quikerDrop.slideUp()
            });
            this.doms.quikerDrop && this.doms.quikerDrop.on("click","li",function(i,el){
                var item =tmpl(this).tmplItem().data;
                var dom = _self.doms.labelBtn.text(item.label);
                _self.__selectFilterField(item);
                _self.doms.quikerDrop.slideUp();
                _self.__search();
            });
            this.doms.quikerDrop && this.on("mouseleave",function(){
                _self.doms.quikerDrop.slideUp()
            })
        },
        __selectFilterField:function(item){
            var _self = this;
            var showIco = function(iconurl){
                _self.doms.icoBtn.attr("src",iconurl);
                _self.doms.icoBtn.attr("alt",item.label );
                _self.doms.icoBtn.attr("title",item.label);
                _self.doms.icoBtn  .show();
                _self.doms.labelBtn.hide();
            };
            var showLabel = function(){
                _self.doms.labelBtn.show();
                _self.doms.icoBtn .hide();

            };
            if(!item.field){
                showIco(item.iconurl);
            } else{
                if(item.icon!=""){
                    showIco(item.iconurl);
                } else
                    showLabel();
            }
            this.filterItem = item;

        },
        __getQueryStr:function(){
            if(!this.filterItem.field){
                return  this.doms.textBox.val();
            }else{

                return "["+ this.filterItem.field + "] " + ((this.filterItem.type=="DATE" || this.filterItem.type=="NUMBER")?" = ":" CONTAINS " ) + this.doms.textBox.val();
            }
        },
        resetFilterItem:function(){
            var view =  this.options.view;
            if($.isArray(view.options.basefilter)&&view.options.basefilter[0])  {
                this.__selectFilterField(view.options.basefilter[0]);
            }

        },
        __search:function(){

            var query = this.__getQueryStr();

            if($.trim(this.doms.textBox.val())!=""){
                this.options.view.search(query);
                this.doms.clearBtn.show();
                this.trigger("search",[query]);
            }else{
                this.__clear();
            }
        }  ,

        __clear:function(){
            this.doms.clearBtn.hide();
            this.doms.textBox.val("");

            this.options.view.Range.empty()
            this.options.view.load({reload:true});
            this.trigger("clear");
        }

    });
    /*!
     * 工具栏扩展
     */
    Toolbar.fn.extend({
        __initWidget:function(){


            var view =  this.options.view;
            view.__runHitchs("toolbar.initWidget",this);
            //分类视图不可搜索

            //if(view.options.cate==""||view.options.cate=="*") {
            this.doms.searchBar =  view.options.Searchbar("<div style='height: 24px;margin:3px 0px 1px;;text-align: left;background: #FFFFFF'></div>",{
                view:this.options.view,
                toolbar:this,
                "float":this.options.view.options.searchbar && this.options.view.options.searchbar["float"]
            });
            this.append( this.doms.searchBar);
            // }
            this.__initStyle();
        }  ,
        __initStyle:function(){

            this.css({
                "background-color":"#e8e8e8",
                "width":"100%",
                "height":"auto",
                "overflow":"visible"
            });
        },
        __initEvent:function(){

        }

    });
    view.fn.extend({
        options:{
            Toolbar:Toolbar,
            Searchbar:Searchbar
        }
    });
    return view;
})
