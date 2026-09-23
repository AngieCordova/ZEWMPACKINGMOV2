sap.ui.define([
    'sap/m/MessageBox',
], function(
    MessageBox
) {
    "use strict";

    return {

        _MensajeInfo: async function(oMensaje) {
            return new Promise(resolve => {
                MessageBox.information(
                    oMensaje, {
                        styleClass: "sapUiSizeCompact",
                        onClose: function(oAction) {
                            resolve();
                        }
                    }
                )
            });
        },

        _MensajeError: async function(oMensaje) {
            return new Promise(resolve => {
                MessageBox.error(
                    oMensaje, {
                        styleClass: "sapUiSizeCompact",
                        onClose: function(oAction) {
                            resolve();
                        }
                    }
                )
            });
        },

        _MensajeExito: async function(oMensaje) {
            return new Promise(resolve => {
                MessageBox.success(
                    oMensaje, {
                        styleClass: "sapUiSizeCompact",
                        onClose: function(oAction) {
                            resolve();
                        }
                    }
                )
            });
        },

        _MensajeAdvertencia: async function(oMensaje) {
            return new Promise(resolve => {
                MessageBox.warning(
                    oMensaje, {
                        styleClass: "sapUiSizeCompact",
                        onClose: function(oAction) {
                            resolve();
                        }
                    }
                );
            });
        },

        _MensajeConfirmacion: async function(oMensaje, oTipo = "error") {
            return new Promise(resolve => {
                MessageBox[oTipo](
                    oMensaje, {
                        title: "Confirmar",
                        actions: ["Cancelar", "CONFIRMAR"],
                        styleClass: "sapUiSizeCompact",
                        onClose: function(oAction) {
                            var oConfirmar = oAction == "CONFIRMAR" ? true : false;
                            resolve(oConfirmar);
                        }
                    }
                )
            });
        },

        _TratarError: function(oErrorResponse) {
            var sMessage = "";
            try {
                var errorResponse = oErrorResponse.responseText;
                if (errorResponse) {
                    var oJson = JSON.parse(errorResponse);
                    var oError = oJson.error;
                    if (oError) {
                        var oInner = oError.innererror;
                        if (oInner) {
                            var oDetails = oInner.errordetails;
                            if (oDetails.length > 0) {
                                oDetails.forEach(d => {
                                    if (d.message.includes("Internal error occurred, contact your system administrator")) return;
                                    sMessage += d.message + "\n";
                                });
                            } else {
                                sMessage = oError.message.value;
                            }
                        } else {
                            var oMessageError = oError.message;
                            var sValue = oMessageError.value;
                            if (sValue) {
                                sMessage = sValue;
                            }
                        }
                    }
                }
                if (!sMessage) throw true;
            } catch (e) {
                sMessage = "Ocurrio un error en la busqueda de pallets.";
            }

            return this._MensajeError(sMessage);
        }
    };
});