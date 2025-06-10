import {IUser} from "./interfaces";
import React from "react";
import DeleteUser from "./components/DeleteUser";
import {DocTitle} from "../../components/CompanyInfo/styles";

const getGroupsList = (groups: any) => {
  return groups.map((group: any) => <li>{group.name}</li>)
}

export const getUserColumns = (callback: any) =>[
  {
    title: "Email",
    dataKey: "email",
    Cell: (row: any) => <DocTitle onClick={() => callback(row)}>{row.email}</DocTitle>,
    width: 300,
    flexGrow: 1,
  },

  {
    title: "Name",
    dataKey: "display_name",
    width: 200,
    flexGrow: 1,
  },
  {
    title: "Access Level",
    dataKey: "display_name",
    width: 400,
    flexGrow: 1.5,
    Cell: (row: IUser) => <div>{row.groups.map(group => group.name).join(', ')}</div>,
  },
  {
    title: "",
    Cell: (row: IUser) => <DeleteUser user={row} key={`delete-${row.id}`}/>,
    width: 220,
    flexGrow: 1,
  },
]