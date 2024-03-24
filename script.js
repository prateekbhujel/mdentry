$(document).ready(function() {
    const recordsPerPage = 10;
    let currentPage = 1;
    let records = [];
    let currentTheme = 'dark';

    loadRecords();

    function loadRecords() {
        records = JSON.parse(localStorage.getItem('records')) || [];
        displayRecords();
    }

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

    $('#addBtn').click(function() {
        addRecord();
    });

    $(document).on('click', '.editBtn', function() {
        const row = $(this).closest('tr');
        editRecord(row);
    });

    $('#addRecord').submit(function(e) {
        e.preventDefault();
        saveChanges();
    });

    $(document).on('click', '.deleteBtn', function() {
        const row = $(this).closest('tr');
        deleteRecord(row);
    });

    $('#exportBtn').click(function() {
        exportToExcel(false);
    });

    $('#exportAllBtn').click(function() {
        exportToExcel(true);
    });

    $(document).keydown(function(e) {
        if ($('#patientName').is(':focus')) {
            if (e.keyCode === 13 || e.keyCode === 40) {
                $('#heading').focus();
                e.preventDefault();
            } else if (e.keyCode === 9 && !e.shiftKey) {
                $('#recordsBody tr:first').focus();
                e.preventDefault();
            }
        } else if ($('#heading').is(':focus')) {
            if (e.keyCode === 13) {
                $('#variable').focus();
                e.preventDefault();
            } else if (e.keyCode === 38) {
                $('#patientName').focus();
                e.preventDefault();
            } else if (e.keyCode === 40) {
                $('#variable').focus();
                e.preventDefault();
            } else if (e.keyCode === 9 && e.shiftKey) {
                $('#patientName').focus();
                e.preventDefault();
            }
        } else if ($('#variable').is(':focus')) {
            if (e.keyCode === 13) {
                addRecord();
                e.preventDefault();
            } else if (e.keyCode === 38) {
                $('#heading').focus();
                e.preventDefault();
            } else if (e.keyCode === 9 && !e.shiftKey) {
                $('#recordsBody tr:first').focus();
                e.preventDefault();
            } else if (e.keyCode === 9 && e.shiftKey) {
                $('#heading').focus();
                e.preventDefault();
            }
        } else if ($('#recordsBody').find('tr').length > 0) {
            const focusedRow = $('#recordsBody tr:focus');
            if (focusedRow.length > 0) {
                if (e.keyCode === 46 || e.shiftKey && e.keyCode === 46) {
                    deleteRecord(focusedRow);
                } else if (e.keyCode === 69) {
                    editRecord(focusedRow);
                } else if (e.keyCode === 38) {
                    const prevRow = focusedRow.prev();
                    if (prevRow.length > 0) {
                        prevRow.focus();
                        e.preventDefault();
                    } else {
                        $('#variable').focus();
                        e.preventDefault();
                    }
                } else if (e.keyCode === 40) {
                    const nextRow = focusedRow.next();
                    if (nextRow.length > 0) {
                        nextRow.focus();
                        e.preventDefault();
                    } else {
                        $('#patientName').focus();
                        e.preventDefault();
                    }
                } else if (e.keyCode === 9) {
                    if (e.shiftKey) {
                        $('#variable').focus();
                    } else {
                        $('#patientName').focus();
                    }
                    e.preventDefault();
                }
            }
        }

        if (e.ctrlKey && e.keyCode === 190) {
            toggleTheme();
            e.preventDefault();
        }

        if (e.keyCode === 113) {
            $('#prevBtn').click();
            e.preventDefault();
        }

        if (e.keyCode === 114) {
            $('#nextBtn').click();
            e.preventDefault();
        }

        if (e.keyCode === 115) {
            e.preventDefault();
            $('#exportAllBtn').click();
        }

        if (e.keyCode === 117) {
            $('#exportBtn').click();
            e.preventDefault();
        }

        if (e.ctrlKey && e.keyCode === 83) {
            $('#showHideShortcuts').click();
            e.preventDefault();
        }
    });

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

    function editRecord(row) {
        const id = row.data('id');
        const recordData = records.find(record => record.id === id);

        if (recordData) {
            $('#patientName').val(recordData.patientName);
            $('#heading').val(recordData.heading);
            $('#variable').val(recordData.variable);
            $('#addBtn').text('Save Changes').data('recordId', id);
            $('#addRecord').off('submit').submit(function(e) {
                e.preventDefault();
                saveChanges(id);
            });
        } else {
            console.error("Record not found.");
        }
    }

    function saveChanges(id) {
        let localData = localStorage.getItem('records');
        let localArray = JSON.parse(localData);
        const idToUpdate = $('#addBtn').data('recordId');
        const indexToUpdate = localArray.findIndex(m => m.id == idToUpdate);

        if (indexToUpdate !== -1) {
            localArray[indexToUpdate].patientName = $('#patientName').val();
            localArray[indexToUpdate].heading = $('#heading').val();
            localArray[indexToUpdate].variable = $('#variable').val();
            localStorage.setItem('records', JSON.stringify(localArray));
            loadRecords();
            clearInputFields();
        }
    }

    function deleteRecord(row) {
        const id = row.data('id');
        if (confirm('Are you sure you want to delete this record?')) {
            const filteredRecords = records.filter(r => r.id !== id);
            records = filteredRecords;
            localStorage.setItem('records', JSON.stringify(records));
            displayRecords();
        }
    }

    function exportToExcel(exportAll) {
        const recordsToExport = exportAll ? records : records.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

        if (recordsToExport.length > 0) {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(recordsToExport);

            const headerCellStyle = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center' } };
            const headerRange = XLSX.utils.decode_range(ws['!ref']);
            for (let col = headerRange.s.c; col <= headerRange.e.c; ++col) {
                const cellAddress = XLSX.utils.encode_cell({ r: headerRange.s.r, c: col });
                ws[cellAddress].s = headerCellStyle;
            }

            const dataCellStyle = { alignment: { horizontal: 'left', vertical: 'center' } };
            for (let row = headerRange.s.r + 1; row <= headerRange.e.r; ++row) {
                for (let col = headerRange.s.c; col <= headerRange.e.c; ++col) {
                    const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                    ws[cellAddress].s = dataCellStyle;
                }
            }

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

    function clearInputFields() {
        $('#patientName').val('');
        $('#heading').val('');
        $('#variable').val('');
        $('#addBtn').text('Add Record').removeData('recordIndex');
    }

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

    $('#themeToggleBtn').click(function() {
        toggleTheme();
    });

    function toggleTheme() {
        if (currentTheme === 'dark') {
            $('body').removeClass('dark-mode');
            $('body').addClass('light-mode');
            currentTheme = 'light';
        } else {
            $('body').removeClass('light-mode');
            $('body').addClass('dark-mode');
            currentTheme = 'dark';
        }
    }

    $('#showHideShortcuts').click(function() {
        $('#shortcutsPopup').toggle();
        displayShortcuts();
    });

    $('.close').click(function() {
        $('#shortcutsPopup').hide();
    });

    function displayShortcuts() {
        const shortcuts = [
            { key: 'Enter', action: 'Move to the next input field or add/save a record' },
            { key: 'Up Arrow', action: 'Move to the previous input field or record' },
            { key: 'Down Arrow', action: 'Move to the next input field or record' },
            { key: 'Tab', action: 'Move to the table or back to the input fields' },
            { key: 'Del/Shift+Del', action: 'Delete the current record' },
            { key: 'E', action: 'Edit the current record' },
            { key: 'CTRL + .', action: 'Toggle theme' },
            { key: 'F2', action: 'Go to Previous Page' },
            { key: 'F3', action: 'Go to Next Page' },
            { key: 'F4', action: 'Download all records to Excel' },
            { key: 'F6', action: 'Download Current records to Excel' }
        ];

        const $ul = $('#shortcutsPopup ul');
        $ul.empty();
        shortcuts.forEach(function(shortcut) {
            $ul.append(`<li><strong>${shortcut.key}:</strong> ${shortcut.action}</li>`);
        });
    }
});