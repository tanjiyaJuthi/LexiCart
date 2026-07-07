"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
    Form,
    TextField,
    Label,
    Input,
    Button,
    Card,
    Select,
    ListBox,
} from "@heroui/react";

import { Check } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Loading from "@/app/loading";
import toast from "react-hot-toast";

const CouponEditPage = () => {
    const router = useRouter();
    const { id } = useParams();

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

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        const fetchCoupon = async () => {
            try {
                const { data: tokenData } = await authClient.token();

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/api/coupon/dashboard/${id}`,
                    {
                    headers: {
                        Authorization: `Bearer ${tokenData?.token}`,
                    },
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message);
                }

                setForm({
                    code: data.data.code,
                    discountType: data.data.discountType,
                    discountValue: data.data.discountValue,
                    minPurchase: data.data.minPurchase,
                    maxDiscount: data.data.maxDiscount ?? "",
                    usageLimit: data.data.usageLimit ?? "",
                    expiresAt: data.data.expiresAt
                    ? data.data.expiresAt.split("T")[0]
                    : "",
                    isActive: data.data.isActive,
                });
            } catch (error) {
                // console.log(error);
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCoupon();
    }, [id]);

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            const { data: tokenData } = await authClient.token();

            const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/coupon/${id}`,
            {
                method: "PATCH",
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

            toast.success("Coupon updated successfully!");

            router.push("/dashboard/librarian/coupons");
        } catch (error) {
            setSubmitError(error.message);
        }
    };

    if (loading) {
        return (
            <Card className="rounded-xl p-6">
                <Loading />
            </Card>
        );
    }

    return (
        <Card className="rounded-xl">
            <Card.Header>
                <Card.Title className="text-xl mb-5">Edit Coupon</Card.Title>
            </Card.Header>

            <Form className="flex w-96 flex-col gap-4" onSubmit={onSubmit   }>
                {submitError && (
                    <p className="text-red-500 text-sm">
                        {submitError}
                    </p>
                )}

                <TextField
                    isRequired
                    value={form.code}
                    onChange={(value) =>
                        setForm({
                        ...form,
                        code: value.toUpperCase(),
                        })
                    }
                    >
                    <Label>Coupon Code</Label>
                    <Input />
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
                        <ListBox.Item id="percentage">
                            Percentage
                        </ListBox.Item>

                        <ListBox.Item id="fixed">
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
                    <Input type="number" />
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
                    <Input type="number" />
                </TextField>

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
                    <Input type="number" />
                </TextField>

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
                    <Input type="number" />
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
                        <ListBox.Item id="true">
                            Active
                        </ListBox.Item>

                        <ListBox.Item id="false">
                            Inactive
                        </ListBox.Item>
                        </ListBox>
                    </Select.Popover>
                </Select>

                <div className="flex gap-3">
                    <Button
                        type="submit"
                        className="relative overflow-hidden h-9.5 px-6 text-white rounded-xl bg-[#ef0161] group flex items-center gap-2"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <Check size={16} />
                            Update Coupon
                        </span>

                        <span className="absolute inset-0 rounded-xl bg-[#5d1bb6] translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out pointer-events-none" />
                    </Button>

                    <Button
                        type="button"
                        variant="light"
                        onPress={() =>
                            router.push(
                                "/dashboard/librarian/coupons"
                            )
                        }
                    >
                        Cancel
                    </Button>
                </div>
            </Form>
        </Card>
    );
};

export default CouponEditPage;