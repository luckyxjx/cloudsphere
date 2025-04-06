import { Button } from "@/components/ui/button";
import { Card, 
        CardContent,
        CardDescription,
        CardHeader,
         CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { SignInFlow } from "../types";
import { useState } from "react";
import axios from "axios";

interface SignInCardProps{
    setState: (state: SignInFlow) => void;
};

export const SignInCard =({setState}:SignInCardProps)=>{
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          const response = await axios.post("/api/user", {
            email,
            password,
          });
    
          console.log("Logged in user:", response.data);
        
        } catch (err) {
          console.error("Login error:", err);
        }
    }
    return(
        <Card className="w-full h-full p-8">
            <CardHeader className="px-0 pt-0">
                <CardTitle>
                    log in to continue
                </CardTitle>
                <CardDescription>
                    use email to continue
                </CardDescription>
            </CardHeader>
           
            <CardContent className="space-y-5 px-0 pb-0">
                <form className="space-y-2.5 ">
                    <Input
                      disabled={false}
                      value={email}
                      onChange={(e)=>setEmail(e.target.value)}
                      placeholder="email"
                      type="email"
                      required
                    />   
                    <Input
                      disabled={false}
                      value={password}
                      onChange={(e)=>setPassword(e.target.value)}
                      placeholder="password"
                      type="password"
                      required
                    />
                         
                    <Button type="submit" className="w-full" size="lg" disabled={false}> 
                     continue
                    </Button>               
                </form>
                <Separator/>
                <div className="flex flex-col gap-y-2.5">
                    <Button disabled={false} 
                        onClick={()=>{}} 
                        variant="outline" 
                        size="lg" 
                        className="w-full relative">
                        <FcGoogle className="size-5"/>
                        Continue with google
                    </Button>
                    <Button disabled={false} 
                        onClick={()=>{}} 
                        variant="outline" 
                        size="lg" 
                        className="w-full relative">
                        <FaGithub className="size-5"/>
                        Continue with Github
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                    Don't have an account? <span onClick={() => setState("signup")} className="text-sky-600 hover:underline cursor-pointer">Signup</span>
                </p>
            </CardContent>
        </Card>
    );
};