using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class OrderItemsService
    {
        private readonly MusicMarketplaceContext _context;
        public OrderItemsService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<OrderItem>> GetAllAsync()
        {
            var sql = "SELECT * FROM get_all_order_items()";
            return await _context.Database.SqlQueryRaw<OrderItem>(sql).ToListAsync();
        }

        public async Task<OrderItem?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM get_order_item_by_id({0})";
            return await _context.Database.SqlQueryRaw<OrderItem>(sql, id).FirstOrDefaultAsync();
        }

        public async Task<OrderItem> CreateAsync(OrderItem orderItem)
        {
            var sql = "SELECT * FROM create_order_item({0}, {1}, {2}, {3})";
            return await _context.Database.SqlQueryRaw<OrderItem>(
                sql,
                orderItem.order_id,
                orderItem.product_id,
                orderItem.quantity,
                orderItem.unit_price
            ).FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateAsync(int id, OrderItem orderItem)
        {
            var sql = "SELECT update_order_item({0}, {1}, {2}, {3}, {4})";
            var result = await _context.Database.ExecuteSqlRawAsync(
                sql,
                id,
                orderItem.order_id,
                orderItem.product_id,
                orderItem.quantity,
                orderItem.unit_price
            );
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "SELECT delete_order_item({0})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, id);
            return result > 0;
        }

        public async Task<List<OrderItemDto>> GetByOrderAsync(int orderId)
        {
            var sql = "SELECT * FROM get_order_items_by_order({0})";
            var result = await _context.Database.SqlQueryRaw<OrderItemDto>(sql, orderId).ToListAsync();
            if (result == null || !result.Any())
                throw new KeyNotFoundException($"OrderItems for order {orderId} not found");
            return result;
        }
    }
}