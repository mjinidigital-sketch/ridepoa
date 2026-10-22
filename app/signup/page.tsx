import { SignUp } from "@clerk/nextjs"
import { Car } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/40 p-6 md:p-10">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-transform hover:scale-105 group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Car className="size-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-foreground">
            Ride<span className="text-primary">Poa</span>
          </span>
        </Link>
        <SignUp
          routing="hash"
          signInUrl="/login"
          forceRedirectUrl="/"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-xl border border-border rounded-2xl bg-card p-6",
              headerTitle: "text-xl font-bold text-foreground",
              headerSubtitle: "text-xs text-muted-foreground",
              socialButtonsBlockButton: "border-border hover:bg-muted text-foreground transition-colors cursor-pointer",
              formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer font-semibold py-2.5",
              footerActionLink: "text-primary hover:text-primary/80 font-semibold cursor-pointer",
            },
          }}
        />
      </div>
    </div>
  )
}
