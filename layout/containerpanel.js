/**
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-3-29
 * Time: 上午11:05
 * Widget API，所有Widget控件都继承该接口
 */
define(["./_base/layout"], function (layout,undefined) {
  var containerPanel = layout.sub();
    containerPanel.fn.extend({
        main:function(selector,ops){

            this.superclass.main.apply(this,arguments)
       }
  })
    return containerPanel;
})