import { Pepe } from "./Pepe";
import { formatCount, formatDate, formatFull, type Post } from "../format";

type Props = {
  post: Post;
  position: number;
  onCopy: (post: Post) => void;
};

export function TweetCard({ post, position, onCopy }: Props) {
  const { author } = post;
  return (
    <article className="card" aria-labelledby={`post-${post.id}-author`}>
      <div className="card-head">
        <span className="rank" aria-hidden="true">
          {position}
        </span>
        <Pepe variant={author.pepe} size={44} className="avatar" />
        <div className="who">
          <span className="who-name" id={`post-${post.id}-author`}>
            {author.name}
          </span>
          <span className="who-meta">
            @{author.handle} <span aria-hidden="true">&middot;</span>{" "}
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </span>
        </div>
      </div>

      <p className="card-text">{post.text}</p>

      <dl className="metrics">
        <div className="metric">
          <dt>Likes</dt>
          <dd title={formatFull(post.likes)}>{formatCount(post.likes)}</dd>
        </div>
        <div className="metric">
          <dt>Reposts</dt>
          <dd title={formatFull(post.reposts)}>{formatCount(post.reposts)}</dd>
        </div>
        <div className="metric">
          <dt>Replies</dt>
          <dd title={formatFull(post.replies)}>{formatCount(post.replies)}</dd>
        </div>
      </dl>

      <div className="card-foot">
        <ul className="topics" aria-label="Topics">
          {post.topics.map((t) => (
            <li key={t} className="topic">
              {t}
            </li>
          ))}
        </ul>
        <div className="card-actions">
          <button type="button" className="btn btn-quiet" onClick={() => onCopy(post)}>
            Copy link
          </button>
          <a className="btn btn-solid" href={post.url} target="_blank" rel="noopener noreferrer">
            {post.url.includes("/status/") ? "Open tweet" : "Search on X"}
          </a>
        </div>
      </div>
    </article>
  );
}
