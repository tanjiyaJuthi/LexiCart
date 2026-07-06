"use client";

import { Edit, EyeOff, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import Loading from "@/app/loading";
import NoData from "@/components/NoData";
import Rating from "@/components/Rating";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@heroui/react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

const BookDetailPage = () => {
  const router = useRouter();

  const { data: session } = useSession();
  const user = session?.user;

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState([]);
  const [ratings, setRatings] = useState([]);

  const [myComment, setMyComment] = useState(null);
  const [myRating, setMyRating] = useState(null);
  const hasReviewed = !!myComment && !!myRating;

  // coupon application
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(book?.deliveryFee || 0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/book/${id}`,
        );
        const data = await res.json();

        if (data.success) {
          setBook(data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const [commentsRes, ratingsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/comment/book/${id}`),
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/rating/book/${id}`),
        ]);

        const commentsData = await commentsRes.json();
        const ratingsData = await ratingsRes.json();

        if (commentsData.success) {
          setComments(commentsData.data);
        }

        if (ratingsData.success) {
          setRatings(ratingsData.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchBook();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (user?.role === "reader") {
      const fetchMyReview = async () => {
        const { data: tokenData } = await authClient.token();

        const [commentRes, ratingRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/comment/book/${id}/me`, {
            headers: {
              Authorization: `Bearer ${tokenData.token}`,
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/rating/book/${id}/me`, {
            headers: {
              Authorization: `Bearer ${tokenData.token}`,
            },
          }),
        ]);

        const comment = await commentRes.json();
        const rating = await ratingRes.json();

        setMyComment(comment.data);
        setMyRating(rating.data);
      };

      fetchMyReview();
    }
  }, [id, user]);

  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    if (!user || !book?._id) return;
    const checkPermission = async () => {
      try {
        const { data: tokenData } = await authClient.token();

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/review/permission/${book._id}`,
          {
            headers: {
              Authorization: `Bearer ${tokenData.token}`,
            },
          },
        );

        const data = await res.json();
        setCanReview(data.canReview);
      } catch (err) {
        console.error(err);
      }
    };

    checkPermission();
  }, [user, book]);

  // coupon
  useEffect(() => {
    if (book) {
      setFinalAmount(book.deliveryFee);
    }
  }, [book]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Enter coupon code");

    try {
      setCouponLoading(true);

      const { data: tokenData } = await authClient.token();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/coupon/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type":"application/json",
            Authorization:`Bearer ${tokenData.token}`,
          },
          body: JSON.stringify({
            code: couponCode,
            subtotal: book.deliveryFee,
          }),
          }
        );

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setDiscount(data.data.discount);
      setFinalAmount(data.data.total);
      setCouponApplied(true);

      toast.success("Coupon applied");
    } catch (err) {
      setDiscount(0);
      setFinalAmount(book.deliveryFee);
      setCouponApplied(false);

      toast.error(err.message);
    } finally {
      setCouponLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (!book)
    return (
      <div className="max-w-7xl mx-auto my-20">
        <NoData />
      </div>
    );

  const isOwner =
    !!user &&
    !!book?.librarianId?._id &&
    String(user.id) === String(book.librarianId._id);

  const isUnavailable = !book?.isAvailable;

  const handleTransaction = async () => {
    if (isUnavailable) return;

    if (!user) {
      router.push(`/signin?redirect=/books/${book._id}`);
      return;
    }

    try {
      const { data: tokenData } = await authClient.token();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/transaction/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenData.token}`,
          },

          body: JSON.stringify({
            bookId: book._id,
            couponCode: couponApplied
              ? couponCode
              : undefined,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        window.location.href = data.url;

        toast.success('Book has sent for delivery!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="w-full min-h-screen font-sans antialiased">
      {/* --- Top Layout: Split Banner and Details --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-[50vh]">
        {/* Left Side: Deep Blue Styled Cover Slider Panel */}
        <div className="bg-[#ef0161] relative flex flex-col justify-center items-center py-12 px-6 overflow-hidden">
          {/* Faux Decorative Book Array Center Deck */}
          <div className="flex items-center justify-center gap-4 w-full max-w-lg opacity-90">
            {/* Left Blurred Out-of-Focus Cards */}
            <div className="hidden sm:block w-20 h-32 opacity-30 transform -rotate-6 filter blur-[1px] relative">
              <Image
                src={book.coverImage}
                alt=""
                fill
                className="object-cover rounded-sm shadow-md"
              />
            </div>
            <div className="hidden sm:block w-28 h-44 opacity-50 transform -rotate-3 filter blur-[0.5px] relative">
              <Image
                src={book.coverImage}
                alt=""
                fill
                className="object-cover rounded-sm shadow-md"
              />
            </div>

            {/* Active Highlighted Main Book Cover */}
            <div className="relative w-48 h-72 md:w-56 md:h-84 shadow-2xl rounded-md overflow-hidden transform scale-105 border-2 border-white/20 transition-transform duration-300">
              <Image
                src={book.coverImage}
                alt={book.title}
                fill
                priority
                className="object-cover"
              />
            </div>

            {/* Right Blurred Out-of-Focus Cards */}
            <div className="hidden sm:block w-28 h-44 opacity-50 transform rotate-3 filter blur-[0.5px] relative">
              <Image
                src={book.coverImage}
                alt=""
                fill
                className="object-cover rounded-sm shadow-md"
              />
            </div>
            <div className="hidden sm:block w-20 h-32 opacity-30 transform rotate-6 filter blur-[1px] relative">
              <Image
                src={book.coverImage}
                alt=""
                fill
                className="object-cover rounded-xl shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Clean Book Spec Info Grid Layout */}
        <div className="bg-[#ef0161]/2 py-12 px-5 lg:px-16 flex flex-col justify-center max-w-3xl">
          {/* Main Title Headers */}
          <div>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-wide">
              {book.title}
            </h1>
            
            <div className="flex items-center gap-1 mt-4">
              <div className="w-3 h-3 bg-[#ef0161] rotate-45" />
              <div className="w-3 h-3 bg-[#ef0161] rotate-45 -ml-1.5" />
              <div className="h-0.5 bg-[#ef0161] w-48 ml-1" />
            </div>
          </div>

          <div className="mt-10 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 tracking-wide uppercase">
                  <div className="w-2.5 h-2.5 bg-[#ef0161] rotate-45" /> Author
                </div>

                <div className="mt-3 flex items-center gap-3 pl-4">
                  <div className="relative w-12 h-12 rounded-lg border-2 border-[#ef0161] overflow-hidden bg-gray-200">
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 font-bold text-xs">
                      {book.author?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">
                      {book.author}
                    </h4>
                    <p className="text-xs text-gray-400 font-medium">
                      Librarian: {book.librarianId?.name || "Staff"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 tracking-wide uppercase">
                <div className="w-2.5 h-2.5 bg-[#ef0161] rotate-45" />{" "}
                Description
              </div>
              <p className="mt-2 text-sm md:text-base leading-7 text-gray-500 font-light pl-4 align-justify">
                {book.description ||
                  "No summary overview details provided for this volume entry context."}
              </p>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 tracking-wide uppercase">
                <div className="w-2.5 h-2.5 bg-[#ef0161] rotate-45" /> Rating
              </div>
              <div className="mt-2.5 flex items-center gap-1 text-gray-300 pl-4">
                <Rating ratings={ratings} />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Coupon code"
                className="border rounded-lg px-3 py-2 flex-1"
              />

              <Button
                  onClick={handleApplyCoupon}
                  isLoading={couponLoading}
              >
                  Apply
              </Button>
            </div>

            <div className="pt-4 flex flex-wrap gap-4 items-center">
              {!isOwner && (
                <Button
                  onClick={handleTransaction}
                  disabled={isUnavailable}
                  className={`h-9.5 rounded-xl px-8 text-sm font-semibold text-white transition shadow-sm ${
                    isUnavailable
                      ? "cursor-not-allowed bg-[#ef0161]/50"
                      : "bg-[#ef0161] hover:bg-[#d90158]"
                  }`}
                >
                  {isUnavailable
                    ? "Unavailable"
                    : `Request Delivery (৳${book.deliveryFee})`}
                </Button>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>${book.deliveryFee}</span>
              </div>

              {couponApplied && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-৳{discount}</span>
                  </div>

                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>৳{finalAmount}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isOwner && user?.role === "reader" && canReview && !hasReviewed && (
        <ReviewForm
          bookId={book._id}
          comment={myComment}
          rating={myRating}
          onSuccess={() => {
            fetchReviews();
            fetchMyReview();
          }}
        />
      )}

      <div className={user?.role === "reader" ? "mt-20" : ""}>
        <ReviewList comments={comments} ratings={ratings} />
      </div>
    </section>
  );
};

export default BookDetailPage;
