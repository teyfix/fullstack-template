import { render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

const signInEmail = vi.hoisted(() => vi.fn());

vi.mock("../auth-client", () => ({
  authClient: { signIn: { email: signInEmail } },
}));

import { LoginPage } from "./login.page";

describe("LoginPage", () => {
  beforeEach(() => {
    signInEmail.mockReset();
  });

  test("labels credentials and exposes authentication failure as an alert", async () => {
    signInEmail.mockResolvedValue({
      error: { message: "The credentials are not valid." },
    });
    const user = userEvent.setup();

    render(() => (
      <LoginPage
        description="Use your account to continue."
        emailLabel="Email address"
        passwordLabel="Password"
        submitLabel="Sign in"
        title="Welcome back"
      />
    ));

    const email = screen.getByRole("textbox", { name: "Email address" });
    const password = screen.getByLabelText("Password");
    await user.type(email, "reader@example.com");
    await user.type(password, "correct-horse");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(signInEmail).toHaveBeenCalledWith({
        email: "reader@example.com",
        password: "correct-horse",
      });
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The credentials are not valid.",
    );
  });
});
