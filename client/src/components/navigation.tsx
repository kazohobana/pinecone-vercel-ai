import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, User, BarChart3, PieChart, Rocket, Settings, Layers, Brain, GraduationCap } from "lucide-react";
import WalletConnection from "@/components/wallet-connection";
import { useQuery } from "@tanstack/react-query";
import { useAdmin } from "@/hooks/use-admin";
import { useWallet } from "@/hooks/use-wallet";

export default function Navigation() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [location] = useLocation();
  const { isAdmin } = useAdmin();
  const { walletAddress } = useWallet();

  const { data: settings } = useQuery<any>({
    queryKey: ['/api/settings'],
  });

  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode);
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    return location.startsWith(path) && path !== "/";
  };

  return (
    <nav className="glass-card border-b border-border/50 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Stellarium AI
              </h1>
              <p className="text-xs text-muted-foreground">ICO Platform</p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            {!isAdminMode ? (
              // User Navigation
              <div className="flex items-center space-x-6">
                <Link href="/">
                  <Button
                    variant={isActive("/") ? "default" : "ghost"}
                    className="text-foreground hover:text-primary transition-colors"
                    data-testid="nav-dashboard"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>

                <Link 
                  href="/main" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location === "/main" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  🚀 Main App
                </Link>

                <Link href="/tokenomics">
                  <Button
                    variant={isActive("/tokenomics") ? "default" : "ghost"}
                    className="text-foreground hover:text-primary transition-colors"
                    data-testid="nav-tokenomics"
                  >
                    <PieChart className="w-4 h-4 mr-2" />
                    Tokenomics
                  </Button>
                </Link>

                {settings?.features?.pioneers && (
                  <Link href="/pioneers">
                    <Button
                      variant={isActive("/pioneers") ? "default" : "ghost"}
                      className="text-foreground hover:text-primary transition-colors"
                      data-testid="nav-pioneers"
                    >
                      <Rocket className="w-4 h-4 mr-2" />
                      Pioneers Hub
                    </Button>
                  </Link>
                )}

                <Link href="/ai-models">
                  <Button
                    variant={isActive("/ai-models") ? "default" : "ghost"}
                    className="text-foreground hover:text-primary transition-colors"
                    data-testid="nav-ai-models"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    AI Models
                  </Button>
                </Link>

                <Link href="/training-portal">
                  <Button
                    variant={isActive("/training-portal") ? "default" : "ghost"}
                    className="text-foreground hover:text-primary transition-colors"
                    data-testid="nav-training-portal"
                  >
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Training Portal
                  </Button>
                </Link>
              </div>
            ) : (
              // Admin Navigation
              <div className="flex items-center space-x-6">
                <Link href="/aionanotherlevel">
                  <Button
                    variant={isActive("/aionanotherlevel") ? "default" : "ghost"}
                    className="text-foreground hover:text-primary transition-colors"
                    data-testid="nav-admin-analytics"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  className="text-foreground hover:text-primary transition-colors"
                  data-testid="nav-admin-stages"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Stages
                </Button>

                <Button
                  variant="ghost"
                  className="text-foreground hover:text-primary transition-colors"
                  data-testid="nav-admin-settings"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            )}

            {/* Wallet Connection */}
            {settings?.features?.wallet && <WalletConnection />}

            {/* Admin Toggle */}
            {isAdmin && (
              <Button
                onClick={toggleAdminMode}
                className="glass-card admin-toggle px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105"
                data-testid="button-admin-toggle"
              >
                {isAdminMode ? <User className="w-4 h-4 mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                {isAdminMode ? "User Mode" : "Admin Mode"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}