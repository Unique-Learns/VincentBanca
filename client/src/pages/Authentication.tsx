import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PhoneForm from "@/components/auth/PhoneForm";
import VerificationForm from "@/components/auth/VerificationForm";
import ProfileForm from "@/components/auth/ProfileForm";

const Authentication = () => {
  const { verificationStep } = useAuth();

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-primary text-white mb-4">
            <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Welcome to BancaMessenger</h1>
          <p className="text-muted-foreground mt-2">Connect with friends and family securely</p>
        </div>

        {/* Auth Forms */}
        {verificationStep === "phone" && <PhoneForm />}
        {verificationStep === "verify" && <VerificationForm />}
        {verificationStep === "profile" && <ProfileForm />}
      </div>
    </div>
  );
};

export default Authentication;
