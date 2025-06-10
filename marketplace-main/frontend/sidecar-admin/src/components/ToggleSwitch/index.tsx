import { ToggleContainer, ToggleLabel,Input, Slider, Switch  } from "./styles";

interface IToggleSwitch {
  title?: string;
  checked?: boolean;
  onChange?: any;
  disabled?:boolean
}

const ToggleSwitch = ({ title ,checked, onChange, disabled }:IToggleSwitch) => {
    return (
      <ToggleContainer>
        
        <Switch>
          <Input type="checkbox" checked={checked} onChange={onChange} disabled={disabled}/>
          <Slider checked={Boolean(checked)} disabled={disabled}></Slider>
        </Switch>
        <ToggleLabel>{title}</ToggleLabel>
      </ToggleContainer>
    );
  };
  
  
  export default ToggleSwitch;
  
  
  
  