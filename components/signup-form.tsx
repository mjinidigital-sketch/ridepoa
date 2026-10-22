"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field"
import { Car } from "lucide-react"
import Link from "next/link"
import { useClerk } from "@clerk/nextjs"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const { openSignUp } = useClerk()

  return (
    <Card className="overflow-hidden border border-border shadow-xl rounded-2xl" {...props}>
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-2 w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
          <Car className="size-7" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Create your RidePoa Account</CardTitle>
        <CardDescription className="text-sm">
          Join thousands of satisfied drivers and travelers across Kenya
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        <FieldGroup>
          <Field className="pt-2">
            <Button
              onClick={() => openSignUp?.()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer py-2.5 font-semibold text-sm"
            >
              Sign up with Clerk
            </Button>
          </Field>

          <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
            Or sign up with
          </FieldSeparator>

          <Field className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => openSignUp?.()}
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
              onClick={() => openSignUp?.()}
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

          <FieldDescription className="px-6 text-center text-sm pt-2">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline cursor-pointer">
              Sign in
            </Link>
          </FieldDescription>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
