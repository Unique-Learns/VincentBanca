import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";

const EmailForm = () => {
  const { setEmail, setVerificationStep, requestVerificationCode } = useAuth();
  const [localEmail, setLocalEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!localEmail) {
      setError("Please enter your email address");
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(localEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await requestVerificationCode(localEmail);
      setEmail(localEmail);
      setVerificationStep("verify");
    } catch (error) {
      console.error("Error requesting code:", error);
      setError("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold mb-4">Enter your email address</h2>
          
          <div className="mb-6">
            <Label htmlFor="email" className="text-muted-foreground text-sm">
              Email Address
            </Label>
            <div className="flex relative">
              <div className="absolute left-3 top-[50%] transform -translate-y-[50%] text-muted-foreground">
                <Mail size={18} />
              </div>
              <Input
                id="email"
                type="email"
                value={localEmail}
                onChange={(e) => setLocalEmail(e.target.value)}
                className="pl-10"
                placeholder="Your email address"
              />
            </div>
            
            {error && (
              <p className="text-sm text-destructive mt-2">
                {error}
              </p>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              We'll send you a verification code via email
            </p>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Next"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmailForm;