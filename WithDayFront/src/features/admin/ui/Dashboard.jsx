import { useEffect } from "react";
import { getDashboardData } from "../api";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
  });

  useEffect(() => {
    console.log(dashboardData);
  });
};

export default Dashboard;
