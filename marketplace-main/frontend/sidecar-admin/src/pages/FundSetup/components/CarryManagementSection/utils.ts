export const sumPropertyValues = (arr: any[], property: string) => {
  return arr.reduce((sum, obj) => sum + (obj[property] ?? 0), 0);
};

export const calculateAllocatedBps = (carryAllocation: any) => {
  const { pools, allocations } = carryAllocation;

  return (
    sumPropertyValues((pools || []), "bps") + sumPropertyValues((allocations || []), "bps")
  );
};

export const calculateUnAllocatedBps= (carryAllocation: any) => {
  return carryAllocation.bps - calculateAllocatedBps(carryAllocation)
}

export const getObjectHierarchyByPoolId = (obj: any, poolId: any) => {
  const hierarchy: any[] = [];

  const traverse = (obj: any) => {
    hierarchy.push({ poolId: obj.external_id, name: obj.name });

    if (obj.external_id === poolId) {
      return true;
    }

    if (obj.pools && obj.pools.length > 0) {
      for (let pool of obj.pools) {
        if (traverse(pool)) {
          return true;
        }
      }
    }

    hierarchy.pop();
    return false;
  };

  traverse(obj);
  return hierarchy;
};

export const findObjectByPoolId = (obj: any, poolId: any) => {
  if ((obj.external_id === poolId )|| !poolId) {
    return obj;
  }
  if (obj.pools && obj.pools.length > 0) {
    for (let pool of obj.pools) {
      const foundObj: any = findObjectByPoolId(pool, poolId);
      if (foundObj) {
        return foundObj;
      }
    }
  }
  return null;
};

export const getRefPoolId:any=(hierarchy:any)=>{

  let base_pool_id =null
  let parent_pool_id=null

  if(hierarchy.length>1){
    base_pool_id=hierarchy[1].poolId
    parent_pool_id=[...hierarchy].pop().poolId
  }

  return {base_pool_id,parent_pool_id}
}

  export const DEFAULT_ALLOCATION_ACTION_PAYLOAD = {
     base_pool_id: "",
     parent_pool_id: "",
     email: "",
     pool_name: "",
     allocation_id: "",
     type: 0,
     bps: 0,
   };