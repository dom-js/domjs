/**
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-7-3
 * Time: 上午8:40
 * To change this template use File | Settings | File Templates.
 */
requirejs.onError = function(err) {
    require(["base/util"],function(util){
        util.error(err)
    })
};
$(function(){

    require(["base/objectjEngine"], function (eg)
        {
            eg("body")
        }
    )
})