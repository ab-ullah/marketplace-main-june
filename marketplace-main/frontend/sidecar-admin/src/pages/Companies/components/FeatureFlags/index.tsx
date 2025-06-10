import React, {useEffect, useState} from 'react';
import RSuite from "../../../../components/Table/RSuite";
import {getColumns} from "./constants";
import API from "../../../../api/backendApi"
import {CompanyFeatureFlag} from "./interfaces";

const FeatureFlags = () => {
    const [featureFlags, setFeatureFlags] = useState<CompanyFeatureFlag[]>([]);

    useEffect(() => {
        fetchFeatureFlags()
    }, [])

    const fetchFeatureFlags = async () => {
        const res = await API.fetchFeatureFlags()
        setFeatureFlags(res)
    }

    const handleActivate = async (featureFlag: string) => {
        return await API.activateFeatureFlag(featureFlag)
    }

    const handleDeactivate = async (featureFlag: string) => {
        return await API.deactivateFeatureFlag(featureFlag)
    }

    const handleFeatureFlagChange = (featureFlag: string, res: boolean) => setFeatureFlags(prevFlags =>
        prevFlags.map(flag =>
            flag.feature.name === featureFlag
                ? { ...flag, active: res }
                : flag
        )
    );

    const toggleFeatureFlag = (featureFlag: string, params: any) => {
        let promise
        if (params.target.checked){
            promise = handleActivate(featureFlag)
        } else {
            promise = handleDeactivate(featureFlag)
        }
        promise.then((res) => handleFeatureFlagChange(featureFlag, res))
    }
    return (
        <>
            <div className='task-type-heading'>Feature Flags</div>
            <RSuite rowSelection={false} data={featureFlags} columns={getColumns(toggleFeatureFlag)}/>
        </>
    )
}

export default FeatureFlags;