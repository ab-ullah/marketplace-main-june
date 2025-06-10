import MenuIcon from "@material-ui/icons/MoreVert";
import { MenuIconWrapper, OptionItem, StyledPopover } from "./styles"
import { useState } from "react";

const PoolOptionsMenu = ({ pool, poolId, onRenameCarryPool, onDeletePool, onTransferPoints }: any) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLDivElement>(null)
    const canMovePoints = pool.allocated || pool.un_allocated
    const canDeletePool = pool.allocated === 0;
    const isDeleteDisabled = pool.un_allocated > 0 && pool.allocated === 0

    return <>
    <MenuIconWrapper onClick={(e) => setAnchorEl(e?.currentTarget)}>
          <MenuIcon />
    </MenuIconWrapper>
    <StyledPopover
        id={poolId}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
       {canMovePoints ?  <OptionItem onClick={() => {
            setAnchorEl(null);
            onTransferPoints()
        }}><p>Reassign Unallocated Points</p></OptionItem> : null }
        <OptionItem onClick={() => {
            setAnchorEl(null)
            onRenameCarryPool()
        }}><p>Edit</p></OptionItem>
        {canDeletePool && <OptionItem disabled={isDeleteDisabled} onClick={() => {
            setAnchorEl(null);
            onDeletePool()
        }}><p>Delete</p></OptionItem>}
      </StyledPopover>
    </>
}

export default PoolOptionsMenu
