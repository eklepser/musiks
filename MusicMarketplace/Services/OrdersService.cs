using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;
using MusicMarketplace.Services;

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

        public async Task<List<OrderWithItemsDto>> GetFilteredOrdersWithItemsAsync(int userId, string? status, DateTime? dateFrom, DateTime? dateTo, string? sortBy)
        {
            var sql = "SELECT * FROM get_filtered_orders_with_items({0}, {1}, {2}, {3}, {4})";
            return await _context.Database.SqlQueryRaw<OrderWithItemsDto>(
                sql,
                userId,
                status ?? (object)DBNull.Value,
                dateFrom.HasValue ? dateFrom.Value.Date : DBNull.Value,
                dateTo.HasValue ? dateTo.Value.Date : DBNull.Value,
                sortBy ?? (object)DBNull.Value
            ).ToListAsync();
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

        public async Task<bool> CompleteAsync(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null || order.status == "completed" || order.status == "cancelled") return false;
            order.status = "completed";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CancelAsync(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null || order.status != "pending") return false;
            order.status = "cancelled";
            var items = await _context.OrderItems.Where(oi => oi.order_id == id).ToListAsync();
            foreach (var item in items)
            {
                var product = await _context.Products.FindAsync(item.product_id);
                if (product != null) product.stock += item.quantity;
            }
            await _context.SaveChangesAsync();
            return true;
        }
    }
}