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
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";
import Loading from "@/app/loading";

const CouponsPage = () => {
    const router = useRouter();

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalPages: 1,
    });
    const limit = 10;
    
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [deleting, setDeleting] = useState(false);
    
    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                setLoading(true);

                const { data: tokenData } = await authClient.token();

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/api/coupon/dashboard`,
                    {
                        headers: {
                            Authorization: `Bearer ${tokenData?.token}`,
                        },
                    }
                );

                const data = await res.json();

                if (res.ok) {
                    setCoupons(data.data);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchCoupons();
    }, []);

    const deleteCoupon = async () => {
        if (!selectedCoupon) return;

        try {
            setDeleting(true);

            const { data: tokenData } = await authClient.token();

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/coupon/${selectedCoupon._id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${tokenData?.token}`,
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message);
            }

            setCoupons((prev) =>
                prev.filter(
                    (coupon) => coupon._id !== selectedCoupon._id
                )
            );

            setDeleteModalOpen(false);
            setSelectedCoupon(null);

            toast.success("Coupon deleted successfully!");
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setDeleting(false);
        }
    };

    const openDeleteModal = (coupon) => {
        setSelectedCoupon(coupon);
        setDeleteModalOpen(true);
    };

    return (
        <>
            <Card className="rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <Card.Title className="text-xl">
                        Coupons
                    </Card.Title>

                    <Link
                        className="h-10 px-5 
                        rounded-xl 
                        text-white
                        bg-[#ef0161]
                        hover:bg-[#5d1bb6]
                        transition-all
                        flex items-center gap-2"
                        href="/dashboard/librarian/coupons/add"
                    >
                        <Plus size={17}/>
                        Add Coupon
                    </Link>
                </div>

                <Table className="bg-[#ef0161]/10 rounded-xl">
                    <Table.ScrollContainer>
                        <Table.Content aria-label="Books table" className="min-w-150">
                            <Table.Header className="bg-[#ef0161]/1 text-xl">
                                <Table.Column isRowHeader >Code</Table.Column>
                                <Table.Column>Type</Table.Column>
                                <Table.Column>Discount</Table.Column>
                                <Table.Column>Min Purchase</Table.Column>
                                <Table.Column>Expires</Table.Column>
                                <Table.Column>Used</Table.Column>
                                <Table.Column>Status</Table.Column>
                                <Table.Column>Actions</Table.Column>
                            </Table.Header>

                            <Table.Body>
                                {coupons.map((coupon) => (
                                    <Table.Row key={coupon._id}>

                                        <Table.Cell>
                                            {coupon.code}
                                        </Table.Cell>

                                        <Table.Cell>
                                            {coupon.discountType}
                                        </Table.Cell>

                                        <Table.Cell>
                                            {coupon.discountType === "percentage"
                                                ? `${coupon.discountValue}%`
                                                : `$${coupon.discountValue}`
                                            }
                                        </Table.Cell>

                                        <Table.Cell>
                                            ${coupon.minPurchase}
                                        </Table.Cell>

                                        <Table.Cell>
                                            {coupon.expiresAt
                                                ? new Date(coupon.expiresAt).toLocaleDateString()
                                                : "-"}
                                        </Table.Cell>

                                        <Table.Cell>
                                            {coupon.usedCount}
                                            {coupon.usageLimit
                                                ? ` / ${coupon.usageLimit}`
                                                : ""}
                                        </Table.Cell>

                                        <Table.Cell>
                                            {coupon.isActive ? (
                                                <span className="text-green-600">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="text-red-500">
                                                    Inactive
                                                </span>
                                            )}
                                        </Table.Cell>

                                        <Table.Cell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="rounded-lg
                                                        text-white
                                                        bg-[#ef0161]
                                                        hover:bg-[#5d1bb6]
                                                        transition-all"
                                                    onPress={() =>
                                                        router.push(
                                                            `/dashboard/librarian/coupons/edit/${coupon._id}`
                                                        )
                                                    }
                                                >
                                                    <Pencil size={16} />
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    className="rounded-lg
                                                        text-white
                                                        bg-[#ef0161]
                                                        hover:bg-[#5d1bb6]
                                                        transition-all"
                                                    onPress={() =>
                                                        openDeleteModal(coupon)
                                                    }
                                                >
                                                    <Trash2 size={16}/>
                                                </Button>
                                            </div>
                                        </Table.Cell>

                                    </Table.Row>
                                ))}
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
                                    Delete Coupon
                                </Modal.Heading>
                            </Modal.Header>

                            <Modal.Body>
                                    Are you sure you want to delete{" "}
                                    <strong>
                                        {selectedCoupon?.code}
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
                                    onPress={deleteCoupon}
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

export default CouponsPage;