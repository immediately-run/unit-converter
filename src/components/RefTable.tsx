import type { RefTable as RefTableData } from '../data/refs';

interface Props {
  table: RefTableData;
}

function RefTable({ table }: Props) {
  return (
    <div className="ref">
      <h3 className="ref-title">{table.title}</h3>
      {table.note && <p className="ref-note">{table.note}</p>}
      <div className="ref-scroll">
        <table className="ref-table">
          <thead>
            <tr>
              {table.columns.map((c) => (
                <th key={c} scope="col">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((r, i) => (
              <tr key={i}>
                {r.map((cell, j) => (j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RefTable;
