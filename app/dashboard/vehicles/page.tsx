// "use client";

// import { useEffect, useState } from "react";
// import {
//   Button,
//   Table,
//   Tag,
//   Card,
//   Typography,
//   Space,
//   message,
//   Tooltip,
//   Modal,
//   Input,
// } from "antd";
// import { useRouter } from "next/navigation";
// import {
//   EditOutlined,
//   CarOutlined,
//   DeleteOutlined,
//   ExclamationCircleOutlined,
//   InfoCircleOutlined,
// } from "@ant-design/icons";
// import dayjs from "dayjs";

// const { Title, Text } = Typography;
// const { confirm } = Modal;
// const { Search } = Input;

// export default function VehiclesPage() {
//   const [vehicles, setVehicles] = useState([]);
//   const [filteredVehicles, setFilteredVehicles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [viewModalOpen, setViewModalOpen] = useState(false);
//   const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

//   const router = useRouter();

//   const fetchVehicles = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/vehicles"); // Ensure this endpoint exists
//       if (!res.ok) throw new Error("Failed to fetch");
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : [];
//       setVehicles(list);
//       setFilteredVehicles(list);
//     } catch (err) {
//       console.error("Fetch error:", err);
//       message.error("Could not load vehicles list");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchVehicles();
//   }, []);

//   const openVehicleModal = (record: any) => {
//     setSelectedVehicle(record);
//     setViewModalOpen(true);
//   };

//   const Detail = ({
//     label,
//     value,
//     fullWidth = false,
//   }: {
//     label: string;
//     value: string;
//     fullWidth?: boolean;
//   }) => (
//     <div style={{ gridColumn: fullWidth ? "1 / -1" : undefined }}>
//       <Typography.Text type="secondary" style={{ fontSize: 12 }}>
//         {label}
//       </Typography.Text>
//       <div style={{ fontWeight: 500 }}>{value}</div>
//     </div>
//   );

//   const handleSearch = (value: string) => {
//     const term = value.toLowerCase();
//     const filtered = vehicles.filter(
//       (v: any) =>
//         v.make?.toLowerCase().includes(term) ||
//         v.model?.toLowerCase().includes(term) ||
//         v.vehicleNumber?.toLowerCase().includes(term) ||
//         v.nickname?.toLowerCase().includes(term)
//     );
//     setFilteredVehicles(filtered);
//   };

//   const showDeactivateConfirm = (record: any) => {
//     confirm({
//       title: "Deactivate Vehicle?",
//       icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
//       content: `Are you sure you want to disable ${record.vehicleNumber}? It will be hidden from active operations.`,
//       centered: true,
//       okText: "Yes, Deactivate",
//       okType: "danger",
//       cancelText: "No",
//       onOk: async () => {
//         try {
//           const res = await fetch(`/api/vehicles/${record._id}`, {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ isActive: false }),
//           });
//           if (res.ok) {
//             message.success(`Vehicle ${record.vehicleNumber} deactivated`);
//             fetchVehicles();
//           } else {
//             message.error("Failed to update status");
//           }
//         } catch (err) {
//           message.error("Error connecting to server");
//         }
//       },
//     });
//   };

//   const columns = [
//     {
//       title: "Make & Model",
//       key: "vehicleInfo",
//       fixed: 'left' as const, // Keeps identity visible while scrolling
//       width: 200,
//       render: (record: any) => (
//         <Space>
//           <CarOutlined
//             style={{
//               fontSize: "18px",
//               color: record.isActive ? "#1890ff" : "#bfbfbf",
//             }}
//           />
//           <div>
//             <div
//               className={
//                 record.isActive
//                   ? "font-semibold"
//                   : "font-semibold text-gray-400"
//               }
//             >
//               {record.make} {record.model}
//             </div>
//             <div className="text-xs text-gray-400">
//               {record.nickname || "No Nickname"}
//             </div>
//           </div>
//         </Space>
//       ),
//     },
//     {
//       title: "Vehicle No.",
//       dataIndex: "vehicleNumber",
//       key: "vehicleNumber",
//       render: (text: string) => <Tag color="blue">{text || "N/A"}</Tag>,
//     },
//     {
//       title: "Fuel Type",
//       dataIndex: "fuelType",
//       key: "fuelType",
//       responsive: ['md'] as any, // Hides on mobile to save space
//       render: (type: string) => (
//         <span className="capitalize">{type || "N/A"}</span>
//       ),
//     },
//     {
//       title: "Status",
//       dataIndex: "isActive",
//       key: "isActive",
//       render: (active: boolean) => (
//         <Tag color={active ? "green" : "red"}>
//           {active ? "ACTIVE" : "INACTIVE"}
//         </Tag>
//       ),
//     },
//     {
//       title: "Created On",
//       dataIndex: "createdAt",
//       key: "createdAt",
//       responsive: ['lg'] as any, // Only shows on large screens
//       sorter: (a: any, b: any) =>
//         dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
//       render: (date: string) => (
//         <span className="text-gray-500">
//           {dayjs(date).format("YYYY-MM-DD")}
//         </span>
//       ),
//     },
//     {
//       title: "Action",
//       key: "action",
//       fixed: 'right' as const, // Keeps buttons always accessible
//       width: 120,
//       render: (_: any, record: any) => (
//         <Space size="small">
//           <Tooltip title="View Details">
//             <Button
//               type="text"
//               icon={<InfoCircleOutlined />}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 openVehicleModal(record);
//               }}
//             />
//           </Tooltip>
//           <Tooltip title="Edit">
//             <Button
//               type="link"
//               icon={<EditOutlined />}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 router.push(`/dashboard/vehicles/add?id=${record._id}`);
//               }}
//             />
//           </Tooltip>
//           {record.isActive && (
//             <Tooltip title="Deactivate">
//               <Button
//                 type="link"
//                 danger
//                 icon={<DeleteOutlined />}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   showDeactivateConfirm(record);
//                 }}
//               />
//             </Tooltip>
//           )}
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <Card className="shadow-sm border-0" style={{ borderRadius: "12px" }}>
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <Title level={4} style={{ margin: 2 }}>
//             Vehicles Management
//           </Title>
//           <Typography.Text type="secondary">
//             View and manage your fleet
//           </Typography.Text>
//         </div>
//         <Space wrap>
//           <Search
//             placeholder="Search by model, no, or nickname..."
//             allowClear
//             onSearch={handleSearch}
//             onChange={(e) => handleSearch(e.target.value)}
//             style={{ width: 300 }}
//           />
//           <Button
//             type="default"
//             icon={<CarOutlined />}
//             onClick={() => router.push("/dashboard/vehicles/add")}
//           >
//             Add New Vehicle
//           </Button>
//         </Space>
//       </div>

//       <Table
//         dataSource={filteredVehicles}
//         columns={columns}
//         rowKey="_id"
//         loading={loading}
//         onRow={(record) => ({
//           onClick: () => openVehicleModal(record),
//         })}
//         pagination={{
//           defaultPageSize: 10,
//           showSizeChanger: true,
//           showTotal: (total) => `Total ${total} vehicles`,
//         }}
//         className="cursor-pointer"
//       />

//       <Modal
//         open={viewModalOpen}
//         title="Vehicle Information"
//         onCancel={() => setViewModalOpen(false)}
//         footer={null}
//         width={500}
//         centered
//       >
//         {selectedVehicle && (
//           <Space
//             orientation="vertical"
//             size={20}
//             style={{ width: "100%", paddingTop: 10 }}
//           >
//             <div className="flex items-center gap-4">
//               <div className="p-4 bg-blue-50 rounded-full">
//                 <CarOutlined style={{ fontSize: 32, color: "#1890ff" }} />
//               </div>
//               <div>
//                 <Title level={4} style={{ margin: 0 }}>
//                   {selectedVehicle.make} {selectedVehicle.model}
//                 </Title>
//                 <Text type="secondary">
//                   {selectedVehicle.nickname || "No Nickname"}
//                 </Text>
//               </div>
//             </div>

//             <div
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "1fr 1fr",
//                 gap: 16,
//               }}
//             >
//               <Detail
//                 label="Vehicle Number"
//                 value={selectedVehicle.vehicleNumber}
//               />
//               <Detail
//                 label="Fuel Type"
//                 value={selectedVehicle.fuelType || "N/A"}
//               />
//               <Detail
//                 label="Status"
//                 value={selectedVehicle.isActive ? "Active" : "Inactive"}
//               />
//               <Detail
//                 label="Registration Date"
//                 value={dayjs(selectedVehicle.createdAt).format("MMMM DD, YYYY")}
//               />
//             </div>
//           </Space>
//         )}
//       </Modal>
//     </Card>
//   );
// }













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
  CalendarOutlined,
  FilterOutlined,
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
      const res = await fetch("/api/vehicles");
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
      content: `Are you sure you want to disable ${record.vehicleNumber}?`,
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
            message.success(`Vehicle deactivated`);
            fetchVehicles();
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
      render: (record: any) => (
        <Space>
          <CarOutlined style={{ color: record.isActive ? "#1890ff" : "#bfbfbf" }} />
          <div>
            <div className="font-semibold">{record.make} {record.model}</div>
            <div className="text-xs text-gray-400">{record.nickname}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Vehicle No.",
      dataIndex: "vehicleNumber",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Fuel Type",
      dataIndex: "fuelType",
      render: (type: string) => <span className="capitalize">{type || "N/A"}</span>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>{active ? "ACTIVE" : "INACTIVE"}</Tag>
      ),
    },
    {
      title: "Created On",
      dataIndex: "createdAt",
      // Restored sorting logic
      sorter: (a: any, b: any) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      defaultSortOrder: 'descend' as const,
      render: (date: string) => <span>{dayjs(date).format("YYYY-MM-DD")}</span>,
    },
    {
      title: "Action",
      key: "action",
      width: 140,
      render: (_: any, record: any) => (
        <Space size="small">
          {/* Wrapped in spans for Tooltip reliability */}
          <Tooltip title="View Details">
            <span>
              <Button 
                type="text" 
                size="small" 
                icon={<InfoCircleOutlined />} 
                onClick={(e) => { e.stopPropagation(); openVehicleModal(record); }} 
              />
            </span>
          </Tooltip>
          <Tooltip title="Edit">
            <span>
              <Button 
                type="link" 
                size="small" 
                icon={<EditOutlined />} 
                onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/vehicles/add?id=${record._id}`); }} 
              />
            </span>
          </Tooltip>
          {record.isActive && (
            <Tooltip title="Deactivate">
              <span>
                <Button 
                  type="link" 
                  size="small" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={(e) => { e.stopPropagation(); showDeactivateConfirm(record); }} 
                />
              </span>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card className="shadow-sm border-0" style={{ borderRadius: "12px" }}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <Title level={4} style={{ margin: 0 }}>Vehicles Management</Title>
          <Text type="secondary">View and manage your fleet</Text>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Search
            placeholder="Search..."
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button
            type="primary"
            icon={<CarOutlined />}
            onClick={() => router.push("/dashboard/vehicles/add")}
          >
            Add New
          </Button>
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="block md:hidden space-y-4">
        {filteredVehicles.map((vehicle: any) => (
          <div 
            key={vehicle._id} 
            className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm"
            onClick={() => openVehicleModal(vehicle)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <div className="p-2 bg-blue-50 rounded-lg h-fit">
                  <CarOutlined style={{ color: "#1890ff", fontSize: 20 }} />
                </div>
                <div>
                  <div className="font-bold text-gray-800 leading-tight">{vehicle.make} {vehicle.model}</div>
                  <div className="text-xs text-gray-400">{vehicle.nickname || "No Nickname"}</div>
                </div>
              </div>
              <Tag color={vehicle.isActive ? "green" : "red"} className="m-0">
                {vehicle.isActive ? "ACTIVE" : "INACTIVE"}
              </Tag>
            </div>

            <div className="grid grid-cols-2 gap-y-3 mb-4 text-sm bg-gray-50 p-3 rounded-md">
              <div>
                <Text type="secondary" className="text-[10px] block uppercase">Vehicle Number</Text>
                <Tag color="blue" className="m-0 font-mono">{vehicle.vehicleNumber}</Tag>
              </div>
              <div>
                <Text type="secondary" className="text-[10px] block uppercase">Fuel Type</Text>
                <Space size={4}><FilterOutlined className="text-gray-400 text-xs"/> <span className="capitalize">{vehicle.fuelType || "N/A"}</span></Space>
              </div>
              <div className="col-span-2">
                <Text type="secondary" className="text-[10px] block uppercase">Created On</Text>
                <Space size={4}><CalendarOutlined className="text-gray-400 text-xs"/> <span>{dayjs(vehicle.createdAt).format("MMMM DD, YYYY")}</span></Space>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
               <Button size="small" icon={<InfoCircleOutlined />} onClick={(e) => { e.stopPropagation(); openVehicleModal(vehicle); }}>Details</Button>
               <Button size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/vehicles/add?id=${vehicle._id}`); }} />
               {vehicle.isActive && (
                 <Button size="small" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); showDeactivateConfirm(vehicle); }} />
               )}
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block">
        <Table
          dataSource={filteredVehicles}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ defaultPageSize: 10 }}
          className="cursor-pointer"
        />
      </div>

      {/* View Modal */}
      <Modal
        open={viewModalOpen}
        title="Vehicle Information"
        onCancel={() => setViewModalOpen(false)}
        footer={null}
        centered
      >
        {selectedVehicle && (
          <Space orientation="vertical" className="w-full" size={16}>
             <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-full"><CarOutlined style={{ fontSize: 24, color: "#1890ff" }} /></div>
              <div>
                <Title level={5} style={{ margin: 0 }}>{selectedVehicle.make} {selectedVehicle.model}</Title>
                <Text type="secondary">{selectedVehicle.nickname || "N/A"}</Text>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Text type="secondary" className="text-xs">Vehicle Number</Text><div className="font-medium">{selectedVehicle.vehicleNumber}</div></div>
              <div><Text type="secondary" className="text-xs">Fuel Type</Text><div className="capitalize">{selectedVehicle.fuelType || "N/A"}</div></div>
              <div><Text type="secondary" className="text-xs">Status</Text><div>{selectedVehicle.isActive ? "Active" : "Inactive"}</div></div>
              <div><Text type="secondary" className="text-xs">Created On</Text><div>{dayjs(selectedVehicle.createdAt).format("YYYY-MM-DD")}</div></div>
            </div>
          </Space>
        )}
      </Modal>
    </Card>
  );
}