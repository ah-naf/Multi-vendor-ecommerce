"use client";

import Link from "next/link";
import { useState, useEffect } from "react"; // Added useState, useEffect
import { useRouter } from "next/navigation"; // Added useRouter
import { useAuth } from "../../context/AuthContext"; // Added useAuth
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { login, isLoading, error, user } = useAuth(); // Use AuthContext
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login({ email, password });
      // Redirect logic is now handled by useEffect
    } catch (err) {
      // Error is already set in AuthContext, can add specific logging here if needed
      console.error("Login attempt failed:", err);
    }
  };

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your email and password.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          {" "}
          {/* Form starts here */}
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col mt-4 gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-sm text-center text-gray-500">
              Don’t have an account?{" "}
              <Link href="/register" className="text-red-500 hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </form>{" "}
        {/* Form ends here, encompassing Content and Footer */}
      </Card>
    </div>
  );
}
