// "use client";

// import { Layout, Menu } from "antd";
// import Link from "next/link";
// import {
//   DashboardOutlined,
//   UserOutlined,
//   CarOutlined,
//   QrcodeOutlined,
// } from "@ant-design/icons";
// import { usePathname } from "next/navigation";

// const { Sider } = Layout;

// export default function Sidebar({ collapsed }: { collapsed: boolean }) {
//   const pathname = usePathname();

//   return (
//     <Sider
//       collapsible
//       collapsed={collapsed}
//       trigger={null}
//       theme="light"
//       width={240}
//       style={{
//         borderRight: "1px solid #f0f0f0",
//         position: "fixed",
//         top: 64,
//         bottom: 0,
//         left: 0,
//         overflow: "auto",
//       }}
//     >
//       <Menu
//         mode="inline"
//         selectedKeys={[pathname]}
//         items={[
//           {
//             key: "/dashboard",
//             icon: <DashboardOutlined />,
//             label: <Link href="/dashboard">Dashboard</Link>,
//           },
//           {
//             key: "/dashboard/drivers",
//             icon: <UserOutlined />,
//             label: <Link href="/dashboard/drivers">Drivers</Link>,
//           },
//           {
//             key: "/dashboard/vehicles",
//             icon: <CarOutlined />,
//             label: <Link href="/dashboard/vehicles">Vehicles</Link>,
//           },
//           {
//             key: "/dashboard/qr",
//             icon: <QrcodeOutlined />,
//             label: <Link href="/dashboard/qr">Generate QR</Link>,
//           },
//         ]}
//       />
//     </Sider>
//   );
// }










"use client";

import { Layout, Menu, Modal, message } from "antd";
import Link from "next/link";
import {
  DashboardOutlined,
  UserOutlined,
  CarOutlined,
  QrcodeOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const { Sider } = Layout;

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Modal.confirm({
      title: "Logout Confirmation",
      content: "Are you sure you want to log out from the dashboard?",
      okText: "Yes, Logout",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          // callbackUrl: "/login" ensures they go back to the login page
          // redirect: true is the default behavior for signOut
          await signOut({ callbackUrl: "/login" });
          message.success("Logged out successfully");
        } catch (error) {
          message.error("Failed to logout. Please try again.");
        }
      },
    });
  };

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
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1 }}>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          style={{ borderRight: 0 }}
          items={[
            // {
            //   key: "/dashboard",
            //   icon: <DashboardOutlined />,
            //   label: <Link href="/dashboard">Dashboard</Link>,
            // },
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
      </div>

      {/* Logout Button Section at Bottom */}
      <Menu
        mode="inline"
        selectable={false}
        style={{ borderTop: "1px solid #f0f0f0" }}
        onClick={handleLogout}
        items={[
          {
            key: "logout",
            icon: <LogoutOutlined style={{ color: "#ff4d4f" }} />,
            label: <span style={{ color: "#ff4d4f" }}>Logout</span>,
          },
        ]}
      />
    </Sider>
  );
}
