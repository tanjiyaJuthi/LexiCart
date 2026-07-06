"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
    Form,
    TextField,
    Label,
    Input,
    TextArea,
    FieldError,
    Button,
    Card,
    Select,
    ListBox,
} from "@heroui/react";

import { Check, Upload } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { imbb } from "@/lib/helper/image uploader/imbb";
import Loading from "@/app/loading";

const BookEditPage = ({ params }) => {
    const router = useRouter();
    const { id } = useParams();

    const [form, setForm] = useState({
        title: "",
        author: "",
        description: "",
        category: "",
        coverImage: "",
        deliveryFee: "",
    });

    const [categories, setCategories] = useState([]);
    const [uploading, setUploading] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const fetchBook = async () => {
        try {
            const { data: tokenData } = await authClient.token();

            const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/book/edit/${id}`,
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
                title: data.data.title || "",
                author: data.data.author || "",
                description: data.data.description || "",
                category: data.data.category || "",
                coverImage: data.data.coverImage || "",
                deliveryFee: String(data.data.deliveryFee || ""),
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data: tokenData } = await authClient.token();

            const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/category`,
            {
                headers: {
                Authorization: `Bearer ${tokenData?.token}`,
                },
            }
            );

            const data = await res.json();

            if (res.ok) {
            setCategories(data.data);
            } else {
            console.log(data.message);
            }
        } catch (error) {
            console.log(error);
        }
        };

    useEffect(() => {
        if (id) {
            fetchBook();
            fetchCategories();
        }
    }, [id]);

    const handleImageUpload = async (file) => {
        try {
          setUploading(true);
    
          const imageUrl = await imbb(file);
    
          setForm((prev) => ({
            ...prev,
            coverImage: imageUrl,
          }));
        } catch (error) {
          console.log(error);
          setSubmitError("Image upload failed");
        } finally {
          setUploading(false);
        }
    };

    const updateBook = async (e) => {
        e.preventDefault();

        try {
            const { data: tokenData } = await authClient.token();
            const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/book/${id}`;

            const payload = {
                ...form,
                deliveryFee: Number(form.deliveryFee),
            };

            const res = await fetch(url,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${tokenData?.token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message);
            }

            router.push("/dashboard/librarian/books");
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
                <Card.Title className="text-xl mb-5">Edit Book</Card.Title>
            </Card.Header>

            <Form className="flex w-96 flex-col gap-4" onSubmit={updateBook}>
                {submitError && (
                    <p className="text-red-500 text-sm">
                        {submitError}
                    </p>
                )}

                <TextField isRequired>
                    <Label>Book Title</Label>

                    <Input
                        value={form.title}
                        onChange={(e) =>
                        setForm((prev) => ({
                            ...prev,
                            title: e.target.value,
                        }))
                        }
                        placeholder="Enter title"
                    />

                    <FieldError />
                </TextField>

                <TextField isRequired>
                    <Label>Author</Label>

                    <Input
                        value={form.author}
                        onChange={(e) =>
                        setForm((prev) => ({
                            ...prev,
                            author: e.target.value,
                        }))
                        }
                        placeholder="Enter author name"
                    />

                    <FieldError />
                </TextField>

                <TextField isRequired>
                    <Label>Delivery Fee</Label>

                    <Input
                        value={form.deliveryFee}
                        onChange={(e) =>
                        setForm((prev) => ({
                            ...prev,
                            deliveryFee: e.target.value,
                        }))
                        }
                        placeholder="Enter Delivery Fee"
                    />

                    <FieldError />
                </TextField>

                <Select
                    value={form.category}
                    onChange={(value) => {
                        setForm((prev) => ({
                            ...prev,
                            category: value,
                        }));
                    }}
                >
                    <Label>Category</Label>

                    <Select.Trigger>
                        <Select.Value placeholder="Select category" />
                        <Select.Indicator />
                    </Select.Trigger>

                    <Select.Popover>
                        <ListBox className="rounded-xl">
                        {categories.map((category) => (
                            <ListBox.Item
                                className="hover:bg-[#ef0161]/5 hover:text-[#ef0161]"
                                key={category._id}
                                id={category._id}
                                textValue={category.name}
                            >
                                {category.name}
                                <ListBox.ItemIndicator />
                            </ListBox.Item>
                        ))}
                        </ListBox>
                    </Select.Popover>
                </Select>

                <TextField
                    isRequired
                    value={form.description}
                    onChange={(value) =>
                        setForm({
                            ...form,
                            description: value,
                        })
                    }
                >
                    <Label>Description</Label>

                    <TextArea
                        value={form.description}
                        onChange={(e) =>
                            setForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                            }))
                        }
                        placeholder="Book description"
                        />

                    <FieldError />
                </TextField>

                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="image-upload"
                        className="flex items-center gap-2 w-fit cursor-pointer rounded-lg border h-9.5 px-2 hover:bg-red-100"
                    >
                        <Upload className="h-3" />
                        <span>Upload Image</span>
                    </label>

                    <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) {
                            handleImageUpload(file);
                        }
                        }}
                    />

                    {uploading && <p>Uploading image...</p>}

                    {form.coverImage && (
                        <Image
                            width={100}
                            height={100}
                            src={form.coverImage}
                            alt="cover"
                            className="
                                h-32
                                w-24
                                object-cover
                                rounded-lg
                            "
                        />
                    )}
                    </div>

                <div className="flex gap-3">
                    <Button
                        type="submit"
                        isLoading={saving}
                        className="
                            bg-[#ef0161]
                            text-white
                            rounded-xl
                        "
                    >
                        <Check size={16} />
                        Update Book
                    </Button>

                    <Button
                        type="button"
                        variant="light"
                        onPress={() =>
                            router.push(
                                "/dashboard/librarian/books"
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

export default BookEditPage;