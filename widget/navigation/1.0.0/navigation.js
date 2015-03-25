/**
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-7-30
 * Time: 下午1:34
 * To change this template use File | Settings | File Templates.
 */
define(["widget/tree/2.0.0/tree"], function (tree) {
    var navi = tree.sub();
    navi.fn.extend({
        options: {
            cssurl: "widget/navigation/1.0.0/theme/default",
            rootlabel: "",
            expandone: true
        }
    })
    return navi;
})