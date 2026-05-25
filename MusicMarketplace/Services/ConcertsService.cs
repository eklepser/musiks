using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class ConcertsService
    {
        private readonly MusicMarketplaceContext _context;
        public ConcertsService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<Concert>> GetAllAsync()
        {
            var sql = "SELECT * FROM get_all_concerts()";
            return await _context.Set<Concert>().FromSqlRaw(sql).ToListAsync();
        }

        public async Task<Concert?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM get_concert_by_id({0})";
            return await _context.Set<Concert>().FromSqlRaw(sql, id).FirstOrDefaultAsync();
        }

        public async Task<List<ConcertFilterResult>> GetFilteredAsync(
            string? searchTitle, string? searchVenue, string? status, int? artistId, string? sortBy)
        {
            var sql = "SELECT * FROM get_filtered_concerts({0}, {1}, {2}, {3}, {4})";
            return await _context.Database.SqlQueryRaw<ConcertFilterResult>(
                sql,
                searchTitle ?? (object)DBNull.Value,
                searchVenue ?? (object)DBNull.Value,
                status ?? (object)DBNull.Value,
                artistId ?? (object)DBNull.Value,
                sortBy ?? (object)DBNull.Value
            ).ToListAsync();
        }

        public async Task<List<ArtistFilterDto>> GetArtistsForFilterAsync()
        {
            var sql = "SELECT * FROM get_artists_for_concert_filter()";
            return await _context.Database.SqlQueryRaw<ArtistFilterDto>(sql).ToListAsync();
        }

        public async Task<Concert> CreateAsync(ConcertDto dto)
        {
            var json = JsonSerializer.Serialize(dto.artistIds ?? new List<int>());
            var sql = "SELECT * FROM create_concert({0}, {1}, {2}::timestamp, {3})";
            var result = await _context.Set<Concert>().FromSqlRaw(
                sql,
                dto.title,
                dto.venue,
                dto.datetime,
                json
            ).FirstOrDefaultAsync();
            return result;
        }

        public async Task<bool> UpdateAsync(int id, ConcertDto dto)
        {
            var json = JsonSerializer.Serialize(dto.artistIds ?? new List<int>());
            var sql = "SELECT update_concert({0}, {1}, {2}, {3}::timestamp, {4}) ";
            var result = await _context.Database.ExecuteSqlRawAsync(
                sql,
                id,
                dto.title,
                dto.venue,
                dto.datetime,
                json
            );
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "SELECT delete_concert({0})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, id);
            return result > 0;
        }
    }
}