import { useEffect, useState } from "react";
import { Table, Button, Form, Col, Row } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import styled from "styled-components";
import { OptionTypeBase } from "react-select";
import DeleteIcon from "@material-ui/icons/Delete";
import RestoreIcon from "@material-ui/icons/Restore";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import CheckIcon from "@material-ui/icons/Check";
import { map } from "lodash";

interface DataTableProps {
  data: OptionTypeBase[];
  onChange: any;
  label: string;
}

const Editor = styled(ReactQuill)`
  background-color: white;
  max-height: 300px;
  overflow: auto;
  position: relative;

  .ql-toolbar {
    background-color: white;
    position: sticky;
    z-index: 1;
    top: 0;
  }
  .ql-container {
    min-height: 190px;
  }
`;

const LabelCol = styled(Col)`
  font-size: 15px !important;
  font-weight: 700 !important;
  line-height: 21px;
  padding-bottom: 6px;
`;

const defaultNewEntry = {
  label: "Edit to write",
  value: "<p>Edit to write</p>",
} as OptionTypeBase;

const DataTable = ({ data, onChange, label }: DataTableProps) => {
  const [newData, setNewData] = useState<OptionTypeBase>(defaultNewEntry);
  const [editting, setEditting] = useState<number>(-1);

  useEffect(() => {
    if (newData !== defaultNewEntry) {
      setNewData(defaultNewEntry);
    }
  }, [data]);

  const handleAddData = () => {
    onChange([...data, newData]);
  };

  const handleUpdateData = (_data: string, key: string, index: number) => {
    const updatedData = [...data];
    updatedData[index] = { ...updatedData[index], [key]: _data };
    onChange(updatedData);
  };

  const handleDeleteData = (index: number) => {
    let newList = [...data];
    newList.splice(index, 1);
    onChange(newList);
  };

  return (
    <Row className={"mt-2"}>
      <LabelCol md="12" className="field-label">
        {label}
      </LabelCol>
      <Col md="12">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Label</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {map(data,(item, index) => (
              <tr key={index}>
                <td>
                  {editting === index ? (
                    <Form.Control
                      type="text"
                      value={item.label}
                      onChange={(e) =>
                        handleUpdateData(e.target.value, "label", index)
                      }
                    />
                  ) : (
                    <p>{item.label}</p>
                  )}
                </td>
                <td>
                  {editting === index ? (
                    <Editor
                      value={item.value}
                      onChange={(value) =>
                        handleUpdateData(value, "value", index)
                      }
                    />
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: item.value }} />
                  )}
                </td>
                <td>
                  <DeleteIcon
                    onClick={() => handleDeleteData(index)}
                    className={"cursor-pointer"}
                    style={{ fill: "#b21111" }}
                  />
                  {editting === index ? (
                    <CheckIcon
                      onClick={() => setEditting(-1)}
                      className={"cursor-pointer"}
                      style={{ fill: "green" }}
                    />
                  ) : (
                    <EditIcon
                      onClick={() => setEditting(index)}
                      className={"cursor-pointer"}
                      style={{ fill: "#E37628" }}
                    />
                  )}
                </td>
              </tr>
            ))}
            <tr key="add-new-entry">
              <td>
                <Form.Control
                  type="text"
                  value={newData.label}
                  onChange={(e) =>
                    setNewData((prev) => ({ ...prev, label: e.target.value }))
                  }
                />
              </td>
              <td>
                <Editor
                  value={newData.value}
                  onChange={(value) =>
                    setNewData((prev) => ({ ...prev, value: value }))
                  }
                />
              </td>
              <td>
                <div style={{ display: "flex" }}>
                  <Button
                    variant="primary"
                    onClick={() => handleAddData()}
                    disabled={
                      JSON.stringify(newData) ===
                      JSON.stringify(defaultNewEntry)
                    }
                  >
                    <AddIcon style={{ fill: "white" }} />
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setNewData(defaultNewEntry)}
                    disabled={
                      JSON.stringify(newData) ===
                      JSON.stringify(defaultNewEntry)
                    }
                  >
                    <RestoreIcon style={{ fill: "white" }} />
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </Table>
      </Col>
    </Row>
  );
};

export default DataTable;
