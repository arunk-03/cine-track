import { Link } from 'react-router-dom';
import { createSlug } from '../utils';

const MovieList = ({ movies }) => {
  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <Link 
          to={`/movies/${createSlug(movie.Title)}`} 
          key={movie.imdbID}
          className="movie-link"
        >
          <div className="movie-card">
            <img src={movie.Poster} alt={movie.Title} />
            <h3>{movie.Title}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MovieList;