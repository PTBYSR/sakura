'use client';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import SyntaxHighlighter from "react-syntax-highlighter";

const Icons = () => {
  return (
    <PageContainer title="Icons" description="this is Icons">

      <DashboardCard title="Icons">
        <div className="text-white text-lg font-semibold mb-2">🔍 Explore Icons</div>
        <div className="text-sm text-gray-300 mb-2">
          Browse and search for icons directly on the{' '}
          <a href="https://tabler-icons.io/" target="_blank" rel="noopener noreferrer" className="text-[#EE66AA] underline">
            Tabler Icons website
          </a>.
        </div>

        <hr className="my-3 border-[#333]" />

        <div className="text-white text-lg font-semibold mb-2">⚙️ Installation</div>

        <div className="text-sm text-gray-300 mb-2">
          To use Tabler icons in your project, install the official React package:
        </div>
        <SyntaxHighlighter language="typescript" style={docco}>
          {` npm install @tabler/icons-react `}
        </SyntaxHighlighter>

        <hr className="my-3 border-[#333]" />

        <div className="text-white text-lg font-semibold mb-2">🧩 Usage Example</div>

        <div className="text-sm text-gray-300 mb-2">Import and use any icon in your components:</div>
        <SyntaxHighlighter language="typescript" style={docco}>
          {`import { IconHome } from '@tabler/icons-react';
function MyComponent() {
  return <IconHome />;
}`}
        </SyntaxHighlighter>
      </DashboardCard>
    </PageContainer>
  );
};

export default Icons;
