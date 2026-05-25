// TicketsService.cs
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
            var sql = "SELECT * FROM create_ticket({0}, {1}, {2}, {3}, {4}, {5}, {6})";
            return await _context.Database.SqlQueryRaw<TicketDto>(
                sql,
                dto.name,
                dto.price,
                dto.description ?? (object)DBNull.Value,
                dto.stock,
                dto.manufacturer_id,
                dto.concert_id,
                dto.price_category ?? (object)DBNull.Value
            ).FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateAsync(int id, TicketDto dto)
        {
            var sql = "SELECT update_ticket({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7})";
            var result = await _context.Database.ExecuteSqlRawAsync(
                sql,
                id,
                dto.name,
                dto.price,
                dto.description ?? (object)DBNull.Value,
                dto.stock,
                dto.manufacturer_id,
                dto.concert_id,
                dto.price_category ?? (object)DBNull.Value
            );
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var ticket = await _context.Tickets
                .Include(t => t.product)
                .FirstOrDefaultAsync(t => t.ticket_id == id);
            if (ticket == null)
                throw new KeyNotFoundException($"Билет с ID {id} не найден");
            var productId = ticket.product_id;
            var hasOrders = await _context.OrderItems.AnyAsync(oi => oi.product_id == productId);
            if (hasOrders)
                throw new InvalidOperationException("Нельзя удалить билет, который есть в заказах");
            var sql = "SELECT delete_ticket({0})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, id);
            return result > 0;
        }
    }
}