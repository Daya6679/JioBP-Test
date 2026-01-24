"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  Table, 
  Tag, 
  Space, 
  Select, 
  Card, 
  Typography, 
  message, 
  Button, 
  Tooltip,
  Modal,
  Divider
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { 
  SearchOutlined, 
  HistoryOutlined, 
  InfoCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  CarOutlined,
  DashboardOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

export default function TransactionDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  
  // Filters state
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const fetchMetadata = async () => {
    try {
      const [drRes, vehRes] = await Promise.all([
        fetch("/api/drivers"),
        fetch("/api/vehicles"),
      ]);
      const drData = await drRes.json();
      const vehData = await vehRes.json();
      
      if (Array.isArray(drData)) setDrivers(drData);
      if (Array.isArray(vehData)) setVehicles(vehData);
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  };

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDriver) params.append("driverId", selectedDriver);
      if (selectedVehicle) params.append("vehicleId", selectedVehicle);

      const response = await fetch(`/api/dashboard/transactions?${params.toString()}`);
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setTransactions(data);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      message.error("Failed to load transactions");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDriver, selectedVehicle]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const openTxModal = (record: any) => {
    setSelectedTx(record);
    setViewModalOpen(true);
  };

  const columns: ColumnsType<any> = [
    {
      title: "Date & Time",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a: any, b: any) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      defaultSortOrder: 'descend' as const,
      render: (date) => (
        <div className="flex flex-col">
          <Text strong>{dayjs(date).format("YYYY-MM-DD")}</Text>
          <Text type="secondary" className="text-xs">{dayjs(date).format("hh:mm A")}</Text>
        </div>
      ),
      width: 150,
    },
    {
      title: "Driver",
      dataIndex: ["driverId", "name"],
      key: "driverName",
      render: (name) => (
        <Space>
          <UserOutlined className="text-blue-500" />
          <Text>{name || "Unknown"}</Text>
        </Space>
      ),
    },
    {
      title: "Vehicle No.",
      dataIndex: ["vehicleId", "vehicleNumber"],
      key: "vehicleNumber",
      render: (plate) => <Tag color="volcano" className="font-mono">{plate || "N/A"}</Tag>,
    },
    {
      title: "Qty (L)",
      dataIndex: "qty",
      key: "qty",
      render: (qty) => (
        qty > 0 ? <Text strong className="text-blue-600">{qty} L</Text> : <Text type="secondary">-</Text>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amt) => (
        amt > 0 ? <Text strong className="text-green-600">₹{amt.toLocaleString()}</Text> : <Text type="secondary">-</Text>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button 
            type="text" 
            icon={<InfoCircleOutlined />} 
            onClick={() => openTxModal(record)} 
            style={}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card className="shadow-sm border-0" style={{ borderRadius: "12px" }}>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <div>
            <Title level={4} style={{ margin: 0 }}>Fuel Transactions Log</Title>
            <Text type="secondary">Review all fueling activities and histories</Text>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              showSearch
              placeholder="Filter by Driver"
              style={{ width: "100%", minWidth: 200 }}
              allowClear
              optionFilterProp="children"
              onChange={(value) => setSelectedDriver(value)}
              suffixIcon={<SearchOutlined />}
            >
              {drivers.map(d => (
                <Option key={d._id} value={d._id}>{d.name}</Option>
              ))}
            </Select>

            <Select
              showSearch
              placeholder="Filter by Vehicle"
              style={{ width: "100%", minWidth: 200 }}
              allowClear
              optionFilterProp="children"
              onChange={(value) => setSelectedVehicle(value)}
              suffixIcon={<SearchOutlined />}
            >
              {vehicles.map(v => (
                <Option key={v._id} value={v._id}>{v.vehicleNumber}</Option>
              ))}
            </Select>
          </div>
        </div>

        {/* MOBILE VIEW */}
        <div className="block md:hidden space-y-4">
          {transactions.map((tx: any) => (
            <div 
              key={tx._id} 
              className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm"
              onClick={() => openTxModal(tx)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <HistoryOutlined style={{ color: "#1890ff", fontSize: 18 }} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{tx.driverId?.name || "Unknown Driver"}</div>
                    <div className="text-xs text-gray-400 font-mono">{tx.vehicleId?.vehicleNumber || "N/A"}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">{dayjs(tx.createdAt).format("MMM DD, YYYY")}</div>
                  <div className="text-[10px] text-gray-400 uppercase">{dayjs(tx.createdAt).format("hh:mm A")}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-md mb-2">
                <div>
                  <Text type="secondary" className="text-[10px] block uppercase">Quantity</Text>
                  <Text strong className="text-blue-600">{tx.qty > 0 ? `${tx.qty} L` : "-"}</Text>
                </div>
                <div className="text-right">
                  <Text type="secondary" className="text-[10px] block uppercase">Amount</Text>
                  <Text strong className="text-green-600">{tx.amount > 0 ? `₹${tx.amount}` : "-"}</Text>
                </div>
              </div>
            </div>
          ))}
          {transactions.length === 0 && !loading && (
            <div className="text-center py-10 text-gray-400">No transactions found</div>
          )}
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden md:block">
          <Table 
            columns={columns} 
            dataSource={transactions} 
            rowKey="_id" 
            loading={loading}
            pagination={{ defaultPageSize: 10, showSizeChanger: true }}
            className="cursor-pointer"
          />
        </div>

        {/* View Modal */}
        <Modal
          open={viewModalOpen}
          title="Transaction Details"
          onCancel={() => setViewModalOpen(false)}
          footer={null}
          centered
          width={400}
        >
          {selectedTx && (
            <div className="py-2">
              <div className="flex flex-col items-center mb-6">
                <div className="p-4 bg-blue-50 rounded-full mb-2">
                  <DashboardOutlined style={{ fontSize: 32, color: "#1890ff" }} />
                </div>
                <Title level={4} style={{ margin: 0 }}>
                  {selectedTx.qty > 0 ? `${selectedTx.qty} Liters` : `₹${selectedTx.amount}`}
                </Title>
                <Text type="secondary">Fuel Transaction Summary</Text>
              </div>
              
              <Divider style={{ margin: "12px 0" }} />
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Text type="secondary"><UserOutlined className="mr-2"/>Driver</Text>
                  <Text strong>{selectedTx.driverId?.name || "N/A"}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary"><CarOutlined className="mr-2"/>Vehicle No.</Text>
                  <Tag color="volcano" className="m-0 font-mono">{selectedTx.vehicleId?.vehicleNumber || "N/A"}</Tag>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary"><CalendarOutlined className="mr-2"/>Date</Text>
                  <Text>{dayjs(selectedTx.createdAt).format("MMMM DD, YYYY")}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary"><HistoryOutlined className="mr-2"/>Time</Text>
                  <Text>{dayjs(selectedTx.createdAt).format("hh:mm:ss A")}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Transaction ID</Text>
                  <Text copyable className="text-xs text-gray-400">{selectedTx._id}</Text>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
}