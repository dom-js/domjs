define(["jquery"],function($){
    var util = {
        /**
         *
         * @param options
         *  host//db/view
         * @return {$.Deferred}
         */
        format_date:function(val,format){
            if(!format){
                if(typeof  val == "string"){
                    return val
                }else{
                    return val.getFullYear()+"-"+(val.getMonth()+1)+"-"+val.getDate()
                }
            } else{
                return val
            }
        },
        format_number:function(){}
    }
    return util
})