'use client';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
const shadows = [
  'shadow-none',
  'shadow-sm',
  'shadow',
  'shadow-md',
  'shadow-lg',
  'shadow-xl',
  'shadow-2xl',
  'shadow-inner',
  'shadow-[0_10px_25px_rgba(0,0,0,0.35)]',
];

const Shadow = () => {
  return (
    <PageContainer title="Shadow" description="this is Shadow">
      <DashboardCard title="Shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["Light", "Dark"].map((mode) => (
            <div key={mode} className={mode === 'Dark' ? 'bg-[#111] p-4 rounded' : 'bg-[#f8fafc] p-4 rounded'}>
              <div className="grid grid-cols-2 gap-3">
                {shadows.map((cls, idx) => (
                  <div key={idx} className={`h-14 rounded flex items-center justify-center text-xs ${cls} ${mode === 'Dark' ? 'bg-[#1f2937] text-gray-200' : 'bg-white text-gray-700'}`}>
                    {cls.replace('shadow-', 'shadow=')}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </PageContainer>
  );
};

export default Shadow;
