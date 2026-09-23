sap.ui.define([], function() {
    "use strict";
    return {
        date: function(sDate) {
            var date = eval('new ' + sDate.replace(/\//gi, ''));
            return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        },

        existNoEmpty: function(objValidate, dialog) {
            let arrValidate = [];

            switch (dialog) {
                case 'MCEmpresaAgricola':
                    arrValidate.push(objValidate.fechaRecepcion);
                    break;
                case 'MCModulo':
                    arrValidate.push(objValidate.fechaRecepcion);
                    arrValidate.push(objValidate.empresaAgricola);
                    break;
                case 'MCCliente':
                    break;
                case 'MCProducto':
                    break;
                case 'MCViaje':
                    arrValidate.push(objValidate.fechaRecepcion);
                    arrValidate.push(objValidate.modulo);
                    arrValidate.push(objValidate.empresaAgricola);
                    arrValidate.push(objValidate.cliente);
                    arrValidate.push(objValidate.producto);
                    break;
                case 'MCGuia':
                    arrValidate.push(objValidate.fechaRecepcion);
                    arrValidate.push(objValidate.modulo);
                    arrValidate.push(objValidate.empresaAgricola);
                    arrValidate.push(objValidate.cliente);
                    arrValidate.push(objValidate.producto);
                    break;
                case 'BTNSAVE':
                    arrValidate.push(objValidate.fechaRecepcion);
                    arrValidate.push(objValidate.empresaAgricola);
                    arrValidate.push(objValidate.modulo);
                    arrValidate.push(objValidate.cliente);
                    arrValidate.push(objValidate.producto);
                    arrValidate.push(objValidate.viaje);
                    arrValidate.push(objValidate.guia);
                    arrValidate.push(objValidate.cantidad);
                    break;
            }

            let bNoEmpty = true;
            arrValidate.forEach(function(valor, indice, array) {
                if (valor == undefined) { bNoEmpty = false; } else if (valor == null) { bNoEmpty = false; } else if (valor == "") { bNoEmpty = false; } else if (valor <= 0) { bNoEmpty = false; }
            });

            return bNoEmpty;
        }

    };
});