"use client";

import { useEffect, useState } from "react";

import {
  Card,
  Avatar,
  Chip
} from "@heroui/react";

import {
  Mail,
  Shield,
  User,
  BadgeCheck,
  Calendar,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import Loading from "@/app/loading";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: tokenData } = await authClient.token();

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/profile/my-profile`,
          {
            headers: {
              Authorization: `Bearer ${tokenData?.token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || "Failed to fetch profile"
          );
        }

        setProfile(data.data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="py-20 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
        {/* Cover */}
        <div className="relative h-52 rounded-xl bg-[#ef0161]">
          <div className="absolute -bottom-16 left-10">
            <Avatar
              src={profile?.image || "/images/fallback.jpg"}
              className="h-36 w-36 border-4 border-white"
            />
          </div>
        </div>

        {/* Main Card */}
        <Card className="mt-20 rounded-xl border">
          <div className="p-8">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              <div>
                <h1 className="text-4xl font-bold">
                  {profile?.name}
                </h1>

                <p className="mt-2 flex items-center gap-2 text-default-500">
                  <Mail size={17} />
                  {profile?.email}
                </p>

                <div className="mt-5 flex gap-3">
                  <Chip
                    color={
                      profile?.role === "admin"
                        ? "danger"
                        : "primary"
                    }
                    variant="shadow"
                    className="capitalize"
                  >
                    {profile?.role}
                  </Chip>

                  <Chip
                    color="success"
                    variant="flat"
                    startContent={<BadgeCheck size={15} />}
                  >
                    Verified
                  </Chip>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">

                <Card className="w-36 p-5 text-center shadow-sm">
                  <p className="text-3xl font-bold text-primary">
                    ✓
                  </p>

                  <p className="text-sm text-default-500">
                    Status
                  </p>

                  <p className="font-semibold">
                    Active
                  </p>
                </Card>

                <Card className="w-36 p-5 text-center shadow-sm">
                  <Shield
                    className="mx-auto mb-2 text-success"
                    size={30}
                  />

                  <p className="text-sm text-default-500">
                    Access
                  </p>

                  <p className="font-semibold capitalize">
                    {profile?.role}
                  </p>
                </Card>

              </div>

            </div>

            <div className="my-8" />

            <div className="grid gap-6 lg:grid-cols-2">

              {/* Personal Info */}
              <Card className="border shadow-none">
                <div className="space-y-6">

                  <h2 className="text-xl font-semibold">
                    Personal Information
                  </h2>

                  <div className="flex items-center gap-4">
                    <User
                      className="text-primary"
                      size={22}
                    />

                    <div>
                      <p className="text-sm text-default-500">
                        Full Name
                      </p>

                      <p className="font-semibold">
                        {profile?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Mail
                      className="text-primary"
                      size={22}
                    />

                    <div>
                      <p className="text-sm text-default-500">
                        Email
                      </p>

                      <p className="font-semibold">
                        {profile?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Shield
                      className="text-primary"
                      size={22}
                    />

                    <div>
                      <p className="text-sm text-default-500">
                        Role
                      </p>

                      <p className="font-semibold capitalize">
                        {profile?.role}
                      </p>
                    </div>
                  </div>

                </div>
              </Card>

              {/* Account */}
              <Card className="border shadow-none">
                <div className="space-y-6">

                  <h2 className="text-xl font-semibold">
                    Account Details
                  </h2>

                  <div className="flex items-center justify-between rounded-xl bg-default-100 p-4">
                    <div>
                      <p className="text-sm text-default-500">
                        Authentication
                      </p>

                      <p className="font-semibold">
                        Active
                      </p>
                    </div>

                    <Chip color="success">
                      Secure
                    </Chip>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-default-100 p-4">
                    <div>
                      <p className="text-sm text-default-500">
                        Access Level
                      </p>

                      <p className="font-semibold capitalize">
                        {profile?.role}
                      </p>
                    </div>

                    <Shield
                      className="text-primary"
                      size={24}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-default-100 p-4">
                    <div>
                      <p className="text-sm text-default-500">
                        Member Since
                      </p>

                      <p className="font-semibold">
                        Jan 2025
                      </p>
                    </div>

                    <Calendar
                      className="text-primary"
                      size={24}
                    />
                  </div>

                </div>
              </Card>

            </div>

          </div>
        </Card>
    </div>
  );
};

export default ProfilePage;