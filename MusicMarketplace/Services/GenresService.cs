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
            var sql = "SELECT * FROM create_genre({0}, {1})";
            var result = await _context.Set<Genre>().FromSqlRaw(
                sql,
                dto.name,
                dto.description ?? (object)DBNull.Value
            ).FirstOrDefaultAsync();
            return result;
        }

        public async Task<bool> UpdateAsync(int id, GenreDto dto)
        {
            var sql = "SELECT update_genre({0}, {1}, {2})";
            var result = await _context.Database.ExecuteSqlRawAsync(
                sql,
                id,
                dto.name,
                dto.description ?? (object)DBNull.Value
            );
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
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
    }

    public class GenreNameResult
    {
        public string name { get; set; }
    }
}