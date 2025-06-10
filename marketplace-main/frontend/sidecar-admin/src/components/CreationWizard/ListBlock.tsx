import { FunctionComponent } from "react";
import classNames from "classnames";
import Nav from "react-bootstrap/Nav";
import BlockActions from "../CreationWizard/BlockActions";
import { NavItem } from "./styles";

interface ListBlockProps {
  canDelete: boolean;
  imgSrc?: string;
  position: number;
  needBlueBackground?: boolean;
  blockName: string;
  onDelete?: () => void;
  criteriaBlock?: any;
}

const ListBlock: FunctionComponent<ListBlockProps> = ({
  canDelete,
  imgSrc,
  position,
  needBlueBackground,
  blockName,
  criteriaBlock,
}) => {
  return (
    <NavItem>
      <Nav.Link>
        <div>
          <span
            className={classNames("block-tag", {
              "blue-background": needBlueBackground,
            })}
          >
            {position}
            <img
              src={imgSrc}
              className="world-icon-white"
              alt="World icon white"
              width={20}
              height={20}
            />
          </span>
        </div>
        <span className="block-name">{blockName}</span>
      </Nav.Link>
      {canDelete && criteriaBlock && (
        <BlockActions criteriaBlock={criteriaBlock} />
      )}
    </NavItem>
  );
};

export default ListBlock;
