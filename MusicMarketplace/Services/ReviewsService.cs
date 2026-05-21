using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class ReviewsService
    {
        private readonly MusicMarketplaceContext _context;
        public ReviewsService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<ReviewDto>> GetByUserAsync(int userId)
        {
            var sql = "SELECT * FROM get_reviews_by_user({0})";
            return await _context.Database.SqlQueryRaw<ReviewDto>(sql, userId).ToListAsync();
        }

        public async Task<List<ReviewFilterResult>> GetUserReviewsFilteredAsync(int userId, string? searchName, int? rating, string? sortBy)
        {
            var sql = "SELECT * FROM get_filtered_reviews({0}, {1}, {2}, {3})";
            return await _context.Database.SqlQueryRaw<ReviewFilterResult>(
                sql,
                userId,
                searchName ?? (object)DBNull.Value,
                rating ?? (object)DBNull.Value,
                sortBy ?? (object)DBNull.Value
            ).ToListAsync();
        }

        public async Task CreateAsync(ReviewCreateDto dto)
        {
            var sql = "SELECT create_review({0}, {1}, {2}, {3})";
            await _context.Database.ExecuteSqlRawAsync(
                sql,
                dto.user_id,
                dto.product_id,
                dto.rating,
                dto.review_text ?? (object)DBNull.Value
            );
        }

        public async Task<bool> DeleteAsync(int userId, int productId)
        {
            var sql = "SELECT delete_review({0}, {1})";
            var result = await _context.Database.ExecuteSqlRawAsync(sql, userId, productId);
            return result > 0;
        }
    }

    public class ReviewFilterResult
    {
        public int product_id { get; set; }
        public string product_name { get; set; }
        public int rating { get; set; }
        public string review_text { get; set; }
        public DateTime review_date { get; set; }
    }
}