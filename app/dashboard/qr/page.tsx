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
  Typography,
  Row,
  Col,
  Input,
  Statistic,
  Radio,
} from "antd";
import {
  PlusOutlined,
  QrcodeOutlined,
  EyeOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text: AntText } = Typography;
const { Option } = Select;
const { Search } = Input;

export default function QRManagementPage() {
  const [form] = Form.useForm();
  const requestType = Form.useWatch("requestType", form);

  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [qrList, setQrList] = useState<any[]>([]);
  const [filteredQrList, setFilteredQrList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
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
    } catch (err) { setDrivers([]); }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) { setVehicles([]); }
  };

  const fetchQrs = async () => {
    try {
      const res = await fetch("/api/qrs");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setQrList(list);
      setFilteredQrList(list);
    } catch (err) { setQrList([]); }
  };

  const handleSearch = (value: string) => {
    const term = value.toLowerCase();
    const filtered = qrList.filter((qr) => {
      const driverName = qr.driverId?.name?.toLowerCase() || "";
      const vehicleNum = qr.vehicleId?.vehicleNumber?.toLowerCase() || "";
      const nickname = qr.vehicleId?.nickname?.toLowerCase() || "";
      return driverName.includes(term) || vehicleNum.includes(term) || nickname.includes(term);
    });
    setFilteredQrList(filtered);
  };

  const createQrRequest = async (values: any) => {
    try {
      const submissionData = {
        driverId: values.driverId,
        vehicleId: values.vehicleId,
        fuelType: values.fuelType,
        qty: values.requestType === "liters" ? values.qty : 0,
        amount: values.requestType === "amount" ? values.amount : 0,
      };

      const res = await fetch("/api/qrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const data = await res.json();

      if (res.ok) {
        message.success("QR request created successfully");
        form.resetFields();
        setIsRequestModalOpen(false);
        fetchQrs();
      } else {
        message.error(data.message || "Failed to create QR request");
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
    } finally { hide(); }
  };

  const columns = [
    {
      title: "Authorized Driver",
      key: "driver",
      render: (record: any) => <AntText strong>{record.driverId?.name || "N/A"}</AntText>,
    },
    {
      title: "Assigned Vehicle",
      key: "vehicle",
      render: (record: any) => (
        <Space orientation="vertical" size={0}>
          <Tag color="blue" style={{ margin: 0 }}>{record.vehicleId?.vehicleNumber || "N/A"}</Tag>
          {record.vehicleId?.nickname && (
            <AntText type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '2px' }}>
              {record.vehicleId.nickname}
            </AntText>
          )}
        </Space>
      ),
    },
    {
      title: "Fuel / Qty",
      render: (_: any, record: any) => (
        <span>{record.fuelType} - <AntText type="secondary">{record.qty > 0 ? `${record.qty}L` : `₹${record.amount}`}</AntText></span>
      ),
    },
    {
      title: "Status",
      render: (_: any, record: any) => {
        if (record.isUsed) return <Tag icon={<CheckCircleOutlined />} color="error">Used</Tag>;
        if (record.qrBase64) return <Tag icon={<CheckCircleOutlined />} color="success">Generated</Tag>;
        return <Tag icon={<ClockCircleOutlined />} color="warning">Pending</Tag>;
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
                onClick={() => setQrModal({ open: true, qrBase64: record.qrBase64 })}
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>QR Management</Title>
          <AntText type="secondary">Generate and track fuel request QR codes</AntText>
        </div>
        <Space size="middle" style={{ flexWrap: 'wrap' }}>
          <Search
            placeholder="Search driver, vehicle or nickname..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="middle"
            onClick={() => setIsRequestModalOpen(true)}
          >
            New QR Request
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm"><Statistic title="Pending Requests" value={qrList.filter((q) => !q.qrBase64).length} prefix={<ClockCircleOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm"><Statistic title="QR Generated" value={qrList.filter((q) => q.qrBase64 && !q.isUsed).length} valueStyle={{ color: "#3f8600" }} prefix={<QrcodeOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm"><Statistic title="Total Used" value={qrList.filter((q) => q.isUsed).length} valueStyle={{ color: "#cf1322" }} /></Card>
        </Col>
      </Row>

      <Card className="shadow-sm" style={{ overflowX: 'auto' }}>
        <Table
          loading={loading}
          rowKey="_id"
          columns={columns}
          dataSource={filteredQrList.filter((q) => !q.isUsed)}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Modal
        title="Create New QR Request"
        open={isRequestModalOpen}
        onCancel={() => {
          setIsRequestModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        centered
        width={500}
        destroyOnClose
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={createQrRequest} 
          style={{ marginTop: '10px' }}
          initialValues={{ requestType: 'liters' }}
        >
          {/* MEANINGFUL LABELS */}
          <Form.Item name="driverId" label="Authorized Driver" rules={[{ required: true, message: 'Select the driver' }]}>
            <Select placeholder="Select Driver" showSearch optionFilterProp="children" size="large">
              {drivers.map((d) => <Option key={d._id} value={d._id}>{d.name}</Option>)}
            </Select>
          </Form.Item>
          
          <Form.Item name="vehicleId" label="Assigned Vehicle Unit" rules={[{ required: true, message: 'Select the vehicle' }]}>
            <Select placeholder="Select Vehicle" showSearch optionFilterProp="children" size="large">
              {vehicles.map((v) => (
                <Option key={v._id} value={v._id}>
                  {v.nickname ? `${v.vehicleNumber} (${v.nickname})` : v.vehicleNumber}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={24}>
               <Form.Item name="requestType" label="Transaction Type">
                 <Radio.Group optionType="button" buttonStyle="solid" block>
                   <Radio value="liters">Set Liters</Radio>
                   <Radio value="amount">Set Amount</Radio>
                 </Radio.Group>
               </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="fuelType" label="Fuel Grade" rules={[{ required: true }]}>
                <Select placeholder="Select Type" size="large">
                  <Option value="Petrol">Petrol</Option>
                  <Option value="Diesel">Diesel</Option>
                </Select>
              </Form.Item>
            </Col>

            {requestType === "liters" && (
              <Col xs={24} sm={12}>
                <Form.Item name="qty" label="Fuel Volume (Liters)" rules={[{ required: true, message: 'Required' }]}>
                  <InputNumber min={1} style={{ width: "100%" }} placeholder="Qty" size="large" />
                </Form.Item>
              </Col>
            )}

            {requestType === "amount" && (
              <Col xs={24} sm={12}>
                <Form.Item name="amount" label="Billing Amount (₹)" rules={[{ required: true, message: 'Required' }]}>
                  <InputNumber min={1} style={{ width: "100%" }} placeholder="Enter amount" size="large" />
                </Form.Item>
              </Col>
            )}
          </Row>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button style={{ flex: 1 }} onClick={() => setIsRequestModalOpen(false)} size="large">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" style={{ flex: 2 }} size="large">
              Confirm Request
            </Button>
          </div>
        </Form>
      </Modal>

      {/* QR Preview remains same */}
      <Modal
        open={qrModal.open}
        footer={[
          <Button key="download" type="primary" icon={<DownloadOutlined />} href={qrModal.qrBase64} download="qr-code.png">
            Download
          </Button>,
        ]}
        onCancel={() => setQrModal({ open: false })}
        title="Fuel Authorization QR"
        centered
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          {qrModal.qrBase64 && (
            <img
              src={qrModal.qrBase64}
              alt="QR"
              style={{ width: "250px", border: "1px solid #f0f0f0", borderRadius: "8px" }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}