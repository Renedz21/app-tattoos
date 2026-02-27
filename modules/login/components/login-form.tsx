"use client";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/modules/core/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/modules/core/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/modules/core/components/ui/field";
import { Input } from "@/modules/core/components/ui/input";

export default function LoginForm() {
  return (
    <section className="w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Inicia sesión en tu cuenta</CardTitle>
          <CardDescription>Ingresa tu email debajo para</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" required />
              </Field>
              <Field>
                <Button type="submit">Login</Button>
                <Button variant="outline" type="button">
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="#">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
