; (function ($) {

    $.pikkyutils = function () {

        var plugin = this;

        plugin.successAlert = function (m) {
            Swal.fire({
                html: '<div class="mt-3"><lord-icon src="https://cdn.lordicon.com/lupuorrc.json" trigger="loop" colors="primary:#0ab39c,secondary:#405189" style="width:120px;height:120px"></lord-icon><div class="mt-4 pt-2 fs-15"><h4>' + m.title + '</h4><p class="text-muted mx-4 mb-0">' + m.text + '</p></div></div>',
                showCancelButton: false,
                showCloseButton: true
            });
        };

        plugin.errorAlert = function (m) {
            Swal.fire({
                html: '<div class="mt-3"><lord-icon src="https://cdn.lordicon.com/tdrtiskw.json" trigger="loop" colors="primary:#f06548,secondary:#f7b84b" style="width:120px;height:120px"></lord-icon><div class="mt-4 pt-2 fs-15"><h4>Oops...! Something went Wrong !</h4><p class="text-muted mx-4 mb-0">' + m.text + '</p></div></div>',
                showCancelButton: false,
                showCloseButton: true
            });
        };

        plugin.warningAlert = function (m) {
            Swal.fire({
                html: '<div class="mt-3"><lord-icon src="https://cdn.lordicon.com/zpxybbhl.json" trigger="loop" colors="primary:#f7b84b,secondary:#f06548" style="width:100px;height:100px"></lord-icon><div class="mt-4 pt-2 fs-15 mx-5"><h4>' + m.title + '</h4><p class="text-muted mx-4 mb-0">' + m.text + ' ?</p></div></div>',
                showCancelButton: true,
                showCloseButton: true,
                confirmButtonText: m.btnConfirmText,
                cancelButtonText: m.btnCancelText,
                confirmButtonColor: '#f06548', // เปลี่ยนสีปุ่มยืนยันตามต้องการ
                cancelButtonColor: '#d33', // เปลี่ยนสีปุ่มยกเลิกตามต้องการ
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then((result) => {
                if (result.isConfirmed) {
                    callFunction(m.OkCallback);
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    callFunction(m.CancelCallback);
                }
            });
        };

        plugin.init = function () {
            return plugin;
        };

        plugin.success = function (m) {
            Swal.fire({
                icon: 'success',
                title: m.title,
                showConfirmButton: false,
                timer: 1500
            });
        };
        plugin.warning = function (m) {

            Swal.fire({
                title: m.title,
                text: m.text,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ok'
            }).then((result) => {
                if (result.isConfirmed) {
                    callFunction(m.OkCallback);
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    callFunction(m.CancelCallback);
                }
            })
        };
        plugin.confirm = function (m) {
            Swal.fire({
                title: m.title,
                text: m.text,
                html: m.html,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ok',
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then((result) => {
                if (result.isConfirmed) {
                    callFunction(m.OkCallback);
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    callFunction(m.CancelCallback);
                }
            })
        };
        plugin.info = function (m) {
            Swal.fire({
                title: m.title,
                text: m.text,
                icon: 'info',
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ok'
            }).then((result) => {
                if (result.isConfirmed) {
                    callFunction(m.OkCallback);
                }
            })
        };
        plugin.input = function (m) {
            Swal.fire({
                title: m.title,
                input: m.input_type,
                inputAttributes: m.inputAttributes,
                //inputAttributes: {
                //    autocapitalize: 'off'
                //},
                inputValue: m.inputValue,
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                preConfirm: (data) => {
                    if (m.required && data.trim() == '') {
                        Swal.showValidationMessage(
                            `Cannot empty`
                        )
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    callFunctionWithValue(m.OkCallback, result);
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    callFunctionWithValue(m.CancelCallback, result);
                }
            })
        }
        plugin.htmlinput = function (m) {
            Swal.fire({
                title: m.title,
                html: m.html,
                inputAttributes: m.inputAttributes,
                inputValue: m.inputValue,
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                preConfirm: (data) => {
                    if (m.input_id)
                        data = $('#' + m.input_id).val()
                    if (m.required && data.trim() == '') {
                        Swal.showValidationMessage(
                            `Cannot empty`
                        )
                    }
                }
            }).then((result) => {
                result.value = $('#' + m.input_id).val()
                if (result.isConfirmed) {
                    callFunctionWithValue(m.OkCallback, result);
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    callFunctionWithValue(m.CancelCallback, result);
                }
            })
        }
        plugin.noitfy = function (m) {
            new PNotify({
                title: m.title,
                icon: 'icofont icofont-info-circle',
                type: m.type
            });
        };
        plugin.notifywarning = function (m) {
            new jBox('Notice', {
                stack: false,
                animation: {
                    open: 'tada',
                    close: 'zoomIn'
                },
                color: 'yellow',
                title: "Warning",
                content: m.text,
                autoClose: m.autoclose ? m.autoclose : 100000,
                onClose: function () {
                    callFunction(m.onclose);
                }
            });
        }
        plugin.notifysuccess = function (m) {
            new jBox('Notice', {
                stack: false,
                animation: {
                    open: 'tada',
                    close: 'zoomIn'
                },
                color: 'green',
                title: "Success",
                content: m.content,
                autoClose: m.autoclose ? m.autoclose : 30000,
                onClose: function () {
                    callFunction(m.onclose);
                }

            });
        }
        plugin.notifyError = function (m) {
            new jBox('Notice', {
                stack: false,
                animation: {
                    open:'tada',
                    close:'zoomIn'
                },
                color: 'red',
                title: 'Error !',
                content: m.text,
                autoClose: m.autoClose ? m.autoClose : 30000,
                onClose: function () {
                    callFunction(m.onclose);
                }
            });
        }
        plugin.required = function (cssname) {
            var returnreq = true;
            cssname.map(m => {
                $.each($(m), function () {
                    var intput_class = $(this).attr('class')
                    if ($(this).val().trim() == '') {
                        if (intput_class.includes('easyui-datetimeboxs') || intput_class.includes('combobox-f combo-f textbox-f')) {
                            $(this).next().attr('style', 'border-bottom: 1px solid #fe5d70');
                        } else {
                            $(this).attr('style', 'border-bottom: 1px solid #fe5d70');
                        }
                        returnreq = false;
                    } else {
                        if (intput_class.includes('easyui-datetimeboxs') || intput_class.includes('combobox-f combo-f textbox-f')) {
                            $(this).next().css('border-bottom', '');
                        } else {
                            $(this).css('border-bottom', '');
                        }
                    }
                })
            });

            if (!returnreq) {
                new jBox('Notice', {
                    stack: false,
                    animation: {
                        open: 'tada',
                        close: 'zoomIn'
                    },
                    color: 'yellow',
                    title: "Warning",
                    content: 'Please check the required field before saving.'
                });

            }


            return returnreq;
        }
        plugin.clearrequired = function (id) {
            var intput_class = $(id).attr('class')
            if (intput_class.includes('easyui-datetimeboxs')) {
                $(id).next().css('border-bottom', '');
            } else {
                $(id).css('border-bottom', '');
            }
        }
        // เพิ่ม function อื่น ๆ ตามที่ต้องการ

        //Private function
        var callFunction = function (f) {
            if (f != undefined) {
                return f();
            }
        };

        return plugin.init();
    };

})(jQuery);
