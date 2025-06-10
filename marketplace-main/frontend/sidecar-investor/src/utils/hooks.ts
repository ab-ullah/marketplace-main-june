import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const useCompanyPrefix = () => {
  const [companyPrefix, setCompanyPrefix] = useState("");
  const { company } = useParams<{ company: string }>();

  useEffect(() => {
    setCompanyPrefix(company ? `/${company}` : "");
  }, [company]);
  return { companyPrefix };
};
