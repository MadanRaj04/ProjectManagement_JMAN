"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@/src/components/animate-ui/components/radix/tabs";
import { Button } from '@/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';


import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"


function Login() {
    // Login form state
    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });

    // Register form state
    const [registerData, setRegisterData] = useState({
        username: "",
        email: "",
        password: "",
        role: "user"
    });

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleLoginChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.id]: e.target.value
        });
        setError("");
    };

    const handleRegisterChange = (e) => {
        setRegisterData({
            ...registerData,
            [e.target.id]: e.target.value
        });
        setError("");
    };

    const handleRoleChange = (value) => {
        setRegisterData({
            ...registerData,
            role: value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            setSuccess("Login successful!");
            console.log("Logged in user:", data.user);
            // TODO: Store user session/token and redirect
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const endpoint = registerData.role === "manager" 
                ? "/api/auth/register-manager" 
                : "/api/auth/register-user";

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: registerData.email,
                    username: registerData.username,
                    password: registerData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            setSuccess("Registration successful! You can now login.");
            setRegisterData({
                username: "",
                email: "",
                password: "",
                role: "user"
            });
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="flex w-full max-w-sm flex-col gap-6 ">
      <Tabs defaultValue="login">
        <TabsList>
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <Card className="shadow-none py-0">
          <TabsContents className="py-6">
            <TabsContent value="login" className="flex flex-col gap-6 text-white">
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription className="text-white">
                  Login to your account here. Click login when you&apos;re done.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="grid gap-6 text-white">
                  {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="p-3 text-sm text-green-500 bg-green-100 rounded-md">
                      {success}
                    </div>
                  )}
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={loginData.email} 
                      onChange={handleLoginChange}
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            <TabsContent value="register" className="flex flex-col gap-6 text-white">
              <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription className="text-white">
                  Register for a new account here. After registering, you can log in.
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleRegister}>
                <CardContent className="grid gap-6">
                  {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="p-3 text-sm text-green-500 bg-green-100 rounded-md">
                      {success}
                    </div>
                  )}
                  <div className="grid gap-3">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      value={registerData.username}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>

                  <Select onValueChange={handleRoleChange} value={registerData.role}>
                    <SelectTrigger className="w-full max-w-48">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                  </Button>
                </CardFooter>
              </form>


            </TabsContent>
          </TabsContents>
        </Card>
      </Tabs>
    </div>


    );
}

export default Login;