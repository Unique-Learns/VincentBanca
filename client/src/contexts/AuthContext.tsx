import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  verificationStep: "phone" | "verify" | "profile";
  phoneNumber: string;
  verificationCode: string;
  login: (user: User) => void;
  logout: () => void;
  setPhoneNumber: (phone: string) => void;
  setVerificationCode: (code: string) => void;
  setVerificationStep: (step: "phone" | "verify" | "profile") => void;
  requestVerificationCode: (phoneNumber: string) => Promise<string>;
  verifyCode: (phoneNumber: string, code: string) => Promise<{success: boolean, isNewUser: boolean, user?: User}>;
  createProfile: (username: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [verificationStep, setVerificationStep] = useState<"phone" | "verify" | "profile">("phone");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have a stored session
    const storedUser = localStorage.getItem("banca_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("banca_user");
      }
    }
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem("banca_user", JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("banca_user");
  };

  const requestVerificationCode = async (phoneNumber: string): Promise<string> => {
    try {
      const response = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to request verification code");
      }

      toast({
        title: "Verification code sent",
        description: "Please check your phone for the code",
      });

      return data.code; // In a real app, this would be sent via SMS
    } catch (error) {
      console.error("Error requesting verification code:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to request verification code",
      });
      throw error;
    }
  };

  const verifyCode = async (phoneNumber: string, code: string) => {
    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify code");
      }

      toast({
        title: "Verification successful",
      });

      if (!data.isNewUser) {
        login(data.user);
      }

      return {
        success: true,
        isNewUser: data.isNewUser,
        user: data.user,
      };
    } catch (error) {
      console.error("Error verifying code:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify code",
      });
      throw error;
    }
  };

  const createProfile = async (username: string): Promise<User> => {
    try {
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create profile");
      }

      toast({
        title: "Welcome to BancaMessenger!",
        description: "Your profile has been created successfully",
      });

      login(data.user);
      return data.user;
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create profile",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        verificationStep,
        phoneNumber,
        verificationCode,
        login,
        logout,
        setPhoneNumber,
        setVerificationCode,
        setVerificationStep,
        requestVerificationCode,
        verifyCode,
        createProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
