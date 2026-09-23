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

        _MostrarMensajesReturn: async function(oResults) {
            var oExisteError = false;
            var oErrorMessage = "";
            var oInfoMessage = "";
            var oWarningMessage = "";
            var oSuccessMessage = "";

            oResults.forEach(r => {
                var oStatus = r.Type;
                var oMessage = r.Message;

                switch (oStatus) {
                    case 'E':
                        oErrorMessage += '- ' + oMessage + '\n';
                        break;
                    case 'I':
                        oInfoMessage += '- ' + oMessage + '\n';
                        break;
                    case 'W':
                        oWarningMessage += '- ' + oMessage + '\n';
                        break;
                    case 'S':
                        oSuccessMessage += '- ' + oMessage + '\n';
                        break;
                    default:
                        break;
                }
            });


            if (oInfoMessage) {
                await this._MensajeInfo(oInfoMessage);
            }

            if (oWarningMessage) {
                await this._MensajeAdvertencia(oWarningMessage);
            }

            if (oErrorMessage) {
                oExisteError = true;
                await this._MensajeError(oErrorMessage);
            }

            if (oSuccessMessage) {
                await this._MensajeExito(oSuccessMessage)
            }

            return oExisteError;
        },

        mostrarMensajesHeader: async function(oHeaderResponse) {
            try {
                var oHeaderObject = oHeaderResponse.headers["sap-message"];
            } catch (e) {
                return;
            }

            var oExistError = false;

            var oMessage = false;
            var oErrorMessage = false;
            var oInfoMessage = false;
            var oWarningMessage = false;
            var oSuccessMessage = false;
            var valNoRepeat = -1;

            if (oHeaderObject) {
                var oHeader = JSON.parse(oHeaderObject);
                if (oHeader) {
                    oErrorMessage = '';
                    oInfoMessage = '';
                    oWarningMessage = '';
                    oSuccessMessage = '';
                    valNoRepeat = -1;
                    if (oHeader["message"]) {
                        oMessage = oHeader.message;
                        var oSeverity = oHeader.severity;
                        switch (oSeverity) {
                            case 'error':
                                oExistError = true;
                                valNoRepeat = oErrorMessage.toLowerCase().indexOf(oMessage.toLowerCase());
                                if (valNoRepeat === -1) {
                                    oErrorMessage += '- ' + oMessage + '\n';
                                }
                                break;
                            case 'info':
                                valNoRepeat = oInfoMessage.toLowerCase().indexOf(oMessage.toLowerCase());
                                if (valNoRepeat === -1) {
                                    oInfoMessage += '- ' + oMessage + '\n';
                                }
                                break;
                            case 'warning':
                                valNoRepeat = oWarningMessage.toLowerCase().indexOf(oMessage.toLowerCase());
                                if (valNoRepeat === -1) {
                                    oWarningMessage += '- ' + oMessage + '\n';
                                }
                                break;
                            case 'success':
                                valNoRepeat = oSuccessMessage.toLowerCase().indexOf(oMessage.toLowerCase());
                                if (valNoRepeat === -1) {
                                    oSuccessMessage += '- ' + oMessage + '\n';
                                }
                                break;
                            default:
                                break;
                        }
                    }
                    if (oHeader.details.length > 0) {
                        var oDetalles = oHeader.details;
                        oDetalles.forEach(detalle => {
                            if (!detalle.message) return;
                            if (detalle.severity == "error") {
                                oExistError = true;
                                valNoRepeat = oErrorMessage.toLowerCase().indexOf(detalle.message.toLowerCase());
                                if (valNoRepeat === -1) {
                                    oErrorMessage += '- ' + detalle.message + '\n';
                                }
                            } else if (detalle.severity == "info") {
                                valNoRepeat = oInfoMessage.toLowerCase().indexOf(detalle.message.toLowerCase());
                                if (valNoRepeat === -1) {
                                    oInfoMessage += '- ' + detalle.message + '\n';
                                }
                            } else if (detalle.severity == "warning") {
                                valNoRepeat = oWarningMessage.toLowerCase().indexOf(detalle.message.toLowerCase());
                                if (valNoRepeat === -1) {
                                    oWarningMessage += '- ' + detalle.message + '\n';
                                }
                            } else {
                                valNoRepeat = oSuccessMessage.toLowerCase().indexOf(detalle.message.toLowerCase());
                                if (valNoRepeat === -1) {
                                    oSuccessMessage += '- ' + detalle.message + '\n';
                                }
                            }
                        });
                    }
                }
            }

            if (oInfoMessage) {
                await this._MensajeInfo(oInfoMessage);
            }

            if (oWarningMessage) {
                await this._AbrirMensajeWarning(oWarningMessage);
            }

            if (oErrorMessage) {
                await this._MensajeError(oErrorMessage);
            }

            if (oSuccessMessage) {
                await this._MensajeExito(oSuccessMessage);
            }

            return oExistError;
        }
    };
});