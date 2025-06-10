import React, {FunctionComponent} from 'react'
import imageIcon from "../../assets/images/image-icon.svg";
import deleteIcon from "../../assets/images/delete-icon.svg";
import styled from "styled-components";


const ImageIconDiv = styled.div`
  padding: 15px;

  a {
    font-family: Quicksand;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: #000000;
    text-decoration: none;
  }

  .deleteImg {
    cursor: pointer;
  }
`


interface ImageIconProps {
  url: string,
  onDelete: () => void;

}


const ImageIcon: FunctionComponent<ImageIconProps> = ({url, onDelete}) => {
  const urlParts = url.split('/')
  const name = urlParts[urlParts.length - 1]
  return (
    <ImageIconDiv className={'mt-2'}>
      <img className={'me-3'} src={imageIcon} alt={name} />
      <a href={url} target={'_blank'} rel="noreferrer">{name}</a>
      <img className={'ms-3 deleteImg'} src={deleteIcon} alt={'delete'} onClick={onDelete}/>
    </ImageIconDiv>
  )
}

export default ImageIcon;