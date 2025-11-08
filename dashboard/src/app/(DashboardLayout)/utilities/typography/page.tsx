'use client';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import BlankCard from '@/app/(DashboardLayout)/components/shared/BlankCard';


const TypographyPage = () => {
  return (
    <PageContainer title="Typography" description="this is Typography">
      <div className="grid grid-cols-1 gap-3">
        <div>
          <DashboardCard title="Default Text">
            <div className="grid grid-cols-1 gap-3">
              <BlankCard>
                <div className="p-4">
                  <div className="text-4xl font-bold text-white">h1. Heading</div>
                  <div className="text-sm text-gray-300">font size: 30 | line-height: 45 | font weight: 500</div>
                </div>
              </BlankCard>
              <BlankCard>
                <div className="p-4">
                  <div className="text-3xl font-semibold text-white">h2. Heading</div>
                  <div className="text-sm text-gray-300">font size: 24 | line-height: 36 | font weight: 500</div>
                </div>
              </BlankCard>
              <BlankCard>
                <div className="p-4">
                  <div className="text-2xl font-semibold text-white">h3. Heading</div>
                  <div className="text-sm text-gray-300">font size: 21 | line-height: 31.5 | font weight: 500</div>
                </div>
              </BlankCard>
              <BlankCard>
                <div className="p-4">
                  <div className="text-xl font-semibold text-white">h4. Heading</div>
                  <div className="text-sm text-gray-300">font size: 18 | line-height: 27 | font weight: 500</div>
                </div>
              </BlankCard>
              <BlankCard>
                <div className="p-4">
                  <div className="text-lg font-semibold text-white">h5. Heading</div>
                  <div className="text-sm text-gray-300">font size: 16 | line-height: 24 | font weight: 500</div>
                </div>
              </BlankCard>
              <BlankCard>
                <div className="p-4">
                  <div className="text-base font-semibold text-white">h6. Heading</div>
                  <div className="text-sm text-gray-300">font size: 14 | line-height: 21 | font weight: 500</div>
                </div>
              </BlankCard>
              <BlankCard>
                <div className="p-4">
                  <div className="text-base text-white">subtitle1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur</div>
                  <div className="text-sm text-gray-300">font size: 16 | line-height: 28 | font weight: 400</div>
                </div>
              </BlankCard>
              <BlankCard>
                <div className="p-4">
                  <div className="text-sm text-white">subtitle2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur</div>
                  <div className="text-sm text-gray-300">font size: 14 | line-height: 21 | font weight: 400</div>
                </div>
              </BlankCard>
              <BlankCard>
                <div className="p-4">
                  <div className="text-base text-white">body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur</div>
                  <div className="text-sm text-gray-300">font size: 16 | line-height: 24 | font weight: 400</div>
                </div>
              </BlankCard>
              <BlankCard>
                <div className="p-4">
                  <div className="text-sm text-white">body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur</div>
                  <div className="text-sm text-gray-300">font size: 14 | line-height: 20 | font weight: 400</div>
                </div>
              </BlankCard>
              <BlankCard>
                <div className="p-4">
                  <div className="text-xs uppercase tracking-wide text-white">caption. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur</div>
                  <div className="text-sm text-gray-300">font size: 12 | line-height: 19 | font weight: 400</div>
                </div>
              </BlankCard>
              <BlankCard>
                <div className="p-4">
                  <div className="text-xs uppercase tracking-wide text-white">overline. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur</div>
                  <div className="text-sm text-gray-300">font size: 12 | line-height: 31 | font weight: 400</div>
                </div>
              </BlankCard>
            </div>

          </DashboardCard>
        </div>
        <div>
          <DashboardCard title="Default Text">
            <div className="grid grid-cols-1 gap-3">
              <BlankCard>
                <div className="p-4">
                  <div className="text-lg text-white">Text Primary</div>
                  <div className="text-sm text-white">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur</div>
                </div>
              </BlankCard>
              <BlankCard>
                <div className="p-4">
                  <div className="text-lg text-gray-300">Text Secondary</div>
                  <div className="text-sm text-gray-300">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur</div>
                </div>
              </BlankCard>
              <BlankCard>
                <div className="p-4">
                  <div className="text-lg" style={{ color: '#539BFF' }}>Text Info</div>
                  <div className="text-sm" style={{ color: '#539BFF' }}>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur</div>
                </div>
              </BlankCard>
              <BlankCard>
                <div className="p-4">
                  <div className="text-lg" style={{ color: '#FDA4B8' }}>Text Primary</div>
                  <div className="text-sm" style={{ color: '#FDA4B8' }}>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur</div>
                </div>
              </BlankCard>
              <BlankCard>
                <div className="p-4">
                  <div className="text-lg" style={{ color: '#FFAE1F' }}>Text Warning</div>
                  <div className="text-sm" style={{ color: '#FFAE1F' }}>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur</div>
                </div>
              </BlankCard>
              <BlankCard>
                <div className="p-4">
                  <div className="text-lg" style={{ color: '#FA896B' }}>Text Error</div>
                  <div className="text-sm" style={{ color: '#FA896B' }}>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur</div>
                </div>
              </BlankCard>
              <BlankCard>
                <div className="p-4">
                  <div className="text-lg" style={{ color: '#13DEB9' }}>Text Success</div>
                  <div className="text-sm" style={{ color: '#13DEB9' }}>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur</div>
                </div>
              </BlankCard>
            </div>
          </DashboardCard>
        </div>
      </div >
    </PageContainer>
  );
};

export default TypographyPage;
