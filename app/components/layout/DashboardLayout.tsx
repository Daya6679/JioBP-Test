// "use client";

// import { Layout } from "antd";
// import { useState } from "react";
// import AppHeader from "./Header";
// import Sidebar from "./Sidebar";

// const { Content } = Layout;

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [collapsed, setCollapsed] = useState(false);

//   return (
//     <Layout style={{ minHeight: "100vh" }}>
//       <Sidebar collapsed={collapsed} />

//       <Layout>
//         <AppHeader
//           collapsed={collapsed}
//           onToggle={() => setCollapsed(!collapsed)}
//         />

//         <Content
//           style={{
//             marginTop: 88,
//             marginLeft: collapsed ? 80: 240,
//             padding: "0 24px",
//             minHeight: "100vh",
//             background: "#f5f6f8",
//             borderRadius: 8,
//           }}
//         >
//           {children}
//         </Content>
//       </Layout>
//     </Layout>
//   );
// }














"use client";

import { Layout } from "antd";
import { useState, useEffect } from "react";
import AppHeader from "./Header";
import Sidebar from "./Sidebar";

const { Content } = Layout;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Track screen width to adjust content margin
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Optional: Auto-collapse or hide sidebar when switching to mobile
      if (mobile) setCollapsed(true);
    };
    
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Pass setCollapsed to Sidebar so it can close itself on mobile link clicks */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <Layout>
        <AppHeader
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />

        <Content
          style={{
            marginTop: 88,
            /* Responsive Margin:
               1. If Mobile: 0 (Drawer overlaps, doesn't push content)
               2. If Desktop & Collapsed: 80
               3. If Desktop & Expanded: 240
            */
            marginLeft: isMobile ? 0 : (collapsed ? 80 : 240),
            padding: isMobile ? "0 12px" : "0 24px", // Slimmer padding on mobile
            minHeight: "100vh",
            background: "#f5f6f8",
            transition: "margin-left 0.2s, padding 0.2s", // Smooth transition
          }}
        >
          <div style={{ paddingBottom: 24 }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
