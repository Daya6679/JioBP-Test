'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import DriverForm from '@/app/components/drivers/DriverForm';
import { message, Spin } from 'antd';
import type { Dayjs } from 'dayjs';

interface DriverRecord {
  _id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseValidity: Dayjs | null;
  address?: string;
  isActive?: boolean;
  image?: string;
}

interface SubmitValues {
  name: string;
  phone: string;
  licenseNumber: string;
  licenseValidity: Dayjs | null;
  address?: string;
  image: string;
  isActive: boolean;
}

function AddDriverContent() {
  const params = useSearchParams();
  const id = params.get('id');
  const router = useRouter();
  const [data, setData] = useState<DriverRecord | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (id) {
      setIsFetching(true);
      fetch(`/api/drivers`)
        .then((r) => r.json())
        .then((d: DriverRecord[]) => {
          const driver = d.find((x) => x._id === id);
          setData(driver ?? null);
        })
        .finally(() => setIsFetching(false));
    }
  }, [id]);

  const onSubmit = async (values: SubmitValues) => {
    setIsSaving(true);
    const payload = {
      ...values,
      licenseValidity: values.licenseValidity?.format('YYYY-MM-DD'),
    };

    try {
      // Use PUT if editing, POST if adding new
      const method = id ? 'PUT' : 'POST';
      const url = id ? `/api/drivers/${id}` : '/api/drivers';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        messageApi.success(id ? 'Driver updated!' : 'Driver registered successfully!');
        setTimeout(() => {
          router.push('/dashboard/drivers');
          router.refresh();
        }, 800);
      } else {
        const errData = await res.json();
        messageApi.error(errData.message || 'Failed to save');
      }
    } catch {
      messageApi.error('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="default" />
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <DriverForm initialValues={data} onSubmit={onSubmit} isLoading={isSaving} isEditing={!!id} />;
    </>
  );
}

export default function AddDriverPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <Spin size="large" />
        </div>
      }
    >
      <AddDriverContent />
    </Suspense>
  );
}
