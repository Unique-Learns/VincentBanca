import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const countryCodes = [
  { code: "+1", country: "United States" },
  { code: "+44", country: "United Kingdom" },
  { code: "+91", country: "India" },
  { code: "+234", country: "Nigeria" },
  { code: "+86", country: "China" },
  { code: "+55", country: "Brazil" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+81", country: "Japan" },
  { code: "+61", country: "Australia" },
];

const PhoneForm = () => {
  const { setPhoneNumber, setVerificationStep, requestVerificationCode } = useAuth();
  const [selectedCode, setSelectedCode] = useState("+1");
  const [localPhone, setLocalPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!localPhone) {
      return;
    }
    
    const fullPhoneNumber = `${selectedCode}${localPhone}`;
    setIsLoading(true);
    
    try {
      await requestVerificationCode(fullPhoneNumber);
      setPhoneNumber(fullPhoneNumber);
      setVerificationStep("verify");
    } catch (error) {
      console.error("Error requesting code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold mb-4">Enter your phone number</h2>
          
          <div className="mb-4">
            <Label htmlFor="country-code" className="text-muted-foreground text-sm">
              Country
            </Label>
            <Select defaultValue={selectedCode} onValueChange={setSelectedCode}>
              <SelectTrigger id="country-code" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countryCodes.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.country} ({country.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="phone-number" className="text-muted-foreground text-sm">
              Phone number
            </Label>
            <div className="flex">
              <div className="bg-muted border border-input rounded-l px-3 py-2 text-muted-foreground flex items-center">
                <span>{selectedCode}</span>
              </div>
              <Input
                id="phone-number"
                type="tel"
                value={localPhone}
                onChange={(e) => setLocalPhone(e.target.value)}
                className="flex-1 rounded-l-none"
                placeholder="Your phone number"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              We'll send you a verification code via SMS
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

export default PhoneForm;
