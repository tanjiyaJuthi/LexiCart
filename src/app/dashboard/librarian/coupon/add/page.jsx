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

const BooksAddPage = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    coverImage: "",
    deliveryFee: "",
  });

  const [submitError, setSubmitError] = useState("");
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);

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
    fetchCategories();
  }, []);

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

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    try {
      const { data: tokenData } = await authClient.token();

      // console.log("Token:", tokenData?.token);
      // console.log("Type:", typeof tokenData?.token);

      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/book`;

      const payload = {
        ...form,
        deliveryFee: Number(form.deliveryFee),
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData?.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      toast.success("Book has been added sucessfully!");
      router.push("/dashboard/librarian/books");
    } catch (error) {
      console.error(error);
      setSubmitError(error.message);
    }
  };

  return (
    <Card className="rounded-xl">
      <Card.Header>
        <Card.Title className="text-xl mb-5">Add Book</Card.Title>
      </Card.Header>

      <Form className="flex w-96 flex-col gap-4" onSubmit={onSubmit}>
        {submitError && <p className="text-red-500 text-sm">{submitError}</p>}

        <TextField
          isRequired
          name="title"
          value={form.title}
          onChange={(value) =>
            setForm({
              ...form,
              title: value,
            })
          }
          validate={(value) => {
            if (!value.trim()) {
              return "Book title is required";
            }

            if (value.length < 3) {
              return "Book title must be at least 3 characters";
            }

            return null;
          }}
        >
          <Label>Book Title</Label>

          <Input placeholder="Enter Book title" className="rounded-xl" />

          <FieldError />
        </TextField>

        <TextField
          isRequired
          name="author"
          value={form.author}
          onChange={(value) =>
            setForm({
              ...form,
              author: value,
            })
          }
          validate={(value) => {
            if (!value.trim()) {
              return "Book author is required";
            }

            if (value.length < 3) {
              return "Book author must be at least 3 characters";
            }

            return null;
          }}
        >
          <Label>Book Author</Label>

          <Input placeholder="Enter Book author" className="rounded-xl" />

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
          value={String(form.deliveryFee)}
          onChange={(value) =>
            setForm({
              ...form,
              deliveryFee: value,
            })
          }
        >
          <Label>Delivery Fee</Label>

          <Input type="number" min={0} placeholder="0" />

          <FieldError />
        </TextField>

        <TextField
          name="description"
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
            className="rounded-xl"
            placeholder="Enter category description"
          />

          <Description>Optional description for this category</Description>

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

        <div className="flex gap-2">
          <Button
            type="submit"
            className="relative overflow-hidden h-9.5 px-6 text-white rounded-xl bg-[#ef0161] group flex items-center gap-2"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Check size={16} />
              Create Book
            </span>

            <span className="absolute inset-0 rounded-xl bg-[#5d1bb6] translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out pointer-events-none" />
          </Button>

          <Button
            type="reset"
            variant="secondary"
            className="relative overflow-hidden h-9.5 px-6 text-[#ef0161] rounded-xl group"
            onPress={() =>
              setForm({
                title: "",
                author: "",
                description: "",
                category: "",
                coverImage: "",
                deliveryFee: "",
              })
            }
          >
            <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
              Reset
            </span>

            <span className="absolute inset-0 rounded-xl bg-[#5d1bb6] translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out pointer-events-none" />
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default BooksAddPage;
