using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;
using MusicMarketplace.DTOs;

namespace MusicMarketplace.Services
{
    public class OrderItemsService
    {
        private readonly MusicMarketplaceContext _context;
        public OrderItemsService(MusicMarketplaceContext context) => _context = context;
        public async Task<List<OrderItem>> GetAllAsync()
        {
            return await _context.OrderItems.ToListAsync();
        }

        public async Task<OrderItem?> GetByIdAsync(int id)
        {
            return await _context.OrderItems.FindAsync(id);
        }

        public async Task<OrderItem> CreateAsync(OrderItem orderItem)
        {
            _context.OrderItems.Add(orderItem);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (await _context.OrderItems.AnyAsync(oi => oi.order_id == orderItem.order_id && oi.product_id == orderItem.product_id))
                    throw new InvalidOperationException("OrderItem already exists");
                throw;
            }
            return orderItem;
        }

        public async Task UpdateAsync(int id, OrderItem orderItem)
        {
            if (id != orderItem.order_id) throw new ArgumentException("ID mismatch");
            _context.Entry(orderItem).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.OrderItems.AnyAsync(oi => oi.order_id == id && oi.product_id == orderItem.product_id))
                    throw new KeyNotFoundException($"OrderItem with order_id {id} not found");
                throw;
            }
        }

        public async Task DeleteAsync(int id)
        {
            var orderItem = await _context.OrderItems.FindAsync(id);
            if (orderItem == null) throw new KeyNotFoundException($"OrderItem with id {id} not found");
            _context.OrderItems.Remove(orderItem);
            await _context.SaveChangesAsync();
        }

        public async Task<List<OrderItemDto>> GetByOrderAsync(int orderId)
        {
            var orderItems = await _context.OrderItems
                .Where(oi => oi.order_id == orderId)
                .Include(oi => oi.product)
                .Select(oi => new OrderItemDto
                {
                    product_id = oi.product_id,
                    product_name = oi.product.name,
                    quantity = oi.quantity,
                    unit_price = oi.unit_price,
                    total_price = oi.quantity * oi.unit_price
                })
                .ToListAsync();

            if (orderItems == null || !orderItems.Any())
                throw new KeyNotFoundException($"OrderItems for order {orderId} not found");

            return orderItems;
        }
    }
}