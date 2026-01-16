"use client";

import { useEffect, useState } from "react";
import {
  Form,
  Select,
  InputNumber,
  Button,
  Card,
  Table,
  Tag,
  Space,
  Modal,
  message,
  Drawer,
  Typography,
  Row,
  Col,
  Input,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  QrcodeOutlined,
  EyeOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text: AntText } = Typography; // Renamed to AntText to avoid browser conflict
const { Option } = Select;
const { Search } = Input;

export default function QRManagementPage() {
  const [form] = Form.useForm();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [qrList, setQrList] = useState<any[]>([]);
  const [filteredQrList, setFilteredQrList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [qrModal, setQrModal] = useState<{ open: boolean; qrBase64?: string }>({
    open: false,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchDrivers(), fetchVehicles(), fetchQrs()]);
    setLoading(false);
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch("/api/drivers");
      const data = await res.json();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (err) {
      setDrivers([]);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      setVehicles([]);
    }
  };

  const fetchQrs = async () => {
    try {
      const res = await fetch("/api/qrs");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setQrList(list);
      setFilteredQrList(list);
    } catch (err) {
      setQrList([]);
    }
  };

  // 1. Added Search Handling Logic
  const handleSearch = (value: string) => {
    const term = value.toLowerCase();
    const filtered = qrList.filter((qr) => {
      const driverName = qr.driverId?.name?.toLowerCase() || "";
      const vehicleNum = qr.vehicleId?.vehicleNumber?.toLowerCase() || "";
      return driverName.includes(term) || vehicleNum.includes(term);
    });
    setFilteredQrList(filtered);
  };

  const createQrRequest = async (values: any) => {
    try {
      const res = await fetch("/api/qrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        message.success("QR request created successfully");
        form.resetFields();
        setIsDrawerOpen(false);
        fetchQrs();
      } else {
        message.error("Failed to create QR request");
      }
    } catch (err) {
      message.error("Error connecting to server");
    }
  };

  const generateQr = async (qrId: string) => {
    const hide = message.loading("Generating Secure QR...", 0);
    try {
      const res = await fetch(`/api/qrs/${qrId}/generate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Generation failed");
      message.success("QR Generated Successfully");
      fetchQrs();
    } catch (err: any) {
      message.error(err.message);
    } finally {
      hide();
    }
  };

  const columns = [
    {
      title: "Driver",
      key: "driver",
      render: (record: any) => (
        <AntText strong>{record.driverId?.name || "N/A"}</AntText>
      ),
    },
    {
      title: "Vehicle",
      key: "vehicle",
      render: (record: any) => (
        <Tag color="blue">{record.vehicleId?.vehicleNumber || "N/A"}</Tag>
      ),
    },
    {
      title: "Fuel / Qty",
      render: (_: any, record: any) => (
        <span>
          {record.fuelType} - <AntText type="secondary">{record.qty}L</AntText>
        </span>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (amount: number) => (
        <AntText strong>₹{amount?.toLocaleString()}</AntText>
      ),
    },
    {
      title: "Status",
      render: (_: any, record: any) => {
        if (record.isUsed)
          return (
            <Tag icon={<CheckCircleOutlined />} color="error">
              Used
            </Tag>
          );
        if (record.qrBase64)
          return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Generated
            </Tag>
          );
        return (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            Pending
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          {!record.qrBase64 ? (
            <Button
              type="primary"
              icon={<QrcodeOutlined />}
              size="small"
              onClick={() => generateQr(record._id)}
            >
              Generate
            </Button>
          ) : (
            <>
              <Button
                icon={<EyeOutlined />}
                size="small"
                onClick={() =>
                  setQrModal({ open: true, qrBase64: record.qrBase64 })
                }
              />
              <a href={record.qrBase64} download={`qr-${record._id}.png`}>
                <Button icon={<DownloadOutlined />} size="small" />
              </a>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            QR Management
          </Title>
          <AntText type="secondary">
            Generate and track fuel request QR codes
          </AntText>
        </div>
        <Space size="middle">
          {/* 2. Added Search Bar */}
          <Search
            placeholder="Search driver or vehicle..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
          <Button
            type="default" // Changed to primary for better UI
            icon={<PlusOutlined />}
            size="middle"
            onClick={() => setIsDrawerOpen(true)}
          >
            New QR Request
          </Button>
        </Space>
        {/* <Button
          type="default"
          icon={<PlusOutlined />}
          size="middle"
          onClick={() => setIsDrawerOpen(true)}
        >
          New QR Request
        </Button> */}
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card className="shadow-sm">
            <Statistic
              title="Pending"
              value={qrList.filter((q) => !q.qrBase64).length}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="shadow-sm">
            <Statistic
              title="Generated"
              value={qrList.filter((q) => q.qrBase64 && !q.isUsed).length}
              valueStyle={{ color: "#3f8600" }}
              prefix={<QrcodeOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="shadow-sm">
            <Statistic
              title="Used"
              value={qrList.filter((q) => q.isUsed).length}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Table
          loading={loading}
          rowKey="_id"
          columns={columns}
          dataSource={filteredQrList.filter((q) => !q.isUsed)}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Drawer
        title="Create New QR Request"
        size={420}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      >
        <Form form={form} layout="vertical" onFinish={createQrRequest}>
          <Form.Item
            name="driverId"
            label="Assign Driver"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select Driver"
              showSearch
              optionFilterProp="children"
            >
              {drivers.map((d) => (
                <Option key={d._id} value={d._id}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="vehicleId"
            label="Select Vehicle"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select Vehicle"
              showSearch
              optionFilterProp="children"
            >
              {vehicles.map((v) => (
                <Option key={v._id} value={v._id}>
                  {v.vehicleNumber}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fuelType"
                label="Fuel Type"
                rules={[{ required: true }]}
              >
                <Select placeholder="Type">
                  <Option value="Petrol">Petrol</Option>
                  <Option value="Diesel">Diesel</Option>
                  <Option value="Electric">Electric</Option>
                  <Option value="Hybrid">Hybrid</Option>
                  <Option value="CNG">CNG</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="qty" label="Liters" rules={[{ required: true }]}>
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="Qty"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="amount"
            label="Amount (₹)"
            rules={[{ required: true }]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="Enter amount"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Create Request
          </Button>
        </Form>
      </Drawer>

      <Modal
        open={qrModal.open}
        footer={[
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            href={qrModal.qrBase64}
            download="qr-code.png"
          >
            Download
          </Button>,
          //   <Button key="close" onClick={() => setQrModal({ open: false })}>
          //     Close
          //   </Button>,
        ]}
        onCancel={() => setQrModal({ open: false })}
        title="Fuel QR Code"
        centered
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          {qrModal.qrBase64 && (
            <img
              src={qrModal.qrBase64}
              alt="QR"
              style={{
                width: "250px",
                border: "1px solid #f0f0f0",
                borderRadius: "8px",
              }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
