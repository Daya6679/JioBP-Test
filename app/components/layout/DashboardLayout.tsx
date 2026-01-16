"use client";

import { Layout } from "antd";
import { useState } from "react";
import AppHeader from "./Header";
import Sidebar from "./Sidebar";

const { Content } = Layout;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} />

      <Layout>
        <AppHeader
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />

        <Content
          style={{
            marginTop: 88,
            marginLeft: collapsed ? 80: 240,
            padding: "0 24px",
            minHeight: "100vh",
            background: "#f5f6f8",
            borderRadius: 8,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
