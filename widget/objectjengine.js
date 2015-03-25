/*!
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-6-4
 * Time: 下午4:54
 * 基于Objectj的html代码解析引擎 *
 */

define(["jquery"], function ($) {
    var objectjEngine = $.sub();
    objectjEngine.fn.extend({
        main:function (selector, context) {
            this.superclass.main.apply(this, arguments)
        }
    })
    return objectjEngine;
})