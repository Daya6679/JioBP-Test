"use client";

import { Suspense, useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  Switch,
  Typography,
  Space,
  message,
  Breadcrumb,
} from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CarOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

function VehicleFormContent() {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("id"); // If ID exists, we are in Edit mode
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(true);

  const [messageApi, contextHolder] = message.useMessage();

  // Fetch data if editing
  useEffect(() => {
    if (vehicleId) {
      const fetchVehicle = async () => {
        try {
          const res = await fetch(`/api/vehicles/${vehicleId}`);
          if (res.ok) {
            const data = await res.json();
            form.setFieldsValue(data);
            setCurrentStatus(
              data.isActive !== undefined ? data.isActive : true,
            );
          }
        } catch (err) {
          messageApi.error("Failed to load vehicle details");
        }
      };
      fetchVehicle();
    } else {
      form.setFieldsValue({ isActive: true });
    }
  }, [vehicleId, form, messageApi]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const url = vehicleId ? `/api/vehicles/${vehicleId}` : "/api/vehicles";
      const method = vehicleId ? "PUT" : "POST";

      const finalSubmission = {
        ...values,
        isActive: vehicleId ? currentStatus : true,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalSubmission),
      });

      if (res.ok) {
        messageApi.success(
          `Vehicle ${vehicleId ? "updated" : "added"} successfully!`,
        );
        setTimeout(() => {
          router.push("/dashboard/vehicles");
          router.refresh(); // Refresh server data
        }, 800);
      } else {
        const error = await res.json();
        throw new Error(error.message || "Operation failed");
      }
    } catch (err: any) {
      messageApi.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      {contextHolder}
      <Space orientation="vertical" size="large" className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Space orientation="vertical" size={0}>
            <Breadcrumb
              items={[
                { title: "Dashboard" },
                { title: "Vehicles", href: "/dashboard/vehicles" },
                { title: vehicleId ? "Edit" : "Add New" },
              ]}
            />
            <Title level={3} style={{ margin: "8px 0" }}>
              {vehicleId ? "Edit Vehicle" : "Register New Vehicle"}
            </Title>
          </Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            Back
          </Button>
        </div>

        <Card className="shadow-md border-0" style={{ borderRadius: "12px" }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ isActive: true }}
            autoComplete="off"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Form.Item
                label="Make (Brand)"
                name="make"
                rules={[
                  {
                    required: true,
                    message: "Enter vehicle make (e.g. Toyota)",
                  },
                ]}
              >
                <Input
                  placeholder="e.g. Toyota"
                  prefix={<CarOutlined className="text-gray-400" />}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Model"
                name="model"
                rules={[{ required: true, message: "Enter vehicle model" }]}
              >
                <Input placeholder="e.g. Camry" size="large" />
              </Form.Item>

              <Form.Item
                label="Vehicle Number"
                name="vehicleNumber"
                rules={[
                  { required: true, message: "Enter registration number" },
                ]}
              >
                <Input placeholder="e.g. ABC-1234" size="large" />
              </Form.Item>

              <Form.Item
                label="Fuel Type"
                name="fuelType"
                rules={[{ required: true, message: "Select fuel type" }]}
              >
                <Select placeholder="Select Type" size="large">
                  <Option value="Petrol">Petrol</Option>
                  <Option value="Diesel">Diesel</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Nickname (optional)" name="nickname">
                <Input placeholder="e.g. City Runner" size="large" />
              </Form.Item>
            </div>

            <div className="border-t pt-6 mt-4 flex justify-end gap-3">
              <Button
                size="large"
                onClick={() => router.push("/dashboard/vehicles")}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                icon={<SaveOutlined />}
              >
                {vehicleId ? "Update Vehicle" : "Save Vehicle"}
              </Button>
            </div>
          </Form>
        </Card>
      </Space>
    </div>
  );
}

export default function VehicleFormPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <Title level={4} type="secondary">
            Loading vehicle form...
          </Title>
        </div>
      }
    >
      <VehicleFormContent />
    </Suspense>
  );
}
