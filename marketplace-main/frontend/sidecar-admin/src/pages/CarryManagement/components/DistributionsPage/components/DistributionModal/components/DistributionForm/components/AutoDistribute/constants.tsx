import get from "lodash/get";
import { CSSProperties } from "react";
import { formatCurrencyWithTwoDecimals } from "../../../../../../../../../../utils/currency";
import { getSumByProperty, limitCarryDecimalPlaces } from "../../../../../../../../../../utils/getValue";
import map from "lodash/map";

const footerRowStyle = {
    borderTop: "1px solid #D5DAE1",
    position: "absolute",
    top: "0px",
    padding: "8px",
    width: "100%",
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "55px",
    background: "#F5F7F8",
    left: 0,
  } as CSSProperties;
  
  const hideTextStyle = { color: "transparent" } as CSSProperties;
  
  const isFooter = (row: any) => get(row, "isFooter") === true;

export const getColumns =()=> [
    {
      title: "Participant",
      dataKey: "full_name",
      width: 180,
      Cell: (row: any) => (
        <span style={isFooter(row) ? footerRowStyle : {}}>
          {get(row, "full_name")}
        </span>
      ),
    },
    {
        title: "Points",
        dataKey: "bps",
        width: 150,
        flexGrow: 1,
        Cell: (row: any) => (
          <span style={isFooter(row) ? { ...footerRowStyle, ...(get(row,"bps")?{}:hideTextStyle) } : {}}>{get(row, "bps")? limitCarryDecimalPlaces(get(row, "bps")):"-"}</span>
        ),
      },
    {
      title: "Gross Distributions",
      width: 150,
      flexGrow: 1,
      Cell: (row: any) => (
        <span
          style={isFooter(row) ? footerRowStyle : {}}
        >
          {formatCurrencyWithTwoDecimals(row.amount)}
        </span>
      ),
    },

    {
        title: "Escrow ($)",
        width: 150,
        flexGrow: 1,
        Cell: (row: any) => (
          <span
            style={isFooter(row) ? { ...footerRowStyle, ...(get(row,"escrow")?{}:hideTextStyle) } : {}}
          >
            {formatCurrencyWithTwoDecimals(row.escrow)}
          </span>
        ),
      },
      {
        title: "Escrow (%)",
        dataKey: "escrow_percentage",
        width: 150,
        flexGrow: 1,
        Cell: (row: any) => (
          <span style={isFooter(row) ? { ...footerRowStyle, ...hideTextStyle } : {}}>
            {(isFooter(row) || !get(row,"escrow_percentage")) ? "-" : `${get(row,"escrow_percentage")} %` }
          </span>
        ),
        
      },
      {
        title: "Net Distributions",
        dataKey: "net_distribution",
        width: 150,
        flexGrow: 1,
        Cell: (row: any) => (
          <span
            style={isFooter(row) ? footerRowStyle: {}}
          >
            {formatCurrencyWithTwoDecimals(Number(get(row,"net_distribution")),"USD","$0")}
          </span>
        ),
        fixed: "right",
      },
  ];

  export const formatAllocationsData=(allocations:any[],totalPoints:number,totalDistributionsAmount:number)=>{
    return map(allocations, allocation=>{
        const percentBps = allocation.bps/totalPoints
        const amount=Number ((percentBps * totalDistributionsAmount).toFixed(2))
        const escrow_percentage = Number((allocation.escrow_percentage || 0).toFixed(2))
        const escrow = Number((escrow_percentage/100*amount).toFixed(2))
        const net_distribution = Number((amount-escrow).toFixed(2))
        return{
            ...allocation,
            amount,
            escrow_percentage,
            escrow,
            net_distribution
        }
    })
  }

  export const generateUnallocatedRow = (totalDistributionsAmount:number, unAllocatedPoints:number, totalPoints:number)=>{
    const amount= totalDistributionsAmount * unAllocatedPoints / totalPoints
    return {
        full_name: "Unallocated Carry",
        bps:unAllocatedPoints,
        amount,
        net_distribution: amount,
        isFooter: true
    }
  }

  export const generateFooter = (allocationsList:any[])=>{
    return {
        full_name: "Total",
        amount: Number(getSumByProperty(allocationsList,'amount')).toFixed(2),
        escrow: Number(getSumByProperty(allocationsList,'escrow')).toFixed(2),
        net_distribution: Number(getSumByProperty(allocationsList,'net_distribution')).toFixed(2),
        isFooter:true
    }
  }