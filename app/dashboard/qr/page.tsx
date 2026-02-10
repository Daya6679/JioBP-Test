"use client";

import { Suspense, useEffect, useState } from "react";
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
  Divider,
  Descriptions,
  Alert,
  notification,
} from "antd";
import {
  PlusOutlined,
  QrcodeOutlined,
  EyeOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  UserOutlined,
  CarOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";

const { Title, Text: AntText } = Typography;
const { Option } = Select;
const { Search } = Input;

function QRManagementContent() {
  const { data: session } = useSession();
  const [form] = Form.useForm();
  const requestType = Form.useWatch("requestType", form);

  const [messageApi, messageContextHolder] = message.useMessage();
  const [notificationApi, notificationContextHolder] =
    notification.useNotification();

  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [qrList, setQrList] = useState<any[]>([]);
  const [filteredQrList, setFilteredQrList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const [qrModal, setQrModal] = useState<{
    open: boolean;
    qrBase64?: string;
    driverName?: string;
    vehicleNo?: string;
    fuelType?: string;
    amountOrQty?: string;
  }>({ open: false });

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

  const handleVehicleChange = (vehicleId: string) => {
    const selectedVehicle = vehicles.find((v) => v._id === vehicleId);
    if (selectedVehicle) {
      const validTypes = ["Petrol", "Diesel"];
      if (validTypes.includes(selectedVehicle.fuelType)) {
        form.setFieldsValue({ fuelType: selectedVehicle.fuelType });
      } else {
        form.setFieldsValue({ fuelType: undefined });
      }
    }
  };

  const handleSearch = (value: string) => {
    const term = value.toLowerCase();
    const filtered = qrList.filter((qr) => {
      const driverName = qr.driverId?.name?.toLowerCase() || "";
      const vehicleNum = qr.vehicleId?.vehicleNumber?.toLowerCase() || "";
      const nickname = qr.vehicleId?.nickname?.toLowerCase() || "";
      return (
        driverName.includes(term) ||
        vehicleNum.includes(term) ||
        nickname.includes(term)
      );
    });
    setFilteredQrList(filtered);
  };

  const createQrRequest = async (values: any) => {
    let hideLoading: (() => void) | null = null;
    try {
      const driverObj = drivers.find((d) => d._id === values.driverId);
      const vehicleObj = vehicles.find((v) => v._id === values.vehicleId);

      const today = new Date();
      const expiryDate = driverObj?.licenseExpiry ? new Date(driverObj.licenseExpiry) : null;
      const isExpired = expiryDate && expiryDate < today;
      const isStatusInvalid = driverObj?.licenseStatus === "Expired" || driverObj?.licenseStatus === "Suspended";

      if (!driverObj || isStatusInvalid || isExpired) {
        notification.error({
          message: "License Validation Failed",
          description: `Cannot generate QR. Driver ${driverObj?.name || ""}'s license is either expired or invalid.`,
          placement: "topRight",
        });
        return;
      }

      setGeneratingId("NEW_REQUEST"); // Changed from setIsGenerating
      hideLoading = messageApi.loading("Validating & Generating QR Code...", 0);

      const submissionData = {
        userId: (session?.user as any)?.id,
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
      if (!res.ok) throw new Error(data.message || "Failed to create QR request");

      const genRes = await fetch(`/api/qrs/${data._id}/generate`, {
        method: "POST",
      });
      
      const genData = await genRes.json();

      if (!genRes.ok) {
        throw new Error(genData.message || "QR Generation Failed");
      }

      messageApi.success("QR Generated Successfully");
      form.resetFields();
      setIsRequestModalOpen(false);
      setQrModal({
        open: true,
        qrBase64: genData.qrBase64,
        driverName: driverObj?.name,
        vehicleNo: vehicleObj?.vehicleNumber,
        fuelType: values.fuelType,
        amountOrQty: values.requestType === "liters" ? `${values.qty} L` : `₹${values.amount}`,
      });
      fetchQrs();

    } catch (err: any) {
      messageApi.error(err.message || "Error connecting to server");
    } finally {
      hideLoading?.();
      setGeneratingId(null); // Changed from setIsGenerating
    }
  };

  const handleRegenerate = async (id: string) => {
    let hideLoading: (() => void) | null = null;
    try {
      setGeneratingId(id);
      hideLoading = messageApi.loading("Retrying QR Generation...", 0);

      const genRes = await fetch(`/api/qrs/${id}/generate`, {
        method: "POST",
      });
      
      const genData = await genRes.json();

      if (!genRes.ok) {
        throw new Error(genData.message || "Failed to generate QR");
      }

      messageApi.success("QR Generated Successfully!");
      fetchQrs(); 

    } catch (err: any) {
      messageApi.error(err.message || "Error connecting to server");
    } finally {
      hideLoading?.();
      setGeneratingId(null);
    }
  };

  const getSafeFilename = (name: string) =>
    `${name.replace(/\s+/g, "_").toLowerCase()}_qr.png`;

  const triggerDownload = (base64: string, name: string) => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${base64}`;
    link.download = getSafeFilename(name || "driver");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      title: "Authorized Driver",
      key: "driver",
      render: (record: any) => (
        <AntText strong>{record.driverId?.name || "N/A"}</AntText>
      ),
    },
    {
      title: "Assigned Vehicle",
      key: "vehicle",
      render: (record: any) => (
        <Space orientation="vertical" size={0}>
          <Tag color="blue" style={{ margin: 0 }}>
            {record.vehicleId?.vehicleNumber || "N/A"}
          </Tag>
          {record.vehicleId?.nickname && (
            <AntText
              type="secondary"
              style={{ fontSize: "11px", display: "block", marginTop: "2px" }}
            >
              {record.vehicleId.nickname}
            </AntText>
          )}
        </Space>
      ),
    },
    {
      title: "Fuel / Qty",
      render: (_: any, record: any) => (
        <span>
          {record.fuelType} -{" "}
          <AntText type="secondary">
            {record.qty > 0 ? `${record.qty}L` : `₹${record.amount}`}
          </AntText>
        </span>
      ),
    },
    {
      title: "Status",
      render: (_: any, record: any) => (
        <Tag color={record.isUsed ? "error" : "success"}>
          {record.isUsed ? "Used" : "Generated"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          {record.qrBase64 ? (
            <>
              <Button
                icon={<EyeOutlined />}
                size="small"
                title="View QR"
                onClick={() =>
                  setQrModal({
                    open: true,
                    qrBase64: record.qrBase64,
                    driverName: record.driverId?.name,
                    vehicleNo: record.vehicleId?.vehicleNumber,
                    fuelType: record.fuelType,
                    amountOrQty: record.qty > 0 ? `${record.qty} L` : `₹${record.amount}`,
                  })
                }
              />
              <Button
                icon={<DownloadOutlined />}
                size="small"
                onClick={() => triggerDownload(record.qrBase64, record.driverId?.name)}
              />
            </>
          ) : (
            <Button
              type="primary"
              danger
              icon={<QrcodeOutlined />}
              size="small"
              loading={generatingId === record._id}
              disabled={generatingId !== null && generatingId !== record._id}
              onClick={(e) => {
                e.stopPropagation();
                handleRegenerate(record._id);
              }}
            >
              Regenerate QR
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {messageContextHolder}
      {notificationContextHolder}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: "16px" }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>QR Management</Title>
          <AntText type="secondary">Generate and track fuel request QR codes</AntText>
        </div>
        <Space size="middle" style={{ flexWrap: "wrap" }}>
          <Search placeholder="Search driver or vehicle..." onSearch={handleSearch} onChange={(e) => handleSearch(e.target.value)} style={{ width: 300 }} allowClear />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsRequestModalOpen(true)}>New Request</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card className="shadow-sm">
            <Statistic
              title="QR Generated (Active)"
              value={qrList.filter((q) => q.qrBase64 && !q.isUsed).length}
              style={{ color: "#3f8600" }}
              prefix={<QrcodeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card className="shadow-sm">
            <Statistic
              title="Total Used"
              value={qrList.filter((q) => q.isUsed).length}
              style={{ color: "#cf1322" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0" style={{ borderRadius: "12px" }}>
        <Table
          loading={loading}
          rowKey="_id"
          columns={columns}
          dataSource={filteredQrList.filter((q) => !q.isUsed)}
          pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: [10, 20, 50, 100] }}
        />
      </Card>

      <Modal
        title="Create New QR Request"
        open={isRequestModalOpen}
        onCancel={() => { setIsRequestModalOpen(false); form.resetFields(); }}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={createQrRequest} initialValues={{ requestType: "liters" }}>
          <Form.Item name="driverId" label="Driver" rules={[{ required: true }]}>
            <Select placeholder="Select Driver">
              {drivers.map((d) => {
                const isExpired = d.licenseExpiry && new Date(d.licenseExpiry) < new Date();
                return (
                  <Option key={d._id} value={d._id} disabled={isExpired}>
                    <Space>{d.name}{isExpired && <Tag color="error">Expired License</Tag>}</Space>
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item name="vehicleId" label="Vehicle" rules={[{ required: true }]}>
            <Select placeholder="Select Vehicle" onChange={handleVehicleChange}>
              {vehicles.map((v) => (
                <Option key={v._id} value={v._id}>{v.vehicleNumber}</Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="requestType" label="Type">
                <Radio.Group optionType="button" buttonStyle="solid" block>
                  <Radio value="liters">Liters</Radio>
                  <Radio value="amount">Amount</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="fuelType" label="Fuel Grade" rules={[{ required: true }]}>
                <Input readOnly placeholder="Auto-filled from vehicle" className="bg-gray-50 cursor-not-allowed" />
              </Form.Item>
            </Col>
            <Col span={12}>
              {requestType === "liters" ? (
                <Form.Item name="qty" label="Qty (L)" rules={[{ required: true }]}><InputNumber min={1} style={{ width: "100%" }} /></Form.Item>
              ) : (
                <Form.Item name="amount" label="Amount (₹)" rules={[{ required: true }]}><InputNumber min={1} style={{ width: "100%" }} /></Form.Item>
              )}
            </Col>
          </Row>
          <Button type="primary" htmlType="submit" block size="large" loading={generatingId === "NEW_REQUEST"}>
            Generate QR
          </Button>
        </Form>
      </Modal>

      <Modal open={qrModal.open} onCancel={() => setQrModal({ open: false })} footer={null} width={750} title="Fuel Authorization QR" centered>
        <Row gutter={24} align="middle">
          <Col span={10} style={{ textAlign: "center", borderRight: "1px solid #f0f0f0" }}>
            {qrModal.qrBase64 && (
              <img src={`data:image/png;base64,${qrModal.qrBase64}`} alt="QR" style={{ width: "100%", borderRadius: "8px", border: "1px solid #eee", padding: "10px", background: "#fff" }} />
            )}
            <Button type="primary" block icon={<DownloadOutlined />} style={{ marginTop: 16 }} onClick={() => triggerDownload(qrModal.qrBase64!, qrModal.driverName!)}>Download QR</Button>
          </Col>
          <Col span={14}>
            <Descriptions title="Authorization Details" bordered column={1} size="small">
              <Descriptions.Item label={<><UserOutlined style={{ color: "#1890ff" }} /> Driver</>}>{qrModal.driverName}</Descriptions.Item>
              <Descriptions.Item label={<><CarOutlined style={{ color: "#1890ff" }} /> Vehicle</>}>{qrModal.vehicleNo}</Descriptions.Item>
              <Descriptions.Item label={<><MedicineBoxOutlined style={{ color: "#1890ff" }} /> Fuel Grade</>}>{qrModal.fuelType}</Descriptions.Item>
              <Descriptions.Item label="Authorized Limit"><AntText strong type="success" style={{ fontSize: "16px" }}>{qrModal.amountOrQty}</AntText></Descriptions.Item>
            </Descriptions>
            <Divider dashed />
            <Alert title="Security Note" description="This QR is valid for a single transaction. Please ensure the driver presents this at the terminal." type="info" showIcon />
          </Col>
        </Row>
      </Modal>
    </div>
  );
}

export default function QRManagementPage() {
  return (
    <Suspense fallback={<Card loading={true} />}>
      <QRManagementContent />
    </Suspense>
  );
}