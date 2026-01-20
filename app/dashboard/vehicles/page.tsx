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
  Tooltip,
  Modal,
  Input,
} from "antd";
import { useRouter } from "next/navigation";
import {
  EditOutlined,
  CarOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { confirm } = Modal;
const { Search } = Input;

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const router = useRouter();

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vehicles"); // Ensure this endpoint exists
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setVehicles(list);
      setFilteredVehicles(list);
    } catch (err) {
      console.error("Fetch error:", err);
      message.error("Could not load vehicles list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const openVehicleModal = (record: any) => {
    setSelectedVehicle(record);
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

  const handleSearch = (value: string) => {
    const term = value.toLowerCase();
    const filtered = vehicles.filter(
      (v: any) =>
        v.make?.toLowerCase().includes(term) ||
        v.model?.toLowerCase().includes(term) ||
        v.vehicleNumber?.toLowerCase().includes(term) ||
        v.nickname?.toLowerCase().includes(term)
    );
    setFilteredVehicles(filtered);
  };

  const showDeactivateConfirm = (record: any) => {
    confirm({
      title: "Deactivate Vehicle?",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: `Are you sure you want to disable ${record.vehicleNumber}? It will be hidden from active operations.`,
      centered: true,
      okText: "Yes, Deactivate",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const res = await fetch(`/api/vehicles/${record._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: false }),
          });
          if (res.ok) {
            message.success(`Vehicle ${record.vehicleNumber} deactivated`);
            fetchVehicles();
          } else {
            message.error("Failed to update status");
          }
        } catch (err) {
          message.error("Error connecting to server");
        }
      },
    });
  };

  const columns = [
    {
      title: "Make & Model",
      key: "vehicleInfo",
      fixed: 'left' as const, // Keeps identity visible while scrolling
      width: 200,
      render: (record: any) => (
        <Space>
          <CarOutlined
            style={{
              fontSize: "18px",
              color: record.isActive ? "#1890ff" : "#bfbfbf",
            }}
          />
          <div>
            <div
              className={
                record.isActive
                  ? "font-semibold"
                  : "font-semibold text-gray-400"
              }
            >
              {record.make} {record.model}
            </div>
            <div className="text-xs text-gray-400">
              {record.nickname || "No Nickname"}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Vehicle No.",
      dataIndex: "vehicleNumber",
      key: "vehicleNumber",
      render: (text: string) => <Tag color="blue">{text || "N/A"}</Tag>,
    },
    {
      title: "Fuel Type",
      dataIndex: "fuelType",
      key: "fuelType",
      responsive: ['md'] as any, // Hides on mobile to save space
      render: (type: string) => (
        <span className="capitalize">{type || "N/A"}</span>
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
      title: "Created On",
      dataIndex: "createdAt",
      key: "createdAt",
      responsive: ['lg'] as any, // Only shows on large screens
      sorter: (a: any, b: any) =>
        dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      render: (date: string) => (
        <span className="text-gray-500">
          {dayjs(date).format("YYYY-MM-DD")}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      fixed: 'right' as const, // Keeps buttons always accessible
      width: 120,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                openVehicleModal(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/vehicles/add?id=${record._id}`);
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
                  showDeactivateConfirm(record);
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
            Vehicles Management
          </Title>
          <Typography.Text type="secondary">
            View and manage your fleet
          </Typography.Text>
        </div>
        <Space wrap>
          <Search
            placeholder="Search by model, no, or nickname..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
          <Button
            type="default"
            icon={<CarOutlined />}
            onClick={() => router.push("/dashboard/vehicles/add")}
          >
            Add New Vehicle
          </Button>
        </Space>
      </div>

      <Table
        dataSource={filteredVehicles}
        columns={columns}
        rowKey="_id"
        loading={loading}
        onRow={(record) => ({
          onClick: () => openVehicleModal(record),
        })}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} vehicles`,
        }}
        className="cursor-pointer"
      />

      <Modal
        open={viewModalOpen}
        title="Vehicle Information"
        onCancel={() => setViewModalOpen(false)}
        footer={null}
        width={500}
        centered
      >
        {selectedVehicle && (
          <Space
            orientation="vertical"
            size={20}
            style={{ width: "100%", paddingTop: 10 }}
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-50 rounded-full">
                <CarOutlined style={{ fontSize: 32, color: "#1890ff" }} />
              </div>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {selectedVehicle.make} {selectedVehicle.model}
                </Title>
                <Text type="secondary">
                  {selectedVehicle.nickname || "No Nickname"}
                </Text>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <Detail
                label="Vehicle Number"
                value={selectedVehicle.vehicleNumber}
              />
              <Detail
                label="Fuel Type"
                value={selectedVehicle.fuelType || "N/A"}
              />
              <Detail
                label="Status"
                value={selectedVehicle.isActive ? "Active" : "Inactive"}
              />
              <Detail
                label="Registration Date"
                value={dayjs(selectedVehicle.createdAt).format("MMMM DD, YYYY")}
              />
            </div>
          </Space>
        )}
      </Modal>
    </Card>
  );
}














