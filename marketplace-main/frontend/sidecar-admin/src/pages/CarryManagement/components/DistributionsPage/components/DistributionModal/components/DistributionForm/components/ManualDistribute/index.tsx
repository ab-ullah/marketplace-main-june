import { SectionBorder, StyledRow } from "../../styles";
import RsuiteTable from "../../../../../../../../../../components/Table/RSuite";
import { generateFooter, getColumns } from "./constants";
import { filter, get, map } from "lodash";
import { getSumByProperty, truncateDecimal } from "../../../../../../../../../../utils/getValue";
import { useEffect, useState } from "react";
import { Col } from "react-bootstrap";
import { FormTextFieldRow } from "../../../../../../../../../../components/Form/TextField";
import { createDecimal, decimalDivide, decimalGreaterThan, decimalMultiply, decimalSubtract } from "../../../../../../../../../../utils/decimal";

interface IManualDistributeProps {
  state: Record<string, any>;
  setState: any;
}

const ManualDistribute = ({ state, setState }: IManualDistributeProps) => {
  const { allocations } = state;
  const [searchQuery, setSearchQuery] = useState("")

  const handleUpdateField = (
    allocationId: string,
    attributes: Record<string, any>
  ) => {
    const strIfZero =(val:any)=> (Number(val)===0) ? "" : val
    const updatedAllocations = map(get(state, "allocations", []), (row) => {
      if (row.allocation_id === allocationId) {
        

        let escrow =get(row, "escrow","")
        let escrow_percentage= get(row, "escrow_percentage","")
        let amount = get(row, "amount","")

        if(attributes?.hasOwnProperty("escrow")){
            escrow = get(attributes,"escrow",0)
            escrow_percentage =strIfZero(truncateDecimal(decimalMultiply(decimalDivide(escrow,(amount || 1)),100).toString(),4))
        }

        if(attributes?.hasOwnProperty("escrow_percentage")){
          escrow_percentage = get(attributes,"escrow_percentage",0)
          escrow = strIfZero(truncateDecimal(decimalDivide(decimalMultiply(escrow_percentage,amount),100).toString(),2))
      }

      if(attributes?.hasOwnProperty("amount")){
        amount = get(attributes,"amount",0)
        if(amount){
          if(decimalGreaterThan(escrow,amount)) escrow = strIfZero(truncateDecimal(createDecimal(amount).toString(),2))

           escrow_percentage = strIfZero(truncateDecimal(decimalMultiply(decimalDivide(escrow,(amount || 1)),100).toString(),4))
          }
          else{
          escrow =""
          escrow_percentage= ""
          }
    }

    const updatedAttributes ={amount,escrow,escrow_percentage}

      const updatedRow = {
        ...row,
        ...updatedAttributes,
      };

        return {
          ...updatedRow,
          net_distribution: truncateDecimal (decimalSubtract(get(updatedRow, "amount", 0), get(updatedRow, "escrow",0)).toString(),2)
        };
      }
      return row;
    });
    setState((prev: any) => ({
      ...prev,
      allocations: updatedAllocations,
      amount: getSumByProperty(updatedAllocations, "amount"),
      escrow: getSumByProperty(updatedAllocations, "escrow"),
      net_distribution: getSumByProperty(updatedAllocations, "net_distribution"),
    }));
  };

  const searchFilter = (data: any) => {
    if (searchQuery)
      return filter(data, (dat: any) =>
        dat.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    else return data;
  };

  useEffect(()=>{
    // To calculate derived fields on loading for edit flow
    handleUpdateField("",{})
  },[])

  return (
    <SectionBorder>
       <div className="mt-2">
        <StyledRow>
          <Col lg={4}>
            <FormTextFieldRow
              label=""
              placeholder="Search participants"
              name="search"
              onChange={(e: any) => setSearchQuery(e.target.value)}
              value={searchQuery}
            />
          </Col>
          </StyledRow>
          </div>
      <div className="mt-3">
        <RsuiteTable
          height="400px"
          allowColMinWidth={true}
          dataKey="allocation_id"
          columns={getColumns(handleUpdateField)}
          data={allocations?.length ? [...searchFilter(allocations), generateFooter(allocations)] : []}
          rowHeight={72}
          rowSelection={false}
        />
      </div>
    </SectionBorder>
  );
};

export default ManualDistribute;
