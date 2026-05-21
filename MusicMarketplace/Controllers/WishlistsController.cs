using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.DTOs;
using MusicMarketplace.Services;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WishlistsController : ControllerBase
    {
        private readonly WishlistsService _wishlistsService;
        public WishlistsController(WishlistsService wishlistsService)
        {
            _wishlistsService = wishlistsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetWishlists()
        {
            var wishlists = await _wishlistsService.GetAllAsync();
            return Ok(wishlists);
        }

        [HttpGet("byUser/{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var items = await _wishlistsService.GetByUserAsync(userId);
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> PostWishlist(WishlistCreateDto dto)
        {
            try
            {
                await _wishlistsService.CreateAsync(dto);
                return Ok();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpDelete("{userId}/{productId}")]
        public async Task<IActionResult> DeleteWishlist(int userId, int productId)
        {
            try
            {
                await _wishlistsService.DeleteAsync(userId, productId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet("byUser/{userId}/filter")]
        public async Task<IActionResult> GetWishlistFiltered(
            int userId,
            [FromQuery] string? searchName = null,
            [FromQuery] string? sortBy = null)
        {
            var items = await _wishlistsService.GetWishlistFilteredAsync(userId, searchName, sortBy);
            return Ok(items);
        }
    }
}