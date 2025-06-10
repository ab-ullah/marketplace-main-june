
import { Link } from 'react-router-dom';
import {ActionButton, StatusPill} from './styles'

const getPillColor=(status:string)=>{
  let color = ''
  switch (status) {
    case 'Invited':
     color = '#ECA106'
     break;
    case 'Accepted Invite':
      color = '#10AC84'
      break;
  }
  return color
}

export const getTableColumns =(setRowForAction:any)=>[
    {
        title: "Name",
        dataKey: "full_name",
        flexGrow: 1,
        minWidth: 150,
        fixed: 'left',
        Cell: (row: any) => <Link to={`participants/${row.id}?participant_name=${row.full_name}`}>{row.full_name}</Link>,
      },
    {
        flexGrow: 3,
        minWidth: 300,
        Cell: (row: any) => {
            const codesList = row.investors.map((investor: {investor_account_code: string})  => investor.investor_account_code)
            const codesString = codesList.join(', ');
            return <>
                {codesString}
            </>
        }
    },
      {
        title: "Email",
        dataKey: "email",
        flexGrow: 1.5,
        minWidth: 250,
      },
      {
        title: "Status",
        dataKey: "invite_status",
        flexGrow: 1,
        minWidth: 100,
        Cell: (row: any) => row.invite_status ? <StatusPill color={getPillColor(row.invite_status)}>{row.invite_status}</StatusPill>: <span>-</span>,
      },
      {
        title: "",
        dataKey: "actions",
        flexGrow: 1,
        minWidth: 100,
        fixed: 'right',
        Cell: (row: any) => <ActionButton onClick={()=>setRowForAction(row)}>{row.deleted ? "Undelete": "Delete"}</ActionButton>
      },
]