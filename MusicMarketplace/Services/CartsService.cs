using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;
using Npgsql;

namespace MusicMarketplace.Services
{
    public class CartsService
    {
        private readonly MusicMarketplaceContext _context;
        public CartsService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<CartDto>> GetByUserAsync(int userId)
        {
            var sql = "SELECT * FROM get_user_cart({0})";
            return await _context.Database.SqlQueryRaw<CartDto>(sql, userId).ToListAsync();
        }

        public async Task<int> PostCartAsync(CartCreateDto dto)
        {
            var sql = "SELECT add_to_cart({0}, {1}, {2})";
            await _context.Database.ExecuteSqlRawAsync(sql, dto.user_id, dto.product_id, dto.quantity);
            var newQuantity = await _context.Carts
                .Where(c => c.user_id == dto.user_id && c.product_id == dto.product_id)
                .Select(c => c.quantity)
                .FirstOrDefaultAsync();
            return newQuantity;
        }

        public async Task DeleteCartItemAsync(int userId, int productId, int quantity)
        {
            var sql = "SELECT delete_from_cart({0}, {1}, {2})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, userId, productId, quantity);
            if (result == 0) throw new KeyNotFoundException("Cart item not found");
        }

        public async Task<CheckoutResultDto> CheckoutAsync(int userId)
        {
            var cartItems = await _context.Carts
                .Where(c => c.user_id == userId)
                .Select(c => new
                {
                    c.product_id,
                    c.quantity,
                    c.product.price,
                    IsTicket = _context.Tickets.Any(t => t.product_id == c.product_id)
                })
                .ToListAsync();

            if (!cartItems.Any())
                throw new InvalidOperationException("Корзина пуста");

            decimal originalTotal = 0;
            int totalTicketQuantity = 0;
            foreach (var item in cartItems)
            {
                originalTotal += item.price * item.quantity;
                if (item.IsTicket)
                    totalTicketQuantity += item.quantity;
            }

            int discountPercent = (totalTicketQuantity >= 2) ? 10 : 0;
            decimal discountAmount = originalTotal * discountPercent / 100m;
            decimal finalTotal = originalTotal - discountAmount;

            var order = new Order
            {
                user_id = userId,
                order_date = DateTime.Now,
                status = "pending",
                total_amount = finalTotal
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            foreach (var item in cartItems)
            {
                _context.OrderItems.Add(new OrderItem
                {
                    order_id = order.order_id,
                    product_id = item.product_id,
                    quantity = item.quantity,
                    unit_price = item.price
                });
            }

            _context.Carts.RemoveRange(_context.Carts.Where(c => c.user_id == userId));
            await _context.SaveChangesAsync();

            return new CheckoutResultDto
            {
                order_id = order.order_id,
                original_total = originalTotal,
                discount_percent = discountPercent,
                discount_amount = discountAmount,
                final_total = finalTotal
            };
        }

        public async Task<List<CartFilterDto>> GetCartFilteredAsync(int userId, string? searchName, string? sortBy)
        {
            var sql = "SELECT * FROM get_filtered_cart({0}, {1}, {2})";
            return await _context.Database.SqlQueryRaw<CartFilterDto>(
                sql,
                userId,
                searchName ?? (object)DBNull.Value,
                sortBy ?? (object)DBNull.Value
            ).ToListAsync();
        }

        public async Task<CartSummaryDto> GetCartSummaryAsync(int userId)
        {
            var cartItems = await _context.Carts
                .Where(c => c.user_id == userId)
                .Select(c => new
                {
                    c.quantity,
                    c.product.price,
                    IsTicket = _context.Tickets.Any(t => t.product_id == c.product_id)
                })
                .ToListAsync();

            if (!cartItems.Any())
            {
                return new CartSummaryDto
                {
                    original_total = 0,
                    discount_percent = 0,
                    discount_amount = 0,
                    final_total = 0
                };
            }

            decimal originalTotal = 0;
            int totalTicketQuantity = 0;
            foreach (var item in cartItems)
            {
                originalTotal += item.price * item.quantity;
                if (item.IsTicket)
                    totalTicketQuantity += item.quantity;
            }

            int discountPercent = (totalTicketQuantity >= 2) ? 10 : 0;
            decimal discountAmount = originalTotal * discountPercent / 100m;
            decimal finalTotal = originalTotal - discountAmount;

            return new CartSummaryDto
            {
                original_total = originalTotal,
                discount_percent = discountPercent,
                discount_amount = discountAmount,
                final_total = finalTotal
            };
        }
    }

    public class CheckoutResult
    {
        public int order_id { get; set; }
        public decimal total_amount { get; set; }
    }
}