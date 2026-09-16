'use client';

import { Layout, Menu, Modal, message, Drawer } from 'antd';
import Link from 'next/link';
import {
  UserOutlined,
  CarOutlined,
  QrcodeOutlined,
  LogoutOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    Modal.confirm({
      title: 'Logout Confirmation',
      content: 'Are you sure you want to log out?',
      okText: 'Yes, Logout',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await signOut({ callbackUrl: '/login' });
          message.success('Logged out successfully');
        } catch {
          message.error('Failed to logout.');
        }
      },
    });
  };

  // Menu items shared between Drawer and Sider
  const menuItems = [
    {
      key: '/dashboard/drivers',
      icon: <UserOutlined />,
      label: <Link href="/dashboard/drivers">Drivers</Link>,
    },
    {
      key: '/dashboard/vehicles',
      icon: <CarOutlined />,
      label: <Link href="/dashboard/vehicles">Vehicles</Link>,
    },
    {
      key: '/dashboard/qr',
      icon: <QrcodeOutlined />,
      label: <Link href="/dashboard/qr">Generate QR</Link>,
    },
    {
      key: '/dashboard/transactions',
      icon: <HistoryOutlined />,
      label: <Link href="/dashboard/transactions">Transactions</Link>,
    },
  ];

  const MenuContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1 }}>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          style={{ borderRight: 0 }}
          items={menuItems}
          onClick={() => isMobile && setCollapsed(true)} // Close drawer on link click
        />
      </div>
      <Menu
        mode="inline"
        selectable={false}
        style={{ borderTop: '1px solid #f0f0f0' }}
        onClick={handleLogout}
        items={[
          {
            key: 'logout',
            icon: <LogoutOutlined style={{ color: '#ff4d4f' }} />,
            label: <span style={{ color: '#ff4d4f' }}>Logout</span>,
          },
        ]}
      />
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setCollapsed(true)}
        open={!collapsed}
        style={{ padding: 0 }}
        size={240}
      >
        {MenuContent}
      </Drawer>
    );
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      theme="light"
      width={240}
      style={{
        borderRight: '1px solid #f0f0f0',
        position: 'fixed',
        top: 64,
        bottom: 0,
        left: 0,
        overflow: 'auto',
        zIndex: 1000,
      }}
    >
      {MenuContent}
    </Sider>
  );
}
