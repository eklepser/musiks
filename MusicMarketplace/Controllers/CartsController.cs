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

        [HttpPost("checkout/{userId}")]
        public async Task<IActionResult> Checkout(int userId)
        {
            // Получаем корзину пользователя
            var cartItems = await _context.Carts
                .Where(c => c.user_id == userId)
                .Include(c => c.product)
                .ToListAsync();

            if (cartItems == null || !cartItems.Any())
                return BadRequest("Корзина пуста");

            // Рассчитываем общую сумму
            decimal totalAmount = cartItems.Sum(item => item.quantity * item.product.price);

            // Создаём заказ
            var order = new Order
            {
                user_id = userId,
                order_date = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified),
                status = "pending",
                total_amount = totalAmount
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync(); // получаем order.order_id

            // Создаём OrderItem для каждого товара в корзине
            foreach (var cartItem in cartItems)
            {
                var orderItem = new OrderItem
                {
                    order_id = order.order_id,
                    product_id = cartItem.product_id,
                    quantity = cartItem.quantity,
                    unit_price = cartItem.product.price // текущая цена из Product
                };
                _context.OrderItems.Add(orderItem);
            }

            // Очищаем корзину пользователя
            _context.Carts.RemoveRange(cartItems);

            await _context.SaveChangesAsync();

            return Ok(new { orderId = order.order_id, totalAmount });
        }
    }
}