define(
    ["jquery"]
    ($) ->
    constructor:(a) ->
        @host = 1
    floatMenu =() ->
        this.doms={}
        this.doms.panel = $ "<div style='position: fixed;'></div>"
        $("body").append this.doms.panel
        this

    floatMenu.prototype.addButton = ()->

)