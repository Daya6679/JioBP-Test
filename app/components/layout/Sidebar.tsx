"use client";

import { Layout, Menu } from "antd";
import Link from "next/link";
import {
  DashboardOutlined,
  UserOutlined,
  CarOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import { usePathname } from "next/navigation";

const { Sider } = Layout;

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      theme="light"
      width={240}
      style={{
        borderRight: "1px solid #f0f0f0",
        position: "fixed",
        top: 64,
        bottom: 0,
        left: 0,
        overflow: "auto",
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        items={[
          {
            key: "/dashboard",
            icon: <DashboardOutlined />,
            label: <Link href="/dashboard">Dashboard</Link>,
          },
          {
            key: "/dashboard/drivers",
            icon: <UserOutlined />,
            label: <Link href="/dashboard/drivers">Drivers</Link>,
          },
          {
            key: "/dashboard/vehicles",
            icon: <CarOutlined />,
            label: <Link href="/dashboard/vehicles">Vehicles</Link>,
          },
          {
            key: "/dashboard/qr",
            icon: <QrcodeOutlined />,
            label: <Link href="/dashboard/qr">Generate QR</Link>,
          },
        ]}
      />
    </Sider>
  );
}
