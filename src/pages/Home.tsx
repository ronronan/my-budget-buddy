import { Link } from 'react-router-dom';

export default function Page() {
  return (
    <div>
      <h1>React 19 Blog</h1>
      <p>Welcome to the beginner-friendly React Router tutorial.</p>
      <Link to='/two'>View Blog Posts</Link>
    </div>
  );
}
