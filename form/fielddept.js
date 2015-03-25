
define( [ "base/objectj" ,"/HikDefaultSytle/DocumentForm/js/documentForm.js"], function($) {
    var Department = $.sub();
    Department.fn.extend({
        main:function(){

            var url = this.options.url||(this.options.cate?"/hikcommon/publicnames.nsf/GroupsByLevel3":"/xxx/hikorg.nsf/(OrgDeptByJB3)");

            var cate = this.options.cate||"";
            var column = this.options.column||(this.options.cate?1:2);
            var ismulti = this.options.multi||false
            var onselect = function(){};
            if(this.options.onselect){
                this.options.onselect
            }
            this.on("click",function(){
                selectTree(this,url,escape(cate),column,!ismulti);
                onselect(this.value)
            })
        }
    })
    return Department;

})