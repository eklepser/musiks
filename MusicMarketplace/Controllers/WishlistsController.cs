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

        [HttpGet("byUser/{userId}/filter")]
        public async Task<ActionResult<IEnumerable<object>>> GetWishlistFiltered(int userId,
        [FromQuery] string? searchName = null,
        [FromQuery] string? sortBy = null)
        {
            var query = _context.Wishlists
                .Where(w => w.user_id == userId)
                .Join(_context.Products, w => w.product_id, p => p.product_id, (w, p) => new { Wishlist = w, Product = p });

            if (!string.IsNullOrEmpty(searchName))
                query = query.Where(i => i.Product.name.ToLower().Contains(searchName.ToLower()));

            var list = await query.Select(i => new
            {
                product_id = i.Product.product_id,
                name = i.Product.name,
                price = i.Product.price,
                added_date = i.Wishlist.added_date
            }).ToListAsync();

            list = sortBy switch
            {
                "price_asc" => list.OrderBy(i => i.price).ToList(),
                "price_desc" => list.OrderByDescending(i => i.price).ToList(),
                "date_asc" => list.OrderBy(i => i.added_date).ToList(),
                "date_desc" => list.OrderByDescending(i => i.added_date).ToList(),
                _ => list.OrderByDescending(i => i.added_date).ToList()
            };

            return Ok(list);
        }
    }
}