import { useSearchParams } from "react-router";
import Composer from "../components/Composer.jsx";
import ContactsStrip from "../components/ContactsStrip.jsx";
import PostList from "../components/PostList.jsx";
import { EmptyPanel } from "../components/states.jsx";
import Tabs from "../components/Tabs.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useFeed } from "../hooks/usePosts.js";

const FEEDS = [
  { value: "all", label: "All signals" },
  { value: "following", label: "Following" },
];

export default function HomePage() {
  useDocumentTitle("Home");
  const [params, setParams] = useSearchParams();
  const feed = params.get("feed") === "following" ? "following" : "all";
  const query = useFeed({ type: feed });

  function selectFeed(next) {
    setParams(next === "all" ? {} : { feed: next }, { replace: true });
  }

  return (
    <>
      <header className="pane-head">
        <h1 className="page-title">Home</h1>
        <Tabs items={FEEDS} value={feed} onChange={selectFeed} label="Choose a feed" />
      </header>
      <Composer />
      <ContactsStrip />
      <PostList
        query={query}
        label={feed === "following" ? "Posts from people you follow" : "All posts"}
        empty={
          feed === "following" ? (
            <EmptyPanel title="Nobody on your scope">
              Follow someone from your contacts and their posts will show up here.
            </EmptyPanel>
          ) : (
            <EmptyPanel title="The channel is quiet">
              Nothing has been posted yet. Send the first transmission.
            </EmptyPanel>
          )
        }
      />
    </>
  );
}
