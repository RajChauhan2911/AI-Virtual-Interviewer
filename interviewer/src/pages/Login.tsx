import { useEffect, useRef, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const confirmationRef = useRef<import("firebase/auth").ConfirmationResult | null>(null);

  useEffect(() => {
    document.title = "Login | AI Interviewer";
  }, []);

  async function ensureUserDoc(uid: string, email?: string | null, name?: string | null) {
    try {
      // Check if Firestore is initialized
      if (!db) {
        throw new Error("Firestore not initialized. Check your .env file and restart the dev server.");
      }

      const userData = {
        email: email ?? null,
        name: name ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      console.log("Creating user doc with:", { uid, userData, dbReady: !!db });
      await setDoc(doc(db, "users", uid), userData, { merge: true });
      console.log("✅ User doc created/updated successfully:", uid);
    } catch (e: any) {
      console.error("❌ Failed to save user doc:", e);
      setError(`Failed to create user profile: ${e?.message ?? "Unknown error"}`);
    }
  }

  const registerEmail = async () => {
    if (loading) return;
    
    setError(null);
    setLoading(true);
    
    // Validate inputs
    if (!email || !password) {
      const msg = "Please enter both email and password";
      setError(msg);
      toast({
        description: "❌ Please enter both email and password",
        duration: 1000,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      const msg = "Password must be at least 6 characters long";
      setError(msg);
      toast({
        description: "❌ Password must be at least 6 characters",
        duration: 2000,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await ensureUserDoc(res.user.uid, res.user.email, res.user.displayName);
      toast({
        description: "✅ Account created successfully! Welcome!",
        duration: 2000,
        variant: "success",
      });
      // Navigate to dashboard after successful signup
      window.location.href = "/";
    } catch (e: any) {
      let description = "❌ Sign up failed. Please try again";
      
      // Firebase Auth Error Codes for Sign Up
      switch (e?.code) {
        case "auth/email-already-in-use":
          description = "❌ This email is already registered. Please use Login instead";
          break;
        case "auth/invalid-email":
          description = "❌ Invalid email format. Please enter a valid email (like user@example.com)";
          break;
        case "auth/weak-password":
          description = "❌ Password is too weak. Please use at least 6 characters with letters and numbers";
          break;
        case "auth/operation-not-allowed":
          description = "❌ Email/password sign-up is disabled. Please contact support";
          break;
        case "auth/network-request-failed":
          description = "❌ Network error. Please check your internet connection and try again";
          break;
        case "auth/too-many-requests":
          description = "❌ Too many sign-up attempts. Please wait 5 minutes and try again";
          break;
        case "auth/invalid-phone-number":
          description = "❌ Invalid phone number format. Please check your phone number";
          break;
        case "auth/missing-phone-number":
          description = "❌ Phone number is required for this sign-up method";
          break;
        case "auth/quota-exceeded":
          description = "❌ Sign-up quota exceeded. Please try again later";
          break;
        case "auth/user-disabled":
          description = "❌ This account has been disabled. Please contact support";
          break;
        case "auth/requires-recent-login":
          description = "❌ Please sign out and sign in again to continue";
          break;
        default:
          // Analyze error message for better context
          const errorMsg = e?.message?.toLowerCase() || "";
          if (errorMsg.includes("email")) {
            description = "❌ Email error. Please check your email address format";
          } else if (errorMsg.includes("password")) {
            description = "❌ Password error. Please use a stronger password";
          } else if (errorMsg.includes("network") || errorMsg.includes("connection")) {
            description = "❌ Connection error. Please check your internet connection";
          } else if (errorMsg.includes("timeout")) {
            description = "❌ Request timeout. Please try again";
          } else if (errorMsg.includes("permission")) {
            description = "❌ Permission denied. Please contact support";
          } else {
            description = "❌ Sign up failed. Please check your details and try again";
          }
      }
      
      setError(description);
      toast({
        description,
        duration: 1000,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loginEmail = async () => {
    if (loading) return;
    
    setError(null);
    setLoading(true);
    
    // Validate inputs
    if (!email || !password) {
      const msg = "Please enter both email and password";
      setError(msg);
      toast({
        description: "❌ Please enter both email and password",
        duration: 1000,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    try {
      // Try login first
      const res = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserDoc(res.user.uid, res.user.email, res.user.displayName);
      toast({
        description: "✅ Welcome back! Logged in successfully",
        duration: 1000,
        variant: "success",
      });
      window.location.href = "/";
    } catch (e: any) {
      let description = "❌ Login failed. Please try again";
      
      // Firebase Auth Error Codes for Login
      switch (e?.code) {
        case "auth/user-not-found":
          description = "❌ No account found with this email. Please click Sign up to create one";
          break;
        case "auth/wrong-password":
          description = "❌ Incorrect password. Please check your password and try again";
          break;
        case "auth/invalid-email":
          description = "❌ Invalid email format. Please enter a valid email address";
          break;
        case "auth/user-disabled":
          description = "❌ This account has been disabled. Please contact support";
          break;
        case "auth/too-many-requests":
          description = "❌ Too many failed login attempts. Please wait 5 minutes and try again";
          break;
        case "auth/network-request-failed":
          description = "❌ Network error. Please check your internet connection and try again";
          break;
        case "auth/invalid-credential":
          description = "❌ Invalid login credentials. Please check your email and password";
          break;
        case "auth/account-exists-with-different-credential":
          description = "❌ An account already exists with this email using a different sign-in method";
          break;
        case "auth/operation-not-allowed":
          description = "❌ Email/password sign-in is disabled. Please contact support";
          break;
        case "auth/requires-recent-login":
          description = "❌ Please sign out and sign in again to continue";
          break;
        case "auth/credential-already-in-use":
          description = "❌ This credential is already associated with a different account";
          break;
        case "auth/invalid-verification-code":
          description = "❌ Invalid verification code. Please try again";
          break;
        case "auth/invalid-verification-id":
          description = "❌ Invalid verification ID. Please try again";
          break;
        case "auth/missing-verification-code":
          description = "❌ Verification code is required";
          break;
        case "auth/missing-verification-id":
          description = "❌ Verification ID is required";
          break;
        case "auth/quota-exceeded":
          description = "❌ Login quota exceeded. Please try again later";
          break;
        case "auth/timeout":
          description = "❌ Login timeout. Please try again";
          break;
        case "auth/expired-action-code":
          description = "❌ The action code has expired. Please request a new one";
          break;
        case "auth/invalid-action-code":
          description = "❌ The action code is invalid. Please request a new one";
          break;
        default:
          // Analyze error message for better context
          const errorMsg = e?.message?.toLowerCase() || "";
          if (errorMsg.includes("user not found") || errorMsg.includes("no user")) {
            description = "❌ No account found with this email. Please sign up first";
          } else if (errorMsg.includes("wrong password") || errorMsg.includes("incorrect password")) {
            description = "❌ Wrong password. Please check your password";
          } else if (errorMsg.includes("invalid email")) {
            description = "❌ Invalid email address. Please check your email";
          } else if (errorMsg.includes("network") || errorMsg.includes("connection")) {
            description = "❌ Connection error. Please check your internet";
          } else if (errorMsg.includes("timeout")) {
            description = "❌ Request timeout. Please try again";
          } else if (errorMsg.includes("disabled")) {
            description = "❌ Account disabled. Please contact support";
          } else if (errorMsg.includes("too many")) {
            description = "❌ Too many attempts. Please wait and try again";
          } else {
            description = "❌ Login failed. Please check your credentials and try again";
          }
      }
      
      setError(description);
      toast({
        description,
        duration: 1000,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    // Clear any existing recaptcha
    const existingContainer = document.getElementById("recaptcha-container");
    if (existingContainer) {
      existingContainer.innerHTML = "";
    }
    
    // Create new recaptcha verifier
    const recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          console.log("reCAPTCHA solved");
        },
        "expired-callback": () => {
          console.log("reCAPTCHA expired");
        },
        "error-callback": (error: any) => {
          console.error("reCAPTCHA error:", error);
        }
      }
    );
    
    return recaptchaVerifier;
  };

  const sendOtp = async () => {
    if (loading) return;
    
    setError(null);
    setLoading(true);
    
    // Validate phone number
    if (!phone) {
      const msg = "Phone number is required";
      setError(msg);
      toast({
        description: "❌ Please enter your phone number",
        duration: 1000,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    if (!phone.startsWith('+')) {
      const msg = "Phone number must include country code (e.g., +1234567890)";
      setError(msg);
      toast({
        description: "❌ Phone number must start with + and country code",
        duration: 2000,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    try {
      const verifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      confirmationRef.current = result;
      toast({
        description: "✅ OTP sent! Check your phone",
        duration: 1000,
        variant: "success",
      });
    } catch (e: any) {
      let description = "❌ Could not send OTP. Please try again";
      
      // Phone OTP specific errors
      switch (e?.code) {
        case "auth/invalid-phone-number":
          description = "❌ Invalid phone number. Please enter a valid phone number (e.g., +1234567890)";
          break;
        case "auth/missing-phone-number":
          description = "❌ Phone number is required. Please enter your phone number";
          break;
        case "auth/quota-exceeded":
          description = "❌ SMS quota exceeded. Please try again later";
          break;
        case "auth/captcha-check-failed":
          description = "❌ reCAPTCHA verification failed. Please try again";
          break;
        case "auth/invalid-app-credential":
          description = "❌ Invalid app credentials. Please contact support";
          break;
        case "auth/app-not-authorized":
          description = "❌ App not authorized for phone authentication";
          break;
        case "auth/network-request-failed":
          description = "❌ Network error. Please check your internet connection";
          break;
        case "auth/too-many-requests":
          description = "❌ Too many OTP requests. Please wait 5 minutes and try again";
          break;
        case "auth/operation-not-allowed":
          description = "❌ Phone authentication is disabled. Please contact support";
          break;
        default:
          const errorMsg = e?.message?.toLowerCase() || "";
          if (errorMsg.includes("phone")) {
            description = "❌ Phone number error. Please check your phone number format";
          } else if (errorMsg.includes("captcha")) {
            description = "❌ reCAPTCHA error. Please try again";
          } else if (errorMsg.includes("network")) {
            description = "❌ Network error. Please check your connection";
          } else if (errorMsg.includes("quota")) {
            description = "❌ SMS limit reached. Please try again later";
          } else {
            description = "❌ Could not send OTP. Please try again";
          }
      }
      
      setError(description);
      toast({
        description,
        duration: 1000,
        variant: "destructive",
      });
    }
  };

  const verifyOtp = async () => {
    if (loading) return;
    
    setError(null);
    setLoading(true);
    
    // Validate OTP
    if (!otp) {
      const msg = "OTP code is required";
      setError(msg);
      toast({
        description: "❌ Please enter the OTP code",
        duration: 1000,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    if (otp.length !== 6) {
      const msg = "OTP code must be 6 digits";
      setError(msg);
      toast({
        description: "❌ OTP code must be 6 digits",
        duration: 1000,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    try {
      if (!confirmationRef.current) throw new Error("Send OTP first");
      const res = await confirmationRef.current.confirm(otp);
      await ensureUserDoc(res.user.uid, res.user.email, res.user.displayName);
      toast({
        description: "✅ Phone verified successfully!",
        duration: 1000,
        variant: "success",
      });
      window.location.href = "/";
    } catch (e: any) {
      let description = "❌ Invalid OTP code. Please try again";
      
      // OTP Verification specific errors
      switch (e?.code) {
        case "auth/invalid-verification-code":
          description = "❌ Invalid verification code. Please check the code and try again";
          break;
        case "auth/invalid-verification-id":
          description = "❌ Invalid verification ID. Please request a new OTP";
          break;
        case "auth/missing-verification-code":
          description = "❌ Verification code is required. Please enter the code";
          break;
        case "auth/missing-verification-id":
          description = "❌ Verification ID is missing. Please request a new OTP";
          break;
        case "auth/code-expired":
          description = "❌ Verification code has expired. Please request a new OTP";
          break;
        case "auth/session-expired":
          description = "❌ Session expired. Please request a new OTP";
          break;
        case "auth/credential-already-in-use":
          description = "❌ This phone number is already registered with another account";
          break;
        case "auth/network-request-failed":
          description = "❌ Network error. Please check your internet connection";
          break;
        case "auth/too-many-requests":
          description = "❌ Too many verification attempts. Please wait and try again";
          break;
        case "auth/operation-not-allowed":
          description = "❌ Phone verification is disabled. Please contact support";
          break;
        default:
          const errorMsg = e?.message?.toLowerCase() || "";
          if (errorMsg.includes("invalid") && errorMsg.includes("code")) {
            description = "❌ Invalid verification code. Please check and try again";
          } else if (errorMsg.includes("expired")) {
            description = "❌ Code expired. Please request a new OTP";
          } else if (errorMsg.includes("network")) {
            description = "❌ Network error. Please check your connection";
          } else if (errorMsg.includes("timeout")) {
            description = "❌ Verification timeout. Please try again";
          } else {
            description = "❌ Verification failed. Please try again";
          }
      }
      
      setError(description);
      toast({
        description,
        duration: 1000,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Welcome to AI Interviewer</h1>
        <p className="text-gray-600">Sign up or login to get started</p>
      </div>

      <div className="ai-card p-6 space-y-4">
        <h2 className="text-xl font-semibold">Email / Password</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={loginEmail} 
            className="btn-gradient flex-1" 
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
          <Button 
            variant="outline" 
            onClick={registerEmail}
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Signing up..." : "Sign up"}
          </Button>
        </div>
      </div>

      <div className="ai-card p-6 space-y-4">
        <h2 className="text-xl font-semibold">Phone (OTP)</h2>
        <p className="text-sm text-gray-600">Sign in or sign up using your mobile number</p>
        <div id="recaptcha-container" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Phone Number (with country code)</Label>
            <Input 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="+91XXXXXXXXXX"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>OTP Code</Label>
            <Input 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              placeholder="123456"
              disabled={loading}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={sendOtp} 
            variant="outline"
            className="flex-1"
            disabled={loading}
          >
            Send OTP
          </Button>
          <Button 
            onClick={verifyOtp} 
            className="btn-gradient flex-1"
            disabled={loading}
          >
            Verify & Login
          </Button>
        </div>
      </div>

      {error && (
        <div className="ai-card p-4 bg-red-50 border border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}


