// Ví dụ cách sử dụng các component tái sử dụng trong AdminDashboard

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import adminService from "../../api/services/admin.service";

import PageLayout from "../../Components/PageLayout";
import StatCard from "../../Components/StatCard";
import DashboardCard from "../../Components/DashboardCard";
import ActionButton from "../../Components/ActionButton";
import TabButtons from "../../Components/TabButtons";
import DataTable from "../../Components/DataTable";
import StatusBadge from "../../Components/StatusBadge";
import ChartContainer from "../../Components/ChartContainer";

type DashboardStats = {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalPosts: number;
  pendingModeration: number;
  dailyActiveUsers: number;
  totalTokensMinted: number;
  systemHealth: "good" | "warning" | "critical";
};

type UserTimeData = {
  date: string;
  users: number;
};

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userTimeData, setUserTimeData] = useState<UserTimeData[]>([]);
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "year">(
    "month"
  );
  const navigate = useNavigate();

  useEffect(() => {
    // Logic lấy dữ liệu giữ nguyên...
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const statsResponse = await adminService.getDashboardStats();
        setStats(statsResponse.data);

        const userTimeResponse = await adminService.getUsersOverTime(
          timePeriod
        );
        setUserTimeData(userTimeResponse.data.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timePeriod]);

  // Thêm mock data nếu cần
  useEffect(() => {
    if (!stats && !loading) {
      // Logic tạo dữ liệu mẫu...
      setStats({
        totalUsers: 1250,
        activeUsers: 780,
        newUsersToday: 24,
        totalPosts: 8764,
        pendingModeration: 12,
        dailyActiveUsers: 450,
        totalTokensMinted: 75000,
        systemHealth: "good",
      });

      // Tạo dữ liệu cho biểu đồ
      const mockTimeData: UserTimeData[] = [];
      const now = new Date();

      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        mockTimeData.push({
          date: date.toLocaleDateString("vi-VN", {
            month: "short",
            day: "numeric",
          }),
          users: Math.floor(Math.random() * 50) + 10,
        });
      }

      setUserTimeData(mockTimeData);
    }
  }, [stats, loading]);

  // Hiển thị loading
  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Cấu hình cho component TabButtons
  const timePeriodOptions = [
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
  ];

  // Cấu hình cho component DataTable
  const logColumns = [
    { header: "Time", accessor: "time" },
    {
      header: "Type",
      accessor: "type",
      cell: (value: string) => (
        <StatusBadge text={value} type={value.toLowerCase() as any} />
      ),
    },
    { header: "Message", accessor: "message" },
  ];

  const logData = [
    {
      time: "Today 10:45 AM",
      type: "INFO",
      message: "System startup completed successfully",
    },
    {
      time: "Today 09:12 AM",
      type: "WARNING",
      message: "High CPU usage detected",
    },
    {
      time: "Yesterday 11:52 PM",
      type: "ERROR",
      message: "Failed to connect to blockchain node",
    },
  ];

  return (
    <PageLayout title="Admin Dashboard" subtitle="Welcome back, Administrator">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          badgeText={`+${stats?.newUsersToday || 0} today`}
          badgeColor="green"
          onClick={() => navigate("/admin/users")}
        />

        <StatCard
          title="Total Posts"
          value={stats?.totalPosts || 0}
          badgeText={
            stats?.pendingModeration
              ? `${stats.pendingModeration} need moderation`
              : "All moderated"
          }
          badgeColor={stats?.pendingModeration ? "yellow" : "green"}
          onClick={() => navigate("/admin/posts/moderation")}
        />

        <StatCard
          title="DX Tokens"
          value={stats?.totalTokensMinted || 0}
          badgeText="Minted total"
          badgeColor="blue"
          onClick={() => navigate("/admin/blockchain/mint")}
        />

        <StatCard
          title="System Health"
          value={stats?.systemHealth?.toUpperCase() || "Unknown"}
          badgeText={`${stats?.dailyActiveUsers || 0} active users today`}
          badgeColor="blue"
          onClick={() => navigate("/admin/settings")}
        />
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* User Growth Chart */}
        <div className="lg:col-span-3">
          <ChartContainer
            title="User Growth"
            height="300px"
            actions={
              <TabButtons
                options={timePeriodOptions}
                currentValue={timePeriod}
                onChange={(value) => setTimePeriod(value as any)}
              />
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 8 }}
                  name="New Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-1">
          <DashboardCard title="Quick Actions" height="300px">
            <div className="space-y-4 flex flex-col h-full justify-between">
              <ActionButton
                text="Manage Tasks"
                color="indigo"
                onClick={() => navigate("/admin/tasks")}
              />
              <ActionButton
                text="Mint Tokens"
                color="green"
                onClick={() => navigate("/admin/blockchain/mint")}
              />
              <ActionButton
                text="System Settings"
                color="yellow"
                onClick={() => navigate("/admin/settings")}
              />
              <ActionButton
                text="View Logs"
                color="gray"
                onClick={() => navigate("/admin/logs")}
              />
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* System Logs */}
      <DashboardCard
        title="Recent System Logs"
        actionText="View All"
        onActionClick={() => navigate("/admin/logs")}
      >
        <DataTable
          columns={logColumns}
          data={logData}
          onRowClick={(log) => console.log("Log clicked:", log)}
        />
      </DashboardCard>
    </PageLayout>
  );
};

export default AdminDashboard;
