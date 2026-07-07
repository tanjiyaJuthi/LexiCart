"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Button,
  Card,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  Select,
  TextArea,
  TextField,
} from "@heroui/react";

import { authClient } from "@/lib/auth-client";
import { imbb } from "@/lib/helper/image uploader/imbb";
import { Check, Upload } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

const CouponsAddPage = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minPurchase: "",
    maxDiscount: "",
    usageLimit: "",
    expiresAt: "",
    isActive: true,
  });

  const [submitError, setSubmitError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    try {
      const { data: tokenData } = await authClient.token();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/coupon`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenData?.token}`,
          },
          body: JSON.stringify({
            ...form,
            discountValue: Number(form.discountValue),
            minPurchase: Number(form.minPurchase),
            maxDiscount: form.maxDiscount
              ? Number(form.maxDiscount)
              : null,
            usageLimit: form.usageLimit
              ? Number(form.usageLimit)
              : null,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      toast.success("Coupon created successfully!");

      router.push("/dashboard/librarian/coupons");
    } catch (error) {
      setSubmitError(error.message);
    }
  };

  return (
    <Card className="rounded-xl">
      <Card.Header>
        <Card.Title className="text-xl mb-5">Add Coupon</Card.Title>
      </Card.Header>

      <Form className="flex w-96 flex-col gap-4" onSubmit={onSubmit}>
        {submitError && (
          <p className="text-red-500 text-sm">
            {submitError}
          </p>
        )}

        <TextField
          isRequired
          value={form.code}
          onChange={(value) =>
            setForm({ ...form, code: value.toUpperCase() })
          }
        >
          <Label>Coupon Code</Label>
          <Input placeholder="SUMMER20" />
          <FieldError />
        </TextField>

        <Select
          value={form.discountType}
          onChange={(value) =>
            setForm({
              ...form,
              discountType: value,
            })
          }
        >
          <Label>Discount Type</Label>

          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>

          <Select.Popover>
            <ListBox>

              <ListBox.Item
                id="percentage"
                textValue="percentage"
              >
                Percentage
              </ListBox.Item>

              <ListBox.Item
                id="fixed"
                textValue="fixed"
              >
                Fixed
              </ListBox.Item>

            </ListBox>
          </Select.Popover>
        </Select>

        <TextField
          isRequired
          value={String(form.discountValue)}
          onChange={(value) =>
            setForm({
              ...form,
              discountValue: value,
            })
          }
        >
          <Label>Discount Value</Label>
          <Input type="number" min={1} />
        </TextField>

        <TextField
          value={String(form.minPurchase)}
          onChange={(value) =>
            setForm({
              ...form,
              minPurchase: value,
            })
          }
        >
          <Label>Minimum Purchase</Label>
          <Input type="number" min={0} />
        </TextField>

        {form.discountType === "percentage" && (
          <TextField
            value={String(form.maxDiscount)}
            onChange={(value) =>
              setForm({
                ...form,
                maxDiscount: value,
              })
            }
          >
            <Label>Maximum Discount</Label>
            <Input type="number" min={0} />
          </TextField>
        )}

        <TextField
          value={String(form.usageLimit)}
          onChange={(value) =>
            setForm({
              ...form,
              usageLimit: value,
            })
          }
        >
          <Label>Usage Limit</Label>
          <Input type="number" min={1} />
        </TextField>

        <TextField
          value={form.expiresAt}
          onChange={(value) =>
            setForm({
              ...form,
              expiresAt: value,
            })
          }
        >
          <Label>Expiry Date</Label>
          <Input type="date" />
        </TextField>

        <Select
          value={form.isActive ? "true" : "false"}
          onChange={(value) =>
            setForm({
              ...form,
              isActive: value === "true",
            })
          }
        >
          <Label>Status</Label>

          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>

          <Select.Popover>
            <ListBox>

              <ListBox.Item
                id="true"
                textValue="true"
              >
                Active
              </ListBox.Item>

              <ListBox.Item
                id="false"
                textValue="false"
              >
                Inactive
              </ListBox.Item>

            </ListBox>
          </Select.Popover>
        </Select>

        <div className="flex gap-2">

          <Button
            type="submit"
            className="bg-[#ef0161] text-white rounded-xl hover:bg-[#5d1bb6]"
          >
            <Check size={16} />
            Create Coupon
          </Button>

          <Button
            type="reset"
            variant="secondary"
            onPress={() =>
              setForm({
                code: "",
                discountType: "percentage",
                discountValue: "",
                minPurchase: "",
                maxDiscount: "",
                usageLimit: "",
                expiresAt: "",
                isActive: true,
              })
            }
          >
            Reset
          </Button>

        </div>

      </Form>
    </Card>
  );
};

export default CouponsAddPage;
