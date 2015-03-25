$("head").prepend("<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">");

//,"css!bootstrap/css/bootstrap.min","css!markdownplugin"
require(["./base/util","bootstrap"],function(util){

if(window.location.href.match(/AppData\/Local\/Temp\/wktemp/i)) return
$(function(){


        var b = $("body>*").filter(":not(script)");
        b.wrapAll("<div class='span8'></div>");
        var mainbody =  $("body").find(">.span8")
        mainbody.prepend($("h1"))
        mainbody.wrap("<div class='row'>");
        var rowbody =  $("body").find(">.row");
        rowbody.wrap("<div class='container'>");
        var container =  $("body").find(">.container");
        var span3 = $("<div class='span4 bs-docs-sidebar' role=\"complementary\">")
        rowbody.prepend(span3)
        var nav = $("a[id]").map(function(i,a){
            var l = $("<a href='#"+a.id+"'><span>"+$(a).text()+"</span></a>");
            return $("<li>").append(l).get(0);
        })
        var nav = $("h2").map(function(i,h2){
            var id = "ID"+i;
            var $h2 =$(h2)
            $h2.wrapInner("<a id='"+id+"'></a>");
            var l = $("<a href='#"+id+"'><span>"+$h2.text()+"</span></a>");
            return $("<li>").append(l).get(0);
        })
        var createNav=function(id,$h){
            $h.wrapInner("<a id='"+id+"'></a>");
            var l = $("<a href='#"+id+"'><span>"+$h.text()+"</span></a>");
            return $("<li>").append(l).get(0);
        }
        var _createdNav = function(ol,max,parent){

            var level = ol||2;
            var max = max||2;
            var $hs


             $hs = parent ?parent.nextUntil("h"+(level-1)).filter("h"+level):$("h"+level);


            var navlist =  $hs.map(function(i,h){
                 var id =  "ID_"+(parent?parent.find("a").attr("id").replace("ID_","")+"_":"") + (i+1);
                $h=$(h);

                var l = $("<a href='#"+id+"'><span>"+$h.text()+"</span></a>");
                var navItem  =  $("<li>")
                $h.wrapInner("<a id='"+id+"'></a>");

                navItem.append(l);
                if(level<=max){
                    var subNav = _createdNav(level+1,max,$h);
                    if(subNav){
                        // icon-chevron-right
                        navItem.find("a").prepend("<i style='float: right' class=' icon-chevron-down'></i><i style='float: right' class=' icon-chevron-right'></i>")
                        navItem.append(subNav)
                    }
                }
                return navItem.get(0);
            });
            if(navlist.length>0){
                return $("<ul class='nav nav-list'  ></ul>").append(navlist);
            }else{
                return false;
            }

        }
       var navP = _createdNav();
        navP.addClass("bs-docs-sidenav")

        span3.append(navP);

        $("body").scrollspy({target:".bs-docs-sidebar",offset:150});
        $("body").on("activate",".bs-docs-sidebar  ul li",function(){
            var $this = $(this);
            var parent =  $this.parent("ul").parent("li")
            parent.addClass('active');
        })
        navP.affix()

    });
});