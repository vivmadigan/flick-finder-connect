import { Movie, Genre, LengthBucket } from '@/types';

// TODO: Replace with actual API calls to your ASP.NET Web API
// Endpoints:
// - GET /api/movies?genre={genre}&lengthBucket={lengthBucket}&skip={skip}&take={take}
// - GET /api/movies/{id}
// - POST /api/movies/like - { userId, movieId }
// - POST /api/movies/skip - { userId, movieId }

const MOCK_MOVIES: Movie[] = [
  // Action
  { id: '1', title: 'Mad Max: Fury Road', year: 2015, runtime: 120, poster: 'https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg', genres: ['Action', 'Sci-Fi'], lengthBucket: 'medium', rating: 8.1, synopsis: 'A post-apocalyptic chase through the desert wasteland.' },
  { id: '2', title: 'John Wick', year: 2014, runtime: 101, poster: 'https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg', genres: ['Action', 'Thriller'], lengthBucket: 'medium', rating: 7.4, synopsis: 'A retired hitman seeks vengeance for his stolen car and killed puppy.' },
  { id: '3', title: 'The Dark Knight', year: 2008, runtime: 152, poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', genres: ['Action', 'Drama'], lengthBucket: 'long', rating: 9.0, synopsis: 'Batman faces his greatest challenge against the anarchic Joker.' },
  
  // Comedy
  { id: '4', title: 'The Grand Budapest Hotel', year: 2014, runtime: 99, poster: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg', genres: ['Comedy'], lengthBucket: 'short', rating: 8.1, synopsis: 'A legendary concierge and his protégé at a famous European hotel.' },
  { id: '5', title: 'Superbad', year: 2007, runtime: 113, poster: 'https://image.tmdb.org/t/p/w500/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg', genres: ['Comedy'], lengthBucket: 'medium', rating: 7.6, synopsis: 'Two co-dependent high school seniors try to score before college.' },
  { id: '6', title: 'Knives Out', year: 2019, runtime: 130, poster: 'https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twj48Jq4.jpg', genres: ['Comedy', 'Thriller'], lengthBucket: 'medium', rating: 7.9, synopsis: 'A detective investigates the death of a patriarch of an eccentric family.' },
  
  // Drama
  { id: '7', title: 'The Shawshank Redemption', year: 1994, runtime: 142, poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', genres: ['Drama'], lengthBucket: 'long', rating: 9.3, synopsis: 'Two imprisoned men bond over years, finding redemption through compassion.' },
  { id: '8', title: 'Whiplash', year: 2014, runtime: 106, poster: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg', genres: ['Drama'], lengthBucket: 'medium', rating: 8.5, synopsis: 'A young drummer faces a ruthless music teacher at an elite conservatory.' },
  { id: '9', title: 'Moonlight', year: 2016, runtime: 111, poster: 'https://image.tmdb.org/t/p/w500/4911T5FbJ9eD2Faz5Z8L9eVEb5a.jpg', genres: ['Drama', 'Academy Award Winners'], lengthBucket: 'medium', rating: 7.4, synopsis: 'A young black man grapples with his identity and sexuality in Miami.' },
  
  // Romance
  { id: '10', title: 'La La Land', year: 2016, runtime: 128, poster: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg', genres: ['Romance', 'Drama'], lengthBucket: 'medium', rating: 8.0, synopsis: 'A jazz musician and an aspiring actress fall in love in Los Angeles.' },
  { id: '11', title: 'Before Sunrise', year: 1995, runtime: 101, poster: 'https://image.tmdb.org/t/p/w500/8lbHr7B7RbAW6F7Faz4c2yPXrFN.jpg', genres: ['Romance', '90s'], lengthBucket: 'medium', rating: 8.1, synopsis: 'Two strangers meet on a train and spend one night together in Vienna.' },
  { id: '12', title: 'Eternal Sunshine of the Spotless Mind', year: 2004, runtime: 108, poster: 'https://image.tmdb.org/t/p/w500/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg', genres: ['Romance', 'Sci-Fi'], lengthBucket: 'medium', rating: 8.3, synopsis: 'A couple undergoes a procedure to erase each other from their memories.' },
  
  // Thriller
  { id: '13', title: 'Parasite', year: 2019, runtime: 132, poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', genres: ['Thriller', 'Drama', 'Academy Award Winners'], lengthBucket: 'medium', rating: 8.5, synopsis: 'A poor family schemes to become employed by a wealthy household.' },
  { id: '14', title: 'Gone Girl', year: 2014, runtime: 149, poster: 'https://image.tmdb.org/t/p/w500/gdiLTof3rbPDAmPaCf4g6op46bj.jpg', genres: ['Thriller', 'Drama'], lengthBucket: 'long', rating: 8.1, synopsis: 'A husband becomes the prime suspect in his wife\'s disappearance.' },
  { id: '15', title: 'Prisoners', year: 2013, runtime: 153, poster: 'https://image.tmdb.org/t/p/w500/tuq4D9WriR6m3YP4BKGq8d0sTgz.jpg', genres: ['Thriller', 'Drama'], lengthBucket: 'long', rating: 8.1, synopsis: 'A father takes matters into his own hands when his daughter goes missing.' },
  
  // Sci-Fi
  { id: '16', title: 'Blade Runner 2049', year: 2017, runtime: 164, poster: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', genres: ['Sci-Fi', 'Drama'], lengthBucket: 'long', rating: 8.0, synopsis: 'A blade runner discovers a secret that could plunge society into chaos.' },
  { id: '17', title: 'Arrival', year: 2016, runtime: 116, poster: 'https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg', genres: ['Sci-Fi', 'Drama'], lengthBucket: 'medium', rating: 7.9, synopsis: 'A linguist is recruited to communicate with mysterious alien visitors.' },
  { id: '18', title: 'Ex Machina', year: 2014, runtime: 108, poster: 'https://image.tmdb.org/t/p/w500/9goPE2IoMIXxTLWzl7aizwuIiLh.jpg', genres: ['Sci-Fi', 'Thriller'], lengthBucket: 'medium', rating: 7.7, synopsis: 'A programmer evaluates the human qualities of a female AI.' },
  
  // Fantasy
  { id: '19', title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001, runtime: 178, poster: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg', genres: ['Fantasy', 'Academy Award Winners'], lengthBucket: 'long', rating: 8.8, synopsis: 'A hobbit embarks on a quest to destroy a powerful ring.' },
  { id: '20', title: 'Pan\'s Labyrinth', year: 2006, runtime: 118, poster: 'https://image.tmdb.org/t/p/w500/iE6yvVMUtC1p1gQF5vWXP6dnXpN.jpg', genres: ['Fantasy', 'Drama'], lengthBucket: 'medium', rating: 8.2, synopsis: 'A young girl escapes into a mythical labyrinth in post-war Spain.' },
  { id: '21', title: 'Spirited Away', year: 2001, runtime: 125, poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', genres: ['Fantasy', 'Animated', 'Academy Award Winners'], lengthBucket: 'medium', rating: 8.6, synopsis: 'A girl enters a magical world where she must save her parents.' },
  
  // Horror
  { id: '22', title: 'Get Out', year: 2017, runtime: 104, poster: 'https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg', genres: ['Horror', 'Thriller'], lengthBucket: 'medium', rating: 7.7, synopsis: 'A man uncovers a disturbing secret at his girlfriend\'s family estate.' },
  { id: '23', title: 'Hereditary', year: 2018, runtime: 127, poster: 'https://image.tmdb.org/t/p/w500/p9fmuz2Oj3HtFJMJgJJN9MRb6H7.jpg', genres: ['Horror'], lengthBucket: 'medium', rating: 7.3, synopsis: 'A family haunted by a mysterious presence after their grandmother dies.' },
  { id: '24', title: 'A Quiet Place', year: 2018, runtime: 90, poster: 'https://image.tmdb.org/t/p/w500/nAU74GmpUk7t5iklEp3bufwDq4n.jpg', genres: ['Horror', 'Thriller'], lengthBucket: 'short', rating: 7.5, synopsis: 'A family must live in silence to avoid mysterious creatures.' },
  
  // Western
  { id: '25', title: 'No Country for Old Men', year: 2007, runtime: 122, poster: 'https://image.tmdb.org/t/p/w500/bj1v6YKF8yHqA489VFfnQvOJpnc.jpg', genres: ['Western', 'Thriller', 'Academy Award Winners'], lengthBucket: 'medium', rating: 8.1, synopsis: 'A hunter becomes the hunted after stumbling upon drug money.' },
  { id: '26', title: 'True Grit', year: 2010, runtime: 110, poster: 'https://image.tmdb.org/t/p/w500/fV6mZYKxRuQyLN95jbP5nFvQNvy.jpg', genres: ['Western'], lengthBucket: 'medium', rating: 7.6, synopsis: 'A girl hires a U.S. Marshal to track down her father\'s killer.' },
  { id: '27', title: 'The Hateful Eight', year: 2015, runtime: 168, poster: 'https://image.tmdb.org/t/p/w500/jIywvdPjia2t3eKYbjVTcwBQlG8.jpg', genres: ['Western', 'Thriller'], lengthBucket: 'long', rating: 7.8, synopsis: 'Eight strangers seek refuge during a blizzard, but not all will survive.' },
  
  // 80s
  { id: '28', title: 'The Breakfast Club', year: 1985, runtime: 97, poster: 'https://image.tmdb.org/t/p/w500/wUBSWMSLLBpuLwqcOWRkTYNvmzE.jpg', genres: ['80s', 'Drama', 'Comedy'], lengthBucket: 'short', rating: 7.8, synopsis: 'Five high school students from different cliques spend a Saturday in detention.' },
  { id: '29', title: 'Back to the Future', year: 1985, runtime: 116, poster: 'https://image.tmdb.org/t/p/w500/7lyBcpYB0Qt8gYhZ4ZVJ6EF49Ar.jpg', genres: ['80s', 'Sci-Fi', 'Comedy'], lengthBucket: 'medium', rating: 8.5, synopsis: 'A teenager is accidentally sent 30 years into the past in a time machine.' },
  { id: '30', title: 'Blade Runner', year: 1982, runtime: 117, poster: 'https://image.tmdb.org/t/p/w500/78lPtwv72eTNqFW9COBYI0dWDJa.jpg', genres: ['80s', 'Sci-Fi'], lengthBucket: 'medium', rating: 8.1, synopsis: 'A blade runner must pursue and terminate four replicants in Los Angeles.' },
  
  // 90s
  { id: '31', title: 'Pulp Fiction', year: 1994, runtime: 154, poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', genres: ['90s', 'Crime', 'Cult Classics'], lengthBucket: 'long', rating: 8.9, synopsis: 'The lives of two hitmen, a boxer, and a gangster intertwine.' },
  { id: '32', title: 'The Matrix', year: 1999, runtime: 136, poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', genres: ['90s', 'Sci-Fi', 'Action'], lengthBucket: 'medium', rating: 8.7, synopsis: 'A hacker discovers reality is a simulated construct controlled by machines.' },
  { id: '33', title: 'Goodfellas', year: 1990, runtime: 145, poster: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg', genres: ['90s', 'Crime', 'Drama'], lengthBucket: 'long', rating: 8.7, synopsis: 'The rise and fall of a mob associate over three decades.' },
  
  // Animated
  { id: '34', title: 'WALL-E', year: 2008, runtime: 98, poster: 'https://image.tmdb.org/t/p/w500/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg', genres: ['Animated', 'Sci-Fi', 'Feel-good'], lengthBucket: 'short', rating: 8.4, synopsis: 'A waste-collecting robot inadvertently embarks on a space journey.' },
  { id: '35', title: 'Inside Out', year: 2015, runtime: 95, poster: 'https://image.tmdb.org/t/p/w500/2H1TmgdfNtsKlU9jKdeNyYL5y8T.jpg', genres: ['Animated', 'Comedy', 'Feel-good'], lengthBucket: 'short', rating: 8.1, synopsis: 'Five emotions guide a young girl through a difficult life transition.' },
  { id: '36', title: 'Spider-Man: Into the Spider-Verse', year: 2018, runtime: 117, poster: 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg', genres: ['Animated', 'Action', 'Academy Award Winners'], lengthBucket: 'medium', rating: 8.4, synopsis: 'A teen becomes Spider-Man and meets other Spider-People from parallel universes.' },
  
  // Documentary
  { id: '37', title: 'Free Solo', year: 2018, runtime: 100, poster: 'https://image.tmdb.org/t/p/w500/yj9XLJ7VC5mJH8D0Pqu6LKe6qR6.jpg', genres: ['Documentary', 'Academy Award Winners'], lengthBucket: 'medium', rating: 8.2, synopsis: 'A climber attempts to scale El Capitan without ropes or safety gear.' },
  { id: '38', title: 'Won\'t You Be My Neighbor?', year: 2018, runtime: 94, poster: 'https://image.tmdb.org/t/p/w500/4VtEUuS1JR7hbYn7oLIBKPQUuZK.jpg', genres: ['Documentary', 'Feel-good'], lengthBucket: 'short', rating: 8.4, synopsis: 'An intimate look at America\'s favorite neighbor, Mister Rogers.' },
  { id: '39', title: 'Jiro Dreams of Sushi', year: 2011, runtime: 81, poster: 'https://image.tmdb.org/t/p/w500/kL5cNuSDRV5tGYJ7yN9J8Xw3Nwc.jpg', genres: ['Documentary'], lengthBucket: 'short', rating: 7.9, synopsis: 'A portrait of Jiro Ono, an 85-year-old sushi master in Tokyo.' },
  
  // Feel-good
  { id: '40', title: 'The Secret Life of Walter Mitty', year: 2013, runtime: 114, poster: 'https://image.tmdb.org/t/p/w500/b0Em5W8bSJSLemvqF3YhRGcIgyJ.jpg', genres: ['Feel-good', 'Comedy', 'Drama'], lengthBucket: 'medium', rating: 7.3, synopsis: 'A daydreamer escapes his life through fantasies and finally takes real action.' },
  { id: '41', title: 'About Time', year: 2013, runtime: 123, poster: 'https://image.tmdb.org/t/p/w500/xRTeZmFJeEPH8N92z8M1JJV36oT.jpg', genres: ['Feel-good', 'Romance', 'Comedy'], lengthBucket: 'medium', rating: 7.8, synopsis: 'A man discovers he can travel in time and uses it to improve his life.' },
  { id: '42', title: 'Chef', year: 2014, runtime: 114, poster: 'https://image.tmdb.org/t/p/w500/gJr1AkvhVZgk9OljqxCdRLjzuJf.jpg', genres: ['Feel-good', 'Comedy'], lengthBucket: 'medium', rating: 7.3, synopsis: 'A chef who loses his restaurant job starts a food truck with his son.' },
  
  // Cult Classics
  { id: '43', title: 'The Big Lebowski', year: 1998, runtime: 117, poster: 'https://image.tmdb.org/t/p/w500/1N5jH7A7zv4FwKTtCvxQZ6P3bxd.jpg', genres: ['Cult Classics', 'Comedy', '90s'], lengthBucket: 'medium', rating: 8.1, synopsis: 'The Dude is mistaken for a millionaire and gets caught in a kidnapping plot.' },
  { id: '44', title: 'Fight Club', year: 1999, runtime: 139, poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', genres: ['Cult Classics', 'Drama', '90s'], lengthBucket: 'medium', rating: 8.8, synopsis: 'An insomniac and a soap salesman form an underground fight club.' },
  { id: '45', title: 'Donnie Darko', year: 2001, runtime: 113, poster: 'https://image.tmdb.org/t/p/w500/fhQoQfejY1hUcwyuLgpBrYs6uFt.jpg', genres: ['Cult Classics', 'Thriller', 'Sci-Fi'], lengthBucket: 'medium', rating: 8.0, synopsis: 'A troubled teenager has visions of a man in a rabbit suit.' },
  
  // More variety
  { id: '46', title: 'Inception', year: 2010, runtime: 148, poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', genres: ['Sci-Fi', 'Action', 'Thriller'], lengthBucket: 'long', rating: 8.8, synopsis: 'A thief who steals secrets through dreams is given a final job.' },
  { id: '47', title: 'The Prestige', year: 2006, runtime: 130, poster: 'https://image.tmdb.org/t/p/w500/tRNlZbgNCNOpLpbPEz5L8G8A0JN.jpg', genres: ['Thriller', 'Drama'], lengthBucket: 'medium', rating: 8.5, synopsis: 'Two magicians engage in a bitter rivalry with dangerous consequences.' },
  { id: '48', title: 'Interstellar', year: 2014, runtime: 169, poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', genres: ['Sci-Fi', 'Drama'], lengthBucket: 'long', rating: 8.6, synopsis: 'A team travels through a wormhole to find a new home for humanity.' },
  { id: '49', title: 'Her', year: 2013, runtime: 126, poster: 'https://image.tmdb.org/t/p/w500/lEIaL12hSkqqe83kgADkbUqEnvk.jpg', genres: ['Romance', 'Sci-Fi', 'Drama'], lengthBucket: 'medium', rating: 8.0, synopsis: 'A lonely writer develops a relationship with an AI operating system.' },
  { id: '50', title: 'Casino Royale', year: 2006, runtime: 144, poster: 'https://image.tmdb.org/t/p/w500/3jTc3gPMEqZPUe9iCWaHly6nqeY.jpg', genres: ['Action', 'Thriller'], lengthBucket: 'long', rating: 8.0, synopsis: 'James Bond\'s first mission as 007 leads him to a high-stakes poker game.' },
  { id: '51', title: 'Drive', year: 2011, runtime: 100, poster: 'https://image.tmdb.org/t/p/w500/3MJUXPyaHnH2nCmRAFLJFp64NpP.jpg', genres: ['Action', 'Drama', 'Cult Classics'], lengthBucket: 'medium', rating: 7.8, synopsis: 'A Hollywood stunt driver moonlights as a getaway driver.' },
  { id: '52', title: 'The Social Network', year: 2010, runtime: 120, poster: 'https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg', genres: ['Drama'], lengthBucket: 'medium', rating: 7.7, synopsis: 'The founding of Facebook and the lawsuits that followed.' },
  { id: '53', title: 'A Beautiful Mind', year: 2001, runtime: 135, poster: 'https://image.tmdb.org/t/p/w500/5uz2wLXfhKD4W3OBqpLt9R6UtQj.jpg', genres: ['Drama', 'Academy Award Winners'], lengthBucket: 'medium', rating: 8.2, synopsis: 'A brilliant mathematician struggles with schizophrenia.' },
  { id: '54', title: 'Gladiator', year: 2000, runtime: 155, poster: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg', genres: ['Action', 'Drama', 'Academy Award Winners'], lengthBucket: 'long', rating: 8.5, synopsis: 'A betrayed Roman general seeks revenge as a gladiator.' },
  { id: '55', title: 'The Truman Show', year: 1998, runtime: 103, poster: 'https://image.tmdb.org/t/p/w500/vuza0WqY239yBXOadKlGwJsZJFE.jpg', genres: ['Drama', 'Sci-Fi', '90s'], lengthBucket: 'medium', rating: 8.1, synopsis: 'A man discovers his entire life is a reality TV show.' },
  { id: '56', title: 'Little Miss Sunshine', year: 2006, runtime: 101, poster: 'https://image.tmdb.org/t/p/w500/50c0cg0kXsPz5c6K5LQjNhXCdoE.jpg', genres: ['Comedy', 'Drama', 'Feel-good'], lengthBucket: 'medium', rating: 7.8, synopsis: 'A dysfunctional family road trip to a child beauty pageant.' },
  { id: '57', title: 'Hot Fuzz', year: 2007, runtime: 121, poster: 'https://image.tmdb.org/t/p/w500/zPib4ukTSdXvHP9pxGkFCe34f3y.jpg', genres: ['Comedy', 'Action', 'Cult Classics'], lengthBucket: 'medium', rating: 7.8, synopsis: 'A top London cop is transferred to a seemingly peaceful village.' },
  { id: '58', title: 'Everything Everywhere All at Once', year: 2022, runtime: 139, poster: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg', genres: ['Sci-Fi', 'Comedy', 'Drama', 'Academy Award Winners'], lengthBucket: 'medium', rating: 7.8, synopsis: 'A woman must connect with parallel universe versions of herself.' },
  { id: '59', title: 'The Grand Budapest Hotel', year: 2014, runtime: 99, poster: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg', genres: ['Comedy', 'Drama'], lengthBucket: 'short', rating: 8.1, synopsis: 'A legendary concierge and his protégé at a famous European hotel.' },
  { id: '60', title: 'Amélie', year: 2001, runtime: 122, poster: 'https://image.tmdb.org/t/p/w500/nSxDa3M9aMvGVLoItzWTepQ5h5d.jpg', genres: ['Romance', 'Comedy', 'Feel-good'], lengthBucket: 'medium', rating: 8.3, synopsis: 'A shy waitress decides to change the lives of those around her.' },
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
