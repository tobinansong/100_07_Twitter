import { useState } from "react";
import { Link, useLocation } from "react-router";
import Icon from "../components/Icon.jsx";
import Logo from "../components/Logo.jsx";
import OrbitField from "../components/OrbitField.jsx";
import { useLogin, useSignup } from "../hooks/useAuth.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { EMAIL_PATTERN, USERNAME_HINT, USERNAME_PATTERN } from "../lib/validation.js";

const EMPTY_FORM = { fullName: "", username: "", email: "", password: "" };

function validateSignup({ fullName, username, email, password }) {
  if (!fullName.trim()) return "Enter your name.";
  if (!USERNAME_PATTERN.test(username)) return USERNAME_HINT;
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address.";
  if (password.length < 6) return "Your password needs at least 6 characters.";
  return null;
}

function AuthForm({ mode, otherLinkState }) {
  const isSignup = mode === "signup";
  const login = useLogin();
  const signup = useSignup();
  const mutation = isSignup ? signup : login;

  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const bind = (field) => ({
    value: form[field],
    onChange: (event) => setForm((current) => ({ ...current, [field]: event.target.value })),
  });

  function submit(event) {
    event.preventDefault();
    setFormError(null);
    mutation.reset();

    if (isSignup) {
      const problem = validateSignup(form);
      if (problem) {
        setFormError(problem);
        return;
      }
      signup.mutate({
        fullName: form.fullName.trim(),
        username: form.username,
        email: form.email.trim(),
        password: form.password,
      });
      return;
    }

    if (!form.username || !form.password) {
      setFormError("Enter your username and password.");
      return;
    }
    login.mutate({ username: form.username.trim(), password: form.password });
  }

  const error = formError ?? mutation.error?.message;

  return (
    <form className="auth__form hull" onSubmit={submit} noValidate>
      <p className="eyebrow">{isSignup ? "New crew" : "Returning crew"}</p>
      <h2 className="auth__title">{isSignup ? "Create account" : "Log in"}</h2>

      {isSignup && (
        <label className="field">
          <span className="field__label">Full name</span>
          <input className="input" autoComplete="name" autoFocus {...bind("fullName")} />
        </label>
      )}

      <label className="field">
        <span className="field__label">Username</span>
        <input
          className="input"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck="false"
          autoFocus={!isSignup}
          {...bind("username")}
        />
      </label>

      {isSignup && (
        <label className="field">
          <span className="field__label">Email</span>
          <input className="input" type="email" autoComplete="email" {...bind("email")} />
        </label>
      )}

      <label className="field">
        <span className="field__label">Password</span>
        <span className="input-wrap">
          <input
            className="input"
            type={showPassword ? "text" : "password"}
            autoComplete={isSignup ? "new-password" : "current-password"}
            {...bind("password")}
          />
          <button
            type="button"
            className="icon-btn input-wrap__toggle"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((shown) => !shown)}
          >
            <Icon name={showPassword ? "eyeOff" : "eye"} size={16} />
          </button>
        </span>
      </label>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <span className="btn-glow btn-glow--block">
        <button type="submit" className="btn btn--primary btn--block" disabled={mutation.isPending}>
          {mutation.isPending ? "Connecting" : isSignup ? "Create account" : "Log in"}
        </button>
      </span>

      <p className="auth__switch">
        {isSignup ? "Already have an account?" : "New to the network?"}{" "}
        <Link to={isSignup ? "/login" : "/signup"} state={otherLinkState}>
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}

export default function AuthPage({ mode }) {
  const location = useLocation();
  useDocumentTitle(mode === "signup" ? "Create account" : "Log in");

  return (
    <div className="auth">
      <OrbitField variant="auth" />
      <section className="auth__hero">
        <Logo size={34} />
        <div className="auth__pitch">
          <h1 className="auth__headline">
            Closest
            <br />
            approach.
          </h1>
          <p className="auth__lede">
            Perigee is the point in an orbit nearest to home. Post short transmissions, follow people
            and see who's in range.
          </p>
        </div>
      </section>
      <section className="auth__panel">
        <AuthForm key={mode} mode={mode} otherLinkState={location.state} />
      </section>
    </div>
  );
}
