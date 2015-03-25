define( [ "jquery" ,"base/objectj"], function($,obj) {

	var DrowDown = obj.sub();
    DrowDown.fn.extend({
        main:function(){

        },
        options:{
            idProperty:"id",
            layout:{
                type:"text",
                text:"label",
                css:{float:"left"}
            },
            autoremove:true,
            data:[]

        },
        id : null,

        add : function(item) {
            var element = new DrowDown.Element(item);
            this.elementList.push(element)
        },
        remove : function() {

        },
        update : function() {

        },
        elementList : []
    })

	DrowDown.extend({
        /**
         * 格式化字符串（将{name:"Leo",age:16}对象格式化到 "姓名"）
         * @param format
         * @param vals
         * @return
         */
    format : function(format, vals) {
            var valstr = ".*", reg
            switch (typeof vals) {
            default:
                return format;
                break;
            case "object":
                var i, j = 0;
                for (i in vals) {
                    j++
                    valstr += "(" + vals[i] + ").*";
                    if (j >= vals.length)
                        break;
                }
                break;
            case "string":
                valstr = "(" + vals + ").*";
            }
            valstr = valstr.replace(/([\*\.])/g, "\\$1")
            reg = new RegExp(valstr, "i")
            return vals.toString().replace(reg, format)
        }
     })
	return DrowDown;
})