import React, {FunctionComponent} from 'react';
import {Card} from "react-bootstrap";
import StatToolTip from "../../../../components/GlossaryToolTip/StatBlockToolTip";


interface StatCardProps {
  heading: string;
  value: string | number | React.ReactNode;
  glossaryHeading?: string
  glossaryValue?: string
}

const StatCard: FunctionComponent<StatCardProps> = ({heading, value, glossaryHeading, glossaryValue}) => {
  return <Card>
    <Card.Body>
      <div className={'stat-card-body'}>
        <div className="heading">{heading}{glossaryHeading && glossaryValue && <StatToolTip
          heading={glossaryHeading}
          description={glossaryValue}
        />}</div>
        <div className="value">{value}</div>
      </div>
    </Card.Body>
  </Card>
};

export default StatCard;
