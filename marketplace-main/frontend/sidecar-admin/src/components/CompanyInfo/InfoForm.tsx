import {FC} from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import AddPhoto from "../../assets/images/add_photo.svg";
import {InfoForm, LogoContainer} from "./styles";
import TextField from "./TextField";

const CompanyInfoForm: FC<any> = ({values, setFieldValue, uploadFile}) => {

  return (
    <InfoForm>
      <Row className={"mb-4 ms-0"}>
        <Col className={'logo-col'}>
          <LogoContainer src={values.logo} alt={values.name || ""}/>
        </Col>
        <Col className={'form-col'}>
          <div>
            <TextField
              label="Company Name"
              placeholder="Company Name"
              name="name"
              disabled={true}
              onChange={(e: any) => setFieldValue("name", e.target.value)}
              value={values.name}
            />
            <TextField
              label="Support Email Address"
              placeholder="Support Email Address"
              name="contact_email"
              onChange={(e: any) => setFieldValue("contact_email", e.target.value)}
              value={values.contact_email}
            />
          </div>
          <div className={'logo-upload'}>
            <input type="file" id="files" className="hidden" onChange={uploadFile}/>
            <label
              htmlFor="files"
            >
              <img src={AddPhoto}/>
              Change Logo
            </label>
          </div>
        </Col>
      </Row>

    </InfoForm>

  )
};

export default CompanyInfoForm;
