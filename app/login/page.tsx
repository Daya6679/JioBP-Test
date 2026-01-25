"use client";
import { Form, Input, Button, Card, Typography, message, Image } from "antd";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { signIn } from "next-auth/react";
import { useEffect, Suspense } from "react"; // Added useEffect

const { Title, Text } = Typography;

// Separated into a sub-component to handle useSearchParams within Suspense
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  // Trigger toast if user was redirected here by middleware
  useEffect(() => {
    if (callbackUrl) {
      message.warning("Please login or signup first to access the dashboard.");
    }
  }, [callbackUrl]);

  const onFinish = async (values: any) => {
    const hide = message.loading("Logging In...", 0); // Changed to 0 so it stays until manual hide
    try {
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      hide();

      if (res?.ok) {
        message.success("Login successful.");
        router.push("/dashboard");
      } else {
        message.error(res?.error || "Login failed");
      }
    } catch (err) {
      hide();
      console.error("DETAILED_FETCH_ERROR:", err);
      message.error("Network error. Please try again.");
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish} size="middle">
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, type: "email" }]}
      >
        <Input placeholder="example@jiobp.com" />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, min: 6 }]}
      >
        <Input.Password placeholder="Enter your password" />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        block
        className="bg-blue-600 mt-2"
      >
        Login
      </Button>
      <div className="mt-4 text-center">
        <Text type="secondary">
          Don&apos;t have an account?{" "}
          <Typography.Link onClick={() => router.push("/signup")}>
            Sign Up
          </Typography.Link>
        </Text>
      </div>
    </Form>
  );
}

export default function LoginPage() {
  return (
    <AntdRegistry>
      {/* 1. Main Background Container */}
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#fff] p-4">
        {/* 2. TOP LEFT LOGO (Positioned absolutely) */}
        <div className="absolute top-6 right-6">
          <Image
            src="./biometrik-logo.jpeg"
            alt="biometrik-logo-top-left"
            width={120}
            preview={false}
          />
        </div>

        {/* 3. CENTER LOGIN CARD */}
        <Card className="w-full max-w-md shadow-md border-t-4 border-blue-600">
          {/* CENTER LOGO (Inside the card) */}
          <div className="mb-6 text-center">
            <Image
              src="./jiobp.png"
              alt="jiobp-logo"
              width={140}
              preview={false}
            />
            {/* <div className="mt-2">
              <Title level={4}>Login to Your Account</Title>
            </div> */}
          </div>

          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </Card>

        {/* Optional: Footer credit */}
        <div className="mt-6">
          <Text type="secondary" className="text-xs">
            © 2026 Biometrik. All rights reserved.
          </Text>
        </div>
      </div>
    </AntdRegistry>

    // <AntdRegistry>
    //   <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4">
    //     <Card className="w-full max-w-md shadow-md border-t-4 border-blue-600">
    //       <div className="mb-6 text-center">
    //         <Image
    //           src="./biometrik-logo.jpeg"
    //           alt="biometrik-logo"
    //           width={140}
    //         />
    //       </div>

    //       <Suspense fallback={<div>Loading...</div>}>
    //         <LoginForm />
    //       </Suspense>
    //     </Card>
    //   </div>
    // </AntdRegistry>
  );
}
