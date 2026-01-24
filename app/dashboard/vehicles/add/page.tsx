// "use client";

// import { useEffect, useState } from "react";
// import {
//   Form,
//   Input,
//   Button,
//   Card,
//   Select,
//   Switch,
//   Typography,
//   Space,
//   message,
//   Breadcrumb,
// } from "antd";
// import { useRouter, useSearchParams } from "next/navigation";
// import {
//   CarOutlined,
//   ArrowLeftOutlined,
//   SaveOutlined,
// } from "@ant-design/icons";

// const { Title, Text } = Typography;
// const { Option } = Select;

// export default function VehicleFormPage() {
//   const [form] = Form.useForm();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const vehicleId = searchParams.get("id"); // If ID exists, we are in Edit mode
//   const [loading, setLoading] = useState(false);

//   // Fetch data if editing
//   useEffect(() => {
//     if (vehicleId) {
//       const fetchVehicle = async () => {
//         try {
//           const res = await fetch(`/api/vehicles/${vehicleId}`);
//           if (res.ok) {
//             const data = await res.json();
//             // form.setFieldsValue(data);
//             form.setFieldsValue({
//               ...data,
//               isActive: data.isActive !== undefined ? data.isActive : true,
//             });
//           }
//         } catch (err) {
//           message.error("Failed to load vehicle details");
//         }
//       };
//       fetchVehicle();
//     } else {
//       form.setFieldsValue({ isActive: true });
//     }
//   }, [vehicleId, form]);

//   const onFinish = async (values: any) => {
//     setLoading(true);
//     try {
//       const url = vehicleId ? `/api/vehicles/${vehicleId}` : "/api/vehicles";
//       const method = vehicleId ? "PUT" : "POST";

//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(values),
//       });

//       if (res.ok) {
//         message.success(
//           `Vehicle ${vehicleId ? "updated" : "added"} successfully!`,
//         );
//         router.push("/dashboard/vehicles");
//       } else {
//         const error = await res.json();
//         throw new Error(error.message || "Operation failed");
//       }
//     } catch (err: any) {
//       message.error(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-4">
//       <Space orientation="vertical" size="large" className="w-full">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <Space orientation="vertical" size={0}>
//             <Breadcrumb
//               items={[
//                 { title: "Dashboard" },
//                 { title: "Vehicles", href: "/dashboard/vehicles" },
//                 { title: vehicleId ? "Edit" : "Add New" },
//               ]}
//             />
//             <Title level={3} style={{ margin: "8px 0" }}>
//               {vehicleId ? "Edit Vehicle" : "Register New Vehicle"}
//             </Title>
//           </Space>
//           <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
//             Back
//           </Button>
//         </div>

//         <Card className="shadow-md border-0" style={{ borderRadius: "12px" }}>
//           <Form
//             form={form}
//             layout="vertical"
//             onFinish={onFinish}
//             initialValues={{ isActive: true }}
//             autoComplete="off"
//           >
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
//               <Form.Item
//                 label="Make (Brand)"
//                 name="make"
//                 rules={[
//                   {
//                     required: true,
//                     message: "Enter vehicle make (e.g. Toyota)",
//                   },
//                 ]}
//               >
//                 <Input
//                   placeholder="e.g. Toyota"
//                   prefix={<CarOutlined className="text-gray-400" />}
//                   size="large"
//                 />
//               </Form.Item>

//               <Form.Item
//                 label="Model"
//                 name="model"
//                 rules={[{ required: true, message: "Enter vehicle model" }]}
//               >
//                 <Input placeholder="e.g. Camry" size="large" />
//               </Form.Item>

//               <Form.Item
//                 label="Vehicle Number"
//                 name="vehicleNumber"
//                 rules={[
//                   { required: true, message: "Enter registration number" },
//                 ]}
//               >
//                 <Input placeholder="e.g. ABC-1234" size="large" />
//               </Form.Item>

//               <Form.Item
//                 label="Fuel Type"
//                 name="fuelType"
//                 rules={[{ required: true, message: "Select fuel type" }]}
//               >
//                 <Select placeholder="Select Type" size="large">
//                   <Option value="Petrol">Petrol</Option>
//                   <Option value="Diesel">Diesel</Option>
//                   {/* <Option value="Electric">Electric</Option>
//                   <Option value="Hybrid">Hybrid</Option>
//                   <Option value="CNG">CNG</Option> */}
//                 </Select>
//               </Form.Item>

//               <Form.Item label="Nickname (Optional)" name="nickname">
//                 <Input placeholder="e.g. City Runner" size="large" />
//               </Form.Item>

//               <Form.Item label="Status" name="isActive" valuePropName="checked">
//                 <div className="flex items-center gap-2">
//                   <Switch defaultChecked />
//                   <Text type="secondary">
//                     Vehicle is available for operations
//                   </Text>
//                 </div>
//               </Form.Item>
//             </div>

//             <div className="border-t pt-6 mt-4 flex justify-end gap-3">
//               <Button
//                 size="large"
//                 onClick={() => router.push("/dashboard/vehicles")}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="primary"
//                 htmlType="submit"
//                 size="large"
//                 loading={loading}
//                 icon={<SaveOutlined />}
//               >
//                 {vehicleId ? "Update Vehicle" : "Save Vehicle"}
//               </Button>
//             </div>
//           </Form>
//         </Card>
//       </Space>
//     </div>
//   );
// }












"use client";

import { useEffect, useState } from "react";
import { 
  Form, Input, Button, Card, Select, Switch, 
  Typography, Space, message, Breadcrumb 
} from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { CarOutlined, ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

export default function VehicleFormPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("id"); // If ID exists, we are in Edit mode
  const [loading, setLoading] = useState(false);

  // Fetch data if editing
  useEffect(() => {
    if (vehicleId) {
      const fetchVehicle = async () => {
        try {
          const res = await fetch(`/api/vehicles/${vehicleId}`);
          if (res.ok) {
            const data = await res.json();
            form.setFieldsValue({
              ...data,
              isActive: data.isActive !== undefined ? data.isActive : true,
            });
          }
        } catch (err) {
          message.error("Failed to load vehicle details");
        }
      };
      fetchVehicle();
    } else {
      form.setFieldsValue({isActive: true});
    }
  }, [vehicleId, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const url = vehicleId ? `/api/vehicles/${vehicleId}` : "/api/vehicles";
      const method = vehicleId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success(`Vehicle ${vehicleId ? "updated" : "added"} successfully!`);
        router.push("/dashboard/vehicles");
      } else {
        const error = await res.json();
        throw new Error(error.message || "Operation failed");
      }
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Space orientation="vertical" size="large" className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Space orientation="vertical" size={0}>
            <Breadcrumb items={[
              { title: 'Dashboard' },
              { title: 'Vehicles', href: '/dashboard/vehicles' },
              { title: vehicleId ? 'Edit' : 'Add New' }
            ]} />
            <Title level={3} style={{ margin: "8px 0" }}>
              {vehicleId ? "Edit Vehicle" : "Register New Vehicle"}
            </Title>
          </Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            Back
          </Button>
        </div>

        <Card className="shadow-md border-0" style={{ borderRadius: '12px' }}>
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
                rules={[{ required: true, message: "Enter vehicle make (e.g. Toyota)" }]}
              >
                <Input placeholder="e.g. Toyota" prefix={<CarOutlined className="text-gray-400" />} size="large" />
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
                rules={[{ required: true, message: "Enter registration number" }]}
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

              {/* HIDE STATUS TOGGLE IF EDITING (when vehicleId exists) */}
              {!vehicleId && (
                <Form.Item label="Status" name="isActive" valuePropName="checked">
                  <div className="flex items-center gap-2">
                      <Switch defaultChecked />
                      {/* <Text type="secondary">Vehicle is available for operations</Text> */}
                  </div>
                </Form.Item>
              )}

            </div>

            <div className="border-t pt-6 mt-4 flex justify-end gap-3">
              <Button size="large" onClick={() => router.push("/dashboard/vehicles")}>
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