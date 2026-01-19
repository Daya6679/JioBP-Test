// "use client";

// import {
//   Form,
//   Input,
//   Button,
//   DatePicker,
//   Switch,
//   Card,
//   Typography,
//   Space,
//   Divider,
//   message,
//   Row,
//   Col,
// } from "antd";
// import {
//   UserOutlined,
//   PhoneOutlined,
//   IdcardOutlined,
//   EnvironmentOutlined,
//   CameraOutlined,
//   RetweetOutlined,
//   ArrowLeftOutlined,
//   SaveOutlined,
// } from "@ant-design/icons";
// import { useState, useRef } from "react";
// import { useRouter } from "next/navigation";
// import dayjs from "dayjs";

// const { Title, Text } = Typography;

// export default function DriverForm({
//   initialValues,
//   onSubmit,
//   isLoading,
// }: any) {
//   const router = useRouter();
//   // const [imageUrl, setImageUrl] = useState<string>(initialValues?.image || "");
//   // Change this line:
//   const [imageUrl, setImageUrl] = useState<string>(
//     initialValues?.image
//       ? initialValues.image.startsWith("data:")
//         ? initialValues.image
//         : `data:image/jpeg;base64,${initialValues.image}`
//       : "",
//   );
//   const [isCameraOpen, setIsCameraOpen] = useState(false);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   const startCamera = async () => {
//     setIsCameraOpen(true);
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "user" },
//       });
//       if (videoRef.current) videoRef.current.srcObject = stream;
//     } catch (err) {
//       message.error("Camera access denied.");
//       setIsCameraOpen(false);
//     }
//   };

//   const takePhoto = () => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     if (video && canvas) {
//       const context = canvas.getContext("2d");
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       context?.drawImage(video, 0, 0, canvas.width, canvas.height);
//       const data = canvas.toDataURL("image/jpeg");

//       // const rawBase64 = data.split(',')[1];
//       setImageUrl(data);
//       stopCamera();
//     }
//   };

//   const stopCamera = () => {
//     const stream = videoRef.current?.srcObject as MediaStream;
//     stream?.getTracks().forEach((track) => track.stop());
//     setIsCameraOpen(false);
//   };

//   const onFinishInternal = (values: any) => {
//     let finalBase64 = imageUrl;
//     if (imageUrl.includes(",")) {
//       finalBase64 = imageUrl.split(",")[1];
//     }
//     onSubmit({ ...values, image: finalBase64 });
//   };

//   const preparedValues = initialValues
//     ? {
//         ...initialValues,
//         licenseValidity: initialValues.licenseValidity
//           ? dayjs(initialValues.licenseValidity)
//           : null,
//       }
//     : { isActive: true };

//   return (
//     <Row
//       justify="center"
//       style={{
//         minHeight: "100vh",
//         padding: "40px 20px",
//         background: "#f0f2f5",
//       }}
//     >
//       <Col xs={24} sm={22} md={18} lg={14} xl={12}>
//         <Space orientation="vertical" style={{ width: "100%" }} size="large">
//           <Button
//             type="link"
//             icon={<ArrowLeftOutlined />}
//             onClick={() => router.back()}
//             style={{ padding: 0, color: "#666" }}
//           >
//             Back to Dashboard
//           </Button>

//           <Card className="shadow-sm" style={{ borderRadius: "8px" }}>
//             <div style={{ marginBottom: "32px" }}>
//               <Title level={4} style={{ marginBottom: "4px" }}>
//                 {initialValues
//                   ? "Update Driver Profile"
//                   : "Register New Driver"}
//               </Title>
//               <Text type="secondary">
//                 Complete the fields below to manage driver records
//               </Text>
//             </div>

//             <Form
//               layout="vertical"
//               initialValues={preparedValues}
//               onFinish={onFinishInternal}
//               size="large"
//               requiredMark="optional"
//             >
//               {/* Image Section */}
//               <Form.Item label={<Text strong>Driver Photo</Text>}>
//                 <div
//                   style={{
//                     display: "flex",
//                     flexDirection: "column",
//                     alignItems: "center",
//                     padding: "20px",
//                     background: "#fafafa",
//                     border: "1px dashed #d9d9d9",
//                     borderRadius: "8px",
//                   }}
//                 >
//                   {isCameraOpen ? (
//                     <div
//                       style={{
//                         position: "relative",
//                         width: "100%",
//                         maxWidth: "300px",
//                       }}
//                     >
//                       <video
//                         ref={videoRef}
//                         autoPlay
//                         playsInline
//                         style={{
//                           width: "100%",
//                           borderRadius: "8px",
//                           background: "#000",
//                         }}
//                       />
//                       <Button
//                         type="primary"
//                         shape="circle"
//                         icon={<CameraOutlined />}
//                         style={{
//                           position: "absolute",
//                           bottom: "10px",
//                           left: "50%",
//                           transform: "translateX(-50%)",
//                         }}
//                         onClick={takePhoto}
//                       />
//                     </div>
//                   ) : (
//                     <Space orientation="vertical" align="center">
//                       {imageUrl ? (
//                         <img
//                           src={
//                             imageUrl.startsWith("data:")
//                               ? imageUrl
//                               : `data:image/jpeg;base64,${imageUrl}`
//                           }
//                           alt="Driver"
//                           style={{
//                             width: "100px",
//                             height: "100px",
//                             borderRadius: "50%",
//                             objectFit: "cover",
//                           }}
//                         />
//                       ) : (
//                         <CameraOutlined
//                           style={{ fontSize: "32px", color: "#bfbfbf" }}
//                         />
//                       )}
//                       <Button size="small" onClick={startCamera}>
//                         {imageUrl ? "Retake Photo" : "Start Camera"}
//                       </Button>
//                     </Space>
//                   )}
//                   <canvas ref={canvasRef} style={{ display: "none" }} />
//                 </div>
//               </Form.Item>

//               <Row gutter={16}>
//                 <Col span={12}>
//                   <Form.Item
//                     name="name"
//                     label="Full Name"
//                     rules={[{ required: true, message: "Required" }]}
//                   >
//                     <Input placeholder="e.g. John Doe" />
//                   </Form.Item>
//                 </Col>
//                 <Col span={12}>
//                   <Form.Item
//                     name="phone"
//                     label="Phone Number"
//                     rules={[{ required: true, len: 10 }]}
//                   >
//                     <Input placeholder="e.g. 9876543210" />
//                   </Form.Item>
//                 </Col>
//               </Row>

//               <Row gutter={16}>
//                 <Col span={12}>
//                   <Form.Item
//                     name="licenseNumber"
//                     label="License No."
//                     rules={[{ required: true }]}
//                   >
//                     <Input placeholder="DL-XXXXXXX" />
//                   </Form.Item>
//                 </Col>
//                 <Col span={12}>
//                   <Form.Item
//                     name="licenseValidity"
//                     label="Expiry Date"
//                     rules={[{ required: true }]}
//                   >
//                     <DatePicker style={{ width: "100%" }} />
//                   </Form.Item>
//                 </Col>
//               </Row>

//               <Form.Item name="address" label="Permanent Address (optional)">
//                 <Input.TextArea
//                   placeholder="Enter full residential address"
//                   rows={3}
//                 />
//               </Form.Item>

//               {/* Status Section - Styled like Vehicles UI */}
//               <Row align="middle" style={{ marginTop: "16px" }}>
//                 <Col span={24}>
//                   <Text style={{ display: "block", marginBottom: "8px" }}>
//                     Status
//                   </Text>
//                   <Form.Item name="isActive" valuePropName="checked" noStyle>
//                     <Space>
//                       <Switch defaultChecked />
//                       <Text type="secondary">
//                         Is this driver authorized to log in immediately?
//                       </Text>
//                     </Space>
//                   </Form.Item>
//                 </Col>
//               </Row>

//               <Divider style={{ margin: "24px 0" }} />

//               {/* Actions Section - Right Aligned like Vehicles UI */}
//               <Row justify="end" gutter={12}>
//                 <Col>
//                   <Button onClick={() => router.back()}>Cancel</Button>
//                 </Col>
//                 <Col>
//                   <Button
//                     type="primary"
//                     htmlType="submit"
//                     loading={isLoading}
//                     icon={<SaveOutlined />}
//                   >
//                     {initialValues ? "Update Driver" : "Create Driver Account"}
//                   </Button>
//                 </Col>
//               </Row>
//             </Form>
//           </Card>
//         </Space>
//       </Col>
//     </Row>
//   );
// }












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
  ArrowLeftOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function DriverForm({
  initialValues,
  onSubmit,
  isLoading,
}: any) {
  const router = useRouter();

  /**
   * Helper: Prepends the necessary Base64 metadata prefix if it's missing.
   * This ensures the browser <img> tag can render the raw string from your database.
   */
  const ensureDataUrl = (str: string) => {
    if (!str) return "";
    if (str.startsWith("data:")) return str;
    // Using image/png to match your database screenshot requirement
    return `data:image/png;base64,${str}`;
  };

  const [imageUrl, setImageUrl] = useState<string>(ensureDataUrl(initialValues?.image));
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync state if initialValues changes (important for async data loading)
  useEffect(() => {
    if (initialValues?.image) {
      setImageUrl(ensureDataUrl(initialValues.image));
    }
  }, [initialValues]);

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      message.error("Camera access denied.");
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
      
      // Keep full Data URL in local state so the preview renders immediately
      const data = canvas.toDataURL("image/png");
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
    let finalBase64 = imageUrl;
    
    /**
     * MANAGER REQUIREMENT: Remove metadata prefix before storing in DB.
     * We strip 'data:image/png;base64,' to leave only the raw string.
     */
    if (imageUrl.includes(",")) {
      finalBase64 = imageUrl.split(",")[1];
    }

    onSubmit({ ...values, image: finalBase64 });
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
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        background: "#f0f2f5",
      }}
    >
      <Col xs={24} sm={22} md={18} lg={14} xl={12}>
        <Space orientation="vertical" style={{ width: "100%" }} size="large">
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            style={{ padding: 0, color: "#666" }}
          >
            Back to Dashboard
          </Button>

          <Card className="shadow-sm" style={{ borderRadius: "8px" }}>
            <div style={{ marginBottom: "32px" }}>
              <Title level={4} style={{ marginBottom: "4px" }}>
                {initialValues ? "Update Driver Profile" : "Register New Driver"}
              </Title>
              <Text type="secondary">
                Complete the fields below to manage driver records
              </Text>
            </div>

            <Form
              layout="vertical"
              initialValues={preparedValues}
              onFinish={onFinishInternal}
              size="large"
              requiredMark="optional"
            >
              {/* Image Section */}
              <Form.Item label={<Text strong>Driver Photo</Text>}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "20px",
                    background: "#fafafa",
                    border: "1px dashed #d9d9d9",
                    borderRadius: "8px",
                  }}
                >
                  {isCameraOpen ? (
                    <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{ width: "100%", borderRadius: "8px", background: "#000" }}
                      />
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<CameraOutlined />}
                        style={{ 
                          position: "absolute", 
                          bottom: "10px", 
                          left: "50%", 
                          transform: "translateX(-50%)" 
                        }}
                        onClick={takePhoto}
                      />
                    </div>
                  ) : (
                    <Space orientation="vertical" align="center">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Driver"
                          style={{ 
                            width: "100px", 
                            height: "100px", 
                            borderRadius: "50%", 
                            objectFit: "cover" 
                          }}
                        />
                      ) : (
                        <CameraOutlined style={{ fontSize: "32px", color: "#bfbfbf" }} />
                      )}
                      <Button size="small" onClick={startCamera}>
                        {imageUrl ? "Retake Photo" : "Start Camera"}
                      </Button>
                    </Space>
                  )}
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                </div>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                    <Input placeholder="e.g. John Doe" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="phone" label="Phone Number" rules={[{ required: true, len: 10 }]}>
                    <Input placeholder="e.g. 9876543210" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="licenseNumber" label="License No." rules={[{ required: true }]}>
                    <Input placeholder="DL-XXXXXXX" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="licenseValidity" label="Expiry Date" rules={[{ required: true }]}>
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="address" label="Permanent Address (optional)">
                <Input.TextArea placeholder="Enter full residential address" rows={3} />
              </Form.Item>

              <Row align="middle" style={{ marginTop: "16px" }}>
                <Col span={24}>
                  <Text style={{ display: "block", marginBottom: "8px" }}>Status</Text>
                  <Form.Item name="isActive" valuePropName="checked" noStyle>
                    <Space>
                      <Switch defaultChecked />
                      <Text type="secondary">Authorized to log in immediately?</Text>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>

              <Divider style={{ margin: "24px 0" }} />

              <Row justify="end" gutter={12}>
                <Col>
                  <Button onClick={() => router.back()}>Cancel</Button>
                </Col>
                <Col>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={isLoading} 
                    icon={<SaveOutlined />}
                  >
                    {initialValues ? "Update Driver" : "Create Driver Account"}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>
        </Space>
      </Col>
    </Row>
  );
}