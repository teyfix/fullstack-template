import { createForm } from "@tanstack/solid-form";
import type { JSX } from "solid-js";
import { createSignal, Show, splitProps } from "solid-js";

import { Button } from "~/app/ui/button";
import { Card, CardContent, CardHeader } from "~/app/ui/card";
import { Container } from "~/app/ui/layout";
import { TextField, TextFieldInput, TextFieldLabel } from "~/app/ui/text-field";
import { Heading, Text } from "~/app/ui/typography";

import { authClient } from "../auth-client";
import { LoginModelSchema } from "./login.dto";

function LoginFormRoot(props: JSX.FormHTMLAttributes<HTMLFormElement>) {
  const [local, rest] = splitProps(props, ["class"]);
  return <form class={`grid gap-5 ${local.class ?? ""}`} {...rest} />;
}

export type LoginPageProps = Readonly<{
  description: string;
  emailLabel: string;
  passwordLabel: string;
  submitLabel: string;
  title: string;
}>;

export function LoginPage(props: LoginPageProps) {
  const [failure, setFailure] = createSignal<string>();
  const form = createForm(() => ({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      const model = LoginModelSchema.parse(value);
      const result = await authClient.signIn.email(model);
      setFailure(result.error?.message);
    },
    validators: { onChange: LoginModelSchema },
  }));

  return (
    <Container class="py-16">
      <Card class="mx-auto max-w-lg">
        <CardHeader>
          <Heading level={1}>{props.title}</Heading>
          <Text>{props.description}</Text>
        </CardHeader>
        <CardContent>
          <LoginFormRoot
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setFailure(undefined);
              void form.handleSubmit();
            }}
          >
            <form.Field name="email">
              {(field) => (
                <TextField>
                  <TextFieldLabel for={field().name}>
                    {props.emailLabel}
                  </TextFieldLabel>
                  <TextFieldInput
                    autocomplete="email"
                    id={field().name}
                    name={field().name}
                    onBlur={field().handleBlur}
                    onInput={(event) =>
                      field().handleChange(event.currentTarget.value)
                    }
                    type="email"
                    value={field().state.value}
                  />
                </TextField>
              )}
            </form.Field>
            <form.Field name="password">
              {(field) => (
                <TextField>
                  <TextFieldLabel for={field().name}>
                    {props.passwordLabel}
                  </TextFieldLabel>
                  <TextFieldInput
                    autocomplete="current-password"
                    id={field().name}
                    name={field().name}
                    onBlur={field().handleBlur}
                    onInput={(event) =>
                      field().handleChange(event.currentTarget.value)
                    }
                    type="password"
                    value={field().state.value}
                  />
                </TextField>
              )}
            </form.Field>
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {(state) => (
                <Button
                  disabled={!state().canSubmit || state().isSubmitting}
                  type="submit"
                >
                  {props.submitLabel}
                </Button>
              )}
            </form.Subscribe>
            <Show when={failure()}>
              {(message) => <Text role="alert">{message()}</Text>}
            </Show>
          </LoginFormRoot>
        </CardContent>
      </Card>
    </Container>
  );
}
