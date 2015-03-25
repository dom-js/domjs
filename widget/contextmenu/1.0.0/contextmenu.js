/**
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-3-26
 * Time: 上午9:03
 * To change this template use File | Settings | File Templates.
 */

define(["jquery","widget/itemlist/1.0.0/itemlist"], function ($,itemlist) {
    var model;
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