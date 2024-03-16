/* eslint-disable react/prop-types */

import { createContext, useContext, useState } from "react";

function App() {
  const columns = [{ key: "id" }, { key: "name" }, { key: "age" }];

  const rows = [
    { id: 1, name: "John", age: 20 },
    { id: 2, name: "Doe", age: 30 },
    { id: 3, name: "Jane", age: 25 },
  ];

  return (
    <CheckboxContextProvider>
      <Table rows={rows} columns={columns} />
    </CheckboxContextProvider>
  );
}

function Table({ rows: propsRows, columns }) {
  const [rows, setRows] = useState(propsRows);
  const { isChecked, clearCheckedRows } = useContext(checkboxContext);

  return (
    <div>
      <button
        onClick={() => {
          setRows(propsRows.filter(({ id }) => !isChecked(id)));
        }}
      >
        Supprimer
      </button>
      <button onClick={clearCheckedRows}>Désélectionner tout</button>
      <table>
        <thead>
          <th></th>
          {columns.map((column) => (
            <th key={column.key}>{column.key}</th>
          ))}
        </thead>
        <tbody>
          {rows.map((row) => (
            <TableRow row={row} columns={columns} key={row.id} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TableRow({ row, columns }) {
  return (
    <tr>
      <td>
        <Checkbox id={row.id} />
      </td>
      {columns.map((column) => (
        <TableCell key={row.id + column.key}>{row[column.key]}</TableCell>
      ))}
    </tr>
  );
}

export function TableCell({ children }) {
  return <td>{children}</td>;
}

export function Checkbox({ id }) {
  const { onCheck, isChecked } = useContext(checkboxContext);
  return (
    <input
      type="checkbox"
      onChange={(e) => onCheck(id, e.target.checked)}
      checked={isChecked(id)}
    />
  );
}

const checkboxContext = createContext({
  checkedRows: [],
  onCheck: () => {},
  isChecked: () => {},
  clearCheckedRows: () => {},
});

function CheckboxContextProvider({ children }) {
  const [checkedRows, setCheckedRows] = useState([]);

  const handleCheck = (id, checked) => {
    if (checked) {
      setCheckedRows([...checkedRows, id]);
    } else {
      setCheckedRows(checkedRows.filter((rowId) => rowId !== id));
    }
  };

  const clearCheckedRows = () => setCheckedRows([]);

  const isChecked = (id) => checkedRows.includes(id);

  return (
    <checkboxContext.Provider
      value={{
        checkedRows,
        onCheck: handleCheck,
        clearCheckedRows,
        isChecked,
      }}
    >
      {children}
    </checkboxContext.Provider>
  );
}

export default App;
