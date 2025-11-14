window.onload = (event) => {
    getTableCus();
    getTableEmail();
};

var ck = 1;

document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    document.querySelectorAll('#txtCnum,#txtSnum').forEach(el => {
        el.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                ck++;
                loadData();
            }
        });
    });

    document.getElementById('btnSearch').addEventListener('click', function () {
        ck += 1;
        loadData();
    });

    getTableCus();
});

function loadData() {
    if (ck > 1) {
        console.log('Loading data...');
        $('#gridSearchCus').datagrid('options').url = gridSearchCus_Url;
        $('#gridSearchCus').datagrid('load', {
            Cnum: document.getElementById('txtCnum').value.trim(),
            Snum: document.getElementById('txtSnum').value.trim(),
            Cname: document.getElementById('txtCname').value.trim(),

        });
    }
}

function getTableCus() {
    console.log('Initializing datagrid...');
    $('#gridSearchCus').datagrid({
        fitColumns: false,
        singleSelect: true,
        checkOnSelect: false,
        selectOnCheck: false,
        pagination: true,
        sortName: 'customer_number',
        sortOrder: 'asc',
        columns: [[
            { field: 'customer_number', title: 'Customer Number', width: '8%', align: 'center', sortable: true },
            { field: 'site_number', title: 'Site Number', width: '8%', align: 'center', sortable: true },
            { field: 'customer_name', title: 'Customer Name', width: '20%', align: 'left', sortable: true },
            { field: 'address1', title: 'Address 1', width: '15%', align: 'left', sortable: true },
            { field: 'address2', title: 'Address 2', width: '10%', align: 'left', sortable: true },
            { field: 'address3', title: 'Address 3', width: '10%', align: 'left', sortable: true },
            { field: 'address4', title: 'Address 4', width: '10%', align: 'left', sortable: true },
            { field: 'city', title: 'City', width: '10%', align: 'left', sortable: true },
            { field: 'postal_code', title: 'Postal Code', width: '9%', align: 'center', sortable: true }
        ]],
        emptyMsg: '<p class="fs-18"><i class="text-danger ri-search-line fs-18"></i> Please press the search button to display the information.</p>',
        onClickRow: function (index, row) {
            populateSingleRecordForm(row);
        }
    });

    $('#gridSearchCus').datagrid('getPager').pagination({
        layout: ['list', 'sep', 'first', 'prev', 'sep', 'links', 'sep', 'next', 'last', 'sep', 'info']
    });
}

function populateSingleRecordForm(row) {
    if (!row) return;
    const map = {
        CustomerNumber: row.customer_number,
        SiteNumber: row.site_number,
        CustomerName: row.customer_name,
        Address1: row.address1,
        Address2: row.address2,
        Address3: row.address3,
        Address4: row.address4,
        City: row.city,
        PostalCode: row.postal_code
    };
    Object.entries(map).forEach(([name, value]) => {
        const input = document.querySelector("#singleRecordForm [name='" + name + "']");
        if (input) input.value = value ?? '';
    });
    loadDataEmail();
    document.getElementById("btnAddEmail").hidden = false;
}

function loadDataEmail() {
    const form = document.getElementById('singleRecordForm') || document;
    const cnum = form.querySelector("[name='CustomerNumber']")?.value.trim() || '';
    const snum = form.querySelector("[name='SiteNumber']")?.value.trim() || '';

    if (!cnum || !snum) {
        console.warn('CustomerNumber or SiteNumber is empty. Email grid load skipped.');
        return;
    }

    console.log('Loading email data for:', cnum, snum);
    $('#gridSearchEmail').datagrid('options').url = gridSearchEmail_Url;
    $('#gridSearchEmail').datagrid('load', {
        Cnum: cnum,
        Snum: snum
    });
}

function getTableEmail() {
    console.log('Initializing email datagrid...');
    $('#gridSearchEmail').datagrid({
        fitColumns: false,
        singleSelect: true,
        checkOnSelect: false,
        selectOnCheck: false,
        pagination: true,
        sortName: 'cust_number',
        sortOrder: 'asc',
        columns: [[
            { field: 'CON_RECID', title: 'Record ID', width: '6%', align: 'center', sortable: true },
            { field: 'cust_number', title: 'Customer Number', width: '9%', align: 'center', sortable: true },
            { field: 'site_number', title: 'Site Number', width: '9%', align: 'center', sortable: true },
            { field: 'email_taxinv', title: 'Tax Invoice Email', width: '28%', align: 'left', sortable: true },
            { field: 'created_by', title: 'Created By', width: '9%', align: 'left', sortable: true },
            { field: 'created_date', title: 'Created Date', width: '11%', align: 'center', sortable: true },
            { field: 'changed_by', title: 'Changed By', width: '9%', align: 'left', sortable: true },
            { field: 'changed_date', title: 'Changed Date', width: '11%', align: 'center', sortable: true },
            {
                field: 'manage',
                title: 'Manage',
                width: '10%',
                align: 'center',
                sortable: false,
                formatter: function (value, row, index) {
                    var recid = encodeURIComponent(row.CON_RECID);
                    var cust = encodeURIComponent(row.cust_number);
                    var site = encodeURIComponent(row.site_number);
                    var emails = encodeURIComponent(row.email_taxinv || '');
                    return '' +
                        '<a class="me-2" onclick="editEmailRecord(\'' + recid + '\', \'' + cust + '\', \'' + site + '\', \'' + emails + '\')" title="Edit">' +
                        '<i class="ri-edit-2-fill fs-18 text-primary"></i>Edit</a>' +
                        '<a class="text-danger" onclick="deleteEmailRecord(\'' + recid + '\')" title="Delete">Delete</a>';
                }
            }
        ]],
        emptyMsg: '<p class="fs-18"><i class="text-danger ri-search-line fs-18"></i> Please press the search button to display the information.</p>'
    });

    $('#gridSearchEmail').datagrid('getPager').pagination({
        layout: ['list', 'sep', 'first', 'prev', 'sep', 'links', 'sep', 'next', 'last', 'sep', 'info']
    });
}

// --- Modal email management ---
var emailModalMode = 'Add';

function clickAddEmail() {
    const cnum = document.querySelector("#singleRecordForm [name='CustomerNumber']")?.value.trim();
    const snum = document.querySelector("#singleRecordForm [name='SiteNumber']")?.value.trim();
    if (!cnum || !snum) {
        alert('Please select a customer first.');
        return;
    }
    emailModalMode = 'Add';
    document.getElementById('emailModalTitle').textContent = 'Add';
    document.getElementById('emailMode').value = 'Add';
    document.getElementById('modalCustomerNumber').value = cnum;
    document.getElementById('modalSiteNumber').value = snum;
    const conRecidInput = document.getElementById('modalConRecid');
    if (conRecidInput) conRecidInput.value = '';
    buildEmailInputs([]);
    $('#ManageEmail').modal('show');
    updateSaveButtonState();
    refreshRemoveButtons();
}

function editEmailRecord(recidEnc, custNumberEnc, siteNumberEnc, emailsEnc) {
    const recid = decodeURIComponent(recidEnc);
    const custNumber = decodeURIComponent(custNumberEnc);
    const siteNumber = decodeURIComponent(siteNumberEnc);
    const rawEmails = decodeURIComponent(emailsEnc || '');

    emailModalMode = 'Edit';
    document.getElementById('emailModalTitle').textContent = 'Edit';
    document.getElementById('emailMode').value = 'Edit';
    document.getElementById('modalCustomerNumber').value = custNumber;
    document.getElementById('modalSiteNumber').value = siteNumber;
    const conRecidInput = document.getElementById('modalConRecid');
    if (conRecidInput) conRecidInput.value = recid;

    let list = [];
    if (rawEmails) {
        list = rawEmails.split(/[,;\r\n]+/).map(e => e.trim()).filter(e => e.length > 0);
    }
    buildEmailInputs(list.length ? list : ['']);
    $('#ManageEmail').modal('show');
    updateSaveButtonState();
    refreshRemoveButtons();
}

function buildEmailInputs(emails) {
    const container = document.getElementById('emailList');
    container.innerHTML = '';
    emails.forEach((email, idx) => container.appendChild(createEmailInputRow(email, idx)));
    if (emails.length === 0) container.appendChild(createEmailInputRow('', 0));
    updateSaveButtonState();
    refreshRemoveButtons();
}

function createEmailInputRow(value, idx) {
    const div = document.createElement('div');
    div.className = 'input-group mb-2 email-row';
    const removeBtnHtml = idx === 0
        ? `<button type="button" class="btn btn-outline-secondary" title="Cannot remove the first email" disabled>&times;</button>`
        : `<button type="button" class="btn btn-outline-danger" onclick="removeEmailRow(this)" title="Remove">&times;</button>`;
    div.innerHTML = `
        <input type="text"
               class="form-control email-input"
               placeholder="example@domain.com (comma / semicolon / newline to split multiple)"
               value="${value}"
               autocomplete="off"
               inputmode="email"
               aria-label="Email"
               oninput="onEmailInput(this)"
               onblur="onEmailBlur(this)">
        ${removeBtnHtml}
    `;
    return div;
}

function onEmailInput(input) {
    // Split immediately if user typed a delimiter
    if (/[,\r\n;]/.test(input.value)) {
        splitAndReplace(input);
    } else {
        validateEmailField(input);
        updateSaveButtonState();
    }
}

function onEmailBlur(input) {
    splitAndReplace(input);
    validateEmailField(input);
    updateSaveButtonState();
}

function splitAndReplace(input) {
    const raw = input.value;
    if (!/[,\r\n;]/.test(raw)) return; // nothing to split
    const parts = raw.split(/[,;\r\n]+/).map(p => p.trim()).filter(Boolean);
    if (parts.length <= 1) return;

    // First part stays in current input
    input.value = parts[0];
    validateEmailField(input);

    const container = document.getElementById('emailList');
    let afterNode = input.closest('.email-row');
    for (let i = 1; i < parts.length; i++) {
        const newRow = createEmailInputRow(parts[i], container.children.length);
        afterNode.after(newRow);
        afterNode = newRow;
        validateEmailField(newRow.querySelector('.email-input'));
    }
    refreshRemoveButtons();
}

function refreshRemoveButtons() {
    const rows = Array.from(document.querySelectorAll('#emailList .email-row'));
    rows.forEach((row, idx) => {
        const btn = row.querySelector('button');
        if (!btn) return;
        if (idx === 0) {
            btn.disabled = true;
            btn.title = 'Cannot remove the first email';
            btn.classList.remove('btn-outline-danger');
            btn.classList.add('btn-outline-secondary');
            btn.removeAttribute('onclick');
        } else {
            btn.disabled = false;
            btn.title = 'Remove';
            btn.classList.add('btn-outline-danger');
            btn.classList.remove('btn-outline-secondary');
            btn.setAttribute('onclick', 'removeEmailRow(this)');
        }
    });
}

function validateEmailField(input) {
    const val = input.value.trim();
    if (!val) {
        input.classList.add('is-invalid');
        return;
    }
    if (!isValidEmail(val)) {
        input.classList.add('is-invalid');
    } else {
        input.classList.remove('is-invalid');
    }
}

function isValidEmail(email) {
    // Basic RFC style: local part: allowed chars; domain: one or more labels separated by dot;
    // final TLD: at least 2 alpha characters. Hyphens allowed inside labels (not start/end enforced here).
    // Examples that will be VALID: twt@we.df, qw@er.fdg, qdq@gfg.fg, 555555555555@eef.sdfsdf
    // Examples INVALID: a@b.c (TLD too short), name@-abc.com (leading hyphen), name@abc-.com (trailing hyphen), name@abc..com (double dot)
    const re = /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/;
    if (!re.test(email)) return false;
    // Extra optional checks (avoid label starting/ending with hyphen and consecutive dots)
    const domain = email.split('@')[1];
    if (domain.includes('..')) return false;
    const labels = domain.split('.');
    return labels.every(l => l.length && !/^[-].|.+[-]$/.test(l) ? !(/^-|-$/.test(l)) : true) &&
           labels.every(l => !l.startsWith('-') && !l.endsWith('-'));
}

function addEmailInput() {
    // Allow adding even if some invalid? Requirement: can add only when all valid.
    if (!allEmailsValid()) {
        alert('Please fix invalid email(s) before adding a new field.');
        return;
    }
    const container = document.getElementById('emailList');
    container.appendChild(createEmailInputRow('', container.children.length));
    updateSaveButtonState();
    refreshRemoveButtons();
}

function removeEmailRow(btn) {
    const row = btn.closest('.email-row');
    const container = document.getElementById('emailList');
    const idx = Array.from(container.children).indexOf(row);
    if (idx === 0) {
        alert('The first email cannot be removed.');
        return;
    }
    row.remove();
    if (container.children.length === 0) container.appendChild(createEmailInputRow('', 0));
    updateSaveButtonState();
    refreshRemoveButtons();
}

function allEmailsValid() {
    const inputs = Array.from(document.querySelectorAll('#emailList .email-input'));
    if (inputs.length === 0) return false;
    return inputs.every(i => {
        const v = i.value.trim();
        return v.length > 0 && isValidEmail(v);
    });
}

function updateSaveButtonState() {
    const saveBtn = document.getElementById('btnSaveEmail');
    if (!saveBtn) return;
    saveBtn.disabled = !allEmailsValid();
}

// Save handler (Add or Edit)
function saveEmail() {
    const saveBtn = document.getElementById('btnSaveEmail');
    if (saveBtn && saveBtn.disabled) {
        alert('Please enter valid emails before saving.');
        return;
    }

    // Final normalization (split any remaining delimiters)
    document.querySelectorAll('#emailList .email-input').forEach(inp => {
        splitAndReplace(inp);
        validateEmailField(inp);
    });

    if (!allEmailsValid()) {
        alert('Please correct invalid emails before saving.');
        return;
    }

    const mode = document.getElementById('emailMode').value;
    const custNumber = document.getElementById('modalCustomerNumber').value.trim();
    const siteNumber = document.getElementById('modalSiteNumber').value.trim();
    const conRecidRaw = document.getElementById('modalConRecid')?.value.trim() || '';

    const emails = Array.from(document.querySelectorAll('#emailList .email-input'))
        .map(i => i.value.trim())
        .filter(v => v.length > 0);

    if (emails.length === 0) {
        alert('Please provide at least one email.');
        return;
    }

    if (mode === 'Add') {
        const payload = {
            cust_number: parseInt(custNumber, 10),
            site_number: parseInt(siteNumber, 10),
            email_taxinv: emails.join(';')
        };
        $.ajax({
            url: AddEmail,
            type: 'POST',
            data: payload,
            success: function (resp) {
                if (resp.success) {
                    $('#ManageEmail').modal('hide');
                    $('#gridSearchEmail').datagrid('reload');
                } else {
                    alert('Add failed: ' + (resp.error || 'unknown'));
                }
            },
            error: function (xhr) {
                alert('Add failed: ' + xhr.status);
            }
        });
    } else {
        const conRecid = parseInt(conRecidRaw, 10);
        if (isNaN(conRecid) || conRecid <= 0) {
            alert('Missing CON_RECID.');
            return;
        }

        const payload = {
            CON_RECID: conRecid,
            email_taxinv: emails.join(';')
        };

        $.ajax({
            url: EditEmail,
            type: 'POST',
            data: payload,
            success: function (resp) {
                if (resp.success) {
                    $('#ManageEmail').modal('hide');
                    $('#gridSearchEmail').datagrid('reload');
                } else {
                    alert('Edit failed: ' + (resp.error || 'unknown'));
                }
            },
            error: function (xhr) {
                alert('Edit failed: ' + xhr.status);
            }
        });
    }
}

function deleteEmailRecord(recidEnc) {
    var recid = decodeURIComponent(recidEnc || '').trim();
    var idNum = parseInt(recid, 10);
    if (!idNum) {
        alert('Invalid CON_RECID');
        return;
    }
    if (!confirm('Delete this email record?\nCON_RECID: ' + idNum)) return;

    $.ajax({
        url: DeleteEmail,
        type: 'POST',
        data: { con_recid: idNum },
        success: function (resp) {
            if (resp && resp.success) {
                $('#gridSearchEmail').datagrid('reload');
            } else {
                alert('Delete failed: ' + (resp && resp.error ? resp.error : 'unknown'));
            }
        },
        error: function (xhr) {
            alert('Delete failed: ' + xhr.status + ' ' + (xhr.responseText || ''));
        }
    });
}