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
            if (string.IsNullOrWhiteSpace(dto.name))
                throw new ArgumentException("Имя исполнителя обязательно");

            var exists = await _context.Artists.AnyAsync(a => a.name == dto.name.Trim());
            if (exists)
                throw new InvalidOperationException($"Исполнитель с именем '{dto.name}' уже существует");

            var sql = "SELECT * FROM create_artist({0}, {1}, {2}, {3})";
            var result = await _context.Set<Artist>().FromSqlRaw(
                sql,
                dto.name.Trim(),
                string.IsNullOrWhiteSpace(dto.country) ? null : dto.country.Trim(),
                dto.debut_year,
                string.IsNullOrWhiteSpace(dto.language) ? null : dto.language.Trim()
            ).FirstOrDefaultAsync();
            return result;
        }

        public async Task<bool> UpdateAsync(int id, ArtistDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.name))
                throw new ArgumentException("Имя исполнителя обязательно");

            var existing = await _context.Artists.FindAsync(id);
            if (existing == null)
                throw new KeyNotFoundException($"Исполнитель с ID {id} не найден");

            var conflict = await _context.Artists.AnyAsync(a => a.name == dto.name.Trim() && a.artist_id != id);
            if (conflict)
                throw new InvalidOperationException($"Исполнитель с именем '{dto.name}' уже существует");

            var sql = "SELECT update_artist({0}, {1}, {2}, {3}, {4})";
            var result = await _context.Database.ExecuteSqlRawAsync(
                sql,
                id,
                dto.name.Trim(),
                string.IsNullOrWhiteSpace(dto.country) ? null : dto.country.Trim(),
                dto.debut_year,
                string.IsNullOrWhiteSpace(dto.language) ? null : dto.language.Trim()
            );
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var artist = await _context.Artists.FindAsync(id);
            if (artist == null)
                throw new KeyNotFoundException($"Исполнитель с ID {id} не найден");

            var hasConcerts = await _context.ArtistConcerts.AnyAsync(ac => ac.artist_id == id);
            var hasMerch = await _context.ArtistMerches.AnyAsync(am => am.artist_id == id);
            if (hasConcerts || hasMerch)
                throw new InvalidOperationException("Невозможно удалить исполнителя, так как он связан с концертами или товарами");

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