import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-[#f8f8fb] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Response recorded</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          Thanks for taking the time. Your answers help us understand how students
          really live and work.
        </p>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm mb-6">
          <p className="text-sm text-foreground font-medium mb-1">Curious how you compare?</p>
          <p className="text-xs text-muted-foreground mb-4">
            See how other students answered — live aggregated results from all participants.
          </p>
          <Link href="/results">
            <Button className="w-full h-10 text-sm font-semibold" data-testid="button-view-results">
              View Results Dashboard
            </Button>
          </Link>
        </div>

        <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Submit another response
        </Link>
      </div>
    </div>
  );
}
