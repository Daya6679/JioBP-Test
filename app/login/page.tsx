// "use client";
// import { Form, Input, Button, Card, Typography, message } from "antd";
// import { useRouter } from "next/navigation";
// import { AntdRegistry } from "@ant-design/nextjs-registry";
// import { signIn } from "next-auth/react";

// const { Title, Text } = Typography;

// export default function LoginPage() {
//   const router = useRouter();

//   const onFinish = async (values: any) => {
//     const hide = message.loading("Logging In...", 1);
//     try {
//       const res = await signIn("credentials", {
//         email: values.email,
//         password: values.password,
//         redirect: false,
//       });
//       // const res = await fetch("/api/auth/login", {
//       //   method: "POST",
//       //   headers: { "Content-Type": "application/json" },
//       //   body: JSON.stringify(values),
//       // });

//       // const data = await res.json();
//       hide();

//       if (res?.ok) {
//         message.success("Login successfull.");
//         router.push("/dashboard");
//       } else {
//         message.error(res?.error || "Login failed");
//       }
//     } catch (err) {
//       hide();
//       console.error("DETAILED_FETCH_ERROR:", err);
//       message.error("Network error. Please try again.");
//     }
//   };

//   return (
//     <AntdRegistry>
//       <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4">
//         <Card className="w-full max-w-md shadow-md border-t-4 border-blue-600">
//           <div className="mb-6 text-center">
//             <Title level={3} style={{ margin: 0, color: "#1d4ed8" }}>
//               Jio-BP
//             </Title>
//             <Text type="secondary">Login Dashboard</Text>
//           </div>

//           <Form layout="vertical" onFinish={onFinish} size="middle">
//             {/* <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
//               <Input placeholder="Enter your name" />
//             </Form.Item> */}

//             <Form.Item
//               name="email"
//               label="Email"
//               rules={[{ required: true, type: "email" }]}
//             >
//               <Input placeholder="example@jiobp.com" />
//             </Form.Item>

//             {/* <Form.Item name="phone" label="Phone Number" rules={[{ required: true, len: 10, message: 'Enter a valid 10-digit number' }]}>
//               <Input placeholder="10-digit mobile number" />
//             </Form.Item> */}

//             <Form.Item
//               name="password"
//               label="Password"
//               rules={[{ required: true, min: 6 }]}
//             >
//               <Input.Password placeholder="Create a password" />
//             </Form.Item>

//             <Button
//               type="primary"
//               htmlType="submit"
//               block
//               className="bg-blue-600 mt-2"
//             >
//               Login
//             </Button>
//             <div className="mt-4 text-center">
//               <Text type="secondary">
//                 Don&apos;t have an account?{" "}
//                 <Typography.Link onClick={() => router.push("/signup")}>
//                   Sign Up
//                 </Typography.Link>
//               </Text>
//             </div>
//           </Form>
//         </Card>
//       </div>
//     </AntdRegistry>
//   );
// }













"use client";
import { Form, Input, Button, Card, Typography, message } from "antd";
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
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4">
        <Card className="w-full max-w-md shadow-md border-t-4 border-blue-600">
          <div className="mb-6 text-center">
            <Title level={3} style={{ margin: 0, color: "#1d4ed8" }}>
              Jio-BP
            </Title>
            <Text type="secondary">Login Dashboard</Text>
          </div>
          
          {/* useSearchParams must be wrapped in Suspense in Next.js 13+ */}
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </Card>
      </div>
    </AntdRegistry>
  );
}