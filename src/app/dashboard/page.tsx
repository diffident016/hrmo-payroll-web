import React from "react";
import TotalCard from "@/components/TotalCard";
import StatsChart from "@/components/EmpStatsChart";
import PayCalendar from "@/components/PayCalendar";
import CompChart from "@/components/EmpCompChart";
import {
  MdWorkOutline,
  MdOutlineGroups,
  MdOutlineGroups2,
  MdOutlineGroups3,
} from "react-icons/md";
import { auth } from "@/auth";
import PageInfo from "@/components/PageInfo";

const HomePage = async () => {
  const userSession = await auth();

  console.log(userSession);
  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4 pb-4">
      <div className="absolute top-4">
        <PageInfo
          title="LGU Jasaan HRMO - Payroll Management System"
          info="An automated system that integrates with DTR/biometrics to streamline
          payroll and boost efficiency."
        />
      </div>
      {/* LEFT */}
      <div className="w-full h-full flex flex-col gap-4">
        {/* TOTAL CARDS */}
        <div className="flex w-full flex-wrap justify-between gap-4">
          <TotalCard
            type="Departments"
            icon={<MdWorkOutline />}
            value={20}
            growth="+5% from last month"
          />
          <TotalCard
            type="Regular Employees"
            icon={<MdOutlineGroups />}
            value={100}
            growth="+3% from last month"
          />
          <TotalCard
            type="Casual Employees"
            icon={<MdOutlineGroups2 />}
            value={150}
            growth="+2% from last month"
          />
          <TotalCard
            type="Job Order Employees"
            icon={<MdOutlineGroups3 />}
            value={300}
            growth="+4% from last month"
          />
        </div>
        {/* STATISTICS */}
        <div className="w-full h-full">
          <StatsChart />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full h-full lg:w-1/3 flex flex-col gap-4">
        {/* PAY DATE */}
        <div className="w-full h-full">
          <PayCalendar />
        </div>
        {/* COMPOSITION */}
        <div className="w-full h-full">
          <CompChart />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
