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
            if (string.IsNullOrWhiteSpace(dto.title))
                throw new ArgumentException("Название концерта обязательно");
            if (string.IsNullOrWhiteSpace(dto.venue))
                throw new ArgumentException("Место проведения обязательно");
            if (dto.datetime == default)
                throw new ArgumentException("Дата и время обязательны");

            var exists = await _context.Concerts.AnyAsync(c =>
                c.title == dto.title.Trim() &&
                c.venue == dto.venue.Trim() &&
                c.datetime == dto.datetime);
            if (exists)
                throw new InvalidOperationException($"Концерт '{dto.title}' в '{dto.venue}' на {dto.datetime} уже существует");

            var json = JsonSerializer.Serialize(dto.artistIds ?? new List<int>());
            var sql = "SELECT * FROM create_concert({0}, {1}, {2}::timestamp, {3})";
            var result = await _context.Set<Concert>().FromSqlRaw(
                sql,
                dto.title.Trim(),
                dto.venue.Trim(),
                dto.datetime,
                json
            ).FirstOrDefaultAsync();
            return result;
        }

        public async Task<bool> UpdateAsync(int id, ConcertDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.title))
                throw new ArgumentException("Название концерта обязательно");
            if (string.IsNullOrWhiteSpace(dto.venue))
                throw new ArgumentException("Место проведения обязательно");
            if (dto.datetime == default)
                throw new ArgumentException("Дата и время обязательны");

            var existing = await _context.Concerts.FindAsync(id);
            if (existing == null)
                throw new KeyNotFoundException($"Концерт с ID {id} не найден");

            var conflict = await _context.Concerts.AnyAsync(c =>
                c.title == dto.title.Trim() &&
                c.venue == dto.venue.Trim() &&
                c.datetime == dto.datetime &&
                c.concert_id != id);
            if (conflict)
                throw new InvalidOperationException($"Концерт '{dto.title}' в '{dto.venue}' на {dto.datetime} уже существует");

            var json = JsonSerializer.Serialize(dto.artistIds ?? new List<int>());
            var datetimeParam = DateTime.SpecifyKind(dto.datetime, DateTimeKind.Unspecified);
            var sql = "SELECT update_concert({0}, {1}, {2}, {3}::timestamp, {4})";
            var result = await _context.Database.ExecuteSqlRawAsync(
                sql,
                id,
                dto.title.Trim(),
                dto.venue.Trim(),
                datetimeParam,
                json
            );
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var concert = await _context.Concerts.FindAsync(id);
            if (concert == null)
                throw new KeyNotFoundException($"Концерт с ID {id} не найден");

            var hasTickets = await _context.Tickets.AnyAsync(t => t.concert_id == id);
            if (hasTickets)
                throw new InvalidOperationException("Невозможно удалить концерт, так как существуют связанные билеты");

            var sql = "SELECT delete_concert({0})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, id);
            return result > 0;
        }
    }
}