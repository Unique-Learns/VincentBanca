import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const VerificationForm = () => {
  const { phoneNumber, verifyCode, setVerificationStep, requestVerificationCode } = useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (value && /^[0-9]$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Move focus to the next input
      if (index < 5 && value) {
        inputRefs[index + 1].current?.focus();
      }
    } else if (value === "") {
      const newCode = [...code];
      newCode[index] = "";
      setCode(newCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      // Move focus to the previous input when backspace is pressed on an empty input
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join("");
    
    if (verificationCode.length !== 6) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await verifyCode(phoneNumber, verificationCode);
      
      if (result.success) {
        if (result.isNewUser) {
          setVerificationStep("profile");
        }
        // If not a new user, the auth context will automatically log them in
      }
    } catch (error) {
      console.error("Error verifying code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await requestVerificationCode(phoneNumber);
    } catch (error) {
      console.error("Error resending code:", error);
    } finally {
      setIsResending(false);
    }
  };

  // Focus first input on mount
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    const countryCode = phone.substring(0, phone.length - 10);
    const number = phone.substring(phone.length - 10);
    return `${countryCode} ${number}`;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Enter verification code</h2>
        <p className="text-muted-foreground text-sm mb-4">
          We've sent a 6-digit code to <span className="font-medium">{formatPhoneNumber(phoneNumber)}</span>
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6 flex justify-between">
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl"
                maxLength={1}
              />
            ))}
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?{" "}
            <Button 
              variant="link" 
              className="p-0 text-primary font-medium" 
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? "Resending..." : "Resend"}
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationForm;
