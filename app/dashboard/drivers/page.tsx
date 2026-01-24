"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Tag,
  Card,
  Typography,
  Space,
  message,
  Avatar,
  Tooltip,
  Modal,
  Input,
} from "antd";
import { useRouter } from "next/navigation";
import {
  EditOutlined,
  CalendarOutlined,
  UserOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { confirm } = Modal;
const { Search } = Input;

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  const router = useRouter();

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/drivers");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setDrivers(list);
      setFilteredDrivers(list);
    } catch (err) {
      console.error("Fetch error:", err);
      message.error("Could not load drivers list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const openDriverModal = (record: any) => {
    setSelectedDriver(record);
    setViewModalOpen(true);
  };

  const handleSearch = (value: string) => {
    const term = value.toLowerCase();
    const filtered = drivers.filter(
      (driver: any) =>
        driver.name.toLowerCase().includes(term) ||
        driver.phone.includes(term)
    );
    setFilteredDrivers(filtered);
  };

  const showDeactivateConfirm = (record: any) => {
    confirm({
      title: "Delete Driver?",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: `Are you sure you want to disable ${record.name}?`,
      centered: true,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const res = await fetch(`/api/drivers/${record._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: false }),
          });
          if (res.ok) {
            message.success(`${record.name} deleted successfully`);
            fetchDrivers();
          }
        } catch (err) {
          message.error("Failed to update status");
        }
      },
    });
  };

  const columns = [
    {
      title: "Photo",
      dataIndex: "image",
      key: "image",
      width: 80,
      render: (image: string) => {
        const src = image && !image.startsWith('data:') ? `data:image/jpeg;base64,${image}` : image;
        return <Avatar src={src} icon={<UserOutlined />} size={50} />;
      },
    },
    {
      title: "Driver Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (text: string, record: any) => (
        <Text className={record.isActive ? "font-semibold" : "font-semibold text-gray-400"}>
          {text}
        </Text>
      ),
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "License Details",
      key: "license",
      render: (_: any, record: any) => (
        <div className="text-xs">
          <div className="text-gray-400">No: {record.licenseNumber}</div>
          <div>Expires: {record.licenseValidity ? dayjs(record.licenseValidity).format("YYYY-MM-DD") : "N/A"}</div>
        </div>
      ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
    },
    {
      title: "Created On",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a: any, b: any) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      defautlSortOrder: "descend" as const,
      render: (date: string) => (
        <Space size="small" className="text-xs">
          <CalendarOutlined style={{ color: "#8c8c8c" }} />
          {dayjs(date).format("YYYY-MM-DD HH:mm")}
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>{active ? "ACTIVE" : "INACTIVE"}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button type="link" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/drivers/add?id=${record._id}`) }} />
          </Tooltip>
          {record.isActive && (
            <Tooltip title="Delete">
              <Button type="link" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); showDeactivateConfirm(record) }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card className="shadow-sm border-0" style={{ borderRadius: "12px" }}>
      {/* Responsive Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <Title level={4} style={{ margin: 0 }}>Drivers Directory</Title>
          <Text type="secondary">Manage and monitor vehicle operators</Text>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Search
            placeholder="Search by name or phone..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full md:w-[300px]"
          />
          <Button
            type="primary"
            className="rounded-md w-full sm:w-auto"
            onClick={() => router.push("/dashboard/drivers/add")}
          >
            + Add New Driver
          </Button>
        </div>
      </div>

      {/* --- MOBILE VIEW: Card List --- */}
      <div className="block md:hidden space-y-4">
        {filteredDrivers.map((driver: any) => (
          <div 
            key={driver._id} 
            className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm"
            onClick={() => openDriverModal(driver)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-3">
                <Avatar 
                  size={50} 
                  src={driver.image && !driver.image.startsWith('data:') ? `data:image/jpeg;base64,${driver.image}` : driver.image} 
                  icon={<UserOutlined />} 
                />
                <div>
                  <div className={`font-bold ${driver.isActive ? "" : "text-gray-400"}`}>{driver.name}</div>
                  <div className="text-xs text-gray-500"><PhoneOutlined /> {driver.phone}</div>
                </div>
              </div>
              <Tag color={driver.isActive ? "green" : "red"}>{driver.isActive ? "ACTIVE" : "INACTIVE"}</Tag>
            </div>

            <div className="grid grid-cols-2 gap-y-2 mb-3 text-xs bg-gray-50 p-2 rounded">
              <div>
                <Text type="secondary" className="block text-[10px] uppercase">License No</Text>
                <Text>{driver.licenseNumber}</Text>
              </div>
              <div>
                <Text type="secondary" className="block text-[10px] uppercase">Expires</Text>
                <Text>{driver.licenseValidity ? dayjs(driver.licenseValidity).format("YYYY-MM-DD") : "N/A"}</Text>
              </div>
              <div className="col-span-2">
                <Text type="secondary" className="block text-[10px] uppercase"><EnvironmentOutlined /> Address</Text>
                <Text ellipsis>{driver.address || "N/A"}</Text>
              </div>
              <div className="col-span-2">
                <Text type="secondary" className="block text-[10px] uppercase"><CalendarOutlined /> Created On</Text>
                <Text>{dayjs(driver.createdAt).format("YYYY-MM-DD HH:mm")}</Text>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
               <Button size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/drivers/add?id=${driver._id}`); }} />
               {driver.isActive && (
                 <Button size="small" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); showDeactivateConfirm(driver); }} />
               )}
            </div>
          </div>
        ))}
      </div>

      {/* --- DESKTOP VIEW: Table --- */}
      <div className="hidden md:block">
        <Table
          dataSource={filteredDrivers}
          columns={columns}
          rowKey="_id"
          loading={loading}
          onRow={(record) => ({ onClick: () => openDriverModal(record) })}
          pagination={{ defaultPageSize: 10, showSizeChanger: true }}
          className="cursor-pointer"
        />
      </div>

      {/* Details Modal (shared) */}
      <Modal open={viewModalOpen} title="Driver Details" onCancel={() => setViewModalOpen(false)} footer={null} width={640} centered>
        {selectedDriver && (
          <Space orientation="vertical" size={24} style={{ width: "100%" }}>
            <Space align="center" size={20}>
              <Avatar size={96} icon={<UserOutlined />} src={selectedDriver.image && !selectedDriver.image.startsWith('data:') ? `data:image/jpeg;base64,${selectedDriver.image}` : selectedDriver.image} />
              <div>
                <Title level={4} style={{ margin: 0 }}>{selectedDriver.name}</Title>
                <Tag color={selectedDriver.isActive ? "green" : "red"} style={{ marginTop: 6 }}>{selectedDriver.isActive ? "ACTIVE" : "INACTIVE"}</Tag>
              </div>
            </Space>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="col-span-1">
                <Text type="secondary" className="text-xs">Phone</Text>
                <div className="font-medium">{selectedDriver.phone}</div>
              </div>
              <div className="col-span-1">
                <Text type="secondary" className="text-xs">License Number</Text>
                <div className="font-medium">{selectedDriver.licenseNumber || "N/A"}</div>
              </div>
              <div className="col-span-1">
                <Text type="secondary" className="text-xs">License Validity</Text>
                <div className="font-medium">{selectedDriver.licenseValidity ? dayjs(selectedDriver.licenseValidity).format("YYYY-MM-DD") : "N/A"}</div>
              </div>
              <div className="col-span-1">
                <Text type="secondary" className="text-xs">Created On</Text>
                <div className="font-medium">{dayjs(selectedDriver.createdAt).format("YYYY-MM-DD HH:mm")}</div>
              </div>
              <div className="col-span-2">
                <Text type="secondary" className="text-xs">Address</Text>
                <div className="font-medium">{selectedDriver.address || "N/A"}</div>
              </div>
            </div>
          </Space>
        )}
      </Modal>
    </Card>
  );
}










