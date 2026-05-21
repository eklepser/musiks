using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;
using MusicMarketplace.DTOs;

namespace MusicMarketplace.Services
{
    public class ReviewsService
    {
        private readonly MusicMarketplaceContext _context;
        public ReviewsService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<ReviewDto>> GetByUserAsync(int userId)
        {
            return await _context.Reviews
                .Where(r => r.user_id == userId)
                .Join(_context.Products, r => r.product_id, p => p.product_id, (r, p) => new ReviewDto
                {
                    product_id = r.product_id,
                    product_name = p.name,
                    rating = r.rating,
                    review_text = r.review_text,
                    review_date = r.review_date
                })
                .ToListAsync();
        }

        public async Task<List<object>> GetUserReviewsFilteredAsync(int userId, string? searchName, int? rating, string? sortBy)
        {
            var query = _context.Reviews
                .Where(r => r.user_id == userId)
                .Join(_context.Products,
                      r => r.product_id,
                      p => p.product_id,
                      (r, p) => new
                      {
                          r.product_id,
                          product_name = p.name,
                          r.rating,
                          r.review_text,
                          r.review_date
                      });

            if (!string.IsNullOrEmpty(searchName))
                query = query.Where(r => r.product_name.ToLower().Contains(searchName.ToLower()));
            if (rating.HasValue)
                query = query.Where(r => r.rating == rating.Value);

            var list = await query.ToListAsync();

            list = sortBy switch
            {
                "rating_asc" => list.OrderBy(r => r.rating).ToList(),
                "rating_desc" => list.OrderByDescending(r => r.rating).ToList(),
                "date_asc" => list.OrderBy(r => r.review_date).ToList(),
                "date_desc" => list.OrderByDescending(r => r.review_date).ToList(),
                _ => list.OrderByDescending(r => r.review_date).ToList()
            };

            return list.Cast<object>().ToList();
        }

        public async Task CreateAsync(ReviewCreateDto dto)
        {
            var exists = await _context.Reviews
                .AnyAsync(r => r.user_id == dto.user_id && r.product_id == dto.product_id);
            if (exists) throw new InvalidOperationException("Вы уже оставляли отзыв на этот товар");

            var review = new Review
            {
                user_id = dto.user_id,
                product_id = dto.product_id,
                rating = dto.rating,
                review_text = dto.review_text,
                review_date = DateTime.Now
            };
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int userId, int productId)
        {
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.user_id == userId && r.product_id == productId);
            if (review == null) throw new KeyNotFoundException($"Review for user {userId} and product {productId} not found");
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
        }
    }
}