/* eslint-disable react/prop-types */

import {
  CheckBox,
  CheckBoxOutlineBlank,
  IndeterminateCheckBoxOutlined,
} from "@mui/icons-material";
import { IconButton } from "@mui/material";
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
  const { isChecked, clearCheckedRows, checkedRows, selectAllRows } =
    useContext(checkboxContext);

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
          <th>
            <IconButton
              color="primary"
              onClick={() =>
                propsRows.every(({ id }) => checkedRows.includes(id))
                  ? clearCheckedRows()
                  : selectAllRows(propsRows.map(({ id }) => id))
              }
            >
              {propsRows.every(({ id }) => checkedRows.includes(id)) ? (
                <CheckBox />
              ) : checkedRows.length ? (
                <IndeterminateCheckBoxOutlined />
              ) : (
                <CheckBoxOutlineBlank />
              )}
            </IconButton>
          </th>
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
    <IconButton color="primary" onClick={() => onCheck(id, !isChecked(id))}>
      {isChecked(id) ? <CheckBox /> : <CheckBoxOutlineBlank />}
    </IconButton>
  );
}

const checkboxContext = createContext({
  checkedRows: [],
  onCheck: () => {},
  isChecked: () => {},
  clearCheckedRows: () => {},
  selectAllRows: () => {},
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

  const selectAllRows = (rows) => setCheckedRows(rows);

  return (
    <checkboxContext.Provider
      value={{
        checkedRows,
        onCheck: handleCheck,
        clearCheckedRows,
        isChecked,
        selectAllRows,
      }}
    >
      {children}
    </checkboxContext.Provider>
  );
}

export default App;
