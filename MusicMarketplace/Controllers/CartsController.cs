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
            int newQuantity;
            if (existing != null)
            {
                existing.quantity += dto.quantity;
                newQuantity = existing.quantity;
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
                newQuantity = dto.quantity;
            }
            await _context.SaveChangesAsync();
            return Ok(new { quantity = newQuantity });
        }

        [HttpDelete("{userId}/{productId}")]
        public async Task<IActionResult> DeleteCartItem(int userId, int productId, [FromQuery] int quantity = 0)
        {
            var cartItem = await _context.Carts
                .FirstOrDefaultAsync(c => c.user_id == userId && c.product_id == productId);
            if (cartItem == null) return NotFound();

            if (quantity > 0 && quantity < cartItem.quantity)
            {
                cartItem.quantity -= quantity;
                await _context.SaveChangesAsync();
                return NoContent();
            }
            else
            {
                _context.Carts.Remove(cartItem);
                await _context.SaveChangesAsync();
                return NoContent();
            }
        }

        [HttpPost("checkout/{userId}")]
        public async Task<IActionResult> Checkout(int userId)
        {
            var cartItems = await _context.Carts
                .Where(c => c.user_id == userId)
                .Include(c => c.product)
                .ToListAsync();

            if (cartItems == null || !cartItems.Any())
                return BadRequest("Корзина пуста");

            decimal totalAmount = cartItems.Sum(item => item.quantity * item.product.price);

            var order = new Order
            {
                user_id = userId,
                order_date = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified),
                status = "pending",
                total_amount = totalAmount
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            foreach (var cartItem in cartItems)
            {
                var orderItem = new OrderItem
                {
                    order_id = order.order_id,
                    product_id = cartItem.product_id,
                    quantity = cartItem.quantity,
                    unit_price = cartItem.product.price
                };
                _context.OrderItems.Add(orderItem);
            }

            _context.Carts.RemoveRange(cartItems);
            await _context.SaveChangesAsync();

            return Ok(new { orderId = order.order_id, totalAmount });
        }

        [HttpGet("byUser/{userId}/filter")]
        public async Task<ActionResult<IEnumerable<object>>> GetCartFiltered(int userId,
    [FromQuery] string? searchName = null,
    [FromQuery] string? sortBy = null)
        {
            var query = _context.Carts
                .Where(c => c.user_id == userId)
                .Join(_context.Products, c => c.product_id, p => p.product_id, (c, p) => new { Cart = c, Product = p });

            if (!string.IsNullOrEmpty(searchName))
                query = query.Where(i => i.Product.name.ToLower().Contains(searchName.ToLower()));

            var list = await query.Select(i => new
            {
                product_id = i.Product.product_id,
                name = i.Product.name,
                price = i.Product.price,
                quantity = i.Cart.quantity,
                added_date = i.Cart.added_date
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