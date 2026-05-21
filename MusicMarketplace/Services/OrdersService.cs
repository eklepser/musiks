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
            return await _context.Orders.ToListAsync();
        }

        public async Task<Order?> GetByIdAsync(int id)
        {
            return await _context.Orders.FindAsync(id);
        }

        public async Task<List<OrderDto>> GetByUserAsync(int userId)
        {
            return await _context.Orders
                .Where(o => o.user_id == userId)
                .OrderByDescending(o => o.order_date)
                .Select(o => new OrderDto
                {
                    order_id = o.order_id,
                    order_date = o.order_date,
                    status = o.status,
                    total_amount = o.total_amount
                })
                .ToListAsync();
        }

        public async Task<List<OrderWithItemsDto>> GetOrdersWithItemsAsync(int userId)
        {
            var orders = await _context.Orders
                .Where(o => o.user_id == userId)
                .Include(o => o.user)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.product)
                .OrderByDescending(o => o.order_date)
                .ToListAsync();

            return orders.Select(o => new OrderWithItemsDto
            {
                order_id = o.order_id,
                user_id = o.user_id,
                user_name = o.user.full_name,
                user_login = o.user.login,
                order_date = o.order_date,
                status = o.status,
                total_amount = o.total_amount,
                items = o.OrderItems.Select(oi => new OrderItemDetailDto
                {
                    product_id = oi.product_id,
                    product_name = oi.product.name,
                    quantity = oi.quantity,
                    unit_price = oi.unit_price,
                    total_price = oi.quantity * oi.unit_price
                }).ToList()
            }).ToList();
        }

        public async Task<Order> CreateAsync(OrderDto dto)
        {
            var order = new Order
            {
                user_id = dto.user_id,
                order_date = dto.order_date,
                status = dto.status,
                total_amount = dto.total_amount
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return order;
        }

        public async Task UpdateAsync(int id, OrderDto dto)
        {
            if (id != dto.order_id) throw new ArgumentException("ID mismatch");

            var order = await _context.Orders.FindAsync(id);
            if (order == null) throw new KeyNotFoundException($"Order with id {id} not found");

            order.user_id = dto.user_id;
            order.order_date = dto.order_date;
            order.status = dto.status;
            order.total_amount = dto.total_amount;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) throw new KeyNotFoundException($"Order with id {id} not found");
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
        }
    }
}