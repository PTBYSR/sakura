import SidebarItems from "./SidebarItems";

interface ItemType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
  isSidebarOpen: boolean;
}

const sidebarWidth = 270;

const MSidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
}: ItemType) => {
  return (
    <>
      {/* Desktop permanent sidebar */}
      <aside
        className="hidden lg:block flex-shrink-0"
        style={{ width: sidebarWidth }}
      >
        <div className="h-full overflow-y-auto border-r border-gray-800 bg-[#1e1e1e]">
          <SidebarItems />
        </div>
      </aside>

      {/* Mobile temporary drawer */}
      {isMobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onSidebarClose as any}
          />
          <div
            className="fixed z-50 top-0 bottom-0 left-0 w-[270px] bg-[#1e1e1e] border-r border-gray-800 shadow-xl"
          >
            <div className="h-full overflow-y-auto">
              <SidebarItems />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MSidebar;
