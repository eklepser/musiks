using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class WishlistsService
    {
        private readonly MusicMarketplaceContext _context;
        public WishlistsService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<Wishlist>> GetAllAsync()
        {
            var sql = "SELECT * FROM get_all_wishlists()";
            return await _context.Set<Wishlist>().FromSqlRaw(sql).ToListAsync();
        }

        public async Task<List<WishlistDto>> GetByUserAsync(int userId)
        {
            var sql = "SELECT * FROM get_wishlist_by_user({0})";
            return await _context.Database.SqlQueryRaw<WishlistDto>(sql, userId).ToListAsync();
        }

        public async Task CreateAsync(WishlistCreateDto dto)
        {
            var sql = "SELECT create_wishlist({0}, {1})";
            await _context.Database.ExecuteSqlRawAsync(sql, dto.user_id, dto.product_id);
        }

        public async Task<bool> DeleteAsync(int userId, int productId)
        {
            var sql = "SELECT delete_wishlist({0}, {1})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, userId, productId);
            return result > 0;
        }

        public async Task<List<WishlistFilterResult>> GetWishlistFilteredAsync(int userId, string? searchName, string? sortBy)
        {
            var sql = "SELECT * FROM get_filtered_wishlist({0}, {1}, {2})";
            return await _context.Database.SqlQueryRaw<WishlistFilterResult>(
                sql,
                userId,
                searchName ?? (object)DBNull.Value,
                sortBy ?? (object)DBNull.Value
            ).ToListAsync();
        }
    }

    public class WishlistFilterResult
    {
        public int product_id { get; set; }
        public string name { get; set; }
        public decimal price { get; set; }
        public DateTime added_date { get; set; }
    }
}