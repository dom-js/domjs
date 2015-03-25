/**
 * Created with JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-9-12
 * Time: 上午11:51
 * To change this template use File | Settings | File Templates.
 */

(function(){
    var csspath1 = require.toUrl("plugin/jquery.datepicker/css/datepicker.css")
    define(["jquery","base/objectj","plugin/jquery.datepicker/js/datepicker2","css!"+csspath1],function($,obj,DatePicker){
        var datepicker =  obj.sub()
          datepicker.fn.extend({
              main:function(){
                  var _self = this
                  var ops =  this.options
                 this.options. onChange=function(){
                      //console.log(arguments)
                      if(ops.mode=="single"){
                          _self.val(_self.DatePickerGetDate(_self.options.format))

                          //_self.hide()
                      }
                     var flag = true
                     _self.one("change",function(e,val,date,input){
                         if($.isArray(e.result)){
                             $.each(e.result,function(i,result){
                                 if(result==false)flag=false;
                             })
                         }else{
                             if ( e.result===false){
                                 flag = false;
                             }
                         }
                     })
                     _self.trigger("change",arguments)
                     return flag
                  }
                  this.options.onHide=function(){
                      _self.val(_self.DatePickerGetDate(_self.options.format))
                     // _self.triggerHandler("change")
                  }

                  this.options. onRender = function(date) {
                      if(typeof _self.options.render =="function")
                        return _self.options.render(date)
                      else
                      return {}
                      //disabled
                      //selected
                      //classname
                      //  var now = new Date()
                       //   {
                              //  disabled: (date.valueOf() < now.valueOf())
                       //   }
                  }

                 this.DatePicker(this.options);
                 this.__initEvent()
              },
              options:{
                  flat: false,
                  date: new Date(),
                  current:new Date(),
                  format:"Y-m-d",
                  calendars:1,
                  view:"days",     //'days'|'months'|'years']
                  mode: 'single',   //multiple ['single'|'multiple'|'range']
                  start: 1  ,
                  sdate:false,
                  edate:false
              },
              __initEvent:function(){
                  var _self = this
                  this.on("click",function(){
                      _self.show();
                  })
              },
              show:function(){
                  this.DatePickerShow();
              },
              hide:function(){
                  this.DatePickerHide();

              },
              DatePicker: DatePicker.init,
              DatePickerHide: DatePicker.hidePicker,
              DatePickerShow: DatePicker.showPicker,
              DatePickerSetDate: DatePicker.setDate,
              DatePickerGetDate: DatePicker.getDate,
              DatePickerClear: DatePicker.clear,
              DatePickerLayout: DatePicker.fixLayout
          })
        return datepicker
    })
})()