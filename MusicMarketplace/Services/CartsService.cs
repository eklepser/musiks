using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

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

        public async Task<(int orderId, decimal totalAmount)> CheckoutAsync(int userId)
        {
            var sql = "SELECT * FROM checkout_cart({0})";
            var result = await _context.Database.SqlQueryRaw<CheckoutResult>(sql, userId).FirstOrDefaultAsync();
            if (result == null) throw new InvalidOperationException("Корзина пуста");
            return (result.order_id, result.total_amount);
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
    }

    public class CheckoutResult
    {
        public int order_id { get; set; }
        public decimal total_amount { get; set; }
    }
}