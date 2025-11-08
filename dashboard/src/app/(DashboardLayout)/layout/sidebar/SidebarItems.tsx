import React from "react";
import Menuitems from "./MenuItems";
import {
  Logo,
  Sidebar as MUI_Sidebar,
  Menu,
  MenuItem,
  Submenu,
} from "react-mui-sidebar";
import { IconPoint } from '@tabler/icons-react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upgrade } from "./Updrade";


const renderMenuItems = (items: any, pathDirect: any) => {


  return items.map((item: any) => {

    const Icon = item.icon ? item.icon : IconPoint;

    const itemIcon = <Icon stroke={1.5} size="1.3rem" />;

    if (item.subheader) {
      // Display Subheader
      return (
        <div className={item.navlabel ? 'block' : 'hidden'} key={item.subheader}>
          <Menu
            subHeading={item.subheader}
            key={item.subheader}
          >
            {null}
          </Menu>
        </div>
      );
    }

    //If the item has children (submenu)
    if (item.children) {
      return (
        <Submenu
          key={item.id}
          title={item.title}
          icon={itemIcon}
          borderRadius='7px'
        >
          {renderMenuItems(item.children, pathDirect)}
        </Submenu>
      );
    }

    // If the item has no children, render a MenuItem

    return (
      <div className="px-3" key={item.id}>
        <MenuItem
          key={item.id}
          isSelected={pathDirect === item?.href}
          borderRadius='8px'
          icon={itemIcon}
          link={item.href}
          component={Link}
        >
          {item.title}
        </MenuItem >
      </div>

    );
  });
};


const SidebarItems = () => {
  const pathname = usePathname();
  const pathDirect = pathname;

  return (
    < >
      <MUI_Sidebar width={"100%"} showProfile={false} themeColor={"#5D87FF"} themeSecondaryColor={'#EE66AA'} >

        <Logo img='/images/logos/dark-logo.svg' component={Link} href="/" >Modernize</Logo>
<div className="mt-5">


        {renderMenuItems(Menuitems, pathDirect)}
        </div>
        {/* <Box px={2}>
          <Upgrade />
        </Box> */}
      </MUI_Sidebar>

    </>
  );
};
export default SidebarItems;
