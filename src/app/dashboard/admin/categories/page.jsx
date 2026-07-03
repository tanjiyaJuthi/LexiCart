"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
    Table,
    Button,
    Card,
    Modal
} from "@heroui/react";

import {
    Pencil,
    Trash2,
    Plus,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Loading from "@/app/loading";
import Pagination from "@/components/Pagination";


const CategoriesPage = () => {
    const router = useRouter();

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
    totalPages: 1,
    });
    const limit = 10;
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchCategories = async () => {
        try {
            const { data: tokenData } = await authClient.token();

            const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/category?page=${page}&limit=${limit}`,
            {
                headers: {
                Authorization: `Bearer ${tokenData?.token}`,
                },
            }
            );

            const data = await res.json();

            if (res.ok) {
            setCategories(data.data);
            setPagination(data.pagination);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [page]);

    const openDeleteModal = (category) => {
        setSelectedCategory(category);
        setDeleteModalOpen(true);
    };

    const deleteCategory = async () => {
        if (!selectedCategory) return;

        try {
            setDeleting(true);

            const { data: tokenData } = await authClient.token();

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/category/${selectedCategory._id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${tokenData?.token}`,
                    },
                }
            );

            if (res.ok) {
                setCategories(
                    categories.filter(
                        category => category._id !== selectedCategory._id
                    )
                );

                setDeleteModalOpen(false);
                setSelectedCategory(null);
            }

        } catch(error) {
            console.log(error);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Card className="rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
                <Card.Title className="text-xl">
                    categories
                </Card.Title>

                <Button
                    className="h-10 px-5 
                    rounded-xl 
                    text-white
                    bg-[#ef0161]
                    hover:bg-[#5d1bb6]
                    transition-all
                    flex items-center gap-2"
                    onPress={() =>
                        router.push(
                            "/dashboard/admin/categories/add"
                        )
                    }
                >
                    <Plus size={17}/>
                    Add Category
                </Button>
            </div>

            <Table className="bg-[#ef0161]/10 rounded-xl">
                <Table.ScrollContainer>
                    <Table.Content aria-label="categories table" className="min-w-150">
                        <Table.Header className="bg-[#ef0161]/1 text-xl">
                            <Table.Column isRowHeader>Category Name</Table.Column>
                            <Table.Column isRowHeader>Description</Table.Column>
                            <Table.Column>Image</Table.Column>
                            <Table.Column>Actions</Table.Column>
                        </Table.Header>

                        <Table.Body>
                            {loading ? (
                                <Table.Row>
                                    <Table.Cell colSpan={4}>
                                        <Loading />
                                    </Table.Cell>
                                </Table.Row>
                            ) : categories.length === 0 ? (
                                <Table.Row>
                                    <Table.Cell colSpan={4}>
                                        No categories found.
                                    </Table.Cell>
                                </Table.Row>
                            ) : (
                                categories.map((item) => (
                                    <Table.Row key={item._id}>
                                        <Table.Cell>
                                            {item.name}
                                        </Table.Cell>

                                        <Table.Cell>
                                            {item.description || "No description"}
                                        </Table.Cell>
                                        
                                        <Table.Cell>
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                className="w-12 h-12 rounded-lg object-cover"
                                                width={100}
                                                height={100}
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        </Table.Cell>

                                        <Table.Cell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="
                                                        rounded-lg
                                                        text-white
                                                        bg-[#ef0161]
                                                        hover:bg-[#5d1bb6]
                                                        transition-all
                                                    "
                                                    onPress={() =>
                                                        router.push(
                                                            `/dashboard/admin/categories/edit/${item._id}`
                                                        )
                                                    }
                                                >
                                                    <Pencil size={15}/>
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    className="
                                                        rounded-lg
                                                        text-white
                                                        bg-[#ef0161]
                                                        hover:bg-[#5d1bb6]
                                                    "
                                                    onPress={() => openDeleteModal(item)}
                                                >
                                                    <Trash2 size={15}/>
                                                </Button>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                ))
                            )}
                        </Table.Body>
                    </Table.Content>
                </Table.ScrollContainer>
            </Table>

            <Modal
                isOpen={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
            >
                <Modal.Backdrop>
                    <Modal.Container>
                        <Modal.Dialog className="rounded-xl">
                            <Modal.CloseTrigger />

                            <Modal.Header>
                                <Modal.Heading>
                                    Delete Category
                                </Modal.Heading>
                            </Modal.Header>

                            <Modal.Body>
                                <p>
                                    Are you sure you want to delete{" "}
                                    <strong>
                                        {selectedCategory?.name}
                                    </strong>
                                    ?
                                </p>
                            </Modal.Body>

                            <Modal.Footer>
                                <Button
                                    variant="light"
                                    onPress={() => setDeleteModalOpen(false)}
                                    className="rounded-xl bg-gray-100"
                                >
                                    Cancel
                                </Button>

                                <Button
                                    className="rounded-xl bg-[#ef0161] text-white hover:bg-[#5d1bb6] transition-all"
                                    isLoading={deleting}
                                    onPress={deleteCategory}
                                >
                                    Delete
                                </Button>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>

            <div className="flex justify-center mt-6">
                <Pagination
                    page={page}
                    setPage={setPage}
                    pagination={pagination}
                />
            </div>
        </Card>

    );
};

export default CategoriesPage;