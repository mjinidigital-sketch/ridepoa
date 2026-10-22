"use client"

import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Car } from "lucide-react"
import Link from "next/link"
import { useClerk } from "@clerk/nextjs"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { openSignIn } = useClerk()

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border border-border shadow-xl rounded-2xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                  <Car className="size-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Welcome to RidePoa</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Sign in to manage your rides and bookings
                </p>
              </div>

              <Field className="pt-2">
                <Button
                  onClick={() => openSignIn?.()}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer py-2.5 font-semibold"
                >
                  Sign in with Clerk
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>

              <Field className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => openSignIn?.()}
                  className="cursor-pointer hover:bg-muted font-medium text-xs gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>Google</span>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => openSignIn?.()}
                  className="cursor-pointer hover:bg-muted font-medium text-xs gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  <span>Apple</span>
                </Button>
              </Field>

              <FieldDescription className="text-center pt-2">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-primary hover:underline cursor-pointer">
                  Sign up
                </Link>
              </FieldDescription>
            </FieldGroup>
          </div>
          <div className="relative hidden bg-linear-to-br from-primary/90 to-primary/40 md:flex flex-col items-center justify-center p-8 text-primary-foreground">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-4 shadow-lg">
              <Car className="size-10" />
            </div>
            <h2 className="text-2xl font-bold text-center">Drive in Comfort & Style</h2>
            <p className="text-center text-sm text-primary-foreground/80 mt-2 max-w-xs">
              Premier car rentals, chauffeur services, and luxury fleets across Kenya.
            </p>
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-xs">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline hover:text-primary">Terms of Service</a> and{" "}
        <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
