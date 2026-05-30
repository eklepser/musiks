using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.DTOs;
using MusicMarketplace.Services;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly ReviewsService _reviewsService;
        public ReviewsController(ReviewsService reviewsService) => _reviewsService = reviewsService;

        [HttpGet("byUser/{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var items = await _reviewsService.GetByUserAsync(userId);
            return Ok(items);
        }

        [HttpGet("byUser/{userId}/filter")]
        public async Task<IActionResult> GetUserReviewsFiltered(
            int userId,
            [FromQuery] string? searchName = null,
            [FromQuery] int? rating = null,
            [FromQuery] string? sortBy = null)
        {
            var items = await _reviewsService.GetUserReviewsFilteredAsync(userId, searchName, rating, sortBy);
            return Ok(items);
        }

        [HttpGet("byProduct/{productId}")]
        public async Task<IActionResult> GetByProduct(int productId)
        {
            var items = await _reviewsService.GetByProductAsync(productId);
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> PostReview(ReviewCreateDto dto)
        {
            try
            {
                await _reviewsService.CreateAsync(dto);
                return Ok();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("{userId}/{productId}")]
        public async Task<IActionResult> DeleteReview(int userId, int productId)
        {
            try
            {
                await _reviewsService.DeleteAsync(userId, productId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}