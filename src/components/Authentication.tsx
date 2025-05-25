
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Users, Bot } from 'lucide-react';

interface AuthenticationProps {
  onComplete: () => void;
}

const Authentication: React.FC<AuthenticationProps> = ({ onComplete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    console.log(`Logging in with ${provider}`);
    
    // Simulate login success
    setTimeout(() => {
      setIsLoading(false);
      onComplete();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-6 flex items-center justify-center">
      <Card className="w-full max-w-lg border-0 shadow-xl bg-white rounded-2xl overflow-hidden">
        <CardHeader className="text-center py-8 px-8">
          <div className="mx-auto mb-6">
            <div className="h-20 w-20 mx-auto bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center">
              <Bot className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-slate-800 mb-3 leading-tight">
            Emotional Pattern Tracker
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Sign in to start your wellness journey
          </p>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-slate-700 font-medium mb-6">Choose a method to sign in:</p>
              
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-3 h-14 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-slate-800 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                  disabled={isLoading}
                  onClick={() => handleSocialLogin('google')}
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="text-base">Continue with Google</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-3 h-14 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                  disabled={isLoading}
                  onClick={() => handleSocialLogin('email')}
                >
                  <Mail className="h-6 w-6 text-slate-600" />
                  <span className="text-base">Continue with Email</span>
                </Button>
              </div>
            </div>

            {/* Mental Health Features */}
            <div className="mt-10 pt-8 border-t border-slate-100">
              <h3 className="text-center text-lg font-semibold text-slate-800 mb-6">
                What You'll Get:
              </h3>
              
              <div className="space-y-5">
                <div className="flex items-start gap-4 p-5 rounded-xl bg-blue-50 border border-blue-100 transition-all duration-200 hover:shadow-sm">
                  <div className="p-3 rounded-xl bg-blue-100 flex-shrink-0">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="text-base font-semibold text-slate-800 mb-2">
                      Professional Support
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Seamless connections to vetted mental health professionals
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-xl bg-emerald-50 border border-emerald-100 transition-all duration-200 hover:shadow-sm">
                  <div className="p-3 rounded-xl bg-emerald-100 flex-shrink-0">
                    <Bot className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="text-base font-semibold text-slate-800 mb-2">
                      AI Companion
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      A personalised AI agent that listens to your pains and provides support
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-center text-slate-500 pt-6 space-y-2">
              <p>By continuing, you agree to our</p>
              <div className="flex justify-center gap-3">
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Terms of Service
                </a>
                <span className="text-slate-400">&</span>
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Authentication;
