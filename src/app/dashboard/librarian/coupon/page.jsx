"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
    Table,
    Button,
    Card,
    Modal,
} from "@heroui/react";

import {
    Pencil,
    Trash2,
    Plus,
    EyeOff,
    Eye,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";
import Loading from "@/app/loading";

const BooksPage = () => {
    const router = useRouter();

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalPages: 1,
    });
    const limit = 10;
    
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);

                const { data: tokenData } = await authClient.token();
                const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/book/my-book?page=${page}&limit=${limit}`;

                const res = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${tokenData?.token}`,
                    },
                });

                const data = await res.json();
                // console.log(data);

                if (res.ok) {
                    setBooks(data.data);
                    setPagination(data.pagination);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchBooks();
    }, [page]);

    const openDeleteModal = (book) => {
        setSelectedBook(book);
        setDeleteModalOpen(true);
    };

    const deleteBook = async () => {
        if (!selectedBook) return;

        try {
            setDeleting(true);

            const { data: tokenData } = await authClient.token();

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/book/${selectedBook._id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${tokenData?.token}`,
                    },
                }
            );

            if (res.ok) {
                setBooks(
                    books.filter(
                        book => book._id !== selectedBook._id
                    )
                );

                setDeleteModalOpen(false);
                setSelectedBook(null);

                toast.success("Book has been deleted sucessfully!");
            }

        } catch(error) {
            console.log(error);
        } finally {
            setDeleting(false);
        }
    };

    const unpublishBook = async (id) => {
        try {
        const { data: tokenData } = await authClient.token();
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/book/unpublish/${id}`;

        const res = await fetch(url, {
            method: "PATCH",
            headers: {
            Authorization: `Bearer ${tokenData?.token}`,
            },
        });

        if (res.ok) {
            setBooks((prev) =>
            prev.map((book) =>
                book._id === id
                ? {
                    ...book,
                    approvalStatus: "Unpublished",
                    }
                : book,
            ),
            );
        }
        } catch (error) {
        console.log(error);
        }
    };

    const publishBook = async (id) => {
        try {
        const { data: tokenData } = await authClient.token();
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/book/publish/${id}`;

        const res = await fetch(url, {
            method: "PATCH",
            headers: {
            Authorization: `Bearer ${tokenData?.token}`,
            },
        });

        if (res.ok) {
            setBooks((prev) =>
            prev.map((book) =>
                book._id === id
                ? {
                    ...book,
                    approvalStatus: "Published",
                    }
                : book,
            ),
            );
        }
        } catch (error) {
        console.log(error);
        }
    };

    const statusColors = {
        Pending: "bg-yellow-100 text-yellow-700",
        Published: "bg-blue-100 text-blue-700",
        Unpublished: "bg-red-100 text-red-700",
    };

    return (
        <>
            <Card className="rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <Card.Title className="text-xl">
                        Books
                    </Card.Title>

                    <Link
                        className="h-10 px-5 
                        rounded-xl 
                        text-white
                        bg-[#ef0161]
                        hover:bg-[#5d1bb6]
                        transition-all
                        flex items-center gap-2"
                        href="/dashboard/librarian/books/add"
                    >
                        <Plus size={17}/>
                        Add Book
                    </Link>
                </div>

                <Table className="bg-[#ef0161]/10 rounded-xl">
                    <Table.ScrollContainer>
                        <Table.Content aria-label="Books table" className="min-w-150">
                            <Table.Header className="bg-[#ef0161]/1 text-xl">
                                <Table.Column isRowHeader>Title</Table.Column>
                                <Table.Column>Cover</Table.Column>
                                <Table.Column>Author</Table.Column>
                                <Table.Column>Category</Table.Column>
                                <Table.Column>Fee</Table.Column>
                                <Table.Column>Approval Status</Table.Column>
                                <Table.Column>Actions</Table.Column>
                            </Table.Header>

                            <Table.Body>
                                {loading ? (
                                    <Table.Row>
                                        <Table.Cell colSpan={7}>
                                            <Loading />
                                        </Table.Cell>
                                    </Table.Row>
                                ) : books.length === 0 ? (
                                    <Table.Row>
                                        <Table.Cell colSpan={7}>
                                            No books found.
                                        </Table.Cell>
                                    </Table.Row>
                                ) : (
                                    books.map((item) => (
                                        <Table.Row key={item._id}>
                                            <Table.Cell>
                                                <Link href={`/books/${item._id}`}>
                                                    {item.title}
                                                </Link>
                                            </Table.Cell>

                                            <Table.Cell>
                                                <Image
                                                    src={item.coverImage}
                                                    alt={item.title}
                                                    width={40}
                                                    height={56}
                                                    className="
                                                        h-14
                                                        w-10
                                                        rounded
                                                        object-cover
                                                    "
                                                />
                                            </Table.Cell>

                                            <Table.Cell>
                                                {item.author}
                                            </Table.Cell>

                                            <Table.Cell>
                                                {item.category?.name}
                                            </Table.Cell>

                                            <Table.Cell>
                                                ${item.deliveryFee}
                                            </Table.Cell>

                                            <Table.Cell>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        statusColors[item.approvalStatus] ||
                                                        "bg-gray-100 text-gray-700"
                                                    }`}
                                                >
                                                    {item.approvalStatus}
                                                </span>
                                            </Table.Cell>

                                            <Table.Cell>
                                                <div className="flex gap-2">
                                                    {item.approvalStatus === "Published" && (
                                                        <Button
                                                            size="sm"
                                                            className="
                                                                rounded-lg
                                                                text-white
                                                                bg-[#ef0161]
                                                                hover:bg-[#5d1bb6]
                                                            "
                                                            onPress={() => unpublishBook(item._id)}
                                                        >
                                                            <EyeOff size={15} />
                                                        </Button>
                                                        )}

                                                        {item.approvalStatus === "Unpublished" && (
                                                        <Button
                                                            size="sm"
                                                            className="
                                                                rounded-lg
                                                                text-white
                                                                bg-[#ef0161]
                                                                hover:bg-[#5d1bb6]
                                                            "
                                                            onPress={() => publishBook(item._id)}
                                                        >
                                                            <Eye size={15} />
                                                        </Button>
                                                        )}

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
                                                                `/dashboard/librarian/books/edit/${item._id}`
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

                <div className="flex justify-center mt-6">
                    <Pagination
                        page={page}
                        setPage={setPage}
                        pagination={pagination}
                    />
                </div>
            </Card>
        
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
                                    Delete Book
                                </Modal.Heading>
                            </Modal.Header>

                            <Modal.Body>
                                    Are you sure you want to delete{" "}
                                    <strong>
                                        {selectedBook?.title}
                                    </strong>
                                    ?
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
                                    onPress={deleteBook}
                                >
                                    Delete
                                </Button>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        </>
    );
};

export default BooksPage;