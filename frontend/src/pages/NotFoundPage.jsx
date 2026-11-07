import { Link } from "react-router";
import { EmptyPanel } from "../components/states.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

export default function NotFoundPage() {
  useDocumentTitle("Off course");
  return (
    <EmptyPanel
      title="Off course"
      action={
        <Link to="/" className="btn btn--ghost">
          Back to home
        </Link>
      }
    >
      There's nothing at this address. It may have moved, or the link may be wrong.
    </EmptyPanel>
  );
}
