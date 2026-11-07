import PostCard from "./PostCard.jsx";
import { ErrorPanel, ScanRows } from "./states.jsx";

export default function PostList({ query, empty, label = "Posts" }) {
  if (query.isPending) return <ScanRows label="Loading posts" />;
  if (query.isError) {
    return <ErrorPanel message={query.error.message} onRetry={query.refetch} />;
  }
  if (query.data.length === 0) return empty;

  return (
    <ol className="log" aria-label={label}>
      {query.data.map((post, index) => (
        <PostCard key={post._id} post={post} index={index} />
      ))}
    </ol>
  );
}
