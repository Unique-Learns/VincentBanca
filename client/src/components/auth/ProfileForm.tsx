import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const ProfileForm = () => {
  const { createProfile } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim()) {
      setError("Please enter your name");
      return;
    }
    
    if (!password) {
      setError("Please enter a password");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await createProfile(username, password);
    } catch (error) {
      console.error("Error creating profile:", error);
      setError(error instanceof Error ? error.message : "Failed to create profile");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // This is a mock function since we're not handling actual file uploads in the MVP
  const handleAvatarClick = () => {
    alert("In a real app, this would open a file picker to select a profile photo");
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Set up your profile</h2>
        
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatar || ""} alt="Profile avatar" />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {username ? getInitials(username) : "😊"}
              </AvatarFallback>
            </Avatar>
            <Button 
              size="icon" 
              className="absolute bottom-0 right-0 bg-secondary text-secondary-foreground rounded-full w-8 h-8 shadow-md"
              onClick={handleAvatarClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="username" className="text-muted-foreground text-sm">
              Your name
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full"
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="password" className="text-muted-foreground text-sm">
              Create a password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={toggleShowPassword}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              At least 8 characters
            </p>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="confirm-password" className="text-muted-foreground text-sm">
              Confirm password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full"
            />
          </div>
          
          {error && (
            <div className="mb-4 text-sm text-destructive">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Profile..." : "Finish Setup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
