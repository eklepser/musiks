using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;
using System.Text.Json;

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
            var sqlOrders = await _context.Database.SqlQueryRaw<OrderWithItemsSqlDto>(sql, userId).ToListAsync();
            return await EnrichOrdersWithDiscountAsync(sqlOrders);
        }

        public async Task<List<OrderWithItemsDto>> GetFilteredOrdersWithItemsAsync(int userId, string? status, DateTime? dateFrom, DateTime? dateTo, string? sortBy)
        {
            var sql = "SELECT * FROM get_filtered_orders_with_items({0}, {1}, {2}, {3}, {4})";
            var sqlOrders = await _context.Database.SqlQueryRaw<OrderWithItemsSqlDto>(
                sql,
                userId,
                status ?? (object)DBNull.Value,
                dateFrom.HasValue ? dateFrom.Value.Date : DBNull.Value,
                dateTo.HasValue ? dateTo.Value.Date : DBNull.Value,
                sortBy ?? (object)DBNull.Value
            ).ToListAsync();

            return await EnrichOrdersWithDiscountAsync(sqlOrders);
        }

        private async Task<List<OrderWithItemsDto>> EnrichOrdersWithDiscountAsync(List<OrderWithItemsSqlDto> sqlOrders)
        {
            if (!sqlOrders.Any()) return new List<OrderWithItemsDto>();

            var ticketProductIdsList = await _context.Tickets.Select(t => t.product_id).ToListAsync();
            var ticketProductIdsSet = new HashSet<int>(ticketProductIdsList);
            var result = new List<OrderWithItemsDto>();

            foreach (var sqlOrder in sqlOrders)
            {
                var dto = new OrderWithItemsDto
                {
                    order_id = sqlOrder.order_id,
                    user_id = sqlOrder.user_id,
                    user_name = sqlOrder.user_name,
                    user_login = sqlOrder.user_login,
                    order_date = sqlOrder.order_date,
                    status = sqlOrder.status,
                    total_amount = sqlOrder.total_amount,
                    items_json = sqlOrder.items_json,
                    original_total = 0,
                    discount_percent = 0,
                    discount_amount = 0
                };

                if (!string.IsNullOrEmpty(sqlOrder.items_json))
                {
                    var items = JsonSerializer.Deserialize<List<OrderItemDetailDto>>(sqlOrder.items_json);
                    if (items != null && items.Any())
                    {
                        decimal originalTotal = 0;
                        int totalTicketQuantity = 0;
                        foreach (var item in items)
                        {
                            originalTotal += item.unit_price * item.quantity;
                            if (ticketProductIdsSet.Contains(item.product_id))
                                totalTicketQuantity += item.quantity;
                        }
                        dto.original_total = originalTotal;
                        dto.discount_percent = (totalTicketQuantity >= 2) ? 10 : 0;
                        dto.discount_amount = originalTotal * dto.discount_percent / 100m;
                    }
                }

                result.Add(dto);
            }

            return result;
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