import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import './InventoryTable.css'
import { useMemo, useState } from 'react'

export default function InventoryTable() {
  const rowData = [] // <-- populate later with real or fake data

  const columnDefs = useMemo(() => [
    { headerName: 'Item Name', field: 'name', sortable: true, flex: 2 },
    { headerName: 'Category', field: 'category', sortable: true },
    { headerName: 'Quantity', field: 'quantity', sortable: true },
    { headerName: 'Price', field: 'price', sortable: true },
    { headerName: 'Status', field: 'status', sortable: true, cellClass: params => `status-${params.value?.toLowerCase()}` },
    {
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: () => (
        <button className="action-btn">Edit</button>
      ),
      flex: 1,
    },
  ], [])

  return (
    <div className="dashboard-card" style={{ gridColumn: 'span 12', gridRow: 'span 3' }}>
      <div className="card-inner">
        <div className="inventory-header">
          <h3>Inventory</h3>
        </div>

        <div className="ag-theme-quartz inventory-table">
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            domLayout="autoHeight"
            suppressCellFocus
          />
          {rowData.length === 0 && (
            <div className="inventory-empty-state">
              <img src="/images/empty-inventory.svg" alt="No inventory" />
              <p>No inventory items yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
