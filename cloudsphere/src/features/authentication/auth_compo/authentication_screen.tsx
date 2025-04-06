"use client";

import { useState } from "react";


import { SignInFlow } from "../types";
import { SignUpCard } from "./sign_uppage";
import { SignInCard } from "./sign_inpage";

export const AuthScreen =()=> {
    const [state, setState]= useState<SignInFlow>("signin") 
    return(
       <div className="h-full flex items-center justify-center bg-blue-200">
            <div className="md:h-auto  md:w-[420px]">
                {state === "signin" ? <SignInCard setState={setState}/> : <SignUpCard setState={setState}/>}
            </div>
        </div>
    );
};