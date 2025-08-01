import { format } from "date-fns";
import { getBusinessDays, getTotalHolidays } from "./holidays";
import { REGULAR_SCHEDULE } from "@/data/constants";

export const computeTotalDaysAndLate = ({
  dates,
  settings,
  employee,
  businessDays = 10,
}: {
  dates: any[];
  settings: any;
  employee?: any;
  businessDays?: number;
}) => {
  const days = dates
    .map((item: any) => item.timestamp)
    .reduce((acc: any, dateTime: any) => {
      const date = format(new Date(dateTime), "yyyy-MM-dd HH:mm:ss").split(
        " "
      )[0];
      acc[date] = acc[date] || [];
      acc[date].push(new Date(dateTime));
      return acc;
    }, {});

  const gracePeriod = settings.gracePeriod || 10;
  const schedule = employee?.schedule || REGULAR_SCHEDULE;

  // console.log("In Time:", schedule.inTime.$date);
  // console.log("Out Time:", schedule.outTime.$date);

  Object.keys(days).forEach((date) => {
    const dayOfWeek = new Date(date).getDay();

    if (!schedule.daysIncluded.includes(dayOfWeek)) {
      delete days[date];
    }
  });

  const inOut = Object.keys(days).map((date) => {
    const times = days[date].sort(
      (a: Date, b: Date) => a.getTime() - b.getTime()
    );

    const inTime = new Date(date + "T" + schedule.inTime.$date.split("T")[1]);
    const outTime = new Date(date + "T" + schedule.outTime.$date.split("T")[1]);
    const workingHours =
      (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60) - 1;

    const totalHours =
      (times[times.length - 1].getTime() - times[0].getTime()) /
      (1000 * 60 * 60);

    const cutoff = inTime;
    cutoff.setMinutes(cutoff.getMinutes() + gracePeriod);

    const lateness = times[0].getTime() - cutoff.getTime();
    const totalDays = Math.min(
      1,
      Math.floor(totalHours / workingHours) +
        (totalHours % workingHours) / workingHours
    );
    const totalLate = lateness > 0 ? Math.floor(lateness / (1000 * 60)) : 0;
    const deductions = (totalLate / 480) * 300;

    return {
      totalDays,
      late: totalLate,
      deductions,
    };
  }) as any;

  const total = inOut.reduce((sum: number, num: any) => sum + num.totalDays, 0);
  const late = inOut.reduce((sum: number, num: any) => sum + num.late, 0);
  const lateDeductions = inOut.reduce(
    (sum: number, num: any) => sum + num.deductions,
    0
  );

  //temporary calculations
  let earnings = 0;

  if (employee.type === "MONTHLY") {
    earnings = Math.min(
      (employee.rate / 2 / businessDays) * total,
      employee.rate / 2
    );
  } else {
    earnings = employee ? total * employee.rate : 0;
  }

  const deductions = employee
    ? getTotalDeduction(employee) + lateDeductions
    : 0;
  const net = earnings - deductions;

  return {
    totalDays: total % 1 === 0 ? total.toFixed(0) : total.toFixed(1),
    late: late % 1 === 0 ? late.toFixed(0) : late.toFixed(1),
    earnings: earnings % 1 === 0 ? earnings.toFixed(0) : earnings.toFixed(1),
    deductions:
      deductions % 1 === 0 ? deductions.toFixed(0) : deductions.toFixed(1),
    net: net % 1 === 0 ? net.toFixed(0) : net.toFixed(1),
  };
};

export const computeTotalDaysAndLateSingle = ({
  reports,
  employee,
  settings,
  businessDays = 10,
}: {
  reports: any;
  employee: any;
  settings: any;
  businessDays?: number;
}) => {
  const gracePeriod = settings.gracePeriod || 10;
  const schedule = employee?.schedule || REGULAR_SCHEDULE;

  const sortedReports = Object.keys(reports)
    .sort((a: any, b: any) => new Date(b).getTime() - new Date(a).getTime())
    .map((date, index: number) => {
      // If there are more than 4 timestamps for the date, keep only the first and last

      console.log("Date:", date);

      const times = reports[date].sort(
        (a: Date, b: Date) => a.getTime() - b.getTime()
      );

      const inTime = new Date(date + "T" + schedule.inTime.$date.split("T")[1]);
      const outTime = new Date(
        date + "T" + schedule.outTime.$date.split("T")[1]
      );
      const totalHours =
        (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60) - 1;

      // const totalHours =
      //   (times[times.length - 1].getTime() - times[0].getTime()) /
      //     (1000 * 60 * 60) -
      //   1;

      const cutoff = inTime;
      cutoff.setMinutes(cutoff.getMinutes() + gracePeriod);
      const lateness = times[0].getTime() - cutoff.getTime();
      const totalDays = Math.min(
        1,
        Math.floor(totalHours / 8) + (totalHours % 8) / 8
      );
      const totalLate = lateness > 0 ? Math.floor(lateness / (1000 * 60)) : 0;
      const deductions = (totalLate / 480) * 300;

      //temporary calculations
      let earnings = 0;
      if (employee.type === "MONTHLY") {
        earnings = (employee.rate / 2 / businessDays) * totalDays;
      } else {
        earnings = employee ? totalDays * employee.rate : 0;
      }

      const net = employee ? earnings - deductions : 0;

      return {
        date,
        name: employee.name,
        earnings:
          earnings % 1 === 0 ? earnings.toFixed(0) : earnings.toFixed(1),
        deductions:
          deductions % 1 === 0 ? deductions.toFixed(0) : deductions.toFixed(1),
        net: net % 1 === 0 ? net.toFixed(0) : net.toFixed(1),
      };
    });

  // if (sortedReports.length > 4) {
  //   return [
  //     sortedReports[0],
  //     sortedReports[1],
  //     sortedReports[2],
  //     sortedReports[sortedReports.length - 1],
  //   ];
  // }

  return sortedReports;
};

const getTotalDeduction = (employee: any) => {
  const deductionList = [
    "gsisgs",
    "ec",
    "gsisps",
    "phic",
    "hdmfgs",
    "hdmfps",
    "wtax",
    "sss",
    "mplhdmf",
    "gfal",
    "landbank",
    "cb",
    "eml",
    "mplgsis",
    "tagum",
    "ucpb",
    "mpllite",
    "sb",
  ];

  return deductionList.reduce((sum: number, deduction: string) => {
    return sum + employee[deduction] || 0;
  }, 0);
};

const timeStringToDate = (timeString: string): Date => {
  console.log("Time String:", timeString);
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const getTotalBusinessDays = (from: Date, to: Date, events: any[]) => {
  from = new Date(from);
  to = new Date(to);

  return getBusinessDays(from, to) - getTotalHolidays(events);
};
