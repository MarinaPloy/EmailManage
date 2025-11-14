window.onload = (event) => {
        getTableCus();
        getTableEmail();
    };

    var ck = 1;

    document.addEventListener('DOMContentLoaded', (event) => {
        console.log('DOM fully loaded and parsed');

        document.querySelectorAll('#txtCnum,#txtSnum,#txtCname').forEach(el => {
            el.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    ck++;
                    loadData();
                }
            });
        });

        document.getElementById('btnSearch').addEventListener('click', function () {
            ck += 1;
            loadData();
        });

        document.getElementById('btnClearSearch').addEventListener('click', clearSearchFields);

        getTableCus();
    });

    function loadData() {
        if (ck > 1) {
            $('#gridSearchCus').datagrid('options').url = gridSearchCus_Url;
            $('#gridSearchCus').datagrid('load', {
                Cnum: document.getElementById('txtCnum').value.trim(),
                Snum: document.getElementById('txtSnum').value.trim(),
                Cname: document.getElementById('txtCname').value.trim(),
            });
        }
    }

    function clearSearchFields() {
        document.getElementById('txtCname').value = '';
        document.getElementById('txtCnum').value = '';
        document.getElementById('txtSnum').value = '';
        ck = 1;
        if ($('#gridSearchCus').data('datagrid')) {
            $('#gridSearchCus').datagrid('loadData', { total: 0, rows: [] });
        }
        document.querySelectorAll("#singleRecordForm input.form-control").forEach(i => i.value = '');
        const addEmailBtn = document.getElementById("btnAddEmail");
        if (addEmailBtn) addEmailBtn.hidden = true;
        if ($('#gridSearchEmail').data('datagrid')) {
            $('#gridSearchEmail').datagrid('loadData', { total: 0, rows: [] });
        }
    }

    function getTableCus() {
        $('#gridSearchCus').datagrid({
            fitColumns: false,
            singleSelect: true,
            checkOnSelect: false,
            selectOnCheck: false,
            pagination: true,
            sortName: 'customer_name',
            sortOrder: 'asc',
            columns: [[
                { field: 'customer_number', title: 'Customer<br/>Number', width: '10%', align: 'center', sortable: true, headerStyler: () => 'white-space:normal; line-height:1.2;' },
                { field: 'site_number', title: 'Site<br/>Number', width: '10%', align: 'center', sortable: true, headerStyler: () => 'white-space:normal; line-height:1.2;' },
                { field: 'customer_name', title: 'Customer Name', width: '45%', align: 'left', sortable: true },
                { field: 'address1', title: 'Address 1', width: '45%', align: 'left', sortable: true },
                { field: 'address2', title: 'Address 2', width: '20%', align: 'left', sortable: true },
                { field: 'address3', title: 'Address 3', width: '20%', align: 'left', sortable: true },
                { field: 'address4', title: 'Address 4', width: '20%', align: 'left', sortable: true },
                { field: 'city', title: 'City', width: '20%', align: 'left', sortable: true },
                { field: 'postal_code', title: 'Postal Code', width: '10%', align: 'center', sortable: true }
            ]],
            emptyMsg: '<p class="fs-18"><i class="text-danger ri-search-line fs-18"></i> Please press the search button to display the information.</p>',
            onClickRow: function (index, row) { populateSingleRecordForm(row); }
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
        if (!cnum || !snum) return;

        $('#gridSearchEmail').datagrid('options').url = gridSearchEmail_Url;
        $('#gridSearchEmail').datagrid('load', { Cnum: cnum, Snum: snum });
    }

    function getTableEmail() {
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
                    field: 'manage', title: 'Manage', width: '10%', align: 'center', sortable: false,
                    formatter: function (value, row) {
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
        if (!cnum || !snum) { alert('Please select a customer first.'); return; }
        emailModalMode = 'Add';
        document.getElementById('emailModalTitle').textContent = 'Add';
        document.getElementById('emailMode').value = 'Add';
        document.getElementById('modalCustomerNumber').value = cnum;
        document.getElementById('modalSiteNumber').value = snum;
        const conRecidInput = document.getElementById('modalConRecid');
        if (conRecidInput) conRecidInput.value = '';

        buildEmailInputs(); // was buildEmailInputs([])
        $('#ManageEmail').modal('show');
        setTimeout(() => document.querySelector('#emailList .email-input')?.focus(), 50);
    }

    function addEmailInput() {
        const container = document.getElementById('emailList');
        if (!container) return;
        // Append without clearing existing rows
        const idx = container.querySelectorAll('.email-row').length;
        container.appendChild(makeEmailRow('', idx));
        refreshRemoveButtons();
        // Do not block addition based on validity
        updateSaveButtonState();
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
        if (rawEmails) list = rawEmails.split(/[,;\r\n]+/).map(e => e.trim()).filter(e => e);
        buildEmailInputs(list.length ? list : ['']);
        $('#ManageEmail').modal('show');
        setTimeout(() => document.querySelector('#emailList .email-input')?.focus(), 50);
    }

    function normalizeEmailArray(emails) {
        if (emails == null) return [''];
        if (Array.isArray(emails)) return emails;
        if (typeof emails === 'string') {
            const arr = emails.split(/[,;\r\n]+/).map(e => e.trim()).filter(Boolean);
            return arr.length ? arr : [''];
        }
        return [''];
    }

    function buildEmailInputs(emails) {
        const container = document.getElementById('emailList');
        if (!container) return;
        emails = normalizeEmailArray(emails);
        if (!emails.length) emails = ['']; // ensure at least one row
        container.innerHTML = '';
        emails.forEach((e, i) => container.appendChild(makeEmailRow(e, i)));
        refreshRemoveButtons();
        updateSaveButtonState();
        ensureDelimiterDelegation();
    }

    function makeEmailRow(value, idx) {
        const row = document.createElement('div');
        row.className = 'input-group mb-2 email-row';
        const removeBtnHtml = idx === 0
            ? `<button type="button" class="btn btn-outline-secondary" disabled title="Cannot remove first">&times;</button>`
            : `<button type="button" class="btn btn-outline-danger" onclick="removeEmailRow(this)" title="Remove">&times;</button>`;
        row.innerHTML = `
            <input type="text"
                   class="form-control email-input"
                   placeholder="example@domain.com (use , ; Enter / split after blur)"
                   value="${value}"
                   autocomplete="off"
                   inputmode="email">
            ${removeBtnHtml}
        `;
        const input = row.querySelector('.email-input');

        input.addEventListener('blur', () => {
            splitOnBlur(input);
            validateEmailField(input);
            updateSaveButtonState();
        });

        return row;
    }

    /* Delegated key handler (single attachment) */
    function ensureDelimiterDelegation() {
        if (window._emailDelimiterAttached) return;
        window._emailDelimiterAttached = true;

        const container = document.getElementById('emailList');
        container.addEventListener('keydown', function (e) {
            const target = e.target;
            if (!target.classList || !target.classList.contains('email-input')) return;

            if (e.key === ',' || e.key === ';' || e.key === 'Enter') {
                e.preventDefault();

                target.value = target.value.replace(/[,;\s]+$/, '').trim();
                validateEmailField(target);

                let nextRow = target.closest('.email-row').nextElementSibling;
                let nextInput = nextRow?.querySelector('.email-input');
                if (!(nextInput && !nextInput.value.trim())) {
                    const newRow = makeEmailRow('', 0);
                    target.closest('.email-row').after(newRow);
                    nextInput = newRow.querySelector('.email-input');
                    refreshRemoveButtons();
                    updateSaveButtonState();
                }

                forceFocusShift(target, nextInput);
            }
        }, true);
    }

    function forceFocusShift(oldInput, newInput) {
        const prevTab = oldInput.getAttribute('tabindex');
        oldInput.setAttribute('tabindex', '-1');
        oldInput.readOnly = true;

        const attemptFocus = (tries = 0) => {
            newInput.focus();
            if (document.activeElement !== newInput && tries < 5) {
                setTimeout(() => attemptFocus(tries + 1), 10);
            } else {
                if (prevTab !== null) oldInput.setAttribute('tabindex', prevTab); else oldInput.removeAttribute('tabindex');
                oldInput.readOnly = false;

                if (document.activeElement !== newInput && newInput.value === '') {
                    const r = newInput.closest('.email-row');
                    if (r) r.remove();
                    refreshRemoveButtons();
                    updateSaveButtonState();
                }
            }
        };
        attemptFocus();
    }

    function splitOnBlur(input) {
        const raw = input.value;
        if (!/[,;\r\n]/.test(raw)) return;
        const tokens = raw.split(/[,;\r\n]+/).map(t => t.trim()).filter(Boolean);
        if (tokens.length <= 1) {
            input.value = tokens[0] || '';
            return;
        }

        input.value = tokens[0];
        validateEmailField(input);

        let afterRow = input.closest('.email-row');

        let sibling = afterRow.nextElementSibling;
        let idx = 1;
        if (sibling?.classList.contains('email-row')) {
            const sibInput = sibling.querySelector('.email-input');
            if (sibInput && !sibInput.value.trim()) {
                sibInput.value = tokens[idx++];
                validateEmailField(sibInput);
                afterRow = sibling;
            }
        }
        for (; idx < tokens.length; idx++) {
            const newRow = makeEmailRow(tokens[idx], 0);
            afterRow.after(newRow);
            afterRow = newRow;
            validateEmailField(afterRow.querySelector('.email-input'));
        }
        refreshRemoveButtons();
        updateSaveButtonState();
    }

    function refreshRemoveButtons() {
        const rows = Array.from(document.querySelectorAll('#emailList .email-row'));
        rows.forEach((row, i) => {
            const btn = row.querySelector('button');
            if (!btn) return;
            if (i === 0) {
                btn.disabled = true;
                btn.title = 'Cannot remove first email';
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
        const v = input.value.trim();
        if (!v) { input.classList.add('is-invalid'); return; }
        if (!isValidEmail(v)) input.classList.add('is-invalid'); else input.classList.remove('is-invalid');
    }

    function isValidEmail(email) {
        const re = /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/;
        if (!re.test(email)) return false;
        const domain = email.split('@')[1];
        if (domain.includes('..')) return false;
        return domain.split('.').every(l => l && !l.startsWith('-') && !l.endsWith('-'));
    }

    function removeEmailRow(btn) {
        const row = btn.closest('.email-row');
        if (row.previousElementSibling === null) {
            alert('The first email cannot be removed.');
            return;
        }
        row.remove();
        if (!document.querySelector('#emailList .email-row')) {
            document.getElementById('emailList').appendChild(makeEmailRow('', 0));
        }
        refreshRemoveButtons();
        updateSaveButtonState();
    }

    function allEmailsValid() {
        const inputs = Array.from(document.querySelectorAll('#emailList .email-input'));
        return inputs.length > 0 && inputs.every(i => {
            const v = i.value.trim();
            return v && isValidEmail(v);
        });
    }

    function updateSaveButtonState() {
        const btn = document.getElementById('btnSaveEmail');
        if (!btn) return;
        const inputs = Array.from(document.querySelectorAll('#emailList .email-input'));
        if (inputs.length === 0) { btn.disabled = true; return; }

        let anyFilledValid = false;
        let anyInvalidFilled = false;

        inputs.forEach(i => {
            const v = i.value.trim();
            if (!v) return; // blank ok
            if (isValidEmail(v)) {
                anyFilledValid = true;
                i.classList.remove('is-invalid');
            } else {
                anyInvalidFilled = true;
                i.classList.add('is-invalid');
            }
        });

        // Enable only if at least one valid filled email and none of the filled ones are invalid.
        btn.disabled = !anyFilledValid || anyInvalidFilled;
}
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