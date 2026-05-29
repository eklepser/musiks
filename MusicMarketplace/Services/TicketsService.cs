using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class TicketsService
    {
        private readonly MusicMarketplaceContext _context;
        public TicketsService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<TicketDto>> GetAllAsync()
        {
            var sql = "SELECT * FROM get_all_tickets()";
            return await _context.Database.SqlQueryRaw<TicketDto>(sql).ToListAsync();
        }

        public async Task<TicketDto?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM get_ticket_by_id({0})";
            return await _context.Database.SqlQueryRaw<TicketDto>(sql, id).FirstOrDefaultAsync();
        }

        public async Task<TicketDto> CreateAsync(TicketDto dto)
        {
            var genresJson = JsonSerializer.Serialize(dto.genreIds ?? new List<int>());
            var sql = "SELECT * FROM create_ticket({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7})";
            var raw = await _context.Database.SqlQueryRaw<TicketRawDto>(
                sql,
                dto.name, dto.price, dto.description, dto.stock,
                dto.manufacturer_id, dto.concert_id, dto.price_category, genresJson
            ).FirstOrDefaultAsync();

            if (raw == null) throw new Exception("Failed to create ticket");

            return new TicketDto
            {
                ticket_id = raw.ticket_id,
                product_id = raw.product_id,
                name = raw.name,
                price = raw.price,
                description = raw.description,
                stock = raw.stock,
                manufacturer_id = raw.manufacturer_id,
                concert_id = raw.concert_id,
                price_category = raw.price_category,
                genreIds = dto.genreIds
            };
        }

        public async Task<bool> UpdateAsync(int id, TicketDto dto)
        {
            var genresJson = JsonSerializer.Serialize(dto.genreIds ?? new List<int>());
            var sql = "SELECT update_ticket({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8})";
            var result = await _context.Database.ExecuteSqlRawAsync(
                sql,
                id,
                dto.name,
                dto.price,
                dto.description,
                dto.stock,
                dto.manufacturer_id,
                dto.concert_id,
                dto.price_category ?? (object)DBNull.Value,
                genresJson
            );
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "SELECT delete_ticket({0})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, id);
            return result > 0;
        }
    }
}