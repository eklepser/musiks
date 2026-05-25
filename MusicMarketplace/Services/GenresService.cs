using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class GenresService
    {
        private readonly MusicMarketplaceContext _context;
        public GenresService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<Genre>> GetAllAsync()
        {
            var sql = "SELECT * FROM get_all_genres()";
            return await _context.Set<Genre>().FromSqlRaw(sql).ToListAsync();
        }

        public async Task<Genre?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM get_genre_by_id({0})";
            return await _context.Set<Genre>().FromSqlRaw(sql, id).FirstOrDefaultAsync();
        }

        public async Task<Genre> CreateAsync(GenreDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.name))
                throw new ArgumentException("Название жанра обязательно");

            var exists = await _context.Genres.AnyAsync(g => g.name == dto.name.Trim());
            if (exists)
                throw new InvalidOperationException($"Жанр с названием '{dto.name}' уже существует");

            var sql = "SELECT * FROM create_genre({0}, {1})";
            var result = await _context.Set<Genre>().FromSqlRaw(
                sql,
                dto.name.Trim(),
                string.IsNullOrWhiteSpace(dto.description) ? null : dto.description.Trim()
            ).FirstOrDefaultAsync();
            return result;
        }

        public async Task<bool> UpdateAsync(int id, GenreDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.name))
                throw new ArgumentException("Название жанра обязательно");

            var existing = await _context.Genres.FindAsync(id);
            if (existing == null)
                throw new KeyNotFoundException($"Жанр с ID {id} не найден");

            var conflict = await _context.Genres.AnyAsync(g => g.name == dto.name.Trim() && g.genre_id != id);
            if (conflict)
                throw new InvalidOperationException($"Жанр с названием '{dto.name}' уже существует");

            var sql = "SELECT update_genre({0}, {1}, {2})";
            var result = await _context.Database.ExecuteSqlRawAsync(
                sql,
                id,
                dto.name.Trim(),
                string.IsNullOrWhiteSpace(dto.description) ? null : dto.description.Trim()
            );
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var genre = await _context.Genres.FindAsync(id);
            if (genre == null)
                throw new KeyNotFoundException($"Жанр с ID {id} не найден");

            var hasProducts = await _context.ProductGenres.AnyAsync(pg => pg.genre_id == id);
            if (hasProducts)
                throw new InvalidOperationException("Невозможно удалить жанр, так как он используется в товарах");

            var sql = "SELECT delete_genre({0})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, id);
            return result > 0;
        }

        public async Task<List<Genre>> GetFilteredAsync(string? searchName, string? sortBy)
        {
            var sql = "SELECT * FROM get_filtered_genres({0}, {1})";
            return await _context.Set<Genre>().FromSqlRaw(
                sql,
                searchName ?? (object)DBNull.Value,
                sortBy ?? (object)DBNull.Value
            ).ToListAsync();
        }

        public async Task<List<string>> GetNamesAsync()
        {
            var sql = "SELECT * FROM get_genre_names()";
            var result = await _context.Database.SqlQueryRaw<GenreNameResult>(sql).ToListAsync();
            return result.Select(r => r.name).ToList();
        }

        private class GenreNameResult { public string name { get; set; } }
    }
}