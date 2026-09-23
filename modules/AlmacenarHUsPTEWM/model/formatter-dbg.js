sap.ui.define([], function() {
    "use strict";
    return {
        date: function(sDate) {
            console.log("sDate");
            console.log(sDate);
            var date = eval('new ' + sDate.replace(/\//gi, ''));
            return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        },

        txtMsgInfoHUs: function(msg) {
            return (msg != "") ? "Comentario: " + msg : "";
        },

        visibleMsgInfoHUs: function(msg) {
            return (msg != "") ? true : false;
        },

        parseInt: function(msg) {
            return parseInt(msg);
        },
        //Inicio-SCH      
        concatenateZero: function(valueID2) {
            
        	if ( valueID2 !== null ) {
	            var length = valueID2.toString().length; /* Largo del número */ 
	            var zero = "0";                          /* String de cero */                         
	            valueID2 = (zero.repeat(20 - length)) + valueID2.toString();
	            return valueID2;         
        	}
        },            
        
        //Fin-SCH

    };
});