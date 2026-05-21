using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class OrdersService
    {
        private readonly MusicMarketplaceContext _context;
        public OrdersService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<Order>> GetAllAsync()
        {
            var sql = "SELECT * FROM get_all_orders()";
            return await _context.Database.SqlQueryRaw<Order>(sql).ToListAsync();
        }

        public async Task<Order?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM get_order_by_id({0})";
            return await _context.Database.SqlQueryRaw<Order>(sql, id).FirstOrDefaultAsync();
        }

        public async Task<List<OrderDto>> GetByUserAsync(int userId)
        {
            var sql = "SELECT * FROM get_orders_by_user({0})";
            return await _context.Database.SqlQueryRaw<OrderDto>(sql, userId).ToListAsync();
        }

        public async Task<List<OrderWithItemsDto>> GetOrdersWithItemsAsync(int userId)
        {
            var sql = "SELECT * FROM get_orders_with_items({0})";
            return await _context.Database.SqlQueryRaw<OrderWithItemsDto>(sql, userId).ToListAsync();
        }

        public async Task<Order> CreateAsync(OrderDto dto)
        {
            var sql = "SELECT * FROM create_order({0}, {1}, {2}, {3})";
            return await _context.Database.SqlQueryRaw<Order>(
                sql,
                dto.user_id,
                dto.order_date,
                dto.status ?? (object)DBNull.Value,
                dto.total_amount
            ).FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateAsync(int id, OrderDto dto)
        {
            var sql = "SELECT update_order({0}, {1}, {2}, {3}, {4})";
            var result = await _context.Database.ExecuteSqlRawAsync(
                sql,
                id,
                dto.user_id,
                dto.order_date,
                dto.status ?? (object)DBNull.Value,
                dto.total_amount
            );
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "SELECT delete_order({0})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, id);
            return result > 0;
        }
    }
}