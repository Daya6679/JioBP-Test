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
} from "antd";

const { Option } = Select;

export default function QRManagementPage() {
  const [form] = Form.useForm();

  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [qrList, setQrList] = useState<any[]>([]);

  const [qrModal, setQrModal] = useState<{
    open: boolean;
    qrBase64?: string;
  }>({ open: false });

  /* ---------------- FETCH INITIAL DATA ---------------- */

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
    fetchQrs();
  }, []);

  const fetchDrivers = async () => {
    const res = await fetch("/api/drivers", { credentials: "include" });
    setDrivers(await res.json());
  };

  const fetchVehicles = async () => {
    const res = await fetch("/api/vehicles", { credentials: "include" });
    setVehicles(await res.json());
  };

  const fetchQrs = async () => {
    const res = await fetch("/api/qrs", { credentials: "include" });
    setQrList(await res.json());
  };

  /* ---------------- CREATE QR REQUEST ---------------- */

  const createQrRequest = async (values: any) => {
    const res = await fetch("/api/qrs", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      message.success("QR request created");
      form.resetFields();
      fetchQrs();
    } else {
      message.error("Failed to create QR request");
    }
  };

  /* ---------------- GENERATE QR ---------------- */

  const generateQr = async (qrId: string) => {
    const res = await fetch(`/api/qrs/${qrId}/generate`, {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      message.success("QR generated");
      fetchQrs();
    } else {
      message.error("Failed to generate QR");
    }
  };

  /* ---------------- TABLE COLUMNS ---------------- */

  const columns = [
    {
      title: "Driver",
      dataIndex: "driverName",
    },
    {
      title: "Vehicle",
      dataIndex: "vehicleNumber",
    },
    {
      title: "Fuel",
      dataIndex: "fuelType",
    },
    {
      title: "Qty",
      dataIndex: "qty",
    },
    {
      title: "Amount",
      dataIndex: "amount",
    },
    {
      title: "Status",
      render: (_: any, record: any) => {
        if (record.isUsed) return <Tag color="red">Used</Tag>;
        if (record.qrBase64) return <Tag color="green">Generated</Tag>;
        return <Tag color="orange">Pending</Tag>;
      },
    },
    {
      title: "Actions",
      render: (_: any, record: any) => (
        <Space>
          {!record.qrBase64 && (
            <Button
              type="primary"
              size="small"
              onClick={() => generateQr(record._id)}
            >
              Generate QR
            </Button>
          )}

          {record.qrBase64 && (
            <>
              <Button
                size="small"
                onClick={() =>
                  setQrModal({ open: true, qrBase64: record.qrBase64 })
                }
              >
                View QR
              </Button>

              <a
                href={record.qrBase64}
                download={`qr-${record._id}.png`}
              >
                <Button size="small">Download</Button>
              </a>
            </>
          )}
        </Space>
      ),
    },
  ];

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* -------- SECTION 1: CREATE QR REQUEST -------- */}
      <Card title="Create QR Request">
        <Form
          form={form}
          layout="vertical"
          onFinish={createQrRequest}
        >
          <Form.Item
            name="driverId"
            label="Driver"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select Driver">
              {drivers.map((d) => (
                <Option key={d._id} value={d._id}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="vehicleId"
            label="Vehicle"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select Vehicle">
              {vehicles.map((v) => (
                <Option key={v._id} value={v._id}>
                  {v.vehicleNumber}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="fuelType"
            label="Fuel Type"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Petrol">Petrol</Option>
              <Option value="Diesel">Diesel</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="qty"
            label="Quantity"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Create QR Request
          </Button>
        </Form>
      </Card>

      {/* -------- SECTION 2: QR LIST -------- */}
      <Card title="QR List (Unused / Generated)">
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={qrList.filter((q) => !q.isUsed)}
        />
      </Card>

      {/* -------- QR MODAL -------- */}
      <Modal
        open={qrModal.open}
        footer={null}
        onCancel={() => setQrModal({ open: false })}
        title="QR Code"
      >
        {qrModal.qrBase64 && (
          <img
            src={qrModal.qrBase64}
            alt="QR"
            style={{ width: "100%" }}
          />
        )}
      </Modal>
    </div>
  );
}
