"use client";

import {
  Form,
  Input,
  Button,
  DatePicker,
  Switch,
  Card,
  Typography,
  Space,
  Divider,
  message,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  IdcardOutlined,
  EnvironmentOutlined,
  CameraOutlined,
  RetweetOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function DriverForm({
  initialValues,
  onSubmit,
  isLoading,
}: any) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>(initialValues?.image || "");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Camera Functions ---
  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      message.error("Camera access denied or not available.");
      setIsCameraOpen(false);
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL("image/jpeg");
      setImageUrl(data);
      stopCamera();
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    setIsCameraOpen(false);
  };

  const onFinishInternal = (values: any) => {
    onSubmit({ ...values, image: imageUrl });
  };

  const preparedValues = initialValues
    ? {
        ...initialValues,
        licenseValidity: initialValues.licenseValidity
          ? dayjs(initialValues.licenseValidity)
          : null,
      }
    : { isActive: true };

  return (
    <Row
      justify="center"
      align="middle"
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        background: "#f0f2f5",
      }}
    >
      <Col xs={24} sm={22} md={18} lg={14} xl={10}>
        <Space orientation="vertical" style={{ width: "100%" }} size="large">
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            style={{ padding: 0, color: "#666" }}
          >
            Back to Dashboard
          </Button>

          <Card
            className="shadow-lg"
            style={{ borderRadius: "16px", overflow: "hidden" }}
          >
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <Title
                level={3}
                style={{ marginBottom: "8px", color: "#141414" }}
              >
                {initialValues
                  ? "Update Driver Profile"
                  : "Register New Driver"}
              </Title>
              <Text type="secondary">
                Complete the fields below to create a secure driver record
              </Text>
            </div>

            <Form
              layout="vertical"
              initialValues={preparedValues}
              onFinish={onFinishInternal}
              size="large"
              requiredMark="optional"
            >
              {/* Centered Image Capture Section */}
              <Form.Item
                label={<Text strong>Driver Identification Photo</Text>}
                required
                style={{ textAlign: "center" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column", // Fixed typo: orientation -> Direction
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "30px",
                    background: "#fafafa",
                    border: "2px dashed #d9d9d9",
                    borderRadius: "12px",
                    minHeight: "220px",
                  }}
                >
                  {isCameraOpen ? (
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: "320px",
                      }}
                    >
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{
                          width: "100%",
                          borderRadius: "12px",
                          background: "#000",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        }}
                      />
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<CameraOutlined />}
                        size="large"
                        style={{
                          position: "absolute",
                          bottom: "15px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          height: "50px",
                          width: "50px",
                        }}
                        onClick={takePhoto}
                      />
                    </div>
                  ) : imageUrl ? (
                    <Space orientation="vertical" align="center" size="middle">
                      <img
                        src={imageUrl}
                        alt="Driver"
                        style={{
                          width: "140px",
                          height: "140px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "4px solid #fff",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Button
                        icon={<RetweetOutlined />}
                        onClick={startCamera}
                        danger
                      >
                        Retake Photo
                      </Button>
                    </Space>
                  ) : (
                    <Space orientation="vertical" align="center">
                      <div
                        style={{
                          background: "#e6f7ff",
                          padding: "20px",
                          borderRadius: "50%",
                          marginBottom: "12px",
                        }}
                      >
                        <CameraOutlined
                          style={{ fontSize: "32px", color: "#1890ff" }}
                        />
                      </div>
                      <Button
                        type="primary"
                        ghost
                        icon={<CameraOutlined />}
                        onClick={startCamera}
                      >
                        Start Camera
                      </Button>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Ensure driver's face is clearly visible
                      </Text>
                    </Space>
                  )}
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                </div>
              </Form.Item>

              <Divider style={{ margin: "32px 0" }} />

              <Title level={5} style={{ marginBottom: "16px" }}>
                <UserOutlined /> Personal Information
              </Title>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true, message: "Please enter name" }]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                      placeholder="e.g. John Doe"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[
                      {
                        required: true,
                        len: 10,
                        message: "Enter a valid 10-digit phone number",
                      },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined style={{ color: "#bfbfbf" }} />}
                      placeholder="e.g. 9876543210"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Title level={5} style={{ margin: "16px 0" }}>
                <IdcardOutlined /> License Details
              </Title>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="licenseNumber"
                    label="License No."
                    rules={[
                      { required: true, message: "Please enter DL number" },
                    ]}
                  >
                    <Input
                      prefix={<IdcardOutlined style={{ color: "#bfbfbf" }} />}
                      placeholder="DL-XXXXXXX"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="licenseValidity"
                    label="Expiry Date"
                    rules={[
                      {
                        required: true,
                        message: "Please select validity date",
                      },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Select Date"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="address" label="Permanent Address">
                <Input.TextArea
                  prefix={<EnvironmentOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Enter full residential address"
                  rows={3}
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>

              <div
                style={{
                  background: "#f9f9f9",
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "24px",
                }}
              >
                <Form.Item
                  name="isActive"
                  label={<Text strong>System Status</Text>}
                  valuePropName="checked"
                  style={{ marginBottom: 0 }}
                >
                  <Space size="middle">
                    <Switch
                      checkedChildren="Active"
                      unCheckedChildren="Inactive"
                      defaultChecked
                    />
                    <Text type="secondary">
                      Is this driver authorized to log in immediately?
                    </Text>
                  </Space>
                </Form.Item>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block
                icon={<CheckCircleOutlined />}
                style={{
                  height: "56px",
                  borderRadius: "10px",
                  fontSize: "18px",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
                  marginTop: "10px",
                }}
              >
                {initialValues
                  ? "Update Driver Profile"
                  : "Create Driver Account"}
              </Button>
            </Form>
          </Card>
        </Space>
      </Col>
    </Row>
  );
}
