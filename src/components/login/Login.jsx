"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@/components/animate-ui/components/radix/tabs";
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const handleSocialSignup = (provider) => {
        console.log(`Social login with ${provider}`);
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
                  Login to your account here. Click login when you&apos;re
                  done.
                  done.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 text-white">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue="" />
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" defaultValue="" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Login</Button>
              </CardFooter>
            </TabsContent>
            <TabsContent value="register" className="flex flex-col gap-6 text-white">


              <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription className="text-white">
                  Register for a new account here. After registering, you can log in.

                </CardDescription>
              </CardHeader>
              
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue="" />
                </div>
                  <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue="" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" defaultValue="" />
                </div>

                    <Select>
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
                <Button>Register</Button>
              </CardFooter>


            </TabsContent>
          </TabsContents>
        </Card>
      </Tabs>
    </div>


    );
}

export default Login;