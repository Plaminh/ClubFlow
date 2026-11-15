import './DataTable.css';

/**
 * Responsive data table. Below 80rem each row becomes a stacked card with
 * "label: value" cells, so identifiers, status and actions are never pushed
 * off-screen (specs/001-frontend-ui/research.md D-UI-04). The wide tables
 * (8 columns) only fit without internal scrolling from 80rem; measured at
 * 768–1024 px they overflowed and hid the action column.
 *
 * Explicit table roles keep the semantics when rows are restyled as cards.
 * columns: [{ key, header, render(row) }]
 */
export default function DataTable({ caption, columns, rows, getRowKey, selectedKey, emptyText = 'Không có dữ liệu.' }) {
  if (rows.length === 0) {
    return <p className="muted">{emptyText}</p>;
  }

  return (
    <div className="table-scroll" role="region" aria-label={caption} tabIndex={0}>
      <table className="data-table" role="table">
        <caption className="visually-hidden">{caption}</caption>
        <thead role="rowgroup">
          <tr role="row">
            {columns.map((column) => (
              <th key={column.key} scope="col" role="columnheader">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {rows.map((row) => {
            const key = getRowKey(row);
            return (
              <tr key={key} role="row" data-selected={key === selectedKey ? 'true' : undefined}>
                {columns.map((column) => (
                  <td key={column.key} role="cell" data-label={column.header}>
                    <div className="data-table__value">{column.render(row)}</div>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
