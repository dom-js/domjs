/**
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-3-26
 * Time: 上午9:03
 * To change this template use File | Settings | File Templates.
 */

define(["jquery","m!widget/dropdown:1.0.0"], function ($,drowdown) {
    var menu=drowdown.sub();
    menu.fn.extend({
        main:function(){
            if(this.data("this"))return this.data("this")
            this.attr("tabindex",0)
            this.data("this",this)

                if(this.find("ul").length>0){
                    this.options.panel=this.find("ul")
                }else{
                    this.options.panel =  $("<ul></ul>").appendTo(this)
                }
            delete  this.options.css.active.width
            delete  this.options.css.unactive.width
            this.__init();


        },
        root:$("body"),
        options:{
            css:{
                li:{
                    "font-size":"12px",
                    "background-color":"#f8f6f6",
                    "margin":"0px 2px",
                    float:"left",
                    clear:"left"
                },
                unactive:{
                    "font-size":"12px",
                    "background-color":"#f8f6f6",
                    "margin":"0px 2px",
                    float:"left",
                    clear:"left"
                },
                active:{
                    "margin":"0px 1px",
                    "border-right":"1px dotted",
                    "border-left":"1px dotted"
                }
            }
        },
        __initEvent:function(){
            var _self = this;
            this .on("contextmenu",function(){
                return false
            })
             .on("focusout","ul",function(){
                    _self.hide();
              })
             .on("mouseenter","li",function(e){
                $(this).css(_self.options.css.active)
            }).on("mouseleave","li",function(e){
                    $(this).css(_self.options.css.unactive)
             }).on("click","li",function(e){
                    e.target=e.currentTarget
                    _self.__select(e)
                    e.stopImmediatePropagation()
                    return false
             })

        },
        __initHTMLList:function(){
            this.panel.hide()
            $(this).hide()
            this.panel.css({
                "background-color":"#f8f6f6",
                "width":"inherit"
            })
            var w=this.panel.width(),h=this.panel.height()
            w=w<200?200:w;
            this.panel.width(w-2)


             var lis = this.panel.find(">li")
            lis.css({
                width:w-6
            })
            lis.each(function(i,el){
               var _doms =  $(el).find(">*")
                    var ico,split,label,exp
                 if(_doms.length==0){
                     ico = $("<div class='ico'></div> ")
                     split = $("<div class='split' ></div> ")
                     label = $("<div class='label' ></div> ").text($(el).text())
                     exp = $("<div class='exp'></div> ")

                 }else{
                     if($(el).find(">.ico").length==0){
                         ico = $("<div class='ico'></div> ")

                     }else{
                         ico =  $(el).find(">.ico")
                     }
                     if($(el).find(">.split").length==0){
                         split = $("<div class='split'></div> ")

                     }else{
                         split =  $(el).find(">.split")
                     }
                     if($(el).find(">.exp").length==0){
                         exp = $("<div class='exp'></div> ")
                     }else{
                         exp =  $(el).find(">.exp")
                     }
                     label =  $(el).find(">.label")

                 }
                $(el).empty()
                $(el).append(ico,split,label,exp)
                ico.attr({
                    style:'width: 16px;margin: 3px;float: left;height: inherit;'
                })
                split.attr({
                    style:'border-left: 1px solid #CCCCCC;border-right: 1px solid #FFFFFF;width: 0px;background-color: #cccccc;float: left;height: inherit;'
                })
                split.height(30)
                label.attr({
                    style:'float: left;margin: 0px 5px;height: inherit;'
                })

                exp.attr({
                    style:'float: right;margin: 0px 3px;height: inherit;'
                })
               // exp.text("exp")
             })
        },
        __select:function(e){
            this.hide();
            if(typeof this.onselect=="function"){
                this.onselect.call(this,e.target,this.root)
            }else if(typeof this.options.onselect=="function"){
                this.options.onselect.call(this,e.target,this.root)
            }

        },
        show:function(){
           this.appendTo(this.root)
            var     x=event.clientX,y= event.clientY;
            var w=this.panel.width(),h=this.panel.height()
            this.panel.show()

            $(this).show()




            this.panel.focus()

           // console.log(this.panel.find(">li").width())
            if(this.parentmenu){
            }

           // console.log(x,y,w,h)
            var clientWidth = document.compatMode == "CSS1Compat"? document.documentElement.clientWidth : document.body.clientWidth;
            var clientHeight = document.compatMode == "CSS1Compat"?document.documentElement.clientHeight : document.body.clientHeight;
            var left =(x +w) > clientWidth?x - w:x;
            var top = (y + h) > clientHeight?y - h:y;
            top+=(document.body.scrollTop==0?document.documentElement.scrollTop:document.body.scrollTop)

            this.css({
                position: "absolute",
                left:left,
                top:top,
                "z-index":9999
            })


        }
    })
    return menu;
    model = function(ops){
        var ops = $.extend({
            layout:[{text:"text",onclick:function(){
                this.item.onclick.call(this)
                this.panel.hide();
            }}]
        },ops)


        ops.nodeOps ={
            css:{
                backgroundColor:"#FFFFFF",
                padding:"3px 10px 3px  10px"
            }
        }
        this.menu=(new itemlist(ops));
        var menuItem = $(this.menu).find(">li")

        menuItem.on("mouseenter",function(){
            $(this).css({
                backgroundColor:"#E2f0fb"
            })
        }).on("mouseleave",function(){
                $(this).css({
                    backgroundColor:"#FFFFFF"
                })
            })

        this.menu.attr("tabIndex",0)
        this.menu.hide();
        this.menu.css({
            border:"1px solid #cccccc",
            backgroundColor:"#FFFFFF",
            fontSize:"12px",
            padding:"5px 0px 5px  0px"
        })

        this.menu.blur(function(){
           $(this).hide();
        })

        $("body").append(this.menu);
    }
    model.prototype = {
        setTarget:function(t){
          this.menu.targetItem = t
        },
        show:function(event){
            this.menu.hide();
            var clientWidth = document.compatMode == "CSS1Compat"? document.documentElement.clientWidth : document.body.clientWidth;
            var clientHeight = document.compatMode == "CSS1Compat"?document.documentElement.clientHeight : document.body.clientHeight;
            var left =(event.clientX + this.menu.width()) > clientWidth?event.clientX - this.menu.width():event.clientX;
            var top = (event.clientY + this.menu.height()) > clientHeight?event.clientY - this.menu.height():event.clientY;
            top+=(document.body.scrollTop==0?document.documentElement.scrollTop:document.body.scrollTop)
            this.menu.css({
                position: "absolute",
                left:left,
                top:top,
                "z-index":9999
            })
           this.menu.show()
           this.menu.focus();

             //   .css({,'top':offsettop+100,'left':offsetleft+50,'z-index':2});


        }
    }

    return model;
})