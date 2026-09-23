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
                        actions: ["Cancelar", "Continuar"],
                        emphasizedAction: "Continuar",
                        styleClass: "sapUiSizeCompact",
                        onClose: function(oAction) {
                            var oConfirmar = oAction == "Continuar" ? true : false;
                            resolve(oConfirmar);
                        }
                    }
                )
            });
        }
    };
});