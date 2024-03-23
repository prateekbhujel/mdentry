$(document).ready(function() {
    // Load records when the page loads
    loadRecords();

    // Function to load records
    function loadRecords() {
        var records = JSON.parse(localStorage.getItem('records')) || [];
        $('#recordsBody').empty();
        records.forEach(function(record) {
            $('#recordsBody').append(`
                <tr data-id="${record.id}">
                    <td>${record.patientName}</td>
                    <td>${record.heading}</td>
                    <td>${record.variable}</td>
                    <td>
                        <button class="editBtn">Edit</button>
                        <button class="deleteBtn">Delete</button>
                    </td>
                </tr>
            `);
        });
    }

    // Add record
    $('#addBtn').click(function() {
        addRecord();
    });

    // Edit record
    $(document).on('click', '.editBtn', function() {
        var row = $(this).closest('tr');
        var id = row.data('id');
        var records = JSON.parse(localStorage.getItem('records')) || [];
        var record = records.find(r => r.id === id);
        if (record) {
            $('#patientName').val(record.patientName);
            $('#heading').val(record.heading);
            $('#variable').val(record.variable);
            $('#addBtn').text('Save Changes').data('id', id);
        }
    });

    // Save changes or Add record
    $('#addRecord').submit(function(e) {
        e.preventDefault();
        addRecord();
    });

    // Delete record
    $(document).on('click', '.deleteBtn', function() {
        var row = $(this).closest('tr');
        var id = row.data('id');
        var records = JSON.parse(localStorage.getItem('records')) || [];
        var filteredRecords = records.filter(r => r.id !== id);
        localStorage.setItem('records', JSON.stringify(filteredRecords));
        loadRecords();
    });

    // Export to Excel
    $('#exportBtn').click(function() {
        exportToExcel();
    });

    // Keyboard events
    $(document).keydown(function(e) {
        if ($('#patientName').is(':focus')) {
            if (e.keyCode === 13) { // Enter key
                $('#heading').focus();
                e.preventDefault();
            }
        } else if ($('#heading').is(':focus')) {
            if (e.keyCode === 13) { // Enter key
                $('#variable').focus();
                e.preventDefault();
            } else if (e.keyCode === 38) { // Up arrow key
                $('#patientName').focus();
                e.preventDefault();
            }
        } else if ($('#variable').is(':focus')) {
            if (e.keyCode === 13) { // Enter key
                addRecord();
                e.preventDefault();
            } else if (e.keyCode === 38) { // Up arrow key
                $('#heading').focus();
                e.preventDefault();
            }
        }
    });

    // Function to add record
    function addRecord() {
        var records = JSON.parse(localStorage.getItem('records')) || [];
        var id = records.length ? records[records.length - 1].id + 1 : 1;
        var patientName = $('#patientName').val();
        var heading = $('#heading').val();
        var variable = $('#variable').val();
        records.push({ id: id, patientName: patientName, heading: heading, variable: variable });
        localStorage.setItem('records', JSON.stringify(records));
        loadRecords();
        clearInputFields();
    }

   // Function to export records to Excel
function exportToExcel() {
    var records = JSON.parse(localStorage.getItem('records')) || [];
    if (records.length > 0) {
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.json_to_sheet(records);
        XLSX.utils.book_append_sheet(wb, ws, "Medical Records");
        var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }

        var blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'medical_records.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        alert("No records to export!");
    }
}

    // Clear input fields
    function clearInputFields() {
        $('#patientName').val('');
        $('#heading').val('');
        $('#variable').val('');
    }
});
