using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class GenresService
    {
        private readonly MusicMarketplaceContext _context;
        public GenresService(MusicMarketplaceContext context) => _context = context;

        public class GenreDto
        {
            public int genre_id { get; set; }
            public string name { get; set; }
            public string description { get; set; }
        }

        public async Task<List<Genre>> GetAllAsync()
        {
            return await _context.Genres.ToListAsync();
        }

        public async Task<Genre?> GetByIdAsync(int id)
        {
            return await _context.Genres.FindAsync(id);
        }

        public async Task<Genre> CreateAsync(GenreDto dto)
        {
            if (await _context.Genres.AnyAsync(g => g.name == dto.name))
                throw new InvalidOperationException("Жанр с таким названием уже существует");

            var genre = new Genre
            {
                name = dto.name,
                description = dto.description
            };
            _context.Genres.Add(genre);
            await _context.SaveChangesAsync();
            return genre;
        }

        public async Task UpdateAsync(int id, GenreDto dto)
        {
            if (id != dto.genre_id) throw new ArgumentException("ID mismatch");

            var genre = await _context.Genres.FindAsync(id);
            if (genre == null) throw new KeyNotFoundException($"Genre with id {id} not found");

            if (await _context.Genres.AnyAsync(g => g.name == dto.name && g.genre_id != id))
                throw new InvalidOperationException("Жанр с таким названием уже существует");

            genre.name = dto.name;
            genre.description = dto.description;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var genre = await _context.Genres.FindAsync(id);
            if (genre == null) throw new KeyNotFoundException($"Genre with id {id} not found");
            _context.Genres.Remove(genre);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Genre>> GetFilteredAsync(string? searchName, string? sortBy)
        {
            var query = _context.Genres.AsQueryable();

            if (!string.IsNullOrEmpty(searchName))
                query = query.Where(g => g.name.ToLower().Contains(searchName.ToLower()));

            query = sortBy switch
            {
                "name_asc" => query.OrderBy(g => g.name),
                "name_desc" => query.OrderByDescending(g => g.name),
                _ => query.OrderBy(g => g.genre_id)
            };

            return await query.ToListAsync();
        }

        public async Task<List<string>> GetNamesAsync()
        {
            return await _context.Genres.Select(g => g.name).ToListAsync();
        }
    }
}