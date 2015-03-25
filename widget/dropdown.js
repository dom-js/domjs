/**
 * DorpDown 用于显示下拉菜单
 */
define(["jquery"],function($){
	var DropDown = function(ops){
		this.layout=[{
					type:"text",
					text:"label",
					css:{float:"left"}
				}]
		this.autoremove = true;
		this.idProperty="id";
		this.scrollbody=[];
		this.data=[];
		this.element;
		$.extend(this,ops)		 
		
		//DropDown.panel.contentPanel.append($("body"))
		this.panel = new DropDown.panel({
			classname:this.classname,
			position:{
			top:"",
			left:""
		},scrollbody:this.scrollbody});
		this.length = 0;
		this._allentries=[];
		if(this.data.length>0){
			$.each(data,function(i,item){
				his.addEntry(item)
			})
		}
		if(this.element)this.panel.setElement(this.element)
	}
	DropDown.prototype.setElement = function(el){
		this.panel.setElement(el)
	}
	DropDown.prototype.has=function(item){
		if(item[this.idProperty]){ 
		
			var i,isHave=false ;
			for(i in this.data){
				isHave = item[this.idProperty] == this.data[i][this.idProperty]
				if(isHave) break;
			} 
			return isHave;
		 
		}else
			return true;
	}
	DropDown.prototype.position=function(position){
		this.panel.position(position)
	}
	DropDown.prototype.show=function(){ 
		 if(this.data.length>0)
		this.panel.show();
	}
	DropDown.prototype.hide=function(){
		this.panel.hide();
	}
	DropDown.prototype.format = function(format,vals){ 
		var valstr =".*"; 
		switch(typeof vals){
				default:
					return format;
				break;
			case "object":
				var i,j=0;
				for(i in vals){
				    j++
				    valstr +="("+vals[i]+").*";
				    if(j>=vals.length)break;
				}
				break;
			case "string":
			    valstr = "("+vals+").*";
		} 
		valstr = valstr.replace(/([\*\.])/g,"\\$1")
		var reg=new RegExp(valstr ,"i") 
		return vals.toString().replace(reg,format)
	}
	DropDown.prototype.createdEntry=function(item){
		 var i ,col,entry;
		 var entries = $("<div  class='drowdownitem'  style='clear:both;height:20px;cursor:pointer'>");
		
		 for (i in this.layout){
			 entry = $("<span>");  
			 col = this.layout[i];
			 if(col.css)
				 entry.css(col.css)  
			 switch (col.type){
			 default: //text,undefind
				 var text = item[col.text]
				 if(col.format){
					 text =this.format(col.format ,text)
				 } 
				 entry.text(text)
				 break;
			 case "img":
				 break;
			 case "action":
				 break;
			 }
			 entries.append(entry);
		 }; 
		 return entries;
	}
	DropDown.prototype.setDate = function(data){
		
		var me=this;
		var  _setDate = function(index,item){  
			me.data.push(item); 
		}
		 
		if(data.each){
			data.each(_setDate)
		}else{
			$.each(data,_setDate)
		}
		
	}
	DropDown.prototype.addEntry=function(item){ 
		 if(this.has(item))
			 return false;
		 else{
				
			 this.data.push(item);
			 var entry = this.createdEntry(item) 
			 this.panel.addEntry(entry) 
		 }
		 
		 entry.on("click",{item:item,me:this},function(e){ 
			 
			e.data. me._selected(e.data.item,this) 
		 }) .on("keydown",{item:item,me:this},function(e){  
			 if(e.which==13){ 
				 e.data. me._selected(e.data.item,this) 
				 return false;
			 }
		 })
	}
	DropDown.prototype._selected = function(item,el){
		if(this.autoremove){ 
			this.reomveItem(item);
			this.removeEntry(el);
		}
		this.selected(item);
	}
	DropDown.prototype.selected = function(item){ 
		return item
	}
	DropDown.prototype.selectfirst = function(){
		this.panel.selectfirst()
	}
	DropDown.prototype.reomveItem=function(item){
		var idProperty = this.idProperty; 
		this.data=$.grep(this.data,function(dataitem,i){ 
			return dataitem[idProperty]!=item[idProperty]
		}) 
	}
	DropDown.prototype.removeEntry=function(el){ 
		 this.panel.removeEntry($(el).parent())
	} 
	DropDown.prototype.update=function(){
		var data=this.data
		//this.empty();
		var me = this
		//console.log(data)
		$.each(data,function(i,item){
			me.addEntry(item);
		})
	}
	DropDown.prototype.empty=function(){
		this.data=[];
		this.panel.empty();
	} 
	DropDown.panel =function(ops){
		 this.jId = "jId"+(new Date()).getTime();//默认jId（如不指定jId,则意味着会创建新的Created）
		 this.isCreated = false; //默认不创建独立panel（使用共有一个）
		 var isHave = false;
		 this.scrollbody=[]
		 $.extend(this,ops) 
		 var scrollbody = "body,form,"+this.scrollbody.toString();
		 var me = this; 
		 //根据屏幕滚动
		$(scrollbody).on("scroll",function(){
				if(me.element){ 
					me.position(); 
				} 
		})  
		this.selectedIndex=-1;
		this.contentPanel=$("div[data-type=dropdown][jId=" +this.jId+ "]");
		
		 if(this.isCreated ||!this.contentPanel.is("[jId=dpnames]")) {
			 this.contentPanel = $("<div data-type='dropdown' style='z-index:9999;display:none;background-color:#FFF;border:\" solid  1px #ccc\"' jId='"+this.jId+"'>").css({
				 position:"absolute"
			 });
			 if(this.classname){
				 this.contentPanel.addClass(this.classname)
			 }
			 $("body").append(this.contentPanel);
		 }
		 this.contentPanel.css({
			 top:this.position.top,
		 	left:this.position.left
		 })
		 this.listPanel = this.contentPanel.find(">ul");
		 if(!this.listPanel.is()){
			 this.listPanel = $("<ul class='dropdownul'>") ;
			 this.contentPanel.append(this.listPanel);
		 }
		 this.addEntry=function(el){
			 var entry = $("<li class='drowdownli'>"); 
			 this.listPanel.append(entry);
			 entry.append(el);
			 var me = this;
			 $(el).on("keydown",function(e){ 
			 
				 switch(e.which){ 
				 	default:
				 		//donothing 
						 return false;
					  
				 		break;
				 	case 38:
						 if(me.selectedIndex<1){
							 me.selectedIndex=me.listPanel.find(">li").length-1;
						 }else{
							 me.selectedIndex--
						 }   
						 me.listPanel.find(">li:eq(" + me.selectedIndex+ ")>*").focus(); 
						 return false; 
					 	break;
				 	case 40:
				 		//console.log(me.selectedIndex)
						 if(me.selectedIndex>=me.listPanel.find(">li").length-1){
							 me.selectedIndex=0;
						 }else{
							 me.selectedIndex++
						 }  
						 me.listPanel.find(">li:eq(" + me.selectedIndex+ ")>*").focus(); 
					 	return false;
					 	break;
				 }
				 return false;
			 });
			 entry.on("focus",function(){  
					$(this).addClass("selected")
				}).on("blur",function(){ 
					$(this).removeClass("selected")
				}) .hover(function(){$(this).focus()},function(){$(this).blur()})
			
		 }
		this.selectfirst=function(){
			$(this.element).blur()
			me.selectedIndex=0
			this.listPanel.find(">li:eq(0)>*").focus(); 
		}
		this.removeEntry=function(el){ 
			$(el).remove();
		}
		this.empty=function(){
			this.listPanel.empty();
		}
		this.show=function(){ 
			me.selectedIndex=-1
			this.contentPanel.show();
		}
		this.hide=function(){
			me.selectedIndex=-1
			this.contentPanel.hide();
		} 
		this.position=function(position){
			this.contentPanel.offset({
				top:position&&position.top||$(this.element).offset().top + $(this.element).height()+5,
				left:position&&position.left||$(this.element).offset().left
			}) 
		}
		this.setElement=function(el){
			if(this.element==el)return;
			this.element = el;
			this.contentPanel.css({
				width:$(this.element).width()
			})
			this.position();
		} 
	} 
	return DropDown;
})