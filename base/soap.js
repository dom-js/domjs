define(function(require,exports,module){

    var util = require("base/util");

    var mapping = {
        "http://schemas.xmlsoap.org/wsdl/soap/": "soap",
        "http://schemas.xmlsoap.org/wsdl/": "wsdl",
        "http://schemas.xmlsoap.org/wsdl/http/": "http",
        "http://www.w3.org/2001/XMLSchema" :"xsd"
    };

    var WSDL = function WSDL(opts){

    }
    WSDL.prototype = {
        /*
         <message name="TESTABCResponse">
         <part element="impl:TESTABCReturn" name="TESTABCReturn"/>
         </message>
         <wsdl:message name="getMaterialModelOrderRequest">
         <wsdl:part name="parameters" element="tns:getMaterialModelOrder"/>
         </wsdl:message>
         <wsdl:message name="addMaterialFileRequest">
         <wsdl:part name="parameters" element="tns:addMaterialFile"/>
         </wsdl:message>
         */
        processMessages:function(){

        }
    }
    var Soap = exports = module.exports = function Soap(opts){

    }


});