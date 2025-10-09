import { User, MapPin, Phone, Briefcase, Plus, Save, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    experience: "1-3 years",
    jobPreferences: [] as string[],
  });
  const [newPreference, setNewPreference] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

        // Set email from auth
        setProfile((p) => ({ ...p, email: user.email || "" }));

        // Load profile from Firestore
        const profileRef = doc(db, 'profiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setProfile((p) => ({ 
            ...p, 
            ...data,
            email: user.email || data.email || ""
          }));
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate, toast]);

  const addPreference = () => {
    const val = newPreference.trim();
    if (val && !profile.jobPreferences.includes(val)) {
      setProfile({ ...profile, jobPreferences: [...profile.jobPreferences, val] });
      setNewPreference("");
    }
  };

  const removePreference = (index: number) => {
    setProfile({
      ...profile,
      jobPreferences: profile.jobPreferences.filter((_, i) => i !== index),
    });
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save profile",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // Save to Firestore
      const profileRef = doc(db, 'profiles', user.uid);
      const profileData = {
        ...profile,
        userId: user.uid,
        email: user.email || profile.email,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(), // Will be overwritten if document exists
      };

      await setDoc(profileRef, profileData, { merge: true });

      toast({
        title: "Success",
        description: "Profile saved successfully!",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gradient">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="ai-card p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
            <User className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-1">{profile.name || "Your Name"}</h2>
          <p className="text-muted-foreground mb-2">{profile.email || "your@email.com"}</p>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground">
            <Briefcase className="h-4 w-4 mr-1" />
            {profile.experience}
          </div>
        </div>

        <div className="lg:col-span-2 ai-card p-6">
          <h2 className="text-xl font-semibold mb-6">Personal Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="ai-input" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="ai-input" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="ai-input pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="location" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} className="ai-input pl-10" />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Select value={profile.experience} onValueChange={(value) => setProfile({ ...profile, experience: value })}>
                <SelectTrigger className="ai-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1 years">0-1 years</SelectItem>
                  <SelectItem value="1-3 years">1-3 years</SelectItem>
                  <SelectItem value="3-5 years">3-5 years</SelectItem>
                  <SelectItem value="5-10 years">5-10 years</SelectItem>
                  <SelectItem value="10+ years">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-4">
              <Label>Job Preferences</Label>
              <div className="flex flex-wrap gap-2">
                {profile.jobPreferences.map((pref, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary text-primary-foreground cursor-pointer hover:bg-primary/80" onClick={() => removePreference(index)}>
                    {pref}
                    <span className="ml-1 text-xs">×</span>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <Input value={newPreference} onChange={(e) => setNewPreference(e.target.value)} placeholder="Add new job preference" className="ai-input flex-1" onKeyPress={(e) => e.key === 'Enter' && addPreference()} />
                <Button onClick={addPreference} variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
            <Button className="btn-gradient px-8 py-3" onClick={saveProfile} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}