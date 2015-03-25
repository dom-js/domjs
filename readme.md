DomJS Tools
=====

#概述
原在Domino 通过AMD机制对一些JS组件进行引入，部分组件针对Domino特点进行设计。随着项目js lib逐渐增多，复杂，形成Domino Js Tools。又因很多组件是Dom组件，二者合一成为今天的DomJS Tools
#依赖
Domjs 建立在[requirejs](https://github.com/jrburke/requirejs)和 [jquery](https://github.com/jquery/jquery) 基础之上，部分组件作为独立项目进行开发。 

#性能问题
由于Domino流程应用的特点，目前还无很好的打包机制，因此使用此套工具包会有大量的http连接产生，因此我们将domjs独立部署在一台服务器上如果有条件可以进行其他加速处理。对js独立文件一般都是压缩发布，未进行混淆，方便工具对异常的调试。

# 核心组件

作为针对Domino平台的前端js组件包，其核心组件主要是解决利用|Domino平台特点提供的一些针对Domino的组件。核心组件主要是避免不必要的agent代理资源的使用，通过js结合平台自身提供的现有功能或结合解决负责的前端问题。
目前在业务开发中比较复杂的一个业务选择组件（选择数据来源于指定文档表格、当前数据库视图搜索结果文档内表格、多个历史数据库的不同视图搜索结果文档表格）用到了下面大部分组件实现。
另外对企业大多都是多个Domino应用单未统一域名的情况下存在的跨域问题，工具包已经使用方式进行解决。

## global.js

依赖全集配置库，实现全集接配置支持、用户信息获取，同时实现异构系统集成domino时认证判断等处理。
  
### formula

实现通过js执行Domino的公式语言
   
### getdoc

实现通过js直接获取Domino文档对象

## appinfo.js

依赖具体应用库，formula、getdoc方法继承了global,同时提供了与具体应用库相关的配置扩展信息，如dicLookUp,dicDoc等可以方便获取通用数据配置字典表内的信息。

## docinfo.js

依赖具体应用库，用户获取具体文档对象的PlainObject结构。

### formula

继承appinfo.formula 并进行扩展，实现公式执行环境为当前doc上下文，因此docinfo.formula 更多用户获取当前文档内的信息。


## store/viewstore

实现对Domino视图读取或搜索，并转换为PlainObject对象。方便js操作已不同形式展示给用户（各类选择窗口、展示列表等）。

## widget/levelselect

实现具有层级的数据选择展示，使用Store作为数据源输入。可以进行无线层级选择，具备基本的filter功能，在使用viewstore时，可以实现各类配置信息的选择。典型应用为部门选择组件及依赖此组件实现。


## form/table
在Domino内如果一个表单内嵌入一个简单的多行表格，如果我们notes.ini内禁止html field字段保存后台字段，我们必须实现安装最大行数将动态表格在表单内绘制完成，并且通过控制因此显示的方式实现增加减少行。由于Domino Form表格绘制也是个很蹩脚的地方，当需求变化时非常麻烦。
form/table 结合Domino配置，可以通过模板（依赖$.tmplate插件）配置一个记录行（一个记录行可以有多个表格行租出），实现无限行数的表格支持（注意：由于form/table没有经过性能优化，已经domino文档的其他限制，行数一般控制在100行以内）可满足大部分需求。
domino server端也有对应的数据保存两种处理机制，可以参考流程模板的相关说明。



## di18n 
对Domino平台的国际化支持，domino平台（非Xpage）提供了配置多语言的设计元素方式，但每次变更都需要修改多个设计元素（文件），很不方便。
对requirejs i18n插件进行扩展，实现基于Domino平台的多语言支持，用户可将多语言配置在domino数据库内，并且可以按照Domino的Form和View进行配置，而无需向i18n组件需要配置独立的文件。
流程引擎模块内也进行了用户，可以根据语言配置获取不同的样式文件。
