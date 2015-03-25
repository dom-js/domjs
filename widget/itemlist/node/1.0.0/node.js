define(["jquery","widget/_base/widget"],function($,widget){
    var row = widget.sub(),_cell = widget.sub();
    row.Cell = _cell;
    _cell.fn.extend({
        __initWidget:function(){
            if(this.options.layout){
                this.__initCellByLayout()
            }else{
                this.__initCellByHTML()
            }
        },
        __initCellByLayout:function(){
            switch (this.options.layout.type){
                case "text":
                    this.setvalue=function(value){
                        this.text(value)
                    }

                    break;
                case "html":
                default:
                    this.setvalue=function(value){
                        this.html(value)
                    }
            }
        },
        __initCellByHTML:function(){

        },
        setvalue:function(value){

        },
        getvalue:function(){

        },
        update:function(item){
            this.setvalue(this.getvalue(item))
        }
    })
    /**
     * 可以创建一个节点。这个节点可以是一个table的tr也可以是一个list的li甚至任何任何其他html元素，node一般会和itemlist在一起使用
     */
      row.fn.extend({
        options:{
           layout:[{
                type:"text",//datatime/number/text/widgettype
                field:"label" //对应item内地字段名称或者一个函数，如果是一个函数，其参数则是一个当前node对应的item
             }]
        },
        cells:[],//cell集合
        __initWidget:function(){
            //如果不存在
            if(!this.options.item){
               this.__initCellByHTML()
            }
        },
        __initCellByHTML:function(){
            var item = this.options.item = {}
            var colums = this.find(">*");
            if(coulums.length==0){
                item[this.attr("name")||"label"] = this.html();
                this.__initCellByItem()
            }else{
                var _self =this
                this.find(">*").each(function(i,el){
                    var cell = rowCell(el)
                    item[cell.get("name")]=cell.get("value");
                    _self.cells.push(cell)
                })
            }
        },
        __initCellByItem:function(){
            this.__computerLayout(this.options.layout)
            this.update()
        },
        __computerLayout:function(layout){

            if($.isArray(layout)){
                for(i in layout){
                    this.__computerLayout(layout)
                }
            }else if($.isPlainObject(layout)){
                var cell = row.Cell("<"+this.options.celltagname+">",{
                    layout:layout,
                    item:item
                })
               this.append(cell)
            }
        },
        update:function(item){
            item=item||this.options.item
            for(i in this.cells){
               this.cells[i].update(item)
            }
        }
    })
   return row;
});