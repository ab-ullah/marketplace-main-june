import { FilterBox, InputBox } from "./styles";
import SearchOutlinedIcon from "@material-ui/icons/SearchOutlined";

const SearchInput = ({ value, handleChange, placeholder }: any) => {
  return (
    <FilterBox>
      <SearchOutlinedIcon />
      <InputBox
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e: any) => handleChange(e.target.value)}
      />
    </FilterBox>
  );
};

export default SearchInput;
