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

interface SignUpCardProps{
    setState: (state: SignInFlow) => void;
};

export const SignUpCard =({setState}:SignUpCardProps)=>{
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [newpassword,setnewPassword] = useState("");
    return(
        <Card className="w-full h-full p-8">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="" style={{ fontFamily: "Great Vibes" }}>
                    SignUp in to continue
                </CardTitle>
                <CardDescription className="" style={{ fontFamily: "Great Vibes" }}>
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
                    <Input
                      disabled={false}
                      value={newpassword}
                      onChange={(e)=>setnewPassword(e.target.value)}
                      placeholder="Confirm password"
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
                        Continue with Google
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
                    Already have an account? <span onClick={() => setState("signin")} className="text-sky-600 hover:underline cursor-pointer">Sign In</span>
                </p>
            </CardContent>
        </Card>
    );
};