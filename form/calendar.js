require.config({
    paths:{
          wdatepicker:require.toUrl("../HikPublic/My97DatePicker/WdatePicker")
    }
})
define(["base/objectj","wdatepicker"],function($){
    /*
     * My97 DatePicker 4.8 Beta1
     * License: http://www.my97.net/dp/license.asp
     */
         // console.log( require.toUrl("../HikPublic/My97DatePicker/WdatePicker"))
    /**
     *
     .Wdate{
     border:#999 1px solid;
     height:20px;
     background:#fff url(datePicker.gif) no-repeat right;
     }

     .WdateFmtErr{
     font-weight:bold;
     color:red;
     }

     * @type {*}
     */
    var Calendar = $.sub()
    Calendar.fn.extend({
        main:function(){
            var format = this.options.format||"yyyy-MM-dd";

            var width = this.options.width || format.length*10
            this.width(width)
            this.on("click",function(){
                WdatePicker({dateFmt:format} )
            })
        }
    })
    return Calendar;
})


