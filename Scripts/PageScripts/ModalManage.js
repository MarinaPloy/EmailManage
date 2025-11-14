function AddEmail() {
    var custNumber = document.getElementById('txtCnum').value.trim();
    var siteNumber = document.getElementById('txtSnum').value.trim();
    var email = document.getElementById('txtEmail').value.trim();

    if (!custNumber || !siteNumber || !email) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    $.ajax({
        url: '/Home/AddEmail',
        type: 'POST',
        data: {
            custNumber: custNumber,
            siteNumber: siteNumber,
            email: email
        },
        success: function (resp) {
            console.log('Add response:', resp);
            $('#gridSearchEmail').datagrid('reload');
        },
        error: function (xhr) {
            alert('Add failed: ' + xhr.status);
        }
    });
}