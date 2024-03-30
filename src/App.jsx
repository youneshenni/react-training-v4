/* eslint-disable react/prop-types */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  createRef,
  useRef,
} from "react";
import {
  Checkbox,
  Tabs,
  Tab,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import { SnackbarProvider, useSnackbar } from "notistack";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Delete } from "@mui/icons-material";

const router = createBrowserRouter([
  {
    path: "/",
    element: <NavigationOutlet />,
    children: [
      {
        path: "/",
        element: <Users />,
      },
      {
        path: "/vehicles",
        element: <Vehicles />,
      },
    ],
  },
]);

export function NavigationOutlet() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <Tabs
        value={location.pathname}
        onChange={(e, target) => navigate(target)}
        aria-label="basic tabs example"
        sx={{ marginBottom: 2 }}
      >
        <Tab label="Utilisateurs" value="/" />
        <Tab label="Véhicules" value="/vehicles" />
      </Tabs>
      <Outlet />
    </>
  );
}

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
  const TableWithUsers = withUsers(Table);
  return <TableWithUsers rayane={"Rayane"} />;
}

function withUsers(Component) {
  const [rows, setUsers] = useState([]);
  const columns = Object.keys(rows[0] || {}).map((key) => ({ key }));
  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
    return () => console.log("Cleanup");
  }, []);

  function MyCreatedComponent(props) {
    return <Component {...props} rows={rows} columns={columns} />;
  }
  return MyCreatedComponent;
}

function Table({ rows: propsRows, columns }) {
  const inputRefs = columns.map(() => createRef());
  useEffect(() => {
    setRows(propsRows);
    localStorage.setItem("rows", JSON.stringify(propsRows));
    return () => localStorage.removeItem("rows");
  }, [propsRows]);
  const [rows, setRows] = useState(propsRows);
  const { isChecked, clearCheckedRows, checkedRows, selectAllRows } =
    useContext(checkboxContext);
  const { enqueueSnackbar } = useSnackbar();

  return (
    <div>
      {columns.map(({ key }, index) => (
        <TextField
          key={key}
          label={key}
          inputProps={{ ref: inputRefs[index] }}
        />
      ))}
      <Button
        onClick={() => {
          setRows((rows) => [
            inputRefs
              .map((ref) => ref.current.value)
              .reduce(
                // (acc, curr, i) => ({ ...acc, [columns[i].key]: curr }), // -- THIS IS BETTER
                (acc, curr, i) => {
                  acc[columns[i].key] = curr;
                  return acc;
                },
                {}
              ),
            ...rows,
          ]);
          inputRefs.map((ref) => (ref.current.value = ""));
        }}
      >
        Ajouter
      </Button>
      <IconButton
        color="primary"
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
        <Delete />
      </IconButton>
      <table>
        <thead>
          <tr>
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
                    ? true
                    : false
                }
              />
            </th>
            {columns.map((column) => (
              <th key={column.key}>{column.key}</th>
            ))}
          </tr>
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
  return useMemo(
    () => (
      <Checkbox
        checked={isChecked(parseInt(id))}
        onChange={() => onCheck(id, !isChecked(parseInt(id)))}
      />
    ),
    [isChecked(id), id]
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
