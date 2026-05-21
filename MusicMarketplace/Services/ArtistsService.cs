using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;
namespace MusicMarketplace.Services
{
    public class ArtistsService
    {
        private readonly MusicMarketplaceContext _context;
        public ArtistsService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<ArtistDto>> GetAllAsync()
        {
            var sql = "SELECT * FROM get_all_artists()";
            return await _context.Database.SqlQueryRaw<ArtistDto>(sql).ToListAsync();
        }

        public async Task<ArtistDto?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM get_artist_by_id({0})";
            return await _context.Database.SqlQueryRaw<ArtistDto>(sql, id).FirstOrDefaultAsync();
        }

        public async Task<Artist> CreateAsync(ArtistDto dto)
        {
            var sql = "SELECT * FROM create_artist({0}, {1}, {2}, {3})";
            var result = await _context.Set<Artist>().FromSqlRaw(
                sql,
                dto.name,
                dto.country ?? (object)DBNull.Value,
                dto.debut_year ?? (object)DBNull.Value,
                dto.language ?? (object)DBNull.Value
            ).FirstOrDefaultAsync();
            return result;
        }

        public async Task<bool> UpdateAsync(int id, ArtistDto dto)
        {
            var sql = "SELECT update_artist({0}, {1}, {2}, {3}, {4})";
            var result = await _context.Database.ExecuteSqlRawAsync(
                sql,
                id,
                dto.name,
                dto.country ?? (object)DBNull.Value,
                dto.debut_year ?? (object)DBNull.Value,
                dto.language ?? (object)DBNull.Value
            );
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "SELECT delete_artist({0})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, id);
            return result > 0;
        }

        public async Task<List<ArtistDto>> GetFilteredAsync(string? searchName, string? searchCountry, string? searchLanguage, string? sortBy)
        {
            var sql = "SELECT * FROM get_filtered_artists({0}, {1}, {2}, {3})";
            return await _context.Database.SqlQueryRaw<ArtistDto>(
                sql,
                searchName ?? (object)DBNull.Value,
                searchCountry ?? (object)DBNull.Value,
                searchLanguage ?? (object)DBNull.Value,
                sortBy ?? (object)DBNull.Value
            ).ToListAsync();
        }
    }
}