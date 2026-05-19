using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WishlistsController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;
        public WishlistsController(MusicMarketplaceContext context) => _context = context;

        public class WishlistCreateDto
        {
            public int user_id { get; set; }
            public int product_id { get; set; }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Wishlist>>> GetWishlists()
        {
            return await _context.Wishlists.ToListAsync();
        }

        [HttpGet("byUser/{userId}")]
        public async Task<ActionResult<IEnumerable<WishlistDto>>> GetByUser(int userId)
        {
            var items = await _context.Wishlists
                .Where(w => w.user_id == userId)
                .Join(_context.Products, w => w.product_id, p => p.product_id, (w, p) => new WishlistDto
                {
                    product_id = w.product_id,
                    name = p.name,
                    price = p.price,
                    added_date = w.added_date
                })
                .ToListAsync();
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> PostWishlist(WishlistCreateDto dto)
        {
            var exists = await _context.Wishlists
                .AnyAsync(w => w.user_id == dto.user_id && w.product_id == dto.product_id);
            if (exists) return Conflict("Товар уже в вишлисте");

            var wishlist = new Wishlist
            {
                user_id = dto.user_id,
                product_id = dto.product_id,
                added_date = DateTime.UtcNow
            };
            _context.Wishlists.Add(wishlist);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("{userId}/{productId}")]
        public async Task<IActionResult> DeleteWishlist(int userId, int productId)
        {
            var wishlist = await _context.Wishlists
                .FirstOrDefaultAsync(w => w.user_id == userId && w.product_id == productId);
            if (wishlist == null) return NotFound();
            _context.Wishlists.Remove(wishlist);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}