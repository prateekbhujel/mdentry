$(document).ready(function() {
    const recordsPerPage = 10; // Number of records to display per page
    let currentPage = 1; // Current page number
    let records = []; // Array to hold all records
    let currentTheme = 'default'; // Default theme

    // Load records when the page loads
    loadRecords();

    // Function to load records
    function loadRecords() {
        records = JSON.parse(localStorage.getItem('records')) || [];
        displayRecords();
    }

    // Function to display records based on current page
    function displayRecords() {
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        const pageRecords = records.slice(startIndex, endIndex);

        $('#recordsBody').empty();
        pageRecords.forEach(function(record) {
            $('#recordsBody').append(`
                <tr data-id="${record.id}" tabindex="0">
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

        updatePaginationInfo();
    }

    // Function to update pagination information
    function updatePaginationInfo() {
        const totalPages = Math.ceil(records.length / recordsPerPage);
        $('#pageInfo').text(`Page ${currentPage} of ${totalPages}`);

        if (currentPage === 1) {
            $('#prevBtn').prop('disabled', true);
        } else {
            $('#prevBtn').prop('disabled', false);
        }

        if (currentPage === totalPages || records.length === 0) {
            $('#nextBtn').prop('disabled', true);
        } else {
            $('#nextBtn').prop('disabled', false);
        }
    }

    // Add record
    $('#addBtn').click(function() {
        addRecord();
    });

    // Edit record
    $(document).on('click', '.editBtn', function() {
        const row = $(this).closest('tr');
        editRecord(row);
    });

    // Save changes or Add record
    $('#addRecord').submit(function(e) {
        e.preventDefault();
        addRecord();
    });

    // Delete record
    $(document).on('click', '.deleteBtn', function() {
        const row = $(this).closest('tr');
        deleteRecord(row);
    });

    // Export to Excel
    $('#exportBtn').click(function() {
        exportToExcel(false);
    });

    $('#exportAllBtn').click(function() {
        exportToExcel(true);
    });

    // Keyboard events
    $(document).keydown(function(e) {
        if ($('#patientName').is(':focus')) {
            if (e.keyCode === 13) { // Enter key
                $('#heading').focus();
                e.preventDefault();
            } else if (e.keyCode === 40) { // Down arrow key
                $('#heading').focus();
                e.preventDefault();
            } else if (e.keyCode === 9) { // Tab key
                if (!e.shiftKey) {
                    $('#recordsBody tr:first').focus();
                    e.preventDefault();
                }
            }
        } else if ($('#heading').is(':focus')) {
            if (e.keyCode === 13) { // Enter key
                $('#variable').focus();
                e.preventDefault();
            } else if (e.keyCode === 38) { // Up arrow key
                $('#patientName').focus();
                e.preventDefault();
            } else if (e.keyCode === 40) { // Down arrow key
                $('#variable').focus();
                e.preventDefault();
            } else if (e.keyCode === 9 && e.shiftKey) { // Shift+Tab
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
            } else if (e.keyCode === 9) { // Tab key
                if (!e.shiftKey) {
                    $('#recordsBody tr:first').focus();
                    e.preventDefault();
                } else {
                    $('#heading').focus();
                    e.preventDefault();
                }
            }
        } else if ($('#recordsBody').find('tr').length > 0) {
            const focusedRow = $('#recordsBody tr:focus');
            if (focusedRow.length > 0) {
                if (e.keyCode === 46 || e.shiftKey && e.keyCode === 46) { // Del/Shift+Del key
                    deleteRecord(focusedRow);
                } else if (e.keyCode === 69) { // E key
                    editRecord(focusedRow);
                } else if (e.keyCode === 38) { // Up arrow key
                    const prevRow = focusedRow.prev();
                    if (prevRow.length > 0) {
                        prevRow.focus();
                        e.preventDefault();
                    } else {
                        $('#variable').focus();
                        e.preventDefault();
                    }
                } else if (e.keyCode === 40) { // Down arrow key
                    const nextRow = focusedRow.next();
                    if (nextRow.length > 0) {
                        nextRow.focus();
                        e.preventDefault();
                    } else {
                        $('#patientName').focus();
                        e.preventDefault();
                    }
                } else if (e.keyCode === 9) { // Tab key
                    if (e.shiftKey) {
                        $('#variable').focus();
                    } else {
                        $('#patientName').focus();
                    }
                    e.preventDefault();
                }
            }
        }

        // Toggle theme mode
        if (e.ctrlKey && e.keyCode === 68) { // CTRL + D key
            e.preventDefault();
            toggleTheme('dark');
        } else if (e.ctrlKey && e.keyCode === 76) { // CTRL + L key
            e.preventDefault();
            toggleTheme('light');
        } else if (e.ctrlKey && e.keyCode === 78) { // CTRL + N key
            e.preventDefault();
            toggleTheme('default');
        }
    });

    // Function to add record
    function addRecord() {
        const id = records.length ? records[records.length - 1].id + 1 : 1;
        const patientName = $('#patientName').val();
        const heading = $('#heading').val();
        const variable = $('#variable').val();

        if (patientName && heading && variable) {
            const newRecord = { id, patientName, heading, variable };
            records.push(newRecord);
            localStorage.setItem('records', JSON.stringify(records));
            displayRecords();
            clearInputFields();
        } else {
            alert('Please fill in all fields.');
        }
    }

    // Function to edit record
    function editRecord(row) {
        const id = row.data('id');
        const record = records.find(r => r.id === id);
        if (record) {
            $('#patientName').val(record.patientName);
            $('#heading').val(record.heading);
            $('#variable').val(record.variable);
            $('#addBtn').text('Save Changes').data('id', id);
        }
    }

    // Function to delete record
    function deleteRecord(row) {
        const id = row.data('id');
        if (confirm('Are you sure you want to delete this record?')) {
            const filteredRecords = records.filter(r => r.id !== id);
            records = filteredRecords;
            localStorage.setItem('records', JSON.stringify(records));
            displayRecords();
        }
    }

    // Function to export records to Excel
    function exportToExcel(exportAll) {
        const recordsToExport = exportAll ? records : records.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

        if (recordsToExport.length > 0) {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(recordsToExport);
            XLSX.utils.book_append_sheet(wb, ws, "Medical Records");
            const wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

            function s2ab(s) {
                const buf = new ArrayBuffer(s.length);
                const view = new Uint8Array(buf);
                for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                return buf;
            }

            const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
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
        $('#addBtn').text('Add Record').removeData('id');
    }

    // Pagination event handlers
    $('#prevBtn').click(function() {
        if (currentPage > 1) {
            currentPage--;
            displayRecords();
        }
    });

    $('#nextBtn').click(function() {
        if (currentPage < Math.ceil(records.length / recordsPerPage)) {
            currentPage++;
            displayRecords();
        }
    });

    // Theme toggle event handlers
    $('#darkModeBtn').click(function() {
        toggleTheme('dark');
    });

    $('#lightModeBtn').click(function() {
        toggleTheme('light');
    });

    $('#defaultModeBtn').click(function() {
        toggleTheme('default');
    });

    // Function to toggle theme
    function toggleTheme(theme) {
        if (theme === 'dark') {
            $('body').addClass('dark-mode');
            $('body').removeClass('light-mode');
            currentTheme = 'dark';
        } else if (theme === 'light') {
            $('body').addClass('light-mode');
            $('body').removeClass('dark-mode');
            currentTheme = 'light';
        } else {
            $('body').removeClass('dark-mode');
            $('body').removeClass('light-mode');
            currentTheme = 'default';
        }
    }

    // Show/hide keyboard shortcuts
    $('#showHideShortcuts').click(function() {
        $('#shortcutsContainer').toggle();
    });
});