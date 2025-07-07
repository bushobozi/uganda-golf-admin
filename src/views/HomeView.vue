<script setup lang="ts">
import { useCollection } from 'vuefire';
import { collection, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net-bs5';
import 'datatables.net-responsive';
import 'datatables.net-select';
import { onMounted, nextTick, ref, computed } from 'vue';
import Navbar from '@/components/navigation/Navbar.vue';

// Install xlsx: npm install xlsx
// Install file-saver: npm install file-saver
// Install @types/file-saver: npm install --save-dev @types/file-saver
// @ts-ignore
import * as XLSX from 'xlsx';
// @ts-ignore
import { saveAs } from 'file-saver';

const selectedColumns = ref<string[]>([]);
const showColumnSelector = ref(false);

// Available columns for selection
const availableColumns = [
    { key: 'rowNumber', label: 'Row Number' },
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'club', label: 'Club' },
    { key: 'event', label: 'Open' },
    { key: 'subsidiary', label: 'Event' },
    { key: 'subsidiaryPrice', label: 'Price' },
    { key: 'paymentConfirmation', label: 'Status' },
    { key: 'country', label: 'Country' }
];

// Load saved columns from localStorage on component mount
onMounted(() => {
    const savedColumns = localStorage.getItem('selectedTableColumns');
    if (savedColumns) {
        selectedColumns.value = JSON.parse(savedColumns);
    } else {
        // Default to all columns if none saved
        selectedColumns.value = availableColumns.map(col => col.key);
    }
});

const saveSelectedTableColumns = () => {
    localStorage.setItem('selectedTableColumns', JSON.stringify(selectedColumns.value));
    alert(`Selected columns (${selectedColumns.value.length}) have been saved for download.`);
    showColumnSelector.value = false;
};

const toggleColumnSelection = (columnKey: string) => {
    const index = selectedColumns.value.indexOf(columnKey);
    if (index > -1) {
        selectedColumns.value.splice(index, 1);
    } else {
        selectedColumns.value.push(columnKey);
    }
};

const selectAllColumns = () => {
    selectedColumns.value = availableColumns.map(col => col.key);
};

const deselectAllColumns = () => {
    selectedColumns.value = [];
};

const downloadExcel = () => {
    if (!registrations.value || registrations.value.length === 0) {
        alert('No data available for download');
        return;
    }

    if (selectedColumns.value.length === 0) {
        alert('Please select at least one column to download');
        return;
    }

    try {
        // Prepare data based on selected columns
        const exportData = registrations.value.map((reg: any, index: number) => {
            const row: any = {};

            selectedColumns.value.forEach(columnKey => {
                switch (columnKey) {
                    case 'rowNumber':
                        row[''] = index + 1;
                        break;
                    case 'name':
                        row['Name'] = `${reg.firstName || ''} ${reg.lastName || ''}`.trim();
                        break;
                    case 'phone':
                        row['Phone'] = reg.phone || '';
                        break;
                    case 'email':
                        row['Email'] = reg.email || '';
                        break;
                    case 'club':
                        row['Club'] = reg.club || '';
                        break;
                    case 'event':
                        row['Open'] = reg.event || '';
                        break;
                    case 'subsidiary':
                        row['Event'] = reg.subsidiary || '';
                        break;
                    case 'subsidiaryPrice':
                        row['Price'] = reg.subsidiaryPrice || '';
                        break;
                    case 'paymentConfirmation':
                        row['Status'] = reg.paymentConfirmation === true ? 'Paid' : (reg.paymentConfirmation || '');
                        break;
                    case 'country':
                        row['Country'] = reg.country || '';
                        break;
                }
            });

            return row;
        });

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Auto-size columns
        const range = XLSX.utils.decode_range(ws['!ref'] || '');
        const colWidths: any[] = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
            let maxWidth = 10;
            for (let R = range.s.r; R <= range.e.r; ++R) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                const cell = ws[cellAddress];
                if (cell && cell.v) {
                    const cellValue = cell.v.toString();
                    maxWidth = Math.max(maxWidth, cellValue.length);
                }
            }
            colWidths.push({ wch: Math.min(maxWidth + 2, 50) });
        }
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Registrations');

        // Generate Excel file
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Save file with timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `uganda_golf_open_registrations_${timestamp}.xlsx`;
        saveAs(data, filename);

        alert(`Excel file "${filename}" has been downloaded successfully!`);
    } catch (error) {
        console.error('Error generating Excel file:', error);
        alert('Error generating Excel file. Please try again.');
    }
};

const downloadSelectedColumnsAsJSON = () => {
    const savedColumns = localStorage.getItem('selectedTableColumns');
    if (!savedColumns) {
        alert('No columns selected for download');
        return;
    }

    const columnKeys = JSON.parse(savedColumns);
    const data = registrations.value.map((reg: any) => {
        const row: any = {};
        columnKeys.forEach((key: string) => {
            if (key === 'name') {
                row[key] = `${reg.firstName || ''} ${reg.lastName || ''}`.trim();
            } else {
                row[key] = reg[key];
            }
        });
        return row;
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected_columns_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const registrations = useCollection(collection(db, 'registrations'));

DataTable.use(DataTablesCore);

const columns = [
    {
        data: null,
        title: '',
        render: (data: any, type: string, row: any, meta: any) => {
            return meta.row + 1;
        }
    },
    {
        data: null,
        title: 'Name',
        render: (data: any, type: string, row: any) => {
            return `${row.firstName || ''} ${row.lastName || ''}`.trim();
        }
    },
    { data: 'phone', title: 'Phone' },
    { data: 'email', title: 'Email' },
    { data: 'club', title: 'Club' },
    { data: 'event', title: 'Open' },
    { data: 'subsidiary', title: 'Event' },
    { data: 'subsidiaryPrice', title: 'Price' },
    {
        data: 'paymentConfirmation',
        title: 'Status',
        render: (data: any, type: string, row: any) => {
            if (row.paymentConfirmation === true) {
                return '<span style="color: green; font-weight: bold;">Paid</span>';
            }
            return row.paymentConfirmation || '';
        }
    },
    { data: 'country', title: 'Country' },
];

const options = {
    responsive: true,
    select: true,
    pageLength: 100,
    scrollX: true,
    scrollY: '90vh',
    scrollCollapse: true,
};

const deleteEntry = async (id: string) => {
    if (!id) {
        alert('No ID found for this entry');
        return;
    }

    if (confirm('Are you sure you want to delete this registration?')) {
        try {
            await deleteDoc(doc(db, 'registrations', id));
            alert('Registration deleted successfully');
        } catch (error) {
            console.error('Error deleting registration:', error);
            alert('Error deleting registration');
        }
    }
};

onMounted(() => {
    nextTick(() => {
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const deleteBtn = target.closest('.delete-btn') as HTMLButtonElement;
            if (deleteBtn) {
                const id = deleteBtn.getAttribute('data-id');
                if (id) {
                    deleteEntry(id);
                }
            }
        });
    });
});
</script>

<template>
    <Navbar />
    <div class="container mb-4">
        <div class="container-fluid mb-4">
            <div class="row">
                <div class="col-md-12">
                    <h1 class="text-center">Registrations</h1>
                    <p class="text-center">Manage all registrations for the Uganda Golf Open</p>
                </div>
                <div class="col-md-12 mt-3">
                    <div class="d-flex gap-2 flex-wrap">
                        <button class="btn btn-primary" @click="showColumnSelector = !showColumnSelector">
                            <i class="bi bi-gear"></i> Select Columns
                        </button>
                        <button class="btn btn-success" @click="downloadExcel" :disabled="selectedColumns.length === 0">
                            <i class="bi bi-download"></i> Download Excel
                        </button>
                        <div class="text-muted small align-self-center">
                            {{ selectedColumns.length }} columns selected
                        </div>
                    </div>

                    <!-- Column Selector Modal -->
                    <div v-if="showColumnSelector" class="mt-3 p-3 border rounded bg-light">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h6>Select Columns to Export to Excel Sheet for Download</h6>
                            <button class="btn btn-outline-secondary btn-sm" @click="showColumnSelector = false">
                                <i class="bi bi-x"></i>
                            </button>
                        </div>

                        <div class="mb-3">
                            <button class="btn btn-outline-primary btn-sm me-2" @click="selectAllColumns">
                                Select All
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" @click="deselectAllColumns">
                                Deselect All
                            </button>
                        </div>

                        <div class="d-flex flex-wrap gap-4">
                            <div v-for="column in availableColumns" :key="column.key">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" :id="column.key"
                                        :checked="selectedColumns.includes(column.key)"
                                        @change="toggleColumnSelection(column.key)">
                                    <label class="form-check-label" :for="column.key">
                                        {{ column.label }}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="mt-3">
                            <button class="btn btn-primary" @click="saveSelectedTableColumns"
                                :disabled="selectedColumns.length === 0">
                                <i class="bi bi-save"></i> Save Selection
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="container-fluid bg-white p-2">
            <DataTable :columns="columns" :options="options" :data="registrations" class="display nowrap" />
        </div>
    </div>
</template>

<style>
@import 'bootstrap';
@import 'datatables.net-dt';

.form-check-input:checked {
    background-color: #0d6efd;
    border-color: #0d6efd;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>