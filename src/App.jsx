/* eslint-disable react/prop-types */

import { createContext, useContext, useState } from "react";
import { Button, Checkbox } from "@mui/material";
import { SnackbarProvider, useSnackbar } from "notistack";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Users />,
  },
  {
    path: "/vehicles",
    element: <Vehicles />,
  },
]);

export default function App() {
  return (
    <SnackbarProvider>
      <CheckboxContextProvider>
        <RouterProvider router={router} />
      </CheckboxContextProvider>
    </SnackbarProvider>
  );
}

function Vehicles() {
  const columns = [
    { key: "id" },
    { key: "brand" },
    { key: "model" },
    { key: "year" },
  ];

  const rows = [
    { id: 1, brand: "Toyota", model: "Corolla", year: 2021 },
    { id: 2, brand: "Honda", model: "Civic", year: 2020 },
    { id: 3, brand: "Ford", model: "Fiesta", year: 2019 },
  ];

  return <Table rows={rows} columns={columns} />;
}

function Users() {
  const columns = [{ key: "id" }, { key: "name" }, { key: "age" }];

  const rows = [
    { id: 1, name: "John", age: 20 },
    { id: 2, name: "Doe", age: 30 },
    { id: 3, name: "Jane", age: 25 },
  ];

  return <Table rows={rows} columns={columns} />;
}

function Table({ rows: propsRows, columns }) {
  const [rows, setRows] = useState(propsRows);
  const { isChecked, clearCheckedRows, checkedRows, selectAllRows } =
    useContext(checkboxContext);
  const { enqueueSnackbar } = useSnackbar();
  return (
    <div>
      <Button
        variant="contained"
        onClick={() => {
          setRows(propsRows.filter(({ id }) => !isChecked(id)));
          enqueueSnackbar(
            `Les lignes: ${checkedRows
              .sort((a, b) => a - b)
              .join(", ")} ont été supprimées avec succès`,
            { variant: "success" }
          );
        }}
      >
        Supprimer
      </Button>
      <Button variant="contained" color="secondary" onClick={clearCheckedRows}>
        Désélectionner tout
      </Button>
      <table>
        <thead>
          <th>
            <Checkbox
              color="primary"
              onChange={() =>
                propsRows.every(({ id }) => checkedRows.includes(id))
                  ? clearCheckedRows()
                  : selectAllRows(propsRows.map(({ id }) => id))
              }
              checked={propsRows.every(({ id }) => checkedRows.includes(id))}
              indeterminate={
                checkedRows.length &&
                !propsRows.every(({ id }) => checkedRows.includes(id))
              }
            />
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
        <CheckboxComponent id={row.id} />
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

export function CheckboxComponent({ id }) {
  const { onCheck, isChecked } = useContext(checkboxContext);
  return (
    <Checkbox
      checked={isChecked(id)}
      onChange={() => onCheck(id, !isChecked(id))}
    />
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
