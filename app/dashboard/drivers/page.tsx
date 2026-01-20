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
  Modal, // Ensure Modal is explicitly imported
  Input,
} from "antd";
import { useRouter } from "next/navigation";
import {
  EditOutlined,
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs"; // Import dayjs for easy date formatting
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";

dayjs.extend(localeData);
dayjs.extend(weekday);

const { Title } = Typography;
const { confirm } = Modal;
const { Search } = Input;

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]); // State for search results
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

  // Modal

  const openDriverModal = (record: any) => {
    setSelectedDriver(record);
    setViewModalOpen(true);
  };

  const Detail = ({
    label,
    value,
    fullWidth = false,
  }: {
    label: string;
    value: string;
    fullWidth?: boolean;
  }) => (
    <div style={{ gridColumn: fullWidth ? "1 / -1" : undefined }}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {label}
      </Typography.Text>
      <div style={{ fontWeight: 500 }}>{value}</div>
    </div>
  );

  // 1. Search Logic
  const handleSearch = (value: string) => {
    const filtered = drivers.filter(
      (driver: any) =>
        driver.name.toLowerCase().includes(value.toLowerCase()) ||
        driver.phone.includes(value)
    );
    setFilteredDrivers(filtered);
  };

  const showDeactivateConfirm = (record: any) => {
    confirm({
      title: "Deactivate Driver?",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: `Are you sure you want to disable ${record.name}? They will no longer be able to log in.`,
      centered: true,
      okText: "Yes, Deactivate",
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
            message.success(`${record.name} deactivated successfully`);
            fetchDrivers();
          } else {
            const errorData = await res.json();
            message.error(errorData.message || "Failed to update status");
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
      render: (image: string) => {
        const src = image && !image.startsWith('data:') ? `data:image/jpeg;base64,${image}` : image;
        return (
          <Avatar
            src={src}
            icon={<UserOutlined />}
            size={50}
            className="border border-gray-200"
          />
        );
      },
    },
    {
      title: "Driver Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      defaultSortOrder: "descend" as const,
      render: (text: string, record: any) => (
        <Space>
          <UserOutlined
            style={{ color: record.isActive ? "#1890ff" : "#bfbfbf" }}
          />
          <span
            className={
              record.isActive ? "font-semibold" : "font-semibold text-gray-400"
            }
          >
            {text}
          </span>
        </Space>
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
        <div>
          <div className="text-xs text-gray-400">
            No: {record.licenseNumber}
          </div>
          {/* FIXED: Formatted the date string using dayjs to remove the T00:00:00Z part */}
          <div className="text-xs">
            Expires:{" "}
            {record.licenseValidity
              ? dayjs(record.licenseValidity).format("YYYY-MM-DD")
              : "N/A"}
          </div>
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
      sorter: (a: any, b: any) =>
        dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      defaultSortOrder: "descend" as const,
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: "#8c8c8c" }} />
          <span>{dayjs(date).format("YYYY-MM-DD HH:mm")}</span>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "ACTIVE" : "INACTIVE"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/drivers/add?id=${record._id}`)
              }}
            />
          </Tooltip>
          {record.isActive && (
            <Tooltip title="Deactivate">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  showDeactivateConfirm(record)
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card className="shadow-sm border-0" style={{ borderRadius: "12px" }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4} style={{ margin: 2 }}>
            Drivers Directory
          </Title>
          <Typography.Text type="secondary">
            Manage and monitor vehicle operators
          </Typography.Text>
        </div>
        <Space wrap>
          {/* 1. AntD SearchBar */}
          <Search
            placeholder="Search by name or phone..."
            allowClear
            size="middle"
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)} // Real-time search
            style={{ width: 300 }}
          />
          <Button
            type="default"
            size="middle"
            className="rounded-md shadow-md"
            onClick={() => router.push("/dashboard/drivers/add")}
          >
            + Add New Driver
          </Button>
        </Space>
      </div>
      <Table
        dataSource={filteredDrivers}
        columns={columns}
        rowKey="_id"
        loading={loading}
        onRow={(record) => ({
          onClick: () => openDriverModal(record),
        })}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total) => `Total ${total} drivers`,
        }}
        className="rounded-lg overflow-hidden cursor-pointer"
      />

      <Modal
        open={viewModalOpen}
        title="Driver Details"
        onCancel={() => setViewModalOpen(false)}
        footer={null} // ✅ remove bottom close button
        width={640}
        centered
      >
        {selectedDriver && (
          <Space orientation="vertical" size={24} style={{ width: "100%" }}>
            {/* HEADER SECTION */}
            <Space align="center" size={20}>
              <Avatar
                src={
                  selectedDriver.image && !selectedDriver.image.startsWith('data:')
                    ? `data:image/jpeg;base64,${selectedDriver.image}`
                    : selectedDriver.image
                }
                size={96} // ✅ bigger photo
                icon={<UserOutlined />}
              />

              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {selectedDriver.name}
                </Title>

                <Tag
                  color={selectedDriver.isActive ? "green" : "red"}
                  style={{ marginTop: 6 }}
                >
                  {selectedDriver.isActive ? "ACTIVE" : "INACTIVE"}
                </Tag>
              </div>
            </Space>

            {/* DETAILS SECTION */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <Detail label="Phone" value={selectedDriver.phone} />
              <Detail
                label="License Number"
                value={selectedDriver.licenseNumber || "N/A"}
              />
              <Detail
                label="License Validity"
                value={
                  selectedDriver.licenseValidity
                    ? dayjs(selectedDriver.licenseValidity).format("YYYY-MM-DD")
                    : "N/A"
                }
              />
              <Detail
                label="Created On"
                value={dayjs(selectedDriver.createdAt).format(
                  "YYYY-MM-DD HH:mm"
                )}
              />
            </div>

            {/* ADDRESS */}
            <Detail
              label="Address"
              value={selectedDriver.address || "N/A"}
              fullWidth
            />
          </Space>
        )}
      </Modal>
    </Card>
  );
}
