/*!
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-6-14
 * Time: 上午11:47
 * AutoComplate *
 */

define(["base/objectj"], function ($) {
    var AutoComplate = $.sub();
    AutoComplate.fn.extend({
        main:function (selector, context) {
            this.superclass.main.apply(this, arguments)
        }
    })
    return AutoComplate;
})