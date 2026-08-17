import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import {
  TextField,
  TextFieldDescription,
  TextFieldErrorMessage,
  TextFieldInput,
  TextFieldLabel,
  TextFieldTextArea,
} from "./text-field";

describe("TextField", () => {
  test("associates labels and validation feedback with an input", () => {
    render(() => (
      <TextField validationState="invalid">
        <TextFieldLabel>Title</TextFieldLabel>
        <TextFieldInput />
        <TextFieldDescription>Shown on the post page.</TextFieldDescription>
        <TextFieldErrorMessage>A title is required.</TextFieldErrorMessage>
      </TextField>
    ));

    const input = screen.getByRole("textbox", { name: "Title" });
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription(
      "Shown on the post page. A title is required.",
    );
  });

  test("labels a multiline input", () => {
    render(() => (
      <TextField>
        <TextFieldLabel>Body</TextFieldLabel>
        <TextFieldTextArea />
      </TextField>
    ));

    expect(screen.getByRole("textbox", { name: "Body" })).toBeInTheDocument();
  });
});
