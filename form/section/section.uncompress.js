define( [ "base/objectj","docinfo","base/util"], function($,docinfo,util) {

    var section= $.sub();
    section.fn.extend({
        options:{
          edit:false
        },
        main:function(){
            var me = this;
            this.data("this",this)
            if(this.find(":input").length>0){
                this.options.edit=true
                this.expand();
            }else{
                this.collapse();
            }

            var _self = this;
            this.find(".section_head").on("click",function(){
                _self[_self.status=="collapse"?"expand":"collapse"]()
            })
            this.id = this.attr("data-id");

            this.id==1&&this.expand()

            if(this.find(".signatureinfo").length>0&& $.trim(this.find(".signatureinfo").text())==""&&!this.options.edit){
                this.hide()
            }
            this.translate();
        },
        id:"",
        status:'collapse',
        istranslate:false,
        collapse: function() {
            this.find(".section_head img").attr("src","/icons/expand.gif");
            this.find(".section_body").hide();
            this.status="collapse"
            return false;
        },
        expand : function() {
            this.status="expand"
            this.find(".section_head img").attr("src","/icons/collapse.gif");

            this.find(".section_body").show();

            return false;
        },
        translate:function(){
            var me = this;

            if(!this.istranslate){
               // require(["base/util"],function(util){
                    util.translate("nls/form",me.find(":not(table)"))
                    me.istranslate=true;
                    if(typeof docinfo.langpack== "string" && $.trim(docinfo.langpack)!=""){
                        util.translate(docinfo.langpack,me,"di18n")
                    }
              //  })

            }
        }
    })
    section.extend({
        created:function(){

            var secbody=[];
            var tmpsecbody=$();
            if(docinfo.isdocbeingedited){
                var formbodyElements=$(".formBody > *,.formBottom > *");
                formbodyElements.each(function(i,el){
                    if(el.tagName=="IMG")
                    {
                        tmpsecbody=$(el)
                        secbody.push(tmpsecbody);
                    }else{
                        tmpsecbody.push(el);
                    }
                });
                $.each(secbody,function(i,nodelist){
                    var id = i+1;
                    nodelist.wrapAll("<div class='section' data-id="+id+">");
                    nodelist.filter(":lt(2)").wrapAll("<div class='section_head title'>").wrapAll("<a name=_section"+id+">")
                    nodelist.filter(":gt(1)").wrapAll("<div class='section_body'>");
                })
            }else{
                var seclen = $(".formBody [name^=_Section],.formBottom [name^=_Section]").length;
                var expendall = []
                for(var i=1;i<seclen+1;i++ ){
                    expendall[i-1]=i
                }
                //expendall.join("%2C");
                var expendinfo = window.location.href.match(/ExpandSection=([-\d%c]*)\.*#?(_section\d+$)?/i);
                if(expendinfo){
                    expendcurr = expendinfo[1].split("%2C");
                    if(expendcurr.length!=seclen)
                        window.location = window.location.href.replace(expendinfo[1],expendall.join("%2C"))
                }else{
                    window.location = window.location.href+="&ExpandSection="+expendall.join("%2C");
                }
                $(".formBody [name^=_Section],.formBottom [name^=_Section]")//.each(funct)
                var formbodyElements=$(".formBody > *,.formBottom > *");
                formbodyElements.each(function(i,el){
                    if(el.tagName=="A" && el.name.match(/_Section\d+/))
                    {
                        tmpsecbody=$(el)
                        secbody.push(tmpsecbody);
                    }else{
                        tmpsecbody.push(el);
                    }
                });
                $.each(secbody,function(i,nodelist){
                    var id = i+1;
                    nodelist.wrapAll("<div class='section' data-id="+id+">");
                    nodelist.filter(":lt(3)").wrapAll("<div class='section_head title'>")//.find("img").unwrap()
                    nodelist.filter(":gt(2)").wrapAll("<div class='section_body'>");
                    nodelist.filter(":eq(1)").find("img").unwrap();
                })
            }
        },
        expandall:function(){
            $(".section").each(function(i,el){
                $(el).data("this").expand()
            })
        },
        collapseall:function(){
            $(".section").each(function(i,el){
                $(el).data("this").collapse()
            })
        },
        expand:function(id){
            $(".section [data-id="+id+"]").data("this").expand();
        },
        collapse:function(id){
            $(".section [data-id="+id+"]").data("this").collapse();
        }
    })
    section.created();
    $(".section").each(function(i,el){
        section(el)
    })
    return section;

})