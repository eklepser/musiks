using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;
        public ReviewsController(MusicMarketplaceContext context) => _context = context;

        public class ReviewCreateDto
        {
            public int user_id { get; set; }
            public int product_id { get; set; }
            public int rating { get; set; }
            public string review_text { get; set; }
        }

        public class ReviewDto
        {
            public int product_id { get; set; }
            public string product_name { get; set; }
            public int rating { get; set; }
            public string review_text { get; set; }
            public DateTime review_date { get; set; }
        }

        [HttpGet("byUser/{userId}")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetByUser(int userId)
        {
            var items = await _context.Reviews
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
            return Ok(items);
        }

        [HttpGet("byUser/{userId}/filter")]
        public async Task<ActionResult<IEnumerable<object>>> GetUserReviewsFiltered(
    int userId,
    [FromQuery] string? searchName = null,
    [FromQuery] int? rating = null,
    [FromQuery] string? sortBy = null)
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

            return Ok(list);
        }

        [HttpPost]
        public async Task<IActionResult> PostReview(ReviewCreateDto dto)
        {
            var exists = await _context.Reviews
                .AnyAsync(r => r.user_id == dto.user_id && r.product_id == dto.product_id);
            if (exists) return Conflict("Вы уже оставляли отзыв на этот товар");

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
            return Ok();
        }

        [HttpDelete("{userId}/{productId}")]
        public async Task<IActionResult> DeleteReview(int userId, int productId)
        {
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.user_id == userId && r.product_id == productId);
            if (review == null) return NotFound();
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}