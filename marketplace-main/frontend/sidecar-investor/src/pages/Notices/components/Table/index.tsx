import React, {FC, useEffect, useRef, useState} from "react";
import {Cell, Column, HeaderCell, Table} from "rsuite-table";
import map from "lodash/map";
import get from "lodash/get";
import size from "lodash/size";
import without from "lodash/without";

import {Wrapper} from "./styles";
import {Image, OverlayTrigger, Tooltip} from "react-bootstrap";
import {GLOSSARY_DEFINITION_HASH} from "../../../../constants/glossaryItemsHash";
import infoIconWhite from "../../../../assets/images/info-icon-white.svg";
import {Description, ParentDiv, RsuiteInfoButton} from "../../../../components/ToolTip/styles";
import {Heading} from "../../../../components/GlossaryToolTip";
import TreeToggleButton from "./TreeToggleButton";

interface IColumns {
  title?: any;
  dataKey?: any;
  width?: any;
  Cell?: any;
}

interface IRSuite {
  isLoading?: boolean;
  allowColMinWidth?: boolean;
  wordWrap?: boolean;
  columns?: IColumns[];
  height?: string;
  data?: any;
  dataKey?: string;
  rowSelection?: boolean;
  emptyMessage?: string;
  handleSelectRow?: (data: any) => void;
  align?: string;
  isTree?: boolean;
  sortColumn?: any;
  sortType?: any;
  onSortColumn?: (dataKey: any, sortType: any) => void;
}

const RsSuite: FC<IRSuite> = ({
                                isLoading,
                                allowColMinWidth,
                                height,
                                wordWrap,
                                columns,
                                data,
                                dataKey,
                                emptyMessage,
                                rowSelection,
                                handleSelectRow,
                                onSortColumn,
                                align,
                                isTree,
                                sortColumn,
                                sortType
                              }) => {
  const [checkValues, setCheckValues] = useState<any[]>([]);
  const [wrapperHeight, setHeight] = useState(0);
  const ref = useRef(null);

  const tableRef = React.useRef();

  const handleCheckCellChange = (value: any) => {
    value = +value;
    let nextCheckValues: any[] = [...checkValues];

    if (nextCheckValues.includes(value)) {
      nextCheckValues = without(nextCheckValues, value);
    } else {
      nextCheckValues.push(value);
    }
    setCheckValues(nextCheckValues);
    if (handleSelectRow) handleSelectRow(nextCheckValues);
  };

  const getTableWidth = (column: any) => {
    const data: any = {};
    if (column.width) data.width = column.width;
    if (column.flexGrow) {
      data.flexGrow = column.flexGrow;
      if (allowColMinWidth)
        data.minWidth = 100;
    }
    if (column.minWidth && allowColMinWidth) data.minWidth = column.minWidth;
    return data;
  };

  const handleRowClick = (row: any, e: any) => {
    if (row.fund_page) window.open(row.fund_page)

  }

  useEffect(() => {
    if (get(ref, "current.clientHeight") && size(data) > 0)
      setHeight(get(ref, "current.clientHeight"));
  }, [data]);

  return (
    <Wrapper style={{height}}>
      <div className="table-container" ref={ref}>
        <Table
          height={height === "" ? undefined : wrapperHeight}
          autoHeight={height === ""}
          data={data}
          ref={tableRef}
          shouldUpdateScroll={false}
          loading={isLoading}
          wordWrap={wordWrap}
          locale={{emptyMessage}}
          onRowClick={handleRowClick}
          rowHeight={70}
          className='ownership-table'
          isTree={isTree}
          rowKey={'id'}
          sortColumn={sortColumn}
          sortType={sortType}
          onSortColumn={onSortColumn}
          headerHeight={99}
          renderTreeToggle={TreeToggleButton}
        >
          {map(columns, (column: any) => {
            return <Column
              key={column.dataKey}
              align={align}
              {...getTableWidth(column)}
              fixed={column?.fixed}
              verticalAlign={'middle'}
              className={wordWrap ? "wrap-word" : ""}
              sortable={column.isSortable}
            >
              <HeaderCell style={{
                fontFamily: 'Quicksand Medium',
                fontSize: '13px',
                paddingLeft: '15px',
                position: 'relative',
                height: '80px',
                verticalAlign: 'bottom',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: (column.tooltip?.heading || column.isSortable) ? 'space-between': "flex-start",

              }}>
                {column.title}
                {column.tooltip?.heading && <OverlayTrigger
                  placement="bottom"
                  overlay={
                    <Tooltip id="button-tooltip-2" arrowProps={{style: {'display': "none", 'height': '0px'}}}>
                      <ParentDiv>
                        <Heading>{column.tooltip.heading}</Heading>
                        <Description>{column.tooltip.description}</Description>
                      </ParentDiv>
                    </Tooltip>
                  }
                >
                  {({ref, ...triggerHandler}) => (
                    <span
                      style={{marginLeft: '8px', marginRight: '2px'}}
                      {...triggerHandler}
                      className="align-items-center info-icon"
                    >
                      <Image
                        ref={ref}
                        roundedCircle
                        src={infoIconWhite}
                        alt="info icon"
                      />
                    </span>
                  )}
                </OverlayTrigger>}
              </HeaderCell>
              <Cell style={{paddingLeft: '16px'}} dataKey={column.dataKey}>{column.Cell}</Cell>
            </Column>
          })}
        </Table>
      </div>
    </Wrapper>
  );
};

RsSuite.defaultProps = {
  dataKey: "id",
  rowSelection: true,
  allowColMinWidth: true,
  height: "",
  emptyMessage: "No data found.",
  align: "center",
  isTree: false
};

export default RsSuite;
