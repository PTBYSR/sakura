
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { IconArrowUpLeft } from '@tabler/icons-react';

import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

const YearlyBreakup = () => {
  // chart color
  const primary = '#FDA4B8';
  const primarylight = '#ecf2ff';
  const successlight = '#E6FFFA';

  // chart
  const optionscolumnchart: any = {
    chart: {
      type: 'donut',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
      height: 155,
    },
    colors: [primary, primarylight, '#F9F9FD'],
    plotOptions: {
      pie: {
        startAngle: 0,
        endAngle: 360,
        donut: {
          size: '75%',
          background: 'transparent',
        },
      },
    },
    tooltip: { theme: 'dark', fillSeriesColor: false },
    stroke: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    responsive: [
      {
        breakpoint: 991,
        options: {
          chart: {
            width: 120,
          },
        },
      },
    ],
  };
  const seriescolumnchart: any = [38, 40, 25];

  return (
    <DashboardCard title="Yearly Breakup">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 sm:col-span-7">
          <div className="text-2xl font-bold text-white">$36,358</div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-[27px] h-[27px] rounded-full flex items-center justify-center" style={{ backgroundColor: successlight }}>
              <IconArrowUpLeft width={18} color="#39B69A" />
            </div>
            <div className="text-sm font-semibold text-white">+9%</div>
            <div className="text-sm text-gray-400">last year</div>
          </div>
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primary }} />
              <span className="text-sm text-gray-400">2024</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primarylight }} />
              <span className="text-sm text-gray-400">2025</span>
            </div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-5">
          <Chart options={optionscolumnchart} series={seriescolumnchart} type="donut" height={150} width={"100%"} />
        </div>
      </div>
    </DashboardCard>
  );
};

export default YearlyBreakup;
