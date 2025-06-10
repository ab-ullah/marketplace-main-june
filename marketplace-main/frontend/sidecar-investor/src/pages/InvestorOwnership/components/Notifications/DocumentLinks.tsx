import React, {FunctionComponent} from 'react';
import {INotification, INotificationDocument} from "../../../../interfaces/investorOwnership";
import API from "../../../../api"
import StyledBadge from "../../../../presentational/StyledBadge";


interface DocumentsLinksProps {
  notification: INotification,
}


const DocumentsLinks: FunctionComponent<DocumentsLinksProps> = ({notification}) => {
  const handleDownload = async (notificationDocument: INotificationDocument) => {
    await API.downloadDocument(notificationDocument.document_id, notificationDocument.title.replace(/\./g, '_'))
  }


  return <>
    {notification.documents.map((notificationDocument => <div>
      <StyledBadge
        className={'cursor-pointer'}
        pill
        bg={'primary'}
        onClick={() => handleDownload(notificationDocument)}
      >
        {notificationDocument.title}
      </StyledBadge>
    </div>))}
  </>

};

export default DocumentsLinks;
