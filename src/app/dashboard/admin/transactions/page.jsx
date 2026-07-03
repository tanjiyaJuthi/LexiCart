"use client"
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { Card, Table } from "@heroui/react";
import Pagination from "@/components/Pagination";

const TransactionsPage = () => {
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalPages: 1,
    });
    const limit = 10;

    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const { data: tokenData } = await authClient.token();
                const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/transaction/admin?page=${page}&limit=${limit}`;

                const res = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${tokenData?.token}`,
                    },
                });

                const data = await res.json();

                if (data.success) {
                    setTransactions(data.transactions);
                    setPagination(data.pagination);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchTransactions();
    }, [page]);
 
    const statusColors = {
        Paid: "bg-green-100 text-green-700",
        Pending: "bg-yellow-100 text-yellow-700",
        Failed: "bg-red-100 text-red-700",
    };

    return (
        <Card className="rounded-xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <Card.Title className="text-xl">
                Transactions
                </Card.Title>

                <div className="text-sm text-gray-500">
                Total: {transactions.length}
                </div>

                <div className="text-sm text-gray-500">
                Paid: {
                    transactions.filter(
                    (t) => t.paymentStatus === "Paid"
                    ).length
                }
                </div>

                <div className="text-sm text-gray-500">
                Pending: {
                    transactions.filter(
                    (t) => t.paymentStatus === "Pending"
                    ).length
                }
                </div>
            </div>

            <Table className="bg-[#ef0161]/10 rounded-xl">
                <Table.ScrollContainer>
                <Table.Content
                    aria-label="Transactions"
                    className="min-w-[1200px]"
                >
                    <Table.Header>
                    <Table.Column isRowHeader>
                        Transaction ID
                    </Table.Column>

                    <Table.Column>User</Table.Column>

                    <Table.Column>Librarian</Table.Column>

                    <Table.Column>Amount</Table.Column>

                    <Table.Column>Status</Table.Column>

                    <Table.Column>Date</Table.Column>
                    </Table.Header>

                    <Table.Body>
                    {transactions.length === 0 ? (
                        <Table.Row>
                        <Table.Cell colSpan={6}>
                            No transactions found
                        </Table.Cell>
                        </Table.Row>
                    ) : (
                        transactions.map((t) => (
                        <Table.Row key={t._id}>
                            <Table.Cell className="max-w-[180px] truncate">
                            {t.stripeSessionId}
                            </Table.Cell>

                            <Table.Cell>
                            {t.userId?.email}
                            </Table.Cell>

                            <Table.Cell>
                            {t.bookId?.librarianId?.email}
                            </Table.Cell>

                            <Table.Cell>
                            ${t.amount}
                            </Table.Cell>

                            <Table.Cell>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                statusColors[t.paymentStatus] ||
                                "bg-gray-100 text-gray-700"
                                }`}
                            >
                                {t.paymentStatus}
                            </span>
                            </Table.Cell>

                            <Table.Cell>
                            {new Date(
                                t.createdAt
                            ).toLocaleDateString()}
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
    );
};

export default TransactionsPage;