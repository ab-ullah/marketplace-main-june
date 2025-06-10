import { useEffect, useState, useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";
import NavableLoader from "../../components/NavableLoader";
import { INVESTOR_URL_PREFIX } from "../../constants/routes";
import { getHomepageUrl } from "../../utils/routes";

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

const NotFound = () => {
  const query = useQuery();
  const code = query.get("code");
  const navigate = useHistory();

  const companyName = localStorage.getItem("companyName");
  const companyPrefix = companyName ? `/${companyName}` : "";

  useEffect(() => {
    if (!code) {
      window.open(getHomepageUrl(companyPrefix),"_self");
    }
  }, [companyPrefix]);

  return <NavableLoader />;
};
//   return (
//     <>
//       {isLoading ? (
//         <NavableLoader />
//       ) : (
//         <div>
//           <h1 style={{ textAlign: "center" }}>Invalid Link</h1>
//           <h2 style={{ textAlign: "center" }}>
//             Please visit the link provided by the company
//           </h2>
//         </div>
//       )}
//     </>
//   );
// };

export default NotFound;
