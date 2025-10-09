import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, User, Home, FileText, Brain, Video, BarChart3, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        description: "✅ Successfully logged out",
        duration: 1000,
        variant: "success",
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        description: "❌ Logout failed. Please try again",
        duration: 1000,
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Resume Analyzer', path: '/resume-analyzer', icon: FileText },
    { name: 'Aptitude Test', path: '/aptitude-test', icon: Brain },
    { name: 'AI Interview', path: '/interview', icon: Video },
    { name: 'Results', path: '/results', icon: BarChart3 },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Video className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-semibold text-gradient">AI Virtual Interviewer</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </NavLink>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="ml-2 flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card border rounded-lg mt-2 mb-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full mt-2 flex items-center space-x-2"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;