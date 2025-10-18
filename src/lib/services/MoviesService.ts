import { Movie, Genre, LengthBucket } from '@/types';

// TODO: Replace with actual API calls to your ASP.NET Web API
// Endpoints:
// - GET /api/movies?genre={genre}&lengthBucket={lengthBucket}&skip={skip}&take={take}
// - GET /api/movies/{id}
// - POST /api/movies/like - { userId, movieId }
// - POST /api/movies/skip - { userId, movieId }

const MOCK_MOVIES: Movie[] = [
  // Action
  { id: '1', title: 'Mad Max: Fury Road', year: 2015, runtime: 120, poster: 'https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg', genres: ['Action', 'Sci-Fi'], lengthBucket: 'medium', rating: 8.1 },
  { id: '2', title: 'John Wick', year: 2014, runtime: 101, poster: 'https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg', genres: ['Action', 'Thriller'], lengthBucket: 'medium', rating: 7.4 },
  { id: '3', title: 'The Dark Knight', year: 2008, runtime: 152, poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', genres: ['Action', 'Drama'], lengthBucket: 'long', rating: 9.0 },
  
  // Comedy
  { id: '4', title: 'The Grand Budapest Hotel', year: 2014, runtime: 99, poster: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg', genres: ['Comedy'], lengthBucket: 'short', rating: 8.1 },
  { id: '5', title: 'Superbad', year: 2007, runtime: 113, poster: 'https://image.tmdb.org/t/p/w500/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg', genres: ['Comedy'], lengthBucket: 'medium', rating: 7.6 },
  { id: '6', title: 'Knives Out', year: 2019, runtime: 130, poster: 'https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twj48Jq4.jpg', genres: ['Comedy', 'Thriller'], lengthBucket: 'medium', rating: 7.9 },
  
  // Drama
  { id: '7', title: 'The Shawshank Redemption', year: 1994, runtime: 142, poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', genres: ['Drama'], lengthBucket: 'long', rating: 9.3 },
  { id: '8', title: 'Whiplash', year: 2014, runtime: 106, poster: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg', genres: ['Drama'], lengthBucket: 'medium', rating: 8.5 },
  { id: '9', title: 'Moonlight', year: 2016, runtime: 111, poster: 'https://image.tmdb.org/t/p/w500/4911T5FbJ9eD2Faz5Z8L9eVEb5a.jpg', genres: ['Drama', 'Academy Award Winners'], lengthBucket: 'medium', rating: 7.4 },
  
  // Romance
  { id: '10', title: 'La La Land', year: 2016, runtime: 128, poster: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg', genres: ['Romance', 'Drama'], lengthBucket: 'medium', rating: 8.0 },
  { id: '11', title: 'Before Sunrise', year: 1995, runtime: 101, poster: 'https://image.tmdb.org/t/p/w500/8lbHr7B7RbAW6F7Faz4c2yPXrFN.jpg', genres: ['Romance', '90s'], lengthBucket: 'medium', rating: 8.1 },
  { id: '12', title: 'Eternal Sunshine of the Spotless Mind', year: 2004, runtime: 108, poster: 'https://image.tmdb.org/t/p/w500/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg', genres: ['Romance', 'Sci-Fi'], lengthBucket: 'medium', rating: 8.3 },
  
  // Thriller
  { id: '13', title: 'Parasite', year: 2019, runtime: 132, poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', genres: ['Thriller', 'Drama', 'Academy Award Winners'], lengthBucket: 'medium', rating: 8.5 },
  { id: '14', title: 'Gone Girl', year: 2014, runtime: 149, poster: 'https://image.tmdb.org/t/p/w500/gdiLTof3rbPDAmPaCf4g6op46bj.jpg', genres: ['Thriller', 'Drama'], lengthBucket: 'long', rating: 8.1 },
  { id: '15', title: 'Prisoners', year: 2013, runtime: 153, poster: 'https://image.tmdb.org/t/p/w500/tuq4D9WriR6m3YP4BKGq8d0sTgz.jpg', genres: ['Thriller', 'Drama'], lengthBucket: 'long', rating: 8.1 },
  
  // Sci-Fi
  { id: '16', title: 'Blade Runner 2049', year: 2017, runtime: 164, poster: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', genres: ['Sci-Fi', 'Drama'], lengthBucket: 'long', rating: 8.0 },
  { id: '17', title: 'Arrival', year: 2016, runtime: 116, poster: 'https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg', genres: ['Sci-Fi', 'Drama'], lengthBucket: 'medium', rating: 7.9 },
  { id: '18', title: 'Ex Machina', year: 2014, runtime: 108, poster: 'https://image.tmdb.org/t/p/w500/9goPE2IoMIXxTLWzl7aizwuIiLh.jpg', genres: ['Sci-Fi', 'Thriller'], lengthBucket: 'medium', rating: 7.7 },
  
  // Fantasy
  { id: '19', title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001, runtime: 178, poster: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg', genres: ['Fantasy', 'Academy Award Winners'], lengthBucket: 'long', rating: 8.8 },
  { id: '20', title: 'Pan\'s Labyrinth', year: 2006, runtime: 118, poster: 'https://image.tmdb.org/t/p/w500/iE6yvVMUtC1p1gQF5vWXP6dnXpN.jpg', genres: ['Fantasy', 'Drama'], lengthBucket: 'medium', rating: 8.2 },
  { id: '21', title: 'Spirited Away', year: 2001, runtime: 125, poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', genres: ['Fantasy', 'Animated', 'Academy Award Winners'], lengthBucket: 'medium', rating: 8.6 },
  
  // Horror
  { id: '22', title: 'Get Out', year: 2017, runtime: 104, poster: 'https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg', genres: ['Horror', 'Thriller'], lengthBucket: 'medium', rating: 7.7 },
  { id: '23', title: 'Hereditary', year: 2018, runtime: 127, poster: 'https://image.tmdb.org/t/p/w500/p9fmuz2Oj3HtFJMJgJJN9MRb6H7.jpg', genres: ['Horror'], lengthBucket: 'medium', rating: 7.3 },
  { id: '24', title: 'A Quiet Place', year: 2018, runtime: 90, poster: 'https://image.tmdb.org/t/p/w500/nAU74GmpUk7t5iklEp3bufwDq4n.jpg', genres: ['Horror', 'Thriller'], lengthBucket: 'short', rating: 7.5 },
  
  // Western
  { id: '25', title: 'No Country for Old Men', year: 2007, runtime: 122, poster: 'https://image.tmdb.org/t/p/w500/bj1v6YKF8yHqA489VFfnQvOJpnc.jpg', genres: ['Western', 'Thriller', 'Academy Award Winners'], lengthBucket: 'medium', rating: 8.1 },
  { id: '26', title: 'True Grit', year: 2010, runtime: 110, poster: 'https://image.tmdb.org/t/p/w500/fV6mZYKxRuQyLN95jbP5nFvQNvy.jpg', genres: ['Western'], lengthBucket: 'medium', rating: 7.6 },
  { id: '27', title: 'The Hateful Eight', year: 2015, runtime: 168, poster: 'https://image.tmdb.org/t/p/w500/jIywvdPjia2t3eKYbjVTcwBQlG8.jpg', genres: ['Western', 'Thriller'], lengthBucket: 'long', rating: 7.8 },
  
  // 80s
  { id: '28', title: 'The Breakfast Club', year: 1985, runtime: 97, poster: 'https://image.tmdb.org/t/p/w500/wUBSWMSLLBpuLwqcOWRkTYNvmzE.jpg', genres: ['80s', 'Drama', 'Comedy'], lengthBucket: 'short', rating: 7.8 },
  { id: '29', title: 'Back to the Future', year: 1985, runtime: 116, poster: 'https://image.tmdb.org/t/p/w500/7lyBcpYB0Qt8gYhZ4ZVJ6EF49Ar.jpg', genres: ['80s', 'Sci-Fi', 'Comedy'], lengthBucket: 'medium', rating: 8.5 },
  { id: '30', title: 'Blade Runner', year: 1982, runtime: 117, poster: 'https://image.tmdb.org/t/p/w500/78lPtwv72eTNqFW9COBYI0dWDJa.jpg', genres: ['80s', 'Sci-Fi'], lengthBucket: 'medium', rating: 8.1 },
  
  // 90s
  { id: '31', title: 'Pulp Fiction', year: 1994, runtime: 154, poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', genres: ['90s', 'Crime', 'Cult Classics'], lengthBucket: 'long', rating: 8.9 },
  { id: '32', title: 'The Matrix', year: 1999, runtime: 136, poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', genres: ['90s', 'Sci-Fi', 'Action'], lengthBucket: 'medium', rating: 8.7 },
  { id: '33', title: 'Goodfellas', year: 1990, runtime: 145, poster: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg', genres: ['90s', 'Crime', 'Drama'], lengthBucket: 'long', rating: 8.7 },
  
  // Animated
  { id: '34', title: 'WALL-E', year: 2008, runtime: 98, poster: 'https://image.tmdb.org/t/p/w500/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg', genres: ['Animated', 'Sci-Fi', 'Feel-good'], lengthBucket: 'short', rating: 8.4 },
  { id: '35', title: 'Inside Out', year: 2015, runtime: 95, poster: 'https://image.tmdb.org/t/p/w500/2H1TmgdfNtsKlU9jKdeNyYL5y8T.jpg', genres: ['Animated', 'Comedy', 'Feel-good'], lengthBucket: 'short', rating: 8.1 },
  { id: '36', title: 'Spider-Man: Into the Spider-Verse', year: 2018, runtime: 117, poster: 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg', genres: ['Animated', 'Action', 'Academy Award Winners'], lengthBucket: 'medium', rating: 8.4 },
  
  // Documentary
  { id: '37', title: 'Free Solo', year: 2018, runtime: 100, poster: 'https://image.tmdb.org/t/p/w500/yj9XLJ7VC5mJH8D0Pqu6LKe6qR6.jpg', genres: ['Documentary', 'Academy Award Winners'], lengthBucket: 'medium', rating: 8.2 },
  { id: '38', title: 'Won\'t You Be My Neighbor?', year: 2018, runtime: 94, poster: 'https://image.tmdb.org/t/p/w500/4VtEUuS1JR7hbYn7oLIBKPQUuZK.jpg', genres: ['Documentary', 'Feel-good'], lengthBucket: 'short', rating: 8.4 },
  { id: '39', title: 'Jiro Dreams of Sushi', year: 2011, runtime: 81, poster: 'https://image.tmdb.org/t/p/w500/kL5cNuSDRV5tGYJ7yN9J8Xw3Nwc.jpg', genres: ['Documentary'], lengthBucket: 'short', rating: 7.9 },
  
  // Feel-good
  { id: '40', title: 'The Secret Life of Walter Mitty', year: 2013, runtime: 114, poster: 'https://image.tmdb.org/t/p/w500/b0Em5W8bSJSLemvqF3YhRGcIgyJ.jpg', genres: ['Feel-good', 'Comedy', 'Drama'], lengthBucket: 'medium', rating: 7.3 },
  { id: '41', title: 'About Time', year: 2013, runtime: 123, poster: 'https://image.tmdb.org/t/p/w500/xRTeZmFJeEPH8N92z8M1JJV36oT.jpg', genres: ['Feel-good', 'Romance', 'Comedy'], lengthBucket: 'medium', rating: 7.8 },
  { id: '42', title: 'Chef', year: 2014, runtime: 114, poster: 'https://image.tmdb.org/t/p/w500/gJr1AkvhVZgk9OljqxCdRLjzuJf.jpg', genres: ['Feel-good', 'Comedy'], lengthBucket: 'medium', rating: 7.3 },
  
  // Cult Classics
  { id: '43', title: 'The Big Lebowski', year: 1998, runtime: 117, poster: 'https://image.tmdb.org/t/p/w500/1N5jH7A7zv4FwKTtCvxQZ6P3bxd.jpg', genres: ['Cult Classics', 'Comedy', '90s'], lengthBucket: 'medium', rating: 8.1 },
  { id: '44', title: 'Fight Club', year: 1999, runtime: 139, poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', genres: ['Cult Classics', 'Drama', '90s'], lengthBucket: 'medium', rating: 8.8 },
  { id: '45', title: 'Donnie Darko', year: 2001, runtime: 113, poster: 'https://image.tmdb.org/t/p/w500/fhQoQfejY1hUcwyuLgpBrYs6uFt.jpg', genres: ['Cult Classics', 'Thriller', 'Sci-Fi'], lengthBucket: 'medium', rating: 8.0 },
  
  // More variety
  { id: '46', title: 'Inception', year: 2010, runtime: 148, poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', genres: ['Sci-Fi', 'Action', 'Thriller'], lengthBucket: 'long', rating: 8.8 },
  { id: '47', title: 'The Prestige', year: 2006, runtime: 130, poster: 'https://image.tmdb.org/t/p/w500/tRNlZbgNCNOpLpbPEz5L8G8A0JN.jpg', genres: ['Thriller', 'Drama'], lengthBucket: 'medium', rating: 8.5 },
  { id: '48', title: 'Interstellar', year: 2014, runtime: 169, poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', genres: ['Sci-Fi', 'Drama'], lengthBucket: 'long', rating: 8.6 },
  { id: '49', title: 'Her', year: 2013, runtime: 126, poster: 'https://image.tmdb.org/t/p/w500/lEIaL12hSkqqe83kgADkbUqEnvk.jpg', genres: ['Romance', 'Sci-Fi', 'Drama'], lengthBucket: 'medium', rating: 8.0 },
  { id: '50', title: 'Casino Royale', year: 2006, runtime: 144, poster: 'https://image.tmdb.org/t/p/w500/3jTc3gPMEqZPUe9iCWaHly6nqeY.jpg', genres: ['Action', 'Thriller'], lengthBucket: 'long', rating: 8.0 },
  { id: '51', title: 'Drive', year: 2011, runtime: 100, poster: 'https://image.tmdb.org/t/p/w500/3MJUXPyaHnH2nCmRAFLJFp64NpP.jpg', genres: ['Action', 'Drama', 'Cult Classics'], lengthBucket: 'medium', rating: 7.8 },
  { id: '52', title: 'The Social Network', year: 2010, runtime: 120, poster: 'https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg', genres: ['Drama'], lengthBucket: 'medium', rating: 7.7 },
  { id: '53', title: 'A Beautiful Mind', year: 2001, runtime: 135, poster: 'https://image.tmdb.org/t/p/w500/5uz2wLXfhKD4W3OBqpLt9R6UtQj.jpg', genres: ['Drama', 'Academy Award Winners'], lengthBucket: 'medium', rating: 8.2 },
  { id: '54', title: 'Gladiator', year: 2000, runtime: 155, poster: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg', genres: ['Action', 'Drama', 'Academy Award Winners'], lengthBucket: 'long', rating: 8.5 },
  { id: '55', title: 'The Truman Show', year: 1998, runtime: 103, poster: 'https://image.tmdb.org/t/p/w500/vuza0WqY239yBXOadKlGwJsZJFE.jpg', genres: ['Drama', 'Sci-Fi', '90s'], lengthBucket: 'medium', rating: 8.1 },
  { id: '56', title: 'Little Miss Sunshine', year: 2006, runtime: 101, poster: 'https://image.tmdb.org/t/p/w500/50c0cg0kXsPz5c6K5LQjNhXCdoE.jpg', genres: ['Comedy', 'Drama', 'Feel-good'], lengthBucket: 'medium', rating: 7.8 },
  { id: '57', title: 'Hot Fuzz', year: 2007, runtime: 121, poster: 'https://image.tmdb.org/t/p/w500/zPib4ukTSdXvHP9pxGkFCe34f3y.jpg', genres: ['Comedy', 'Action', 'Cult Classics'], lengthBucket: 'medium', rating: 7.8 },
  { id: '58', title: 'Everything Everywhere All at Once', year: 2022, runtime: 139, poster: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg', genres: ['Sci-Fi', 'Comedy', 'Drama', 'Academy Award Winners'], lengthBucket: 'medium', rating: 7.8 },
  { id: '59', title: 'The Grand Budapest Hotel', year: 2014, runtime: 99, poster: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg', genres: ['Comedy', 'Drama'], lengthBucket: 'short', rating: 8.1 },
  { id: '60', title: 'Amélie', year: 2001, runtime: 122, poster: 'https://image.tmdb.org/t/p/w500/nSxDa3M9aMvGVLoItzWTepQ5h5d.jpg', genres: ['Romance', 'Comedy', 'Feel-good'], lengthBucket: 'medium', rating: 8.3 },
];

export class MoviesService {
  static async getMovies(
    genre?: Genre,
    lengthBucket?: LengthBucket,
    skip: number = 0,
    take: number = 10
  ): Promise<Movie[]> {
    console.log('[MOCK] Fetching movies:', { genre, lengthBucket, skip, take });
    
    // TODO: Replace with actual API call
    // const response = await api.get('/api/movies', { params: { genre, lengthBucket, skip, take } });
    // return response.data;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = MOCK_MOVIES;
        
        if (genre) {
          filtered = filtered.filter((m) => m.genres.includes(genre));
        }
        
        if (lengthBucket) {
          filtered = filtered.filter((m) => m.lengthBucket === lengthBucket);
        }
        
        const results = filtered.slice(skip, skip + take);
        resolve(results);
      }, 400);
    });
  }

  static async likeMovie(userId: string, movieId: string): Promise<void> {
    console.log('[MOCK] Liking movie:', { userId, movieId });
    
    // TODO: Replace with actual API call
    // await api.post('/api/movies/like', { userId, movieId });
    
    return Promise.resolve();
  }

  static async skipMovie(userId: string, movieId: string): Promise<void> {
    console.log('[MOCK] Skipping movie:', { userId, movieId });
    
    // TODO: Replace with actual API call
    // await api.post('/api/movies/skip', { userId, movieId });
    
    return Promise.resolve();
  }
}
