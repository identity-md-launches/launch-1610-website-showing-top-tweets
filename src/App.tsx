import { useId, useMemo, useRef, useState } from "react";
import data from "./data/tweets.json";
import { HeroPepe, Pepe } from "./components/Pepe";
import { TweetCard } from "./components/TweetCard";
import { matches, rank, type Post, type SortKey } from "./format";

const POSTS = data.posts as Post[];
const TOPICS = data.topics as string[];
const PAGE = 8;
const X_SEARCH = "https://x.com/search?q=IdentityMD";

export default function App() {
  const [sort, setSort] = useState<SortKey>("top");
  const [topic, setTopic] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [status, setStatus] = useState("");
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);

  const visible = useMemo(
    () => rank(POSTS, sort).filter((p) => matches(p, topic, query)),
    [sort, topic, query],
  );
  const shown = visible.slice(0, limit);
  const hidden = visible.length - shown.length;

  const changeFilter = (fn: () => void) => {
    fn();
    setLimit(PAGE);
  };

  const copyLink = async (post: Post) => {
    try {
      await navigator.clipboard.writeText(post.url);
      setStatus(`Copied the link to ${post.author.name}'s post.`);
    } catch {
      setStatus("Unable to copy. Open the post and copy its address instead.");
    }
  };

  const clearSearch = () => {
    changeFilter(() => setQuery(""));
    searchRef.current?.focus();
  };

  return (
    <>
      <a className="skip" href="#posts">
        Skip to posts
      </a>

      <header className="site-head">
        <a className="brand" href="./" aria-label="Identity MD tweets, home">
          <Pepe variant="visor" size={32} />
          <span className="brand-name">Identity MD tweets</span>
        </a>
        <a className="btn btn-quiet" href={X_SEARCH} target="_blank" rel="noopener noreferrer">
          Search on X
        </a>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">The Identity MD timeline, ranked.</h1>
            <p className="hero-line">The most liked and reposted posts about Identity MD, in one list.</p>
          </div>
          <HeroPepe className="hero-art" />
        </section>

        <section className="controls" aria-label="Sort and filter">
          <div className="control-row">
            <div className="segment" role="group" aria-label="Sort posts">
              <button
                type="button"
                className="seg-btn"
                aria-pressed={sort === "top"}
                onClick={() => changeFilter(() => setSort("top"))}
              >
                Top
              </button>
              <button
                type="button"
                className="seg-btn"
                aria-pressed={sort === "newest"}
                onClick={() => changeFilter(() => setSort("newest"))}
              >
                Newest
              </button>
            </div>

            <div className="search">
              <label htmlFor={searchId}>Search posts</label>
              <input
                ref={searchRef}
                id={searchId}
                type="search"
                name="q"
                autoComplete="off"
                placeholder="agent, contract, launch"
                value={query}
                onChange={(e) => changeFilter(() => setQuery(e.target.value))}
              />
            </div>
          </div>

          <div className="chips" role="group" aria-label="Filter by topic">
            <button
              type="button"
              className="chip"
              aria-pressed={topic === null}
              onClick={() => changeFilter(() => setTopic(null))}
            >
              All topics
            </button>
            {TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                className="chip"
                aria-pressed={topic === t}
                onClick={() => changeFilter(() => setTopic(topic === t ? null : t))}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <section id="posts" className="posts" aria-labelledby="posts-title">
          <div className="posts-head">
            <h2 id="posts-title">
              {visible.length === POSTS.length
                ? `${POSTS.length} posts`
                : `${visible.length} of ${POSTS.length} posts`}
            </h2>
            <p className="posts-note">From a list kept in this repository, not a live feed.</p>
          </div>

          {shown.length === 0 ? (
            <div className="empty">
              <p className="empty-title">
                {query.trim() ? `No posts match "${query.trim()}".` : `No posts tagged ${topic}.`}
              </p>
              <p className="empty-line">Try another word, or widen the list.</p>
              <div className="empty-actions">
                {query.trim() && (
                  <button type="button" className="btn btn-solid" onClick={clearSearch}>
                    Clear search
                  </button>
                )}
                {topic && (
                  <button
                    type="button"
                    className="btn btn-quiet"
                    onClick={() => changeFilter(() => setTopic(null))}
                  >
                    Show all topics
                  </button>
                )}
              </div>
            </div>
          ) : (
            <ol className="list">
              {shown.map((p, i) => (
                <li key={p.id}>
                  <TweetCard post={p} position={i + 1} onCopy={copyLink} />
                </li>
              ))}
            </ol>
          )}

          {hidden > 0 && (
            <div className="more">
              <button type="button" className="btn btn-quiet" onClick={() => setLimit(limit + PAGE)}>
                {hidden === 1 ? "Show 1 more post" : `Show ${Math.min(hidden, PAGE)} more posts`}
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Stable live region: always in the DOM, visible as a toast only while it has text. */}
      <div className={status ? "toast" : "toast toast-empty"} role="status" aria-live="polite">
        {status && (
          <>
            <span className="toast-text">{status}</span>
            <button type="button" className="btn btn-quiet" onClick={() => setStatus("")}>
              Dismiss
            </button>
          </>
        )}
      </div>

      <footer className="site-foot">
        <p>
          Edit <code>src/data/tweets.json</code> and rebuild to change the list.
        </p>
        <a href={X_SEARCH} target="_blank" rel="noopener noreferrer">
          Find newer posts about Identity MD on X
        </a>
      </footer>
    </>
  );
}
