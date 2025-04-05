import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfileForm = () => {
  const { createProfile } = useAuth();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await createProfile(username);
    } catch (error) {
      console.error("Error creating profile:", error);
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
          <div className="mb-6">
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
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Profile..." : "Finish Setup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
