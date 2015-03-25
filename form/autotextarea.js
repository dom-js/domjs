define(["jquery","base/objectj","plugin/autoResize"],function($,obj){
    var autotextarea = obj.sub()
    autotextarea.fn.extend({
        options:{ minHeight: 20,extraSpace:0,animate:100},
        main:function(){
            this.options.maxHeight=this.options.maxheight||this.options.maxHeight
            var el=this[0],_self = this
            var name = el.name
            if(el.type=="text"){
                var div = $("<div></div>");
                $(el).after(div)
                div.append(el)
                var html = div.html();
                html = html.replace(/<input/gi,"<textarea").replace(/\/>/,">")+"</textarea>"
                var tt = $(html)

              //  docinfo.formula(name).then(function(res){
                 //   tt.val(res[name])
                    tt.val(el.value)
                    tt.autoResize(_self.options)
               // })
                tt .removeAttr("value")
                div.after(tt)
                $(el).remove()
                div.remove()
                el = tt;
                this.pushStack(tt)
                tt
            }else{
                $(el).autoResize(this.options)
            }

        }
    })
    return autotextarea
})