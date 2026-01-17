"use client";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { useRouter } from "next/navigation";
import { AntdRegistry } from "@ant-design/nextjs-registry";

const { Title, Text } = Typography;

export default function SignupPage() {
  const router = useRouter();

  const onFinish = async (values: any) => {
    const hide = message.loading("Creating account...", 0);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      hide();

      if (res.ok) {
        message.success("Account created! Please login.");
        router.push("/login");
      } else {
        message.error(data.message || "Signup failed");
      }
    } catch (err) {
      hide();
      console.error("DETAILED_FETCH_ERROR:", err);
      message.error("Network error. Please try again.");
    }
  };

  return (
    <AntdRegistry>
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4">
        <Card className="w-full max-w-md shadow-md border-t-4 border-blue-600">
          <div className="mb-6 text-center">
            <Title level={2} style={{ margin: 0, color: "#1d4ed8" }}>
              Jio-BP
            </Title>
            <Text type="secondary">Portal Registration</Text>
          </div>

          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter your name" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: "email" }]}
            >
              <Input placeholder="example@jiobp.com" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                {
                  required: true,
                  len: 10,
                  message: "Enter a valid 10-digit number",
                },
              ]}
            >
              <Input placeholder="10-digit mobile number" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password placeholder="Create a password" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              className="bg-blue-600 mt-2"
            >
              Sign Up
            </Button>
            <div className="mt-4 text-center">
              <Text type="secondary">
                Already have an account?{" "}
                <Typography.Link onClick={() => router.push("/login")}>
                  Login
                </Typography.Link>
              </Text>
            </div>
          </Form>
        </Card>
      </div>
    </AntdRegistry>
  );
}
