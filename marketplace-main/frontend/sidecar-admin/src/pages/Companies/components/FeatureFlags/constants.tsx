import DOMPurify from "dompurify";
import moment from "moment/moment";
import TrashIcon from "@material-ui/icons/DeleteOutlined";
import {CompanyFeatureFlag} from "./interfaces";
import ToggleSwitch from "../../../../components/ToggleSwitch";


export const getColumns = (handleToggleChange: any) => {
    return [
        {
            title: "Name",
            flexGrow: 0.5,
            dataKey: "feature.name",
            minWidth: 350,
            Cell: (data: CompanyFeatureFlag) => (
                <>
                    {data.feature.name}
                </>
            ),
        },
        {
            title: "Description",
            dataKey: "feature.description",
            flexGrow: 1,
            minWidth: 250,
            Cell: (data: CompanyFeatureFlag) => (
                <>
                    {data.feature.description}
                </>
            ),
        },
        {
            title: "Last Update",
            flexGrow: 0.5,
            minWidth: 50,
            Cell: (data: CompanyFeatureFlag) => (
                <>
                    {moment(data.modified_at).format('YYYY-MM-DD hh:mm:ss A')}
                </>
            ),
        },
        {
            title: "Turn on/off",
            dataKey: "action",
            minWidth: 100,
            flexGrow: 0.5,
            Cell: (data: CompanyFeatureFlag) => {
                return <ToggleSwitch
                    onChange={(event: any) => handleToggleChange(data.feature.name, event)}
                    checked={data.active}
                />
            },
        },
    ];
}