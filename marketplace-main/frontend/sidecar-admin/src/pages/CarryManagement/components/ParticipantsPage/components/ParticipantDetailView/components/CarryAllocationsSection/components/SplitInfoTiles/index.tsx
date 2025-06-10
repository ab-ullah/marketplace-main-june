import { InfoValue, InfoTitle, InfoTile, InfoCont } from "./styled";

export const Info = ({ value, label }: any) => {
    return (
      <InfoCont>
        <InfoValue>{value}</InfoValue>
        <InfoTitle>{label}</InfoTitle>
      </InfoCont>
    );
  };
  

const SplitInfoTiles = ({data}:any) => {
    return ( 
        <div style={{display:'flex',gap:'10px'}}>
            {data.map((dat:any)=>(
                <InfoTile>
                    {dat.map((elem:any)=>(
                        <Info value={elem.value} label={elem.label}/>
                    ))}
                </InfoTile>
            ))}
        </div>
     );
}
 
export default SplitInfoTiles;