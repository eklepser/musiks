using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartsController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;
        public CartsController(MusicMarketplaceContext context) => _context = context;

        public class CartCreateDto
        {
            public int user_id { get; set; }
            public int product_id { get; set; }
            public int quantity { get; set; }
        }

        public class CartDto
        {
            public int product_id { get; set; }
            public string name { get; set; }
            public decimal price { get; set; }
            public int quantity { get; set; }
            public DateTime added_date { get; set; }
        }

        [HttpGet("byUser/{userId}")]
        public async Task<ActionResult<IEnumerable<CartDto>>> GetByUser(int userId)
        {
            var items = await _context.Carts
                .Where(c => c.user_id == userId)
                .Join(_context.Products, c => c.product_id, p => p.product_id, (c, p) => new CartDto
                {
                    product_id = c.product_id,
                    name = p.name,
                    price = p.price,
                    quantity = c.quantity,
                    added_date = c.added_date
                })
                .ToListAsync();
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> PostCart(CartCreateDto dto)
        {
            var existing = await _context.Carts
                .FirstOrDefaultAsync(c => c.user_id == dto.user_id && c.product_id == dto.product_id);
            if (existing != null)
            {
                existing.quantity += dto.quantity;
                _context.Carts.Update(existing);
            }
            else
            {
                var cart = new Cart
                {
                    user_id = dto.user_id,
                    product_id = dto.product_id,
                    quantity = dto.quantity,
                    added_date = DateTime.Now
                };
                _context.Carts.Add(cart);
            }
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("{userId}/{productId}")]
        public async Task<IActionResult> DeleteCart(int userId, int productId)
        {
            var cart = await _context.Carts
                .FirstOrDefaultAsync(c => c.user_id == userId && c.product_id == productId);
            if (cart == null) return NotFound();
            _context.Carts.Remove(cart);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}