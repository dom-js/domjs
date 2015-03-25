define(
    [ "jquery" ],
    function($) {

        var parserCells=function(dom,flag){

            var tdDom = $(dom)   ,  cell ={},text ="",html=""
            if(tdDom.attr("colspan")&&tdDom.attr("colspan")>1||flag){
                cell.colspan =  tdDom.attr("colspan") -0
                cell.iscategroy = true
                var _catetdDom = tdDom.find("table td") ,expendurl,expendinfo,expendkey
                if(_catetdDom.length==2){
                    expendurl = _catetdDom.filter(":first").find("a[href]").attr("href")
                    text =     _catetdDom.filter(":last").text()
                }else{
                    expendurl = tdDom.find("a[href]").attr("href")
                    text =     tdDom.text()
                }
                var expendinfo = expendurl && expendurl.match(/[(expand)(Collapse)]=([\.\d]+)/)

                if(expendinfo&&expendinfo.length==2){
                    expendkey = expendinfo[1]
                    cell.expandkey = expendkey
                    cell.expandurl = expendurl
                    cell.catelevel=expendkey.split(".").length-1
                    cell.catecolumn = true
                }
                html = text

            }  else{
                // 处理文档链接
                //tdDom.find("img[src='/icons/ecblank.gif']").remove()
                tdDom.find("img[src*=\"/icons/ecblank.gif\"]").remove()
                var linkdom = tdDom.find("a[href]")
                var href =""

                linkdom.each(function(i,a){
                    if(!$(a).attr("custom")){

                        hrefinfo = a.href.match(/\:\/\/([^\/]*)(.*\.nsf\/)([^\/]+)(\?openview).*(expand=\d+)/i)
                        //http://develop.xxx.com.cn/xxx/bxg/BomApply_New.nsf/EndBySerial?OpenView&Start=1&Count=60&Expand=3&ResortDescending=0#3
                        if(hrefinfo){
                            var url = a.href.replace(/(^.*\:\/\/[^\/]*.*\.nsf\/[^\/]+\?openview&Start=)[\.\d\#]+(&count=)[\.\d\#]+(&expand=)(\d+)#\d+$/i,function(o,base,count,expand,position){
                                return base+position+".1"+count+"1"+expand+position
                            })
                            cell.duplicate = new $.Deferred()
                            $.ajax(url).done(function(data){
                                data = data.replace(/\n/,"")
                                var tempArr = (/<\/th><\/tr>\s*(<tr.*(?!<\/tr>)(<a\s+href="([^"]+)[^>]+>))/gi).exec(data)
                                if(tempArr&&tempArr[4]){
                                    cell.duplicate.resolve(tempArr[4])
                                }else{
                                    cell.duplicate.reject("")
                                }
                            }).fail(cell.duplicate.reject(""))
                            $(a).remove()
                        }else{
                            try{
                                cell. unid = a.href.match(/\/([A-z0-9]{32})\/?\?[(open)|(edit)]/i)[1]
                                cell. docurl =  a.href
                            }catch(e){
                            }

                        }
                    }
                    linkdom = null,

                        delete  linkdom
                })

                text = tdDom.text()
                html = text==""&&tdDom.find("table").length==1?"":tdDom.html()
                // &&tdDom.find("img").length==0
                if(href!="") {
                    cell.doclink = href
                    html = tdDom.text()
                }

            }
            cell.html = html
            cell.text = text
            tdDom = null,dom =null
            delete  tdDom  ,dom
            return cell
        }

        var forCell=function(j,opts,tds,item,colindex){
            //  console.log(j+( item._colspan-1||0))
            //  console.log(j-1+( item._colspan-1||1),opts.layout[j-1+( item._colspan-1||1)])
            var layout = opts.layout[colindex]
            var cell = parserCells( tds[j],item._iscategroy)

            item[layout.name] = cell.text
            if(cell.html&&cell.text!=cell.html)
                item[layout.name+"_html"] = cell.html


            if(cell.colspan){
                item._colcolspan.push(cell.colspan)
                for(var n=1;n<cell.colspan;n++){
                    item._colcolspan.push(0)
                }
            }else{
                item._colcolspan.push(1)
            }
            //console.log(cell.iscategroy)
            if(cell.iscategroy&&!item._iscategroy){
                // item._colspan = cell.colspan
                item._iscategroy = cell.iscategroy

            }
            if(cell.iscategroy&&cell.catecolumn){
                item._catecolumn = colindex;
                item._position = cell.expandkey
                item._expandurl = cell.expandurl
                item._catelevel =cell.catelevel  -colindex
            }
            if(cell.docurl&&!item._docurl){
                item._docurl = cell.docurl
            }
            if(cell.unid&&!item._unid){
                item._unid = cell.unid
            }
            if(cell.href){
                item[layout.name+"_href"] = cell.href
            }

            j++
        }
        var forRow=function(i,trs,opts,collen,level,laylen,result){

            var tr = $(trs[i]),tds,item = {} ,filterStr=[]  ,colindex=0
            if( tr.find(">td").length<collen) return null
            if(opts.isQuery){
                filterStr.push(">td:first")
            }
            if(level>1){
                filterStr.push(">td:last")
            }
            if(filterStr.length>0)  tr.find(filterStr.join(",")).remove()
            tds   = tr.find(">td")

            item._colcolspan=[]

            for( var j=0;j<Math.min(collen,laylen);j++){
                if(j+( item._colspan-1||0)>=laylen) break;
                colindex = item._colcolspan.length

                if(colindex>=laylen) break;
                //  console.log(colindex)
                //colindex = j+( item._colspan-1||0)
                forCell(j,opts,tds,item,colindex)

            }
            if(i>0 &&  item._catelevel!=result[0]._catelevel) return false
            cell = null
            delete  cell
            result.push(item)

            return item
        }
        var workerFor = function(n,length,fn,obj){
            var deferred = this.then?this:new $.Deferred()
            if(n<length){
                var args1 = Array.prototype.slice.call(arguments, 4)
                args1 = [n].concat(args1)
                var item =fn.apply(obj,args1)
                if(item==false){
                    deferred.resolve()
                }else{
                    var args2 = Array.prototype.slice.call(arguments, 0);
                    setTimeout(function(){
                        args2[0]++

                        workerFor.apply(deferred,args2)
                    },1)
                }

            }else{
                deferred.resolve()
            }
            return deferred
        }
        var initTotal = {}
        var getTotal = function(baseurl,key){
            var url =baseurl+key
            if(initTotal[key])return initTotal[key]
            return $.get(url+"&endview&count=1").pipe(function(data){
                data=data.replace(/\n/gi,"")
                data = data.match(/<body[^\n]*<\/body>/gi)[0].replace(/<script[^>]*><\/script>/gi,"")//.replace(/<script.*(?=<\/script>)<\/script>/gi,"")
                data = data.replace(/class="[^"]*"/gi,"").replace(/<img[^>]*>/gi,"")
                return initTotal[key] =parseInt($(data).find("#viewStart").text())
            })
        }
        var adapter = function(data,opts) {

            var deferred = new $.Deferred()
            var __time__=(new Date()).getTime()

            // data=data.match(/<body((.*)|(\n))*<\/body>/)
            var totalurlbase =data.match(/url="(.*&Click=)"/)
            if(totalurlbase&&totalurlbase[1]){
                totalurlbase=totalurlbase[1]
            }
            data=data.replace(/\n/gi,"");
            data = data.match(/<body([\s\S](?!\/body))*<\/body>/gi)[0].replace(/<script([\s\S](?!\/script))*<\/script>/gi,"");

            // data = data.match(/<body[^\n]*<\/body>/gi)[0].replace(/<script[^>]*><\/script>/gi,"")//.replace(/<script.*(?=<\/script>)<\/script>/gi,"")
            data = data.replace(/class="[^"]*"/gi,"") //.replace(/<img[^>]*>/gi,"")
            var body = $(data),viewTotal

            if(body.find("#idgetendpage").length==1&&totalurlbase){
                try{

                    viewTotal=getTotal(totalurlbase,body.find("#idgetendpage").attr("onclick").match(/\('(.*)'./)[1])
                }catch(e){
                    viewTotal = parseInt(body.find("#viewTotal").text())
                }

            }else{
                viewTotal=parseInt(body.find("#viewTotal").text())
            }
            var _depend = body.find("th:first");

            if(_depend.length==0) return []

            var trs = _depend.parent().parent().find(">tr:gt(0)")
            if(trs.length==0) return []
            var result = []
            try{
                var strHTML,arrHTML,arrHTMLTD,arrHeads,arrHeadColumn,arrRows,arrCells,strSplit = (new Date()).getTime();
                var depth= 0,level=1
                var leveltd = trs.filter(":first").find("td[colspan]")
                if(leveltd.length>0){
                    level
                }

                var level = trs.filter(":first").find(">td[colspan]").attr("colspan") || 1

                var laylen =  opts.layout.length

                var collen =  trs.filter(":first").find(">td").length

                workerFor(0,trs.length,forRow,this,trs,opts,collen,level,laylen,result).then(function(){
                    result.total = viewTotal
                    deferred.resolve(result)
                })
            }catch(e){
                deferred.reject(e)
            }
            data = null,_depend=null,trs = null
            delete _depend ,  data ,trs
            //result .total=result.length


            return  deferred
        };
        return adapter
    });
