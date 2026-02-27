"use client";

import { useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/modules/core/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/core/components/ui/select";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/modules/core/components/ui/field";
import {
  adminFiltersSchema,
  STATUS_OPTIONS,
  type AdminFiltersValues,
} from "@/modules/schemas/admin-filters.schema";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "@/modules/hooks/use-debounce";

export default function AdminFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const form = useForm<AdminFiltersValues>({
    resolver: zodResolver(adminFiltersSchema),
    defaultValues: {
      search: searchParams.get("search") ?? "",
      status: searchParams.get("status") ?? "",
    },
  });
  useEffect(() => {
    form.reset({
      search: searchParams.get("search") ?? "",
      status: searchParams.get("status") ?? "",
    });
  }, [searchParams.toString()]); // eslint-disable-line react-hooks/exhaustive-deps

  function navigate(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    value ? params.set(key, value) : params.delete(key);
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  }

  const handleSearch = useDebouncedCallback((value: string) =>
    navigate("search", value),
  );

  return (
    <form>
      <div className="w-full flex gap-x-6">
        <Controller
          control={form.control}
          name="search"
          render={({ field, fieldState }) => (
            <Field className="w-full lg:max-w-md">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  {...field}
                  placeholder="Nombre del cliente..."
                  className={cn(
                    "pl-9 bg-card/50 border-border/50 font-grotesk",
                    isPending ? "opacity-60" : "",
                  )}
                  onChange={(e) => {
                    field.onChange(e);
                    handleSearch(e.target.value);
                  }}
                />
              </div>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="status"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-0" data-invalid={fieldState.invalid}>
              <FieldContent>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  navigate("status", value);
                }}
              >
                <SelectTrigger
                  id="form-rhf-select-language"
                  aria-invalid={fieldState.invalid}
                  className="w-full lg:max-w-56"
                >
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      </div>
    </form>
  );
}
