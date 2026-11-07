import { useRef, useState } from "react";
import { useUpdateProfile } from "../hooks/useUsers.js";
import { toSafeUrl } from "../lib/format.js";
import { compressImage, IMAGE_PRESETS } from "../lib/image.js";
import { USERNAME_HINT, USERNAME_PATTERN } from "../lib/validation.js";
import Avatar from "./Avatar.jsx";
import Dialog from "./Dialog.jsx";
import Icon from "./Icon.jsx";
import OrbitCover from "./OrbitCover.jsx";

const PRESET_AVATARS = ["boy1", "boy2", "boy3", "girl1", "girl2", "girl3"].map(
  (name) => `/avatars/${name}.png`
);
const BIO_LIMIT = 160;
const EDITABLE_FIELDS = ["fullName", "username", "email", "bio", "link", "profileImg", "coverImg"];

function UploadButton({ preset, onImage, onError, label }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      onImage(await compressImage(file, preset));
    } catch (error) {
      onError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleFile}
      />
      <button
        type="button"
        className="btn btn--sm btn--ghost"
        disabled={busy}
        onClick={() => input.current?.click()}
      >
        <Icon name="image" size={14} />
        {busy ? "Compressing" : label}
      </button>
    </>
  );
}

function validate(form) {
  if (!form.fullName.trim()) return "Enter your name.";
  if (!USERNAME_PATTERN.test(form.username)) return USERNAME_HINT;
  if (form.link.trim() && !toSafeUrl(form.link.trim())) return "That link isn't a valid web address.";
  if (form.currentPassword || form.newPassword) {
    if (!form.currentPassword || !form.newPassword) {
      return "To change your password, fill in both password fields.";
    }
    if (form.newPassword.length < 6) return "Your new password needs at least 6 characters.";
  }
  return null;
}

export default function EditProfileDialog({ me, onClose, onSaved }) {
  const update = useUpdateProfile();
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    fullName: me.fullName ?? "",
    username: me.username ?? "",
    email: me.email ?? "",
    bio: me.bio ?? "",
    link: me.link ?? "",
    profileImg: me.profileImg ?? "",
    coverImg: me.coverImg ?? "",
    currentPassword: "",
    newPassword: "",
  });

  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const bind = (field) => ({
    value: form[field],
    onChange: (event) => set(field, event.target.value),
  });

  function save(event) {
    event.preventDefault();
    const problem = validate(form);
    setError(problem);
    if (problem) return;

    // Only changed fields are sent, which keeps unchanged images out of the 100 KB limit.
    const changes = {};
    for (const field of EDITABLE_FIELDS) {
      const value = form[field].trim();
      if (value !== (me[field] ?? "")) changes[field] = value;
    }
    if (form.currentPassword) {
      changes.currentPassword = form.currentPassword;
      changes.newPassword = form.newPassword;
    }
    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    update.mutate(changes, {
      onSuccess: (user) => onSaved(user),
      onError: (saveError) => setError(saveError.message),
    });
  }

  return (
    <Dialog title="Edit profile" eyebrow="Crew record" onClose={onClose}>
      <form className="edit" onSubmit={save} noValidate>
        <div className="edit__scroll">
          <section className="edit__section">
            <h3 className="eyebrow">Cover</h3>
            <div className="edit__cover">
              {form.coverImg ? (
                <img src={form.coverImg} alt="Current cover" />
              ) : (
                <OrbitCover seed={me._id} />
              )}
            </div>
            <div className="edit__row">
              <UploadButton preset={IMAGE_PRESETS.cover} label="Upload" onImage={(url) => set("coverImg", url)} onError={setError} />
              {form.coverImg && (
                <button type="button" className="btn btn--sm btn--ghost" onClick={() => set("coverImg", "")}>
                  Use orbit map
                </button>
              )}
            </div>
          </section>

          <section className="edit__section">
            <h3 className="eyebrow">Avatar</h3>
            <div className="edit__avatars">
              <Avatar user={{ ...me, fullName: form.fullName, profileImg: form.profileImg }} size="lg" />
              <div className="edit__presets" role="group" aria-label="Preset avatars">
                {PRESET_AVATARS.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    className="preset"
                    aria-label={`Preset avatar ${index + 1}`}
                    aria-pressed={form.profileImg === src}
                    onClick={() => set("profileImg", src)}
                  >
                    <img src={src} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
            <div className="edit__row">
              <UploadButton preset={IMAGE_PRESETS.avatar} label="Upload" onImage={(url) => set("profileImg", url)} onError={setError} />
              {form.profileImg && (
                <button type="button" className="btn btn--sm btn--ghost" onClick={() => set("profileImg", "")}>
                  Use initials
                </button>
              )}
            </div>
          </section>

          <section className="edit__section edit__grid">
            <label className="field">
              <span className="field__label">Full name</span>
              <input className="input" autoComplete="name" {...bind("fullName")} />
            </label>
            <label className="field">
              <span className="field__label">Username</span>
              <input className="input" autoComplete="username" autoCapitalize="none" spellCheck="false" {...bind("username")} />
            </label>
            <label className="field edit__wide">
              <span className="field__label">Email</span>
              <input className="input" type="email" autoComplete="email" {...bind("email")} />
            </label>
            <label className="field edit__wide">
              <span className="field__label">
                Bio
                <span className="field__count">
                  {form.bio.length}/{BIO_LIMIT}
                </span>
              </span>
              <textarea className="input input--area" rows={3} maxLength={BIO_LIMIT} {...bind("bio")} />
            </label>
            <label className="field edit__wide">
              <span className="field__label">Link</span>
              <input className="input" inputMode="url" placeholder="yoursite.com" autoComplete="url" {...bind("link")} />
            </label>
          </section>

          <section className="edit__section edit__grid">
            <h3 className="eyebrow edit__wide">Change password</h3>
            <label className="field">
              <span className="field__label">Current password</span>
              <input className="input" type="password" autoComplete="current-password" {...bind("currentPassword")} />
            </label>
            <label className="field">
              <span className="field__label">New password</span>
              <input className="input" type="password" autoComplete="new-password" {...bind("newPassword")} />
            </label>
          </section>
        </div>

        <footer className="edit__foot">
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="edit__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={update.isPending}>
              {update.isPending ? "Saving" : "Save changes"}
            </button>
          </div>
        </footer>
      </form>
    </Dialog>
  );
}
