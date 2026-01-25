"use client";
import { Form, Input, Button, Card, Typography, message, Image } from "antd";
import { useRouter } from "next/navigation";
import { AntdRegistry } from "@ant-design/nextjs-registry";

const { Title, Text } = Typography;

export default function SignupPage() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: any) => {
    const msgKey = "signup-loading";
   messageApi.open({
      key: msgKey,
      type: "loading",
      content: "Creating account...",
      duration: 0,
    });
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      // hide();

      if (res.ok) {
        messageApi.open({
          key: msgKey,
          type: "success",
          content: "Account created! Please login.",
          duration: 2,
        });
        router.push("/login");
      } else {
       messageApi.open({
          key: msgKey,
          type: "error",
          content: data.message || "Signup failed",
          duration: 3,
        });
      }
    } catch (err) {
      // hide();
      console.error("DETAILED_FETCH_ERROR:", err);
      messageApi.open({
        key: msgKey,
        type: "error",
        content: "Network error. Please try again.",
        duration: 3,
      });
    }
  };

  return (
    <AntdRegistry>
      {contextHolder}
      
      <div className="relative min-h-screen flex items-center justify-center bg-[#fff] p-4">
        {/* 1. TOP LEFT LOGO */}
        <div className="absolute top-6 right-6">
          <Image
            src="./biometrik-logo.jpeg"
            alt="biometrik-logo-top"
            width={120}
            preview={false}
          />
        </div>
        <Card className="w-full max-w-md shadow-md border-t-4 border-blue-600 mt-12 mb-8">
          <div className="mb-6 text-center">
            <Image
              src="./jiobp.png"
              alt="jiobp-logo"
              width={140}
              preview={false}
            />
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
