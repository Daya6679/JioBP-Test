'use client';
import { Form, Input, Button, Card, Typography, message, Image } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation'; // Added useSearchParams
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { signIn } from 'next-auth/react';
import { useEffect, Suspense } from 'react'; // Added useEffect

const { Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

// Separated into a sub-component to handle useSearchParams within Suspense
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const callbackUrl = searchParams.get('callbackUrl');

  // Trigger toast if user was redirected here by middleware
  useEffect(() => {
    if (callbackUrl) {
      messageApi.warning('Please login or signup first to access the dashboard.');
    }
  }, [callbackUrl, messageApi]);

  const onFinish = async (values: LoginFormValues) => {
    const key = 'loginLoading';
    messageApi.open({
      key,
      type: 'loading',
      content: 'Logging In...',
      duration: 0,
    });
    try {
      const res = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      // hide();

      if (res?.ok) {
        messageApi.open({
          key,
          type: 'success',
          content: 'Login successful.',
          duration: 2,
        });
        router.push('/dashboard');
      } else {
        messageApi.open({
          key,
          type: 'error',
          content: res?.error || 'Login failed',
          duration: 3,
        });
      }
    } catch (err) {
      // hide();
      messageApi.open({
        key,
        type: 'error',
        content: 'Network error. Please try again.',
        duration: 3,
      });
      console.error('DETAILED_FETCH_ERROR:', err);
    }
  };

  return (
    <>
      {contextHolder}
      <Form layout="vertical" onFinish={onFinish} size="middle">
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input placeholder="example@jiobp.com" />
        </Form.Item>

        <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
          <Input.Password placeholder="Enter your password" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block className="bg-blue-600 mt-2">
          Login
        </Button>
        <div className="mt-4 text-center">
          <Text type="secondary">
            Don&apos;t have an account?{' '}
            <Typography.Link onClick={() => router.push('/signup')}>Sign Up</Typography.Link>
          </Text>
        </div>
      </Form>
    </>
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
            <Image src="./Jio-bp_logo.svg" alt="jiobp-logo" width={100} preview={false} />
          </div>

          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </Card>
      </div>
    </AntdRegistry>
  );
}
