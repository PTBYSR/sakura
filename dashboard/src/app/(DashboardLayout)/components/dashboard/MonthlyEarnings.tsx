
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { IconArrowDownRight, IconCurrencyDollar } from '@tabler/icons-react';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

const MonthlyEarnings = () => {
  // chart color
  const secondary = '#EE66AA';
  const secondarylight = '#f5fcff';
  const errorlight = '#fdede8';

  // chart
  const optionscolumnchart: any = {
    chart: {
      type: 'area',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
      height: 60,
      sparkline: {
        enabled: true,
      },
      group: 'sparklines',
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      colors: [secondarylight],
      type: 'solid',
      opacity: 0.05,
    },
    markers: {
      size: 0,
    },
    tooltip: { theme: 'dark' },
  };
  const seriescolumnchart: any = [
    {
      name: '',
      color: secondary,
      data: [25, 66, 20, 40, 12, 58, 20],
    },
  ];

  return (
    <DashboardCard
      title="Monthly Earnings"
      action={
        <button className="w-10 h-10 rounded-full bg-[#EE66AA] text-white flex items-center justify-center">
          <IconCurrencyDollar width={20} />
        </button>
      }
      footer={
        <Chart options={optionscolumnchart} series={seriescolumnchart} type="area" height={60} width={"100%"} />
      }
    >
      <>
        <div className="text-2xl font-bold -mt-5 text-white">$6,820</div>
        <div className="flex items-center gap-2 my-2">
          <div className="w-[27px] h-[27px] rounded-full flex items-center justify-center" style={{ backgroundColor: errorlight }}>
            <IconArrowDownRight width={18} color="#FA896B" />
          </div>
          <div className="text-sm font-semibold text-white">+9%</div>
          <div className="text-sm text-gray-400">last year</div>
        </div>
      </>
    </DashboardCard>
  );
};

export default MonthlyEarnings;
