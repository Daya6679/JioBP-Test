"use client";

import { Layout, Button, Typography } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import Image from "next/image";
import { usePathname } from "next/navigation";

const { Header } = Layout;
const { Title } = Typography;

export default function AppHeader({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  const getPageName = () => {
    if (pathname.includes("drivers")) return "Drivers";
    if (pathname.includes("vehicles")) return "Vehicles";
    if (pathname.includes("qr")) return "Generate QR";
    return "Dashboard";
  };

  return (
    <Header
      style={{
        background: "#ffffff",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #f0f0f0",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        zIndex: 1000,
      }}
    >
      {/* LEFT SECTION: Logo + Toggle + Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20, // Increased gap for better spacing
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Image
            src="/Jio-bp_logo.svg"
            alt="JioBP Logo"
            width={80} // Slightly reduced to save horizontal space
            height={60}
            priority
            style={{ objectFit: "contain" }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginLeft: "130px", // Adds specific breathing room from the logo
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onToggle}
            style={{ fontSize: 18 }}
          />

          <Title level={5} style={{ margin: 0, fontWeight: 500, whiteSpace: "nowrap" }}>
            User / {getPageName()}
          </Title>
        </div>
      </div>

      {/* RIGHT SECTION: BIOMETRIK LOGO */}
      <div
        style={{
          width: 140,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Image
          src="/biometrik-logo.jpeg"
          alt="Biometrik Logo"
          width={120}
          height={40}
          priority
          style={{ objectFit: "contain" }}
        />
      </div>
    </Header>
  );
}