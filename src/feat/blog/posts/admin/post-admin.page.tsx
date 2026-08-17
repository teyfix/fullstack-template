import { createForm } from "@tanstack/solid-form";
import type { JSX } from "solid-js";
import { createSignal, Show, splitProps } from "solid-js";

import { Button } from "~/app/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/app/ui/card";
import { cn } from "~/app/ui/cn";
import { Container, Stack } from "~/app/ui/layout";
import {
  TextField,
  TextFieldErrorMessage,
  TextFieldInput,
  TextFieldLabel,
  TextFieldTextArea,
} from "~/app/ui/text-field";
import { Heading, Text } from "~/app/ui/typography";

import {
  type AdminCreatePostModel,
  AdminCreatePostModelSchema,
} from "../post.dto";
import { createPost } from "../post.functions";

function PostFormRoot(props: JSX.FormHTMLAttributes<HTMLFormElement>) {
  const [local, rest] = splitProps(props, ["class"]);
  return <form class={cn("grid gap-5", local.class)} {...rest} />;
}

type StringFieldAccessor = () => Readonly<{
  handleBlur(): void;
  handleChange(value: string): void;
  name: string;
  state: Readonly<{
    meta: Readonly<{ errors: readonly unknown[]; isValid: boolean }>;
    value: string;
  }>;
}>;

export type PostModelFieldProps = Readonly<{
  field: StringFieldAccessor;
  label: string;
  multiline?: boolean;
}>;

export function PostModelField(props: PostModelFieldProps) {
  const inputProps = () => ({
    id: props.field().name,
    name: props.field().name,
    onBlur: props.field().handleBlur,
    onInput: (event: InputEvent & { currentTarget: HTMLInputElement }) =>
      props.field().handleChange(event.currentTarget.value),
    value: props.field().state.value,
  });

  return (
    <TextField
      validationState={props.field().state.meta.isValid ? "valid" : "invalid"}
    >
      <TextFieldLabel for={props.field().name}>{props.label}</TextFieldLabel>
      <Show
        when={props.multiline}
        fallback={<TextFieldInput {...inputProps()} />}
      >
        <TextFieldTextArea
          id={props.field().name}
          name={props.field().name}
          onBlur={props.field().handleBlur}
          onInput={(event) =>
            props.field().handleChange(event.currentTarget.value)
          }
          value={props.field().state.value}
        />
      </Show>
      <TextFieldErrorMessage>
        {fieldError(props.field().state.meta.errors)}
      </TextFieldErrorMessage>
    </TextField>
  );
}

export type PostAdminPageProps = Readonly<{
  bodyLabel: string;
  createLabel: string;
  description: string;
  excerptLabel: string;
  onCreate?: (model: AdminCreatePostModel) => Promise<void>;
  savedLabel: string;
  slugLabel: string;
  submitLabel: string;
  title: string;
  titleLabel: string;
}>;

function fieldError(errors: readonly unknown[]): string {
  return errors
    .map((error) =>
      typeof error === "string"
        ? error
        : error instanceof Error
          ? error.message
          : String(error),
    )
    .join(", ");
}

export function PostAdminPage(props: PostAdminPageProps) {
  const [saved, setSaved] = createSignal(false);
  const defaultValues: AdminCreatePostModel = {
    body: "",
    excerpt: "",
    slug: "",
    state: "draft",
    title: "",
  };
  const form = createForm(() => ({
    defaultValues,
    onSubmit: async ({ value }) => {
      const model = AdminCreatePostModelSchema.parse(value);
      if (props.onCreate === undefined) await createPost({ data: model });
      else await props.onCreate(model);
      setSaved(true);
      form.reset();
    },
    validators: { onChange: AdminCreatePostModelSchema },
  }));

  return (
    <Container class="py-12">
      <Stack>
        <Stack class="gap-2">
          <Heading level={1}>{props.title}</Heading>
          <Text>{props.description}</Text>
        </Stack>
        <Card>
          <CardHeader>
            <CardTitle>{props.createLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <PostFormRoot
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setSaved(false);
                void form.handleSubmit();
              }}
            >
              <form.Field name="title">
                {(field) => (
                  <PostModelField field={field} label={props.titleLabel} />
                )}
              </form.Field>
              <form.Field name="slug">
                {(field) => (
                  <PostModelField field={field} label={props.slugLabel} />
                )}
              </form.Field>
              <form.Field name="excerpt">
                {(field) => (
                  <PostModelField field={field} label={props.excerptLabel} />
                )}
              </form.Field>
              <form.Field name="body">
                {(field) => (
                  <PostModelField
                    field={field}
                    label={props.bodyLabel}
                    multiline
                  />
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
              <Show when={saved()}>
                <Text role="status">{props.savedLabel}</Text>
              </Show>
            </PostFormRoot>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
